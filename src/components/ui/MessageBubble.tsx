import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MessageBubbleProps {
    role: "user" | "assistant" | "system";
    content: string;
    isTyping?: boolean;
}

export function MessageBubble({ role, content, isTyping }: MessageBubbleProps) {
    const isUser = role === "user";
    const isSystem = role === "system";

    if (isSystem) {
        return (
            <div className="flex justify-center my-4">
                <span className="text-xs text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {content}
                </span>
            </div>
        );
    }

    return (
        <div className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[85%] rounded-2xl p-4 md:p-5",
                    isUser
                        ? "bg-[#005293] text-white rounded-tr-sm"
                        : "glass-card rounded-tl-sm border-white/10 text-zinc-100 prose-chat"
                )}
            >
                {!isUser && (
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#5C5CFF]">
                        <span className="text-lg">🤖</span> Tutor
                    </div>
                )}

                {isTyping ? (
                    <div className="flex space-x-1 items-center h-5">
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                    </div>
                ) : isUser ? (
                    <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                        {content}
                    </div>
                ) : (
                    <div className="text-[15px] leading-relaxed break-words"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown></div>
                )}
            </div>
        </div>
    );
}


