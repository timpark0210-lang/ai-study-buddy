"use client";

import KnowledgeCard from "@/components/artifacts/KnowledgeCard";
import { useStudyStore } from "@/store/StudyContext";
import Link from "next/link";

export default function LibraryContent() {
    const { knowledgeCards } = useStudyStore();

    return (
        <div style={{ maxWidth: "1000px" }}>
            <div style={{ marginBottom: "2rem", animation: "fadeSlideIn 0.4s ease both" }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-indigo)", letterSpacing: "0.1em", fontWeight: 500, marginBottom: "0.5rem" }}>
                    YOUR COLLECTION
                </p>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", marginBottom: "0.75rem" }}>
                    Knowledge Base
                </h1>
                <p style={{ color: "var(--color-text-muted)" }}>
                    All the knowledge cards collected from your tutoring sessions ({knowledgeCards.length} items).
                </p>
            </div>

            {knowledgeCards.length === 0 ? (
                <div
                    className="glass-card"
                    style={{
                        padding: "3rem",
                        textAlign: "center",
                        animation: "fadeSlideIn 0.4s ease 0.15s both",
                    }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                        Your library is empty
                    </h2>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                        As you study with your AI tutor, key concepts and definitions will be
                        automatically saved here for future reference.
                    </p>
                    <Link
                        href="/tutor"
                        style={{
                            display: "inline-block",
                            padding: "0.625rem 1.5rem",
                            borderRadius: "var(--radius-full)",
                            background: "var(--color-indigo)",
                            color: "white",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                        }}
                    >
                        Start Studying →
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", animation: "fadeSlideIn 0.4s ease 0.15s both" }}>
                    {knowledgeCards.map((card) => (
                        <KnowledgeCard key={card.id} {...card} />
                    ))}
                </div>
            )}
        </div>
    );
}

