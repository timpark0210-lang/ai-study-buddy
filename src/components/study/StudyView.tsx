"use client";

import { useState } from "react";
import { useArtifactStore } from "@/store/useArtifactStore";
import { useViewStore } from "@/store/useViewStore";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";

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
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
                <BookOpen size={48} className="text-muted-foreground/40" />
                <div>
                    <h2 className="text-lg font-semibold mb-1">Study Guide Generator</h2>
                    <p className="text-sm text-muted-foreground">
                        Enter a topic and I'll create a personalised study guide for you.
                    </p>
                </div>
                <div className="flex w-full max-w-md gap-2">
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateGuide()}
                        placeholder="e.g. Quadratic Equations"
                        className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                        disabled={isLoading}
                    />
                    <button
                        onClick={generateGuide}
                        disabled={isLoading || !topic.trim()}
                        className="btn-premium disabled:opacity-40"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Generate"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold font-outfit">{studyGuide.title}</h1>
                    <button
                        onClick={() => setStudyGuide(null)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Concept Tags */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {studyGuide.concepts.map((c, i) => (
                        <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {c}
                        </span>
                    ))}
                </div>

                {/* Content — rendered as plain text for now, markdown renderer in Phase 4 */}
                <article className="prose prose-sm dark:prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
                    {studyGuide.content}
                </article>

                {/* Suggested Path */}
                {studyGuide.suggestedPath?.length > 0 && (
                    <div className="mt-8 card-premium">
                        <h3 className="text-sm font-semibold mb-3">📋 Suggested Next Steps</h3>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                            {studyGuide.suggestedPath.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
