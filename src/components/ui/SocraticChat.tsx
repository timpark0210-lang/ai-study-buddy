"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { Send, ImagePlus, Paperclip } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
}

export function SocraticChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Kia Ora! I'm your AI Study Buddy. Upload an image of your problem or type a question, and let's figure it out together.",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        const updatedMessages = [...messages, newUserMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedMessages,
                    // imagePart: ... (TODO: Add image upload handling later)
                }),
            });

            if (!res.ok) throw new Error("API request failed");

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.content,
                },
            ]);

            if (data.metadata?.concept) {
                console.log("-> Artifact Discovered:", data.metadata.concept);
                // (TODO: Push to Artifacts panel)
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "system",
                    content: "Sorry, I had trouble reaching the AI engine. Please try again.",
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-3xl border border-white/10 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {isTyping && <MessageBubble role="assistant" content="" isTyping={true} />}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
                <div className="relative flex items-end gap-2 bg-black/40 rounded-2xl border border-white/10 p-2 focus-within:border-[#5C5CFF]/50 transition-colors">
                    <button className="p-2 text-zinc-400 hover:text-[#5C5CFF] rounded-xl hover:bg-white/5 transition-colors shrink-0">
                        <ImagePlus size={20} />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-[#5C5CFF] rounded-xl hover:bg-white/5 transition-colors shrink-0">
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Type your question or drop an image here..."
                        className="w-full bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none py-2.5 max-h-32 min-h-[44px] custom-scrollbar"
                        rows={1}
                    />

                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2.5 bg-[#5C5CFF] hover:bg-[#4B4BFF] disabled:bg-white/10 disabled:text-zinc-500 text-white rounded-xl transition-colors shrink-0 mb-0.5"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
