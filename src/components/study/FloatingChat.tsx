"use client";

import React, { useState, useRef, useEffect } from 'react';
import { chatAction } from '@/lib/actions';

interface FloatingChatProps {
    contextMarkdown: string;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

export default function FloatingChat({ contextMarkdown }: FloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        
        const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setIsTyping(true);

        const result = await chatAction(userMsg, contextMarkdown, messages);
        
        setIsTyping(false);
        if (result.success && result.text) {
            setMessages([...newMessages, { role: 'model', text: result.text }]);
        } else {
            setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error while thinking. Please try again.' }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            {/* Chat Panel */}
            <div 
                className={`transition-all duration-500 ease-in-out transform origin-bottom-right mb-4 ${
                    isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
                }`}
            >
                <div className="w-[380px] h-[550px] bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white text-sm">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="text-zinc-100 font-bold text-sm">AI Tutor</h3>
                                <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-indigo-400">waving_hand</span>
                                </div>
                                <h4 className="text-zinc-200 font-bold mb-2">Hello there!</h4>
                                <p className="text-zinc-500 text-sm">I have read the study material. Ask me anything about it!</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700/50 rounded-tl-sm'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-800 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                        <div className="relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about this material..."
                                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500"
                                disabled={isTyping}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-1.5 top-1.5 w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white disabled:opacity-50 disabled:bg-zinc-700 hover:bg-indigo-500 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-[0_10px_25px_rgba(99,102,241,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            >
                <span className="material-symbols-outlined text-2xl transition-transform duration-300">
                    {isOpen ? 'close' : 'chat'}
                </span>
            </button>
        </div>
    );
}
