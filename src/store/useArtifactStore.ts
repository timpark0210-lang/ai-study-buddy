import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StudyGuide, QuizSet } from "@/lib/agents/types";

interface ArtifactState {
    studyGuide: StudyGuide | null;
    quizSet: QuizSet | null;
    
    // Actions
    setStudyGuide: (guide: StudyGuide | null) => void;
    setQuizSet: (quiz: QuizSet | null) => void;
    clearArtifacts: () => void;
}

export const useArtifactStore = create<ArtifactState>()(
    persist(
        (set) => ({
            studyGuide: null,
            quizSet: null,

            setStudyGuide: (guide) => set({ studyGuide: guide }),
            setQuizSet: (quiz) => set({ quizSet: quiz }),
            clearArtifacts: () => set({ studyGuide: null, quizSet: null }),
        }),
        { name: "kiatutor-artifact-storage" }
    )
);
