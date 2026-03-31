import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AgentResponse, AgentMetadata } from "./types";

export abstract class BaseAgent {
    protected model: GenerativeModel;
    protected agentName: string;

    constructor(
        agentName: string,
        modelName: string = "gemini-1.5-pro",
        systemInstruction: string = ""
    ) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        this.agentName = agentName;
        this.model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
        });
    }

    /**
     * AI 응답에서 JSON을 안전하게 추출하고 파싱합니다.
     */
    protected parseJsonResponse<T>(text: string): T {
        try {
            // 마크다운 블록 제거
            const cleanText = text
                .replace(/```json\n?/g, "")
                .replace(/```/g, "")
                .trim();
            
            return JSON.parse(cleanText) as T;
        } catch (error) {
            console.error(`[${this.agentName}] JSON Parsing Error:`, error);
            console.error("Original Text:", text);
            throw new Error(`Failed to parse AI response as JSON in ${this.agentName}`);
        }
    }

    /**
     * 공통 실행 메서드 (상속받은 클래스에서 구체화)
     */
    abstract run(context: any): Promise<AgentResponse>;

    /**
     * 메타데이터를 포함한 표준 응답 생성
     */
    protected createResponse(content: string, metadata: AgentMetadata = {}): AgentResponse {
        return {
            content,
            metadata: {
                ...metadata,
                source: this.agentName,
                timestamp: new Date().toISOString(),
            },
        };
    }
}
