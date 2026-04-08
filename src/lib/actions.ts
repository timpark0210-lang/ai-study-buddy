'use server';

import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * 🔥 AI Master Teacher - Phase 3 (Gemini 2.0 Flash)
 * Generates high-fidelity study materials from uploaded files.
 */
export async function generateStudyGuideAction(prompt: string, files: any[], locale: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Preparation for multimodal input (supporting browser-based URLs and Blobs)
    const parts = [
      { text: prompt },
      ...files.map(f => ({
        inlineData: {
          data: f.url.split(',')[1] || f.url, 
          mimeType: f.mimeType
        }
      }))
    ];

    const result = await model.generateContent({
       contents: [{ role: 'user', parts }],
       generationConfig: {
         maxOutputTokens: 2000,
         temperature: 0.7,
       }
    });

    const response = await result.response;
    const text = response.text();

    return { 
        success: true, 
        content: text,
        subject: text.split('\n')[0].replace('#', '').trim() 
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { success: false, error: "Failed to generate study guide" };
  }
}

export async function generateQuizAction(content: string, count: number = 5) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Based on the following study guide, generate ${count} multiple-choice questions in JSON format. 
        Format: Array<{ question: string, options: string[], answer: number, explanation: string }>
        
        Content: ${content}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // JSON 배열 형태의 응답 파싱 - 구버전 ts 컴파일러 호환을 위해 /s 플래그 대신 [\s\S]* 사용
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          console.error('AI Response text:', text);
          throw new Error('Failed to parse AI response into JSON. No JSON array found.');
        }
        const quizData = JSON.parse(jsonMatch[0]);

        return { success: true, data: quizData };
    } catch (error) {
        console.error("Quiz Error:", error);
        return { success: false, error: "Quiz failure" };
    }
}
