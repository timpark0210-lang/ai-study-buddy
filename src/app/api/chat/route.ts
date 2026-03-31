import { NextRequest, NextResponse } from "next/server";
import { AgentOrchestrator, AgentMode } from "@/lib/agents/AgentOrchestrator";
import { UserContext } from "@/lib/agents/types";

// Initialize Orchestrator once
const orchestrator = new AgentOrchestrator();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, imagePart, mode = "chat" } = body;

        // Convert messages to Gemini history format, excluding the current input
        const history = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const currentInput = messages[messages.length - 1].content;

        const context: UserContext = {
            history,
            currentInput,
            imagePart,
        };

        // Run pipeline with selected mode
        const response = await orchestrator.processInput(context, mode as AgentMode);

        return NextResponse.json({
            content: response.content,
            metadata: response.metadata,
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Failed to process your request. Check your API key and input." },
            { status: 500 }
        );
    }
}
