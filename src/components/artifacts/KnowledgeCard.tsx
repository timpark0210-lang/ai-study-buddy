interface KnowledgeCardProps {
    id: string;
    title: string;
    summary: string;
    tag: string;
    needsReview?: boolean;
}

export default function KnowledgeCard({ title, summary, tag, needsReview }: KnowledgeCardProps) {
    const borderColor = needsReview ? "rgba(239, 68, 68, 0.4)" : "var(--color-border)";
    const highlightColor = needsReview ? "#ef4444" : "var(--color-indigo)";

    return (
        <div
            className="glass-card"
            style={{
                padding: "0.875rem",
                animation: "fadeSlideIn 0.35s ease both",
                flexShrink: 0,
                border: `1px solid ${borderColor}`,
                background: needsReview ? "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(255,255,255,0.02) 100%)" : undefined,
            }}
        >
            {/* 상단 태그 및 오답 뱃지 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{
                    display: "inline-block",
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "var(--color-indigo)",
                    background: "var(--color-indigo-dim)",
                    border: "1px solid rgba(92,92,255,0.2)",
                    borderRadius: "var(--radius-full)",
                    padding: "0.15em 0.6em",
                }}>
                    {tag}
                </span>

                {needsReview && (
                    <span style={{
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        color: "#ef4444",
                        background: "rgba(239, 68, 68, 0.1)",
                        padding: "0.15em 0.4em",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem"
                    }}>
                        <span>⚠️</span> Needs Review
                    </span>
                )}
            </div>

            {/* 제목 */}
            <div style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9375rem",
                lineHeight: 1.25,
                marginBottom: "0.375rem",
            }}>
                {title}
            </div>

            {/* 요약 */}
            <div style={{
                fontSize: "0.8rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.55,
            }}>
                {summary}
            </div>

            {/* 하단 구분선 */}
            <div style={{
                marginTop: "0.625rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
            }}>
                <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: highlightColor,
                    flexShrink: 0,
                }} />
                <span style={{ fontSize: "0.6875rem", color: "var(--color-text-faint)" }}>
                    {needsReview ? "Requires more practice" : "Discovered in session"}
                </span>
            </div>
        </div>
    );
}
