"use client";

import { useState } from "react";
import { useArtifactStore } from "@/store/useArtifactStore";
import { useViewStore } from "@/store/useViewStore";
import { useUserStore } from "@/store/useUserStore";
import { Brain, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { QuizQuestion } from "@/lib/agents/types";

export default function QuizView() {
    const { quizSet, setQuizSet } = useArtifactStore();
    const { isLoading, setLoading } = useViewStore();
    const { addXp } = useUserStore();
    const [topic, setTopic] = useState("");
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);

    const generateQuiz = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setCurrentQ(0);
        setSelected(null);
        setScore(0);
        setFinished(false);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: topic }],
                    mode: "quiz",
                }),
            });
            const data = await res.json();
            if (data.metadata?.quizSet) {
                setQuizSet(data.metadata.quizSet);
            }
        } catch (err) {
            console.error("Quiz generation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        const q = quizSet!.questions[currentQ];
        if (idx === q.answerIndex) {
            setScore((s) => s + 1);
            addXp(50);
        }
    };

    const nextQuestion = () => {
        if (currentQ + 1 >= (quizSet?.questions.length ?? 0)) {
            setFinished(true);
        } else {
            setCurrentQ((c) => c + 1);
            setSelected(null);
        }
    };

    const reset = () => {
        setQuizSet(null);
        setTopic("");
        setFinished(false);
        setScore(0);
        setCurrentQ(0);
        setSelected(null);
    };

    // Empty state
    if (!quizSet) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <Brain size={48} className="text-muted-foreground/40" />
                <div>
                    <h2 className="text-lg font-semibold mb-1">Quiz Generator</h2>
                    <p className="text-sm text-muted-foreground">
                        Test your knowledge with an AI-generated quiz.
                    </p>
                </div>
                <div className="flex w-full max-w-md gap-2">
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
                        placeholder="e.g. Photosynthesis"
                        className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                        disabled={isLoading}
                    />
                    <button
                        onClick={generateQuiz}
                        disabled={isLoading || !topic.trim()}
                        className="btn-premium disabled:opacity-40"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Start"}
                    </button>
                </div>
            </div>
        );
    }

    // Finished state
    if (finished) {
        const total = quizSet.questions.length;
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="text-4xl">{score === total ? "🎉" : score >= total / 2 ? "👍" : "📚"}</div>
                <h2 className="text-xl font-bold font-outfit">
                    {score}/{total} Correct
                </h2>
                <p className="text-sm text-muted-foreground">
                    {score === total
                        ? "Perfect score! You're absolutely smashing it, mate!"
                        : score >= total / 2
                        ? "Good effort! Keep practising and you'll nail it."
                        : "No worries — review the topic and give it another go!"}
                </p>
                <button onClick={reset} className="btn-premium flex items-center gap-2">
                    <RefreshCw size={14} /> Try Another Quiz
                </button>
            </div>
        );
    }

    // Question view
    const q: QuizQuestion = quizSet.questions[currentQ];

    return (
        <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Question {currentQ + 1} of {quizSet.questions.length}</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium">{q.difficulty}</span>
                </div>

                {/* Question */}
                <h3 className="text-base font-semibold mb-5 leading-relaxed">{q.question}</h3>

                {/* Options */}
                <div className="space-y-2.5 mb-6">
                    {q.options.map((opt, i) => {
                        let style = "border-border hover:border-primary/40 hover:bg-primary/5";
                        if (selected !== null) {
                            if (i === q.answerIndex) style = "border-green-500 bg-green-50 dark:bg-green-500/10";
                            else if (i === selected) style = "border-red-500 bg-red-50 dark:bg-red-500/10";
                            else style = "border-border opacity-50";
                        }
                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                disabled={selected !== null}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${style}`}
                            >
                                <span className="font-medium mr-2 text-muted-foreground">
                                    {String.fromCharCode(65 + i)}.
                                </span>
                                {opt}
                                {selected !== null && i === q.answerIndex && (
                                    <CheckCircle2 size={16} className="float-right mt-0.5 text-green-600" />
                                )}
                                {selected !== null && i === selected && i !== q.answerIndex && (
                                    <XCircle size={16} className="float-right mt-0.5 text-red-500" />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation */}
                {selected !== null && (
                    <div className="card-premium mb-4 text-sm">
                        <p className="font-medium mb-1">💡 Explanation</p>
                        <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                )}

                {/* Next Button */}
                {selected !== null && (
                    <button onClick={nextQuestion} className="btn-premium w-full">
                        {currentQ + 1 >= quizSet.questions.length ? "See Results" : "Next Question"}
                    </button>
                )}
            </div>
        </div>
    );
}
