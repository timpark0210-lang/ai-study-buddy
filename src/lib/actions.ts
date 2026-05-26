'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * 🔥 AI Master Teacher - Phase 3 (Gemini 2.0 Flash)
 * Generates high-fidelity study materials from uploaded files.
 */
export async function generateStudyGuideAction(prompt: string, files: any[], locale: string) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash" });
    
    // Fetch file from URL and convert to Base64 helper
    const fileParts = await Promise.all(
      files.map(async (f) => {
        if (f.url.startsWith('data:')) {
          return {
            inlineData: {
              data: f.url.split(',')[1],
              mimeType: f.mimeType,
            },
          };
        }

        console.log(`[AI Tutor Action] Fetching and encoding file: ${f.name} (${f.url})`);
        const response = await fetch(f.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file from storage: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString('base64');
        
        return {
          inlineData: {
            data: base64Data,
            mimeType: f.mimeType,
          },
        };
      })
    );

    // Preparation for multimodal input (supporting browser-based URLs and Blobs)
    const parts = [
      { text: prompt },
      ...fileParts
    ];

    const result = await model.generateContent({
       contents: [{ role: 'user', parts }],
       generationConfig: {
         maxOutputTokens: 4000,
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
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash" });
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

export async function chatAction(message: string, contextMarkdown: string, chatHistory: any[]) {
    try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-3.5-flash" });
        const systemPrompt = `You are "Kia Ora AI Tutor", a smart and friendly AI teaching assistant.
You are helping a student who is currently reviewing a study guide.

Here is the context (The study guide the student is currently reading):
---
${contextMarkdown}
---

Your role:
1. Answer the student's questions accurately using the provided context.
2. If the answer is not in the context, use your own general knowledge to help the student.
3. Keep your answers concise, encouraging, and easy to understand.
4. Reply in the same language the student uses to ask the question.

Remember: Be a helpful and encouraging tutor!`;

        // Format history for Gemini
        const history = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I am ready to help the student based on the study guide.' }] },
                ...history
            ]
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return { success: true, text };
    } catch (error) {
        console.error("Chat Error:", error);
        return { success: false, error: "Failed to get chat response" };
    }
}
