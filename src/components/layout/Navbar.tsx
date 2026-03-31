"use client";

import { useUserStore } from "@/store/useUserStore";
import { useViewStore, ViewMode } from "@/store/useViewStore";
import { MessageSquare, BookOpen, Brain } from "lucide-react";

const tabs: { id: ViewMode; label: string; icon: typeof MessageSquare }[] = [
    { id: "chat", label: "Tutor", icon: MessageSquare },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Brain },
];

export default function Navbar() {
    const { level, xp } = useUserStore();
    const { currentView, setView } = useViewStore();
    const xpProgress = Math.min((xp / (level * 1000)) * 100, 100);

    return (
        <header className="sticky top-0 z-50 glass border-b border-border/50">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold font-outfit tracking-tight">
                        🥝 Kia Ora Tutor
                    </span>
                </div>

                {/* Tab Navigation */}
                <nav className="flex gap-1 rounded-full bg-muted/60 p-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setView(id)}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                currentView === id
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon size={15} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </nav>

                {/* XP / Level Badge */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">
                        Lv.{level}
                    </span>
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
