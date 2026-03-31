"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useViewStore } from "@/store/useViewStore";
import { useUserStore } from "@/store/useUserStore";
import { Send, Loader2, ImagePlus } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatContainer() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const { isLoading, setLoading } = useViewStore();
    const { addXp, updateStreak } = useUserStore();
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !image) return;

        const userMsg: Message = { role: "user", content: input };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);

        try {
            const imagePart = image
                ? { inlineData: { data: image.split(",")[1], mimeType: "image/png" } }
                : undefined;

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: nextMessages, imagePart, mode: "chat" }),
            });

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
            addXp(25);
            updateStreak();
            setImage(null);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry mate, something went wrong. Give it another go?" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-center">
                        <div>
                            <p className="text-2xl mb-2">🥝</p>
                            <p className="font-medium">Kia Ora! Upload a photo of your work</p>
                            <p className="text-sm">or ask me any question to get started.</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-muted text-foreground rounded-bl-md"
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                            <Loader2 size={16} className="animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Image Preview */}
            {image && (
                <div className="px-4 pb-2">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs">
                        📎 Image attached
                        <button onClick={() => setImage(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border p-4">
                <div className="mx-auto flex max-w-3xl items-center gap-2">
                    <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <ImagePlus size={18} />
                    </button>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !image)}
                        className="btn-premium disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
}
