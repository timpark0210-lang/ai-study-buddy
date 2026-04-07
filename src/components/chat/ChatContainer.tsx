import { useState, useEffect, useRef, FormEvent } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { useViewStore } from "@/store/useViewStore";
import { useUserStore } from "@/store/useUserStore";
import { ImagePlus, Loader2, Send } from "lucide-react";

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
        <GlassCard className="flex flex-col h-[70vh] max-w-4xl mx-auto shadow-2xl border-white/10" delay={0.2}>
            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex h-full items-center justify-center text-slate-400 text-center"
                        >
                            <div className="space-y-4">
                                <span className="text-5xl block animate-bounce">🥝</span>
                                <h3 className="text-xl font-bold font-outfit text-white">Kia Ora! I'm your AI Tutor</h3>
                                <p className="text-sm max-w-xs mx-auto opacity-70">Upload a study photo or ask me any question to kick off your learning journey.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-sm leading-relaxed shadow-lg ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm"
                                                : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-md"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
                
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-start mt-6"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-sm px-5 py-3 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 font-outfit uppercase tracking-wider">Tutor is thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Area Overlay */}
            <div className="px-6 pb-8 pt-4">
                <form 
                    onSubmit={handleSubmit} 
                    className="relative flex items-center gap-3 bg-black/40 border border-white/10 rounded-[28px] p-2 focus-within:border-indigo-500/50 transition-all shadow-inner"
                >
                    <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className={`rounded-full p-3 transition-all ${image ? "bg-teal-500/20 text-teal-400" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                    >
                        <ImagePlus size={20} />
                    </button>
                    
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-600 text-white"
                        disabled={isLoading}
                    />
                    
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !image)}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-full p-3 shadow-lg disabled:opacity-20 disabled:grayscale transition-all"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                    
                    {image && (
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className="absolute -top-12 left-2 flex items-center gap-2 bg-teal-500/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter"
                        >
                            📎 Image Ready
                            <button onClick={() => setImage(null)} className="hover:scale-125 transition-transform">✕</button>
                        </motion.div>
                    )}
                </form>
            </div>
        </GlassCard>
    );
}
