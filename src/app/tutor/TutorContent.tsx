"use client";

import { useState, useRef, useEffect } from "react";
import KnowledgeCard from "@/components/artifacts/KnowledgeCard";
import { useStudyStore } from "@/store/StudyContext";

/* ── 타입 ── */
type Role = "user" | "tutor";

interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
}

interface KnowledgeItem {
    id: string;
    title: string;
    summary: string;
    tag: string;
    createdAt?: number;
}

/* ── 파일 업로드 영역 ── */
function UploadZone({ onImageSelect }: { onImageSelect: (base64: string) => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setPreview(base64);
            onImageSelect(base64);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) processFile(file);
            }}
            style={{
                border: `2px dashed ${isDragging ? "var(--color-indigo)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem",
                textAlign: "center",
                cursor: "pointer",
                transition: "all var(--duration-base) var(--ease-smooth)",
                background: isDragging ? "var(--color-indigo-dim)" : "var(--color-surface)",
                marginBottom: "1rem",
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                }}
            />
            {preview ? (
                <img src={preview} alt="Uploaded" style={{ maxWidth: "100%", borderRadius: "var(--radius-md)", maxHeight: "160px", objectFit: "contain" }} />
            ) : (
                <>
                    <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>📸</div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 500, marginBottom: "0.25rem" }}>Upload a Problem</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Drag & drop or click<br />JPG, PNG, PDF supported
                    </div>
                </>
            )}
        </div>
    );
}

/* ── 채팅 메시지 버블 ── */
function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";
    return (
        <div
            style={{
                display: "flex",
                flexDirection: isUser ? "row-reverse" : "row",
                gap: "0.625rem",
                alignItems: "flex-start",
                animation: "fadeSlideIn 0.3s ease both",
            }}
        >
            {/* 아바타 */}
            <div style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.875rem",
                background: isUser
                    ? "linear-gradient(135deg, var(--color-nzd-blue) 0%, var(--color-indigo) 100%)"
                    : "linear-gradient(135deg, #1e1e2e 0%, #2d2d4e 100%)",
                border: "1px solid var(--color-border)",
            }}>
                {isUser ? "👤" : "🎓"}
            </div>

            {/* 말풍선 */}
            <div style={{
                maxWidth: "75%",
                padding: "0.75rem 1rem",
                borderRadius: isUser ? "1rem 0.25rem 1rem 1rem" : "0.25rem 1rem 1rem 1rem",
                background: isUser ? "var(--color-indigo-dim)" : "var(--color-surface)",
                border: `1px solid ${isUser ? "rgba(92,92,255,0.2)" : "var(--color-border)"}`,
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: "var(--color-text)",
                whiteSpace: "pre-wrap",
            }}
                className="prose-chat"
            >
                {message.content}
            </div>
        </div>
    );
}

/* ── 메인 튜터 페이지 ── */
export default function TutorContent() {
    const { addKnowledgeCards, addStudyTime } = useStudyStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 학습 시간 측정 로직
    useEffect(() => {
        const startTime = Date.now();
        return () => {
            const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
            if (elapsedMinutes > 0) {
                addStudyTime(elapsedMinutes);
            }
        };
    }, [addStudyTime]);

    // 시작 환영 메시지
    useEffect(() => {
        setMessages([{
            id: "welcome",
            role: "tutor",
            content: "Kia ora! 👋 I'm your AI study tutor.\n\nI'm here to help you *understand* concepts deeply — not just give you answers. You can ask me anything, or upload an image of a problem and I'll guide you through it step by step.\n\nWhat would you like to explore today?",
            timestamp: new Date(),
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed && !image) return;
        if (isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: trimmed || "(Uploaded an image)",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    image: image,
                    history: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await res.json();

            const tutorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "tutor",
                content: data.reply || "I'm sorry, I couldn't process that. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, tutorMsg]);

            /* 지식 카드 추출 (API 응답에 concepts 포함 시) */
            if (data.concepts?.length) {
                const newCards: KnowledgeItem[] = data.concepts.map((c: { title: string; summary: string; tag: string }, idx: number) => ({
                    id: `${Date.now()}-${idx}`,
                    title: c.title,
                    summary: c.summary,
                    tag: c.tag,
                    createdAt: Date.now(),
                }));
                // 최근 지식 카드 표시
                setKnowledgeItems((prev) => [...prev, ...newCards]);
                // 전역 컨텍스트 영구 저장
                addKnowledgeCards(newCards as any);
            }

            setImage(null);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "tutor",
                    content: "⚠️ Connection error.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", gap: "1.5rem", height: "calc(100vh - 4rem)", maxWidth: "1200px" }}>

            {/* ── 왼쪽: 업로드 & 도구 패널 ── */}
            <aside style={{
                width: "220px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}>
                <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Upload Material
                    </h2>
                    <UploadZone onImageSelect={setImage} />
                    {image && (
                        <button
                            onClick={() => setImage(null)}
                            style={{ width: "100%", padding: "0.4rem", fontSize: "0.75rem", color: "var(--color-text-muted)", background: "transparent", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                        >
                            Remove image ✕
                        </button>
                    )}
                </div>

                <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                        Tutor Mode
                    </h2>
                    {["Socratic (Default)", "Explain & Teach", "Practice Mode"].map((mode) => (
                        <button
                            key={mode}
                            style={{
                                width: "100%", textAlign: "left", padding: "0.5rem 0.75rem", marginBottom: "0.375rem", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem",
                                background: mode === "Socratic (Default)" ? "var(--color-indigo-dim)" : "transparent",
                                border: `1px solid ${mode === "Socratic (Default)" ? "rgba(92,92,255,0.2)" : "var(--color-border)"}`,
                                color: mode === "Socratic (Default)" ? "var(--color-indigo)" : "var(--color-text-muted)",
                                cursor: "pointer",
                            }}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </aside>

            {/* ── 가운데: 채팅 ── */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", overflow: "hidden",
            }}>
                {/* 헤더 */}
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "0.625rem", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e88" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9375rem" }}>AI Tutor — Socratic Mode</span>
                </div>

                {/* 메시지 목록 */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    {isLoading && (
                        <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start", animation: "fadeSlideIn 0.3s ease both" }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d4e 100%)", border: "1px solid var(--color-border)" }}>🎓</div>
                            <div style={{ padding: "0.75rem 1rem", borderRadius: "0.25rem 1rem 1rem 1rem", background: "var(--color-surface)", border: "1px solid var(--color-border)" }} className="animate-shimmer">
                                <div style={{ width: 60, height: "0.875rem", borderRadius: "var(--radius-sm)", opacity: 0 }}>.</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 입력창 */}
                <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid var(--color-border)", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end" }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Ask a question... (Shift+Enter for new line)"
                            rows={2}
                            style={{ flex: 1, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "0.625rem 0.875rem", color: "var(--color-text)", fontSize: "0.9rem", resize: "none", outline: "none", fontFamily: "var(--font-body)", lineHeight: 1.5 }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(92,92,255,0.4)")}
                            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={isLoading || (!input.trim() && !image)}
                            style={{ padding: "0.625rem 1.125rem", borderRadius: "var(--radius-md)", background: (isLoading || (!input.trim() && !image)) ? "var(--color-surface)" : "var(--color-indigo)", border: "1px solid var(--color-border)", color: (isLoading || (!input.trim() && !image)) ? "var(--color-text-muted)" : "white", fontSize: "0.875rem", fontWeight: 500, cursor: (isLoading || (!input.trim() && !image)) ? "not-allowed" : "pointer" }}
                        >
                            {isLoading ? "..." : "Send →"}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 오른쪽: 최근 수집 지식 카드 ── */}
            <aside style={{
                width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto",
            }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem", flexShrink: 0 }}>
                    Recent Artifacts
                </h2>
                {knowledgeItems.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem 1rem", border: "2px dashed var(--color-border)", borderRadius: "var(--radius-lg)" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🧩</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                            Key concepts discovered will appear here.
                        </div>
                    </div>
                ) : (
                    knowledgeItems.map((item) => (
                        <KnowledgeCard key={item.id} {...item} />
                    ))
                )}
            </aside>
        </div>
    );
}

