import { BaseAgent } from "./BaseAgent";
import { UserContext, AgentResponse, QuizSet } from "./types";

export class QuizAgent extends BaseAgent {
    constructor() {
        super(
            "QuizAgent",
            "gemini-1.5-pro",
            `You are an adaptive Quiz Master. 
            Create 5 challenging yet fair multiple-choice questions.
            Include detailed explanations for each answer. 
            Output ONLY valid JSON matching the QuizSet structure.`
        );
    }

    async run(context: { userContext: UserContext; visionAnalysis: string }): Promise<AgentResponse> {
        const { userContext, visionAnalysis } = context;

        try {
            const prompt = `
            Based on: "${visionAnalysis}"
            Current Input: "${userContext.currentInput}"
            
            Generate a 5-question Quiz in JSON:
            {
              "targetConcept": "The main topic",
              "questions": [
                {
                  "question": "Question text?",
                  "options": ["A", "B", "C", "D"],
                  "answerIndex": 0,
                  "explanation": "Why A is correct...",
                  "difficulty": "Medium"
                }
              ]
            }`;

            const result = await this.model.generateContent(prompt);
            const quizSet = this.parseJsonResponse<QuizSet>(result.response.text());

            return this.createResponse(`Generated quiz on ${quizSet.targetConcept}`, { quizSet });
        } catch (error) {
            console.error("QuizAgent Run Error:", error);
            throw error;
        }
    }
}
