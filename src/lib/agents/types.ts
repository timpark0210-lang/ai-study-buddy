export type Role = "user" | "model";

export interface MessagePart {
    text: string;
}

export interface ChatMessage {
    role: Role;
    parts: MessagePart[];
}

export interface AgentMetadata {
    usage?: {
        promptTokens: number;
        candidatesTokens: number;
        totalTokens: number;
    };
    source?: string;
    [key: string]: any;
}

export interface AgentResponse {
    content: string;
    metadata?: AgentMetadata;
}

export interface UserContext {
    history: ChatMessage[];
    currentInput: string;
    imagePart?: {
        inlineData: {
            data: string;
            mimeType: string;
        };
    };
}

export interface ScaffoldingPlan {
    currentStage: string;
    nextQuestionPrompt: string;
    targetConcept: string;
}

export interface StudyGuide {
    title: string;
    concepts: string[];
    content: string; // Markdown
    suggestedPath: string[];
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    difficulty: "Easy" | "Medium" | "Hard";
}

export interface QuizSet {
    questions: QuizQuestion[];
    targetConcept: string;
}
