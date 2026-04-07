'use server';

import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// 1. Dynamic Config: AI Model Selection
// ==========================================
const FLASH_MODEL_NAME = process.env.GEMINI_FLASH_MODEL || "gemini-3.0-flash";
const PRO_MODEL_NAME = process.env.GEMINI_PRO_MODEL || "gemini-3.1-pro";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==========================================
// 2. Vercel Blob Integration (Hybrid Engine & DB-less)
// ==========================================

export async function uploadToBlob(base64Data: string, filename: string, mimeType: string) {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = await put(`uploads/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType: mimeType,
    });
    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return { success: false, error: error.message };
  }
}

// DB-less LMS History Persistence
export async function syncHistoryAction(jsonString: string) {
  try {
    const buffer = Buffer.from(jsonString, 'utf-8');
    const blob = await put(`state/user_history.json`, buffer, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false // Overwrite existing history
    });
    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('History sync error:', error);
    return { success: false, error: error.message };
  }
}

// Helper: Fetch URL Data (Crucial for Vercel Blob .docx feeding to Gemini)
export async function fetchBlobDataAsBase64(url: string) {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (err: any) {
    console.error("Fetch DB-less Blob Error", err);
    return null;
  }
}

// ==========================================
// 3. AI Core: Master Teacher (2-Pass Engine)
// ==========================================

export async function generateStudyGuideAction(
  prompt: string,
  files: { data?: string, url?: string, mimeType: string, name: string }[],
  locale: 'en' | 'ko'
) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });
    const proModel = genAI.getGenerativeModel({ model: PRO_MODEL_NAME });

    // --- Phase 1: Vision Analysis & Auto-Tagging ---
    let visionAnalysis = "";
    let extractedSubject = "General";

    if (files && files.length > 0) {
      const visionParts: any[] = [{ 
        text: `Examine these educational materials. 
1. Extract all key facts, diagrams, formulas, and context into a structured summary for further instruction.
2. At the very end, output the most appropriate school subject as a single English word in this format: [SUBJECT: Math]` 
      }];
      
      for (const file of files) {
        let base64Data = file.data;
        // Edge Case QA Defense: Fetch DOCX from Vercel Blob URL to inject into inlineData
        if (!base64Data && file.url) {
           base64Data = await fetchBlobDataAsBase64(file.url) || "";
        }
        
        if (base64Data) {
          visionParts.push({
            inlineData: { data: base64Data, mimeType: file.mimeType }
          });
        }
      }

      const visionResult = await flashModel.generateContent({ contents: [{ role: 'user', parts: visionParts }] });
      const rawVisionText = visionResult.response.text();
      
      // Auto-Tagging extraction
      const subjectMatch = rawVisionText.match(/\[SUBJECT:\s*(.+?)\]/i);
      if (subjectMatch) {
         extractedSubject = subjectMatch[1].trim();
         visionAnalysis = rawVisionText.replace(subjectMatch[0], '').trim();
      } else {
         visionAnalysis = rawVisionText;
      }
    }

    // --- Phase 2: Master Teacher ---
    const localizedInstructions = locale === 'ko' 
      ? `당신은 뉴질랜드 교육 과정 전문가인 'Kia Ora Tutor'입니다. 
다음 분석된 자료와 사용자의 요청을 바탕으로 완벽한 학습 가이드를 한글로 작성하세요.
반드시 ## 📌 핵심 개념 정리, ## ✍️ 상세 설명, ## 💡 암기 팁 하위 섹션을 포함하십시오. 
수학/과학 공식이 있는 경우 반드시 KaTeX($...$ 또는 $$...$$)를 사용하세요.`
      : `You are the 'Kia Ora Tutor', an expert in New Zealand curriculum.
Generate a perfect study guide in English based on the provided analysis and user notes.
Mandatory sections: ## 📌 Key Concepts, ## ✍️ Detailed Explanation, ## 💡 Study Tips.
Use KaTeX ($...$ or $$...$$) for all mathematical/scientific formulas.`;

    const teacherPrompt = `
[Material Analysis]:
${visionAnalysis || "No outside materials provided."}

[User Learning Goals]:
${prompt || "Generate a comprehensive guide based on the materials."}

Create an elite, editorial-grade study guide according to your persona rules.`;

    const teacherResult = await proModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: teacherPrompt }] }],
      systemInstruction: { role: "system", parts: [{ text: localizedInstructions }] }
    });

    return { 
      success: true, 
      content: teacherResult.response.text(),
      subject: extractedSubject
    };

  } catch (error: any) {
    console.error("Master Teacher Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 4. Background Optimistic AI: Quiz Generator
// ==========================================
export async function generateQuizAction(guideContent: string, count: number = 3) {
  try {
     const flashModel = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });
     
     const quizPrompt = `Based on the following study guide, generate exactly ${count} multiple choice questions.
You must return the output STRICTLY as a raw JSON array of objects without markdown formatting.
Format each object as:
{
  "id": "q1",
  "question": "The question text (can use KaTeX)",
  "options": [
    { "text": "Option A", "isCorrect": true },
    { "text": "Option B", "isCorrect": false }
  ],
  "explanation": "Why this is correct."
}

[Study Guide Content]:
${guideContent}
`;
     
     const result = await flashModel.generateContent(quizPrompt);
     let text = result.response.text().trim();
     
     // Strip markdown JSON wrapping if present
     if (text.startsWith("```json")) {
         text = text.replace(/^```json/, '').replace(/```$/, '').trim();
     } else if (text.startsWith("```")) {
         text = text.replace(/^```/, '').replace(/```$/, '').trim();
     }

     const quizData = JSON.parse(text);
     return { success: true, data: quizData };

  } catch (error: any) {
     console.error("Quiz Gen Error:", error);
     return { success: false, error: error.message };
  }
}

// ==========================================
// 5. Chat Interface
// ==========================================

export async function processChatRequest(
  history: { role: 'user' | 'assistant', content: string }[],
  prompt: string,
  files: { data?: string, url?: string, mimeType: string, name: string }[]
) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });

    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [{ text: prompt }];
    if (files && files.length > 0) {
      for (const file of files) {
        let base64Data = file.data;
        if (!base64Data && file.url) {
           base64Data = await fetchBlobDataAsBase64(file.url) || "";
        }
        if (base64Data) {
          currentParts.push({ inlineData: { data: base64Data, mimeType: file.mimeType } });
        }
      }
    }
    contents.push({ role: 'user', parts: currentParts });

    const systemPrompt = `You are the Kia Ora Tutor, an elite New Zealand educational assistant.
Keep your answers highly encouraging, structured, and use Markdown.
Extract 1-3 word concept and output as: [ARTIFACT: 개념] at the end.`;

    const result = await flashModel.generateContent({
      contents,
      systemInstruction: { role: "system", parts: [{ text: systemPrompt }] }
    });

    const responseText = result.response.text();
    let concept = "Unknown";
    let finalContent = responseText;
    const artifactMatch = responseText.match(/\[ARTIFACT:\s*(.+?)\]/);
    if (artifactMatch) {
      concept = artifactMatch[1];
      finalContent = responseText.replace(artifactMatch[0], '').trim();
    }

    return { success: true, content: finalContent, metadata: { concept } };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { success: false, error: error.message };
  }
}
