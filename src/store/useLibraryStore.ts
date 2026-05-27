import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudySession {
    id: string;
    fileName: string;
    fileType: 'pdf' | 'word' | 'image';
    blobUrl: string;
    subject: string;
    guideMarkdown: string;
    quizData: any;
    quizScore: number | null;
    createdAt: string;
}

interface AppState {
  activeView: 'UPLOAD' | 'LIBRARY' | 'STUDY' | 'QUIZ';
  studySessions: StudySession[];
  currentSessionId: string | null;
  setActiveView: (view: 'UPLOAD' | 'LIBRARY' | 'STUDY' | 'QUIZ') => void;
  setCurrentSessionId: (id: string | null) => void;
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  // Legacy aliases for backward compatibility during Phase 3 transition
  addMaterial: (session: any) => void;
}

export const useLibraryStore = create<AppState>()(
  persist(
    (set) => ({
      activeView: 'UPLOAD',
      studySessions: [],
      currentSessionId: null,
      setActiveView: (view) => set({ activeView: view }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      addStudySession: (session) => set((state) => ({ 
        studySessions: [session, ...state.studySessions] 
      })),
      updateStudySession: (id, updates) => set((state) => ({
        studySessions: state.studySessions.map((s) => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      // Map legacy addMaterial to addStudySession format
      addMaterial: (material) => set((state) => {
        const session: StudySession = {
          id: material.id || `session_${Date.now()}`,
          fileName: material.title || material.name || 'Untitled',
          fileType: material.type === 'pdf' ? 'pdf' : 'image',
          blobUrl: material.url || '',
          subject: 'Generating...',
          guideMarkdown: '',
          quizData: null,
          quizScore: null,
          createdAt: new Date().toISOString()
        };
        return { studySessions: [session, ...state.studySessions] };
      }),
    }),
    { name: 'ai-study-buddy-storage' }
  )
);
