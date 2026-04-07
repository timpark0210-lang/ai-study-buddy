"use client";

import { useState } from "react";
import { useArtifactStore } from "@/store/useArtifactStore";
import { useViewStore } from "@/store/useViewStore";
import { useUserStore } from "@/store/useUserStore";
import { Brain, Loader2, CheckCircle2, XCircle, RefreshCw, ArrowRight, Trophy, Target } from "lucide-react";
import type { QuizQuestion } from "@/lib/agents/types";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

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
            <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
                        <Brain size={48} className="text-rose-400" />
                    </div>
                </motion.div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">AI Quiz Master</h2>
                    <p className="text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Ready to test your knowledge? Just drop a topic and I'll generate a custom challenge for ya.
                    </p>
                </div>

                <div className="flex w-full gap-3 bg-black/20 border border-white/10 p-2 rounded-full focus-within:border-rose-500/50 transition-all shadow-inner">
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateQuiz()}
                        placeholder="e.g. History of New Zealand..."
                        className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-slate-600 text-white"
                        disabled={isLoading}
                    />
                    <button
                        onClick={generateQuiz}
                        disabled={isLoading || !topic.trim()}
                        className="bg-rose-500 hover:bg-rose-400 text-white rounded-full px-8 py-3 shadow-lg disabled:opacity-20 transition-all flex items-center gap-2 font-medium"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                            <>
                                <span>Start</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Finished state
    if (finished) {
        const total = quizSet.questions.length;
        const percentage = (score / total) * 100;
        
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <GlassCard className="max-w-md w-full p-10 space-y-8" delay={0.1}>
                    <motion.div 
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex justify-center"
                    >
                        <div className="text-6xl bg-white/5 w-24 h-24 rounded-full flex items-center justify-center border border-white/10">
                            {percentage === 100 ? "👑" : percentage >= 70 ? "🔥" : percentage >= 40 ? "🥝" : "📕"}
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black font-outfit text-white tracking-tight">
                            {score} / {total} Correct
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed px-4">
                            {percentage === 100
                                ? "Absolute legend! You've nailed everything, mate. Perfect score!"
                                : percentage >= 70
                                ? "Sweet as! You've got a solid grasp on this. Awesome effort."
                                : percentage >= 40
                                ? "Not bad at all. A bit more mahi and you'll be an expert in no time."
                                : "No worries! Every mistake is a learning step. Give it another smash?"}
                        </p>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button onClick={reset} className="btn-premium w-full flex items-center justify-center gap-2 py-4 text-base">
                            <RefreshCw size={18} /> Take New Quiz
                        </button>
                        <button onClick={() => window.location.reload()} className="text-slate-500 hover:text-white text-xs font-semibold py-2 transition-colors">
                            Back to Home
                        </button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    // Question view
    const q: QuizQuestion = quizSet.questions[currentQ];

    return (
        <div className="h-full flex flex-col items-center justify-center px-6 py-10 overflow-y-auto scrollbar-hide">
            <div className="w-full max-w-xl space-y-6">
                {/* Progress Bar */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-2">
                            <Target size={14} className="text-indigo-400" />
                            Question {currentQ + 1} of {quizSet.questions.length}
                        </span>
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md text-indigo-300">
                            {q.difficulty}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-rose-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQ + 1) / quizSet.questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <GlassCard className="p-8 shadow-indigo-500/5">
                            <h3 className="text-xl font-bold font-outfit text-white leading-tight mb-8">
                                {q.question}
                            </h3>

                            <div className="space-y-3">
                                {q.options.map((opt, i) => {
                                    const isSelected = selected === i;
                                    const isCorrect = i === q.answerIndex;
                                    const showResult = selected !== null;

                                    let bgStyle = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20";
                                    if (showResult) {
                                        if (isCorrect) bgStyle = "bg-green-500/20 border-green-500/40 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                                        else if (isSelected) bgStyle = "bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
                                        else bgStyle = "bg-white/5 border-white/10 text-slate-600 opacity-40";
                                    }

                                    return (
                                        <motion.button
                                            key={i}
                                            whileTap={!showResult ? { scale: 0.98 } : {}}
                                            onClick={() => handleAnswer(i)}
                                            disabled={showResult}
                                            className={`w-full group flex items-center justify-between gap-4 p-4 rounded-[20px] border transition-all text-left text-sm font-medium ${bgStyle}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] uppercase font-black transition-colors ${
                                                    isSelected ? "bg-white text-black border-white" : "border-white/20"
                                                }`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                {opt}
                                            </div>
                                            {showResult && isCorrect && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />}
                                            {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-500 flex-shrink-0" />}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </motion.div>
                </AnimatePresence>

                {/* Feedback and Navigation Area */}
                <AnimatePresence>
                    {selected !== null && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-[24px] text-sm leading-relaxed backdrop-blur-md">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-2 uppercase text-[10px] tracking-widest">
                                    <Target size={12} />
                                    <span>Explanation</span>
                                </div>
                                <p className="text-slate-300">{q.explanation}</p>
                            </div>
                            
                            <button 
                                onClick={nextQuestion} 
                                className="btn-premium w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group"
                            >
                                <span>{currentQ + 1 >= quizSet.questions.length ? "Finish Quiz & See Medals" : "Next Challenge"}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
