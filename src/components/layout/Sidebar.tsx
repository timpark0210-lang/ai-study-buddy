"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── 아이콘 SVG (lucide-react 없을 때 인라인으로 사용) ── */
const IconDashboard = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);
const IconTutor = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
const IconQuiz = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IconKnowledge = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const navItems = [
    { href: "/", label: "Dashboard", Icon: IconDashboard },
    { href: "/tutor", label: "AI Tutor", Icon: IconTutor },
    { href: "/quiz", label: "Quiz", Icon: IconQuiz },
    { href: "/library", label: "Knowledge Base", Icon: IconKnowledge },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: "var(--sidebar-width)",
            minHeight: "100vh",
            borderRight: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem 1rem",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 50,
            background: "rgba(9,9,11,0.92)",
            backdropFilter: "blur(20px)",
        }}>

            {/* 로고 */}
            <div style={{ marginBottom: "2.5rem", paddingLeft: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: "0.5rem",
                        background: "linear-gradient(135deg, var(--color-nzd-blue) 0%, var(--color-indigo) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0,
                    }}>🎓</div>
                    <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 400, lineHeight: 1.2 }}>
                            Kia Ora Tutor
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                            AI STUDY BUDDY
                        </div>
                    </div>
                </div>
            </div>

            {/* 네비게이션 */}
            <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {navItems.map(({ href, label, Icon }) => {
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 500 : 400,
                                color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                                background: isActive ? "var(--color-indigo-dim)" : "transparent",
                                border: `1px solid ${isActive ? "rgba(92,92,255,0.2)" : "transparent"}`,
                                transition: "all var(--duration-base) var(--ease-smooth)",
                                textDecoration: "none",
                            }}
                        >
                            <span style={{ color: isActive ? "var(--color-indigo)" : "inherit" }}>
                                <Icon />
                            </span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* 하단 유저 영역 */}
            <div style={{
                paddingTop: "1rem",
                borderTop: "1px solid var(--color-border)",
                marginTop: "1rem",
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.5rem",
                }}>
                    <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--color-nzd-blue) 0%, var(--color-indigo) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        flexShrink: 0,
                    }}>NZ</div>
                    <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 500 }}>NZ Student</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Free Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
