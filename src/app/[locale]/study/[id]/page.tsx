"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { useLibraryStore } from '@/store/useLibraryStore';
import dynamic from 'next/dynamic';
import FloatingChat from '@/components/study/FloatingChat';

const StudyRoom = dynamic(() => import('@/components/study/StudyRoom'), { ssr: false });
const QuizEngine = dynamic(() => import('@/components/quiz/QuizEngine'), { ssr: false });

export default function StudyRoutePage(props: { params: Promise<{ locale: string, id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const { studySessions, activeView, setActiveView, updateStudySession } = useLibraryStore();

    const session = studySessions.find(s => s.id === params.id);

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-zinc-900">
                <span className="material-symbols-outlined text-6xl text-zinc-700 mb-4">error_outline</span>
                <h1 className="text-2xl font-bold text-zinc-200 mb-2">Study Session Not Found</h1>
                <p className="text-zinc-500 mb-6">The study material you are looking for does not exist or has been deleted.</p>
                <button 
                    onClick={() => router.push(`/${params.locale}/library`)}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                    Return to Library
                </button>
            </div>
        );
    }

    return (
        <main className="w-full min-h-screen bg-zinc-900 text-zinc-200 relative pb-20">
            {/* Header / Back navigation */}
            <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800/50 mb-8">
                <button 
                    onClick={() => router.push(`/${params.locale}`)}
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="text-sm font-semibold uppercase tracking-wider">Dashboard</span>
                </button>
                <div className="text-sm text-zinc-500 font-medium">
                    Study Mode
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {activeView === 'QUIZ' ? (
                    <QuizEngine 
                        session={session} 
                        onFinish={(score) => { 
                            updateStudySession(session.id, { quizScore: score }); 
                            setActiveView('STUDY'); // Return to study mode instead of library
                        }} 
                    />
                ) : (
                    <>
                        <StudyRoom 
                            session={session} 
                            onStartQuiz={() => setActiveView('QUIZ')} 
                        />
                        {/* Floating AI Chat Overlay */}
                        <FloatingChat contextMarkdown={session.guideMarkdown} />
                    </>
                )}
            </div>
        </main>
    );
}
