import { NextRequest, NextResponse } from "next/server";

/* ── Vision Analyst 시스템 프롬프트 ── */
const VISION_SYSTEM_PROMPT = `You are the "Vision Analyst" for Kia Ora Tutor.
Your job is to structure and interpret images of educational material (problems, textbook pages, handwritten notes).

CORE TASKS:
1. OCR: Extract all text correctly.
2. STRUCTURE: Identify what is a question, what is an example, and what is a diagram/graph description.
3. CONTEXT: Determine the subject (Maths, Science, etc.) and difficulty level.
4. NZ CONTEXT: Ensure any NZ-specific terms or curriculum references are noted.

OUTPUT FORMAT:
Return a JSON object with:
{
  "subject": "e.g., Mathematics",
  "topic": "e.g., Quadratic Equations",
  "extracted_text": "full text here",
  "problem_description": "concise summary of the problem",
  "nz_curriculum_hint": "potential NCEA level or NZ context",
  "structured_data": {
    "question": "the main question asked",
    "givens": ["list of facts provided"],
    "goal": "what needs to be solved"
  }
}
Do not provide a solution. Just analyse the problem context.`;

export async function POST(req: NextRequest) {
    try {
        const { image } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
            return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const requestBody = {
            system_instruction: {
                parts: [{ text: VISION_SYSTEM_PROMPT }],
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        { inlineData: { mimeType: matches[1], data: matches[2] } },
                        { text: "Analyse this study material and provide structural context in JSON." }
                    ],
                },
            ],
            generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.1,
            },
        };

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const err = await response.json();
            return NextResponse.json({ error: err.error?.message || "Vision API failed" }, { status: 200 });
        }

        const data = await response.json();
        const result = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

        return NextResponse.json(result);
    } catch (error) {
        console.error("Vision API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
