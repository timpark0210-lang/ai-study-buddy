'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

/**
 * 🔥 AI Master Teacher - Phase 3 (Gemini 2.0 Flash)
 * Generates high-fidelity study materials from uploaded files.
 */
export async function generateStudyGuideAction(prompt: string, files: any[], locale: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Preparation for multimodal input (supporting browser-based URLs and Blobs)
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

    const parts = [
      { text: prompt },
      ...fileParts
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
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

