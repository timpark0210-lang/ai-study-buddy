import { BaseAgent } from "./BaseAgent";
import { UserContext, AgentResponse } from "./types";

export class VisionAnalyst extends BaseAgent {
    constructor() {
        super(
            "VisionAnalyst",
            "gemini-2.0-flash",
            `You are a Vision & Document Analyst. 
            Extract text, formulas (in LaTeX), and structure from images or fragments. 
            Identify key learning concepts and student's current progress.`
        );
    }

    async run(context: UserContext): Promise<AgentResponse> {
        if (!context.imagePart) {
            return this.createResponse("No image provided for analysis.");
        }

        try {
            const prompt = `Analyze this educational material. Extract all visual information, formulas, and text. 
            Relate it to the student's question: "${context.currentInput}"`;

            const result = await this.model.generateContent([prompt, context.imagePart]);
            return this.createResponse(result.response.text());
        } catch (error) {
            console.error("VisionAnalyst Run Error:", error);
            throw error;
        }
    }
}
