import { VisionAnalyst } from "./VisionAnalyst";
import { LearningStrategist } from "./LearningStrategist";
import { TutorAgent } from "./TutorAgent";
import { MasterTeacherAgent } from "./MasterTeacherAgent";
import { QuizAgent } from "./QuizAgent";
import { UserContext, AgentResponse } from "./types";

export type AgentMode = "chat" | "study" | "quiz";

export class AgentOrchestrator {
    private visionAnalyst = new VisionAnalyst();
    private learningStrategist = new LearningStrategist();
    private tutorAgent = new TutorAgent();
    private masterTeacher = new MasterTeacherAgent();
    private quizAgent = new QuizAgent();

    /**
     * 메인 입력 처리 기계
     */
    async processInput(context: UserContext, mode: AgentMode = "chat"): Promise<AgentResponse> {
        try {
            // 1. Vision Analysis (Always run if image exists or if it's the first turn)
            // Note: For performance, we can skip this if we already have context in the session
            const visionResult = await this.visionAnalyst.run(context);
            const visionAnalysis = visionResult.content;

            if (mode === "chat") {
                // 2. Formulate Plan
                const planResult = await this.learningStrategist.run({
                    userContext: context,
                    visionAnalysis
                });
                const plan = (planResult.metadata as any).plan;

                // 3. Tutor Response
                return await this.tutorAgent.run({
                    userContext: context,
                    plan
                });
            } else if (mode === "study") {
                // Return Study Guide
                return await this.masterTeacher.run({
                    userContext: context,
                    visionAnalysis
                });
            } else if (mode === "quiz") {
                // Return Quiz
                return await this.quizAgent.run({
                    userContext: context,
                    visionAnalysis
                });
            }

            throw new Error(`Unsupported agent mode: ${mode}`);
        } catch (error) {
            console.error("Orchestrator Error:", error);
            return {
                content: "I'm sorry, mate. I ran into a bit of a snag. Could you try asking that again?",
                metadata: { error: true }
            };
        }
    }
}
