'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSubjectDetectionPrompt, getSubjectSpecificPrompt } from "./prompts/studyGuidePrompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * 🔥 AI Master Teacher - Phase 4 (Subject-Aware 2-Pass Generation)
 * Generates high-fidelity study materials from uploaded files.
 */
export async function generateStudyGuideAction(files: any[], locale: string) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_ANALYSIS_MODEL || "gemini-3.5-flash" });
    
    const fileParts = await Promise.all(
      files.map(async (f) => {
        let base64Data: string;
        if (f.url.startsWith('http')) {
          base64Data = await urlToBase64(f.url);
        } else {
          base64Data = f.url.split(',')[1] || f.url;
        }
        return {
          inlineData: {
            data: base64Data,
            mimeType: f.mimeType,
          },
        };
      })
    );

    // Pass 1: Subject Detection
    const detectionPrompt = getSubjectDetectionPrompt();
    const detectionResult = await model.generateContent({
       contents: [{ role: 'user', parts: [{ text: detectionPrompt }, ...fileParts] }],
       generationConfig: { maxOutputTokens: 200, temperature: 0.1 }
    });
    
    let subjectCode = 'OTHER';
    let subjectTitle = 'New Material';
    try {
      let detText = detectionResult.response.text();
      detText = detText.replace(/```json/g, '').replace(/```/g, '').trim();
      const detJson = JSON.parse(detText);
      subjectCode = detJson.subjectCode || 'OTHER';
      subjectTitle = detJson.subject || 'New Material';
    } catch (e) {
      console.warn("Subject detection parsing failed, defaulting to OTHER");
    }

    // Pass 2: Content Generation
    const specificPrompt = getSubjectSpecificPrompt(subjectCode);
    const result = await model.generateContent({
       contents: [{ role: 'user', parts: [{ text: specificPrompt }, ...fileParts] }],
       generationConfig: { maxOutputTokens: 8000, temperature: 0.7 }
    });

    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let tabs = {
      guide: "",
      walkthrough: "",
      practice: ""
    };

    try {
      tabs = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse tabs JSON:", e);
      tabs.guide = text; // Fallback
    }

    return { 
        success: true, 
        subject: subjectTitle,
        subjectCode: subjectCode,
        tabs: tabs
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, error: "Failed to generate study guide" };
  }
}

export async function generateQuizAction(content: string, count: number = 5) {
    try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_ANALYSIS_MODEL || "gemini-3.5-flash" });
        const prompt = `Based on the following study guide, generate ${count} multiple-choice questions in JSON format. 
        Format: Array<{ question: string, options: string[], answer: number, explanation: string }>
        
        Content: ${content}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const quizData = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        return { success: true, data: quizData };
    } catch (error) {
        console.error("Quiz Error:", error);
        return { success: false, error: "Quiz failure" };
    }
}

export async function chatAction(userMsg: string, contextMarkdown: string, history: any[]) {
    try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash" });
        
        const contents = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const systemPrompt = `You are a helpful and premium AI tutor. Below is the study material context of this study session. 
        Please answer the user's questions strictly based on the context, or guide them pedagogically if they ask for explanation.
        
        Study Material Context:
        ${contextMarkdown}`;

        contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMsg}` }]
        });

        const result = await model.generateContent({
            contents,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        const response = await result.response;
        return { success: true, text: response.text() };
    } catch (error) {
        console.error("Chat Action Error:", error);
        return { success: false, error: "Thinking failure" };
    }
}
