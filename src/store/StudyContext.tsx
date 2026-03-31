"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface KnowledgeItem {
    id: string;
    title: string;
    summary: string;
    tag: string;
    createdAt?: number;
    needsReview?: boolean;
}

export interface StudyStats {
    totalMinutes: number;
    conceptsMastered: number;
    quizScore: number;
    quizTotal: number;
}

interface StudyContextType {
    knowledgeCards: KnowledgeItem[];
    addKnowledgeCards: (cards: KnowledgeItem[]) => void;
    markNeedsReview: (cardId: string) => void;
    clearReviewFlag: (cardId: string) => void;
    stats: StudyStats;
    addStudyTime: (minutes: number) => void;
    completeQuiz: (total: number, score: number) => void;
    clearData: () => void;
}

const defaultStats: StudyStats = {
    totalMinutes: 0,
    conceptsMastered: 0,
    quizScore: 0,
    quizTotal: 0,
};

const StudyContext = createContext<StudyContextType | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
    const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeItem[]>([]);
    const [stats, setStats] = useState<StudyStats>(defaultStats);
    const [isLoaded, setIsLoaded] = useState(false);

    // 로드
    useEffect(() => {
        try {
            const savedCards = localStorage.getItem("ai_study_buddy_cards");
            if (savedCards) setKnowledgeCards(JSON.parse(savedCards));

            const savedStats = localStorage.getItem("ai_study_buddy_stats");
            if (savedStats) setStats(JSON.parse(savedStats));
        } catch (e) {
            console.error("Local storage error:", e);
        }
        setIsLoaded(true);
    }, []);

    // 저장
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("ai_study_buddy_cards", JSON.stringify(knowledgeCards));
            localStorage.setItem("ai_study_buddy_stats", JSON.stringify({
                ...stats,
                conceptsMastered: knowledgeCards.length,
            }));
        }
    }, [knowledgeCards, stats, isLoaded]);

    const addKnowledgeCards = (cards: KnowledgeItem[]) => {
        setKnowledgeCards((prev) => {
            // 중복 방지 로직 (제목 기준 간단히)
            const existingTitles = new Set(prev.map(c => c.title.toLowerCase()));
            const newCards = cards.filter(c => !existingTitles.has(c.title.toLowerCase()));
            return [...prev, ...newCards];
        });
    };

    const addStudyTime = (minutes: number) => {
        setStats((prev) => ({ ...prev, totalMinutes: prev.totalMinutes + minutes }));
    };

    const markNeedsReview = (cardId: string) => {
        setKnowledgeCards(prev => prev.map(c => c.id === cardId ? { ...c, needsReview: true } : c));
    };

    const clearReviewFlag = (cardId: string) => {
        setKnowledgeCards(prev => prev.map(c => c.id === cardId ? { ...c, needsReview: false } : c));
    };

    const completeQuiz = (total: number, score: number) => {
        setStats((prev) => ({
            ...prev,
            quizScore: prev.quizScore + score,
            quizTotal: prev.quizTotal + total,
        }));
    };

    const clearData = () => {
        setKnowledgeCards([]);
        setStats(defaultStats);
        localStorage.removeItem("ai_study_buddy_cards");
        localStorage.removeItem("ai_study_buddy_stats");
    };

    if (!isLoaded) return null; // Hydration mismatch 방지

    return (
        <StudyContext.Provider value={{ knowledgeCards, addKnowledgeCards, markNeedsReview, clearReviewFlag, stats, addStudyTime, completeQuiz, clearData }}>
            {children}
        </StudyContext.Provider>
    );
}

export function useStudyStore() {
    const context = useContext(StudyContext);
    if (!context) throw new Error("useStudyStore must be used within StudyProvider");
    return context;
}
