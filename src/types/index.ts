// Global Core Types for Kia Ora Tutor (v16.65)

export type FileSourceType = 'session' | 'library';
export type FileMimeType = 'application/pdf' | 'image/png' | 'image/jpeg' | 'application/msword' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'text/plain';

/**
 * 1. Source File Interface (Vercel Blob & LocalForage Hybrid)
 */
export interface SourceFile {
  id: string;              // Unique identifier (e.g., Vercel Blob URL or local ID)
  name: string;            // Original file name
  mimeType: string;        // MIME type
  size: number;            // File size in bytes
  url?: string;            // Vercel Blob URL (if synced to cloud)
  base64?: string;         // LocalForage base64 payload (if offline/local)
  isSynced: boolean;       // Sync status with Vercel Blob
  createdAt: string;       // ISO Date string
}

/**
 * 2. AI Chat Messages
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Omit<SourceFile, 'base64'>[]; // Used for context injection (we don't keep base64 in messages state to save memory)
  timestamp: number;
}

/**
 * 3. Adaptive Quiz Engine
 */
export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  relatedConceptId?: string; // Links back to Study Room artifacts
}

export interface QuizSession {
  id: string;
  totalScore: number;
  questions: QuizQuestion[];
  completed: boolean;
}

/**
 * 4. DB-less LMS Data (CR-008)
 */
export interface StudySession {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'word';
  blobUrl: string;       // Vercel Blob 원본 링크
  subject: string;       // AI 자동 추론 과목명
  guideMarkdown: string; // 생성된 핵심 개념 요약본
  quizData: QuizQuestion[] | null; // 생성된 퀴즈 객체
  quizScore: number | null; 
  createdAt: string;
}

/**
 * 5. Zustand State Architecture (AppStore)
 */
export type ActiveView = 'UPLOAD' | 'STUDY' | 'QUIZ' | 'LIBRARY';

export interface AppState {
  // Global View State
  locale: 'en' | 'ko';
  activeView: ActiveView;
  
  // Storage State
  libraryFiles: SourceFile[];
  sessionFiles: SourceFile[];
  studySessions: StudySession[]; // DB-less Persistence Store
  currentSessionId: string | null; // To bind active AI responses

  
  // Chat State
  chatMessages: ChatMessage[];
  learnedArtifacts: string[]; // Important concepts extracted by AI
  
  // Actions
  setActiveView: (view: ActiveView) => void;
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, data: Partial<StudySession>) => void;
  setCurrentSessionId: (id: string | null) => void;
  addFileToLibrary: (file: SourceFile) => Promise<void>;
  syncWithBlob: () => Promise<void>;
  syncHistoryToJson: () => Promise<void>; // Backup history to Vercel JSON
  addMessage: (msg: ChatMessage) => void;
  clearSession: () => void;
}
