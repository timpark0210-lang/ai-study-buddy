import { BaseAgent } from "./BaseAgent";
import { UserContext, AgentResponse, ScaffoldingPlan } from "./types";

export class LearningStrategist extends BaseAgent {
    constructor() {
        super(
            "LearningStrategist",
            "gemini-1.5-pro",
            `You are a Master Learning Strategist. 
            Formulate a Socratic 'Scaffolding Plan'. 
            NEVER give the answer. Decide the next educational step.
            Output ONLY valid JSON.`
        );
    }

    async run(context: { userContext: UserContext; visionAnalysis: string }): Promise<AgentResponse> {
        const { userContext, visionAnalysis } = context;

        try {
            const prompt = `
            Context Analysis: "${visionAnalysis}"
            Student Input: "${userContext.currentInput}"
            
            Return JSON:
            {
              "currentStage": "Identifying | Applying | Reviewing",
              "nextQuestionPrompt": "Instruction for Tutor on what to ask",
              "targetConcept": "Main concept"
            }`;

            const result = await this.model.generateContent(prompt);
            const plan = this.parseJsonResponse<ScaffoldingPlan>(result.response.text());

            return this.createResponse(JSON.stringify(plan), { plan });
        } catch (error) {
            console.error("LearningStrategist Run Error:", error);
            throw error;
        }
    }
}
