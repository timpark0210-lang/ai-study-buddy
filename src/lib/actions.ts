'use server';

import { put } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// 1. Vercel Blob Integration
// ==========================================

export async function uploadToBlob(base64Data: string, filename: string, mimeType: string) {
  try {
    // Convert base64 back to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public', // Change to 'private' if needed, depending on security
      contentType: mimeType,
    });

    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('Blob upload error:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 2. Gemini AI Orchestration 
// ==========================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processChatRequest(
  history: { role: 'user' | 'assistant', content: string }[],
  prompt: string,
  files: { data: string, mimeType: string, name: string }[]
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format chat history for Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Construct the current message parts
    const currentParts: any[] = [{ text: prompt }];

    // Inject files if present
    if (files && files.length > 0) {
      files.forEach(file => {
        currentParts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    // Enforce prompt engineering constraints
    const systemPrompt = `You are the Kia Ora Tutor, an elite New Zealand educational assistant.
Keep your answers highly encouraging, structured, and use Markdown.
If the user uploads an image/PDF, analyze it step-by-step.
Extract the most important educational concept you explained in exactly 1-3 words, and output it at the very end in format: [ARTIFACT: 개념].`;

    const result = await model.generateContent({
      contents,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      }
    });

    const responseText = result.response.text();
    
    // Parse artifact if present
    let concept = "Unknown";
    let finalContent = responseText;
    const artifactMatch = responseText.match(/\[ARTIFACT:\s*(.+?)\]/);
    if (artifactMatch) {
      concept = artifactMatch[1];
      finalContent = responseText.replace(artifactMatch[0], '').trim();
    }

    return { 
      success: true, 
      content: finalContent, 
      metadata: { concept } 
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { success: false, error: error.message };
  }
}
