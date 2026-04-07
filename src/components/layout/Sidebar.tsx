"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/tutor", label: "AI Tutor", icon: "smart_toy" },
    { href: "/quiz", label: "Quiz Engine", icon: "quiz" },
    { href: "/library", label: "Study Room", icon: "menu_book" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen border-r border-border backdrop-blur-xl bg-card/80 flex flex-col p-6 fixed top-0 left-0 z-50 transition-all">
            {/* Logo Area */}
            <div className="mb-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <span className="material-symbols-outlined text-white">school</span>
                </div>
                <div>
                    <div className="font-sans text-lg font-bold tracking-tight text-foreground leading-tight">
                        Kia Ora
                    </div>
                    <div className="text-[10px] text-muted-foreground tracking-[0.2em] font-semibold uppercase">
                        Ai Tutor
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-2">
                {navItems.map(({ href, label, icon }) => {
                    // Match exact path or sub-paths, handling locale if needed
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                                ${isActive 
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                                    : "text-muted-foreground hover:bg-slate-800/50 hover:text-foreground border border-transparent"
                                }`
                            }
                        >
                            <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                                {icon}
                            </span>
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:shadow-md transition-shadow">
                        NZ
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-foreground">Scholar</div>
                        <div className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Premium</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
