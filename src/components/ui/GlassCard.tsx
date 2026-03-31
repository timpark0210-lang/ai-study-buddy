import { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hoverEffect?: boolean;
    intensity?: "light" | "medium" | "heavy";
}

export function GlassCard({
    children,
    className = "",
    hoverEffect = true,
    intensity = "medium",
    ...props
}: GlassCardProps) {
    const intensityClasses = {
        light: "bg-white/5 backdrop-blur-sm",
        medium: "bg-white/5 backdrop-blur-md",
        heavy: "bg-white/10 backdrop-blur-lg",
    };

    const combinedClassName = [
        "glass-card border border-white/10 rounded-2xl overflow-hidden",
        intensityClasses[intensity],
        hoverEffect ? "transition-all duration-300 hover:border-white/20 hover:bg-white/10" : "",
        className
    ].filter(Boolean).join(" ");

    return (
        <div className={combinedClassName} {...props}>
            {children}
        </div>
    );
}
