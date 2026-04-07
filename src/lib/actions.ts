'use server';

import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// 1. Dynamic Config: AI Model Selection
// ==========================================
const FLASH_MODEL_NAME = process.env.GEMINI_FLASH_MODEL || "gemini-2.5-flash";
const PRO_MODEL_NAME = process.env.GEMINI_PRO_MODEL || "gemini-2.5-pro";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==========================================
// 2. Vercel Blob Integration (Hybrid Engine)
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

// ==========================================
// 3. AI Core: Master Teacher (2-Pass Engine)
// ==========================================

/**
 * Kia Ora Tutor Core: Generates a high-fidelity study guide from various sources.
 * Phase 1: Vision Analyst (Flash) -> Extracts data from images/PDFs.
 * Phase 2: Master Teacher (Pro)   -> Generates structured markdown guide with editorial precision.
 */
export async function generateStudyGuideAction(
  prompt: string,
  files: { data: string, mimeType: string, name: string }[],
  locale: 'en' | 'ko'
) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });
    const proModel = genAI.getGenerativeModel({ model: PRO_MODEL_NAME });

    // --- Phase 1: Vision Analysis (Data Extraction) ---
    let visionAnalysis = "";
    if (files && files.length > 0) {
      const visionParts: any[] = [{ text: "Examine these educational materials. Extract all key facts, diagrams, formulas, and context into a structured summary for further instruction." }];
      
      files.forEach(file => {
        visionParts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      });

      const visionResult = await flashModel.generateContent({ contents: [{ role: 'user', parts: visionParts }] });
      visionAnalysis = visionResult.response.text();
    }

    // --- Phase 2: Master Teacher (Educational Synthesis) ---
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
      systemInstruction: {
        role: "system",
        parts: [{ text: localizedInstructions }]
      }
    });

    return { 
      success: true, 
      content: teacherResult.response.text() 
    };

  } catch (error: any) {
    console.error("Master Teacher Error:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 4. Chat Interface
// ==========================================

export async function processChatRequest(
  history: { role: 'user' | 'assistant', content: string }[],
  prompt: string,
  files: { data: string, mimeType: string, name: string }[]
) {
  try {
    const flashModel = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });

    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [{ text: prompt }];
    if (files && files.length > 0) {
      files.forEach(file => {
        currentParts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
      });
    }
    contents.push({ role: 'user', parts: currentParts });

    const systemPrompt = `You are the Kia Ora Tutor, an elite New Zealand educational assistant.
Keep your answers highly encouraging, structured, and use Markdown.
If the user uploads an image/PDF, analyze it step-by-step.
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
