export type FileType = 'pdf' | 'text' | 'image' | 'docx';

export interface SourceFile {
  id: string;
  title: string;
  type: FileType;
  url: string;
  createdAt: string;
}

export interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  questions: Question[];
}

export interface StudyPlan {
  id: string;
  days: {
    day: number;
    topic: string;
    tasks: string[];
  }[];
}

export interface StudySession {
  id: string;
  materialId: string;
  startTime: string;
  quizScore?: number;
}
