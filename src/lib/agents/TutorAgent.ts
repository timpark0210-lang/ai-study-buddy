import { BaseAgent } from "./BaseAgent";
import { UserContext, AgentResponse, ScaffoldingPlan } from "./types";

export class TutorAgent extends BaseAgent {
    constructor() {
        super(
            "Tutor",
            "gemini-1.5-pro",
            `You are Kia Ora Tutor, a supportive AI buddy from New Zealand. 
            Use NZ English (kiwi slang occasionally, 'Kia Ora', 'mate', 'sweet as').
            Follow the Scaffolding Plan strictly. Use Socratic Method.
            NEVER give direct answers. Use LaTeX for math. 
            Keep responses encouraging and concise.`
        );
    }

    async run(context: { userContext: UserContext; plan: ScaffoldingPlan }): Promise<AgentResponse> {
        const { userContext, plan } = context;

        try {
            const prompt = `
            Scaffolding Strategy: ${plan.nextQuestionPrompt}
            Target Concept: ${plan.targetConcept}
            Stage: ${plan.currentStage}
            
            Student says: "${userContext.currentInput}"
            
            Respond as Kia Ora Tutor.`;

            const result = await this.model.generateContent({
                contents: [
                    ...userContext.history,
                    { role: "user", parts: [{ text: prompt }] }
                ]
            });

            return this.createResponse(result.response.text(), { plan });
        } catch (error) {
            console.error("TutorAgent Run Error:", error);
            throw error;
        }
    }
}
