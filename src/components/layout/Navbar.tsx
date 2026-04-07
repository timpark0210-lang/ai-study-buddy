"use client";

import { useUserStore } from "@/store/useUserStore";
import { useViewStore, ViewMode } from "@/store/useViewStore";
import { MessageSquare, BookOpen, Brain, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const tabs: { id: ViewMode; label: string; icon: typeof MessageSquare }[] = [
    { id: "chat", label: "Tutor", icon: MessageSquare },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Brain },
];

export default function Navbar() {
    const { level, xp } = useUserStore();
    const { currentView, setView } = useViewStore();
    const [nzTime, setNzTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const time = new Intl.DateTimeFormat("en-NZ", {
                timeZone: "Pacific/Auckland",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }).format(new Date());
            setNzTime(time);
        };
        updateTime();
        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, []);

    const xpProgress = Math.min((xp / (level * 1000)) * 100, 100);

    return (
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="flex h-16 w-full max-w-5xl items-center justify-between px-6 glass-card pointer-events-auto">
                {/* Logo & Locale */}
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold font-outfit tracking-tight bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
                        🥝 Kia Ora
                    </span>
                    <div className="hidden md:flex items-center gap-3 border-l border-white/10 pl-4 text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                            <Clock size={12} className="text-indigo-400" />
                            <span>{nzTime} NZ</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign size={12} className="text-teal-400" />
                            <span className="text-slate-300">$NZD</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex gap-1 rounded-2xl bg-black/20 p-1.5 border border-white/5">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setView(id)}
                            className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300"
                        >
                            {currentView === id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-indigo-500/20 border border-indigo-500/30 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon size={16} className={currentView === id ? "text-indigo-400" : "text-slate-400"} />
                            <span className={currentView === id ? "text-white" : "text-slate-500"}>
                                {label}
                            </span>
                        </button>
                    ))}
                </nav>

                {/* XP / Level Badge */}
                <div className="hidden sm:flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/5">
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Progress</span>
                        <span className="text-xs font-bold text-indigo-300">Lv.{level}</span>
                    </div>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
