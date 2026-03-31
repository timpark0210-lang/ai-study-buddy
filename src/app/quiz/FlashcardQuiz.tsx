"use client";

import { useState } from "react";
import { useStudyStore } from "@/store/StudyContext";
import Link from "next/link";

interface QuizState {
    status: "idle" | "active" | "finished";
    currentCardIndex: number;
    correctCount: number;
    cardsToTest: any[];
}

export default function FlashcardQuiz() {
    const { knowledgeCards, stats, completeQuiz, markNeedsReview, clearReviewFlag } = useStudyStore();
    const [quizState, setQuizState] = useState<QuizState>({
        status: "idle",
        currentCardIndex: 0,
        correctCount: 0,
        cardsToTest: [],
    });
    const [showAnswer, setShowAnswer] = useState(false);

    const startQuiz = () => {
        const shuffled = [...knowledgeCards].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        setQuizState({ status: "active", currentCardIndex: 0, correctCount: 0, cardsToTest: selected });
        setShowAnswer(false);
    };

    const handleAnswer = (knewIt: boolean) => {
        const currentCard = quizState.cardsToTest[quizState.currentCardIndex];
        if (knewIt) clearReviewFlag(currentCard.id);
        else markNeedsReview(currentCard.id);
        const nextCorrect = knewIt ? quizState.correctCount + 1 : quizState.correctCount;
        const isNextLast = quizState.currentCardIndex + 1 >= quizState.cardsToTest.length;
        if (isNextLast) {
            completeQuiz(quizState.cardsToTest.length, nextCorrect);
            setQuizState({ ...quizState, status: "finished", correctCount: nextCorrect });
        } else {
            setQuizState({ ...quizState, currentCardIndex: quizState.currentCardIndex + 1, correctCount: nextCorrect });
            setShowAnswer(false);
        }
    };

    if (knowledgeCards.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="text-5xl">🎯</div>
                <h2 className="text-lg font-semibold">Not enough data yet</h2>
                <p className="text-sm text-muted-foreground">Go to the Tutor to study and collect knowledge cards!</p>
                <Link href="/tutor" className="btn-premium">Start Studying →</Link>
            </div>
        );
    }

    if (quizState.status === "idle") {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="text-5xl">🧠</div>
                <h2 className="text-xl font-semibold">Ready to test yourself?</h2>
                <p className="text-sm text-muted-foreground">{knowledgeCards.length} cards available. Up to 10 random cards per session.</p>
                <button onClick={startQuiz} className="btn-premium">Start Quiz Now</button>
            </div>
        );
    }

    if (quizState.status === "finished") {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="text-5xl">🏆</div>
                <h2 className="text-xl font-bold">{quizState.correctCount} / {quizState.cardsToTest.length} Correct</h2>
                <div className="flex gap-3">
                    <Link href="/" className="btn-premium">Back to Home</Link>
                    <button onClick={startQuiz} className="btn-premium">Review Again ↺</button>
                </div>
            </div>
        );
    }

    const card = quizState.cardsToTest[quizState.currentCardIndex];

    return (
        <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="w-full max-w-lg">
                <div className="mb-4 text-xs text-muted-foreground">Card {quizState.currentCardIndex + 1} of {quizState.cardsToTest.length}</div>
                <div className="card-premium min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                    {!showAnswer ? (
                        <>
                            <span className="text-xs text-primary font-semibold uppercase mb-4">{card.tag}</span>
                            <h2 className="text-2xl font-bold">{card.title}</h2>
                            <p className="text-sm text-muted-foreground mt-6">Think of the answer, then click below.</p>
                        </>
                    ) : (
                        <div className="card-premium p-6 w-full">
                            <p className="text-sm text-primary font-semibold mb-2">{card.title}</p>
                            <p className="leading-relaxed">{card.summary}</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 flex justify-center gap-3">
                    {!showAnswer ? (
                        <button onClick={() => setShowAnswer(true)} className="btn-premium">Show Answer 👀</button>
                    ) : (
                        <>
                            <button onClick={() => handleAnswer(false)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-red-400">Need Practice 😓</button>
                            <button onClick={() => handleAnswer(true)} className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 text-green-400">Got It! 🥳</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
