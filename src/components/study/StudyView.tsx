"use client";

import { useState } from "react";
import { useArtifactStore } from "@/store/useArtifactStore";
import { useViewStore } from "@/store/useViewStore";
import { BookOpen, Loader2, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export default function StudyView() {
    const { studyGuide, setStudyGuide } = useArtifactStore();
    const { isLoading, setLoading } = useViewStore();
    const [topic, setTopic] = useState("");

    const generateGuide = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{ role: "user", content: topic }],
                    mode: "study",
                }),
            });
            const data = await res.json();
            if (data.metadata?.guide) {
                setStudyGuide(data.metadata.guide);
            }
        } catch (err) {
            console.error("Study guide generation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!studyGuide) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-8 px-6 text-center max-w-2xl mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
                        <BookOpen size={48} className="text-indigo-400" />
                    </div>
                </motion.div>
                
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">AI Study Guide</h2>
                    <p className="text-slate-400 leading-relaxed max-w-sm">
                        Chur! Just tell me what you're learning, and I'll whip up a premium study guide for ya.
                    </p>
                </div>

                <div className="flex w-full gap-3 bg-black/20 border border-white/10 p-2 rounded-full focus-within:border-indigo-500/50 transition-all shadow-inner">
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateGuide()}
                        placeholder="e.g. Photosynthesis or Calculus..."
                        className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-slate-600 text-white"
                        disabled={isLoading}
                    />
                    <button
                        onClick={generateGuide}
                        disabled={isLoading || !topic.trim()}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-6 py-3 shadow-lg disabled:opacity-20 transition-all flex items-center gap-2 font-medium"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                            <>
                                <span>Generate</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-6 py-10 scrollbar-hide">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Header Card */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                            <Sparkles size={14} />
                            <span>Generated Study Guide</span>
                        </div>
                        <h1 className="text-3xl font-black font-outfit text-white tracking-tight">{studyGuide.title}</h1>
                    </div>
                    <button
                        onClick={() => setStudyGuide(null)}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-3 text-slate-400 hover:text-white transition-all"
                        title="New Guide"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Concept Tags */}
                <div className="flex flex-wrap gap-2.5">
                    {studyGuide.concepts.map((c, i) => (
                        <motion.span 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md"
                        >
                            #{c}
                        </motion.span>
                    ))}
                </div>

                {/* Content Section */}
                <GlassCard className="p-8 shadow-indigo-500/5" delay={0.2}>
                    <div className="prose-glass">
                        <ReactMarkdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                        >
                            {studyGuide.content}
                        </ReactMarkdown>
                    </div>
                </GlassCard>

                {/* Suggested Path */}
                {studyGuide.suggestedPath?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <h3 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                            <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                            Suggested Next Steps
                        </h3>
                        <div className="grid gap-3">
                            {studyGuide.suggestedPath.map((step, i) => (
                                <motion.div 
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl group transition-all hover:bg-white/10"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{step}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
