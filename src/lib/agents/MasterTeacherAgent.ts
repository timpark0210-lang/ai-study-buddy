import { BaseAgent } from "./BaseAgent";
import { UserContext, AgentResponse, StudyGuide } from "./types";

export class MasterTeacherAgent extends BaseAgent {
    constructor() {
        super(
            "MasterTeacher",
            "gemini-1.5-pro",
            `You are a Master Teacher specialized in creating premium Study Guides. 
            Analyze the student's materials and context to create a comprehensive guide. 
            Use Markdown and LaTeX. Keep it structured, clear, and encouraging.
            Return ONLY valid JSON matching the StudyGuide structure.`
        );
    }

    async run(context: { userContext: UserContext; visionAnalysis: string }): Promise<AgentResponse> {
        const { userContext, visionAnalysis } = context;

        try {
            const prompt = `
            Vision Analysis: "${visionAnalysis}"
            Last Input: "${userContext.currentInput}"
            
            Generate a detailed Study Guide in JSON:
            {
              "title": "Topic title",
              "concepts": ["Basic concept 1", "Concept 2"],
              "content": "# Full Markdown Content with LaTeX...",
              "suggestedPath": ["Step 1", "Step 2"]
            }`;

            const result = await this.model.generateContent(prompt);
            const guide = this.parseJsonResponse<StudyGuide>(result.response.text());

            return this.createResponse(guide.content, { guide });
        } catch (error) {
            console.error("MasterTeacherAgent Run Error:", error);
            throw error;
        }
    }
}
