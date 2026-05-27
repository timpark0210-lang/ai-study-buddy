"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLibraryStore } from "@/store/useLibraryStore";
import { generateStudyGuideAction, generateQuizAction } from "@/lib/actions";

const MaterialUploader = dynamic(() => import("@/components/ui/MaterialUploader"), { ssr: false });

export default function DashboardPage() {
    const router = useRouter();
    const { addStudySession, updateStudySession, studySessions, setCurrentSessionId } = useLibraryStore();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleUploadComplete = async (fileUrl: string, fileName: string, mimeType: string) => {
        setIsAnalyzing(true);
        
        const analysisTimeout = setTimeout(() => {
            setIsAnalyzing(false);
            alert("Analysis timed out. Please try again or check your network connection.");
        }, 30000);

        try {
            const guideResult = await generateStudyGuideAction(
                [{ url: fileUrl, mimeType, name: fileName }], 
                'en'
            );

            if (guideResult.success) {
                const sessionId = `session_${Date.now()}`;
                
                addStudySession({
                    id: sessionId,
                    fileName,
                    fileType: mimeType.includes('pdf') ? 'pdf' : mimeType.includes('word') ? 'word' : 'image',
                    blobUrl: fileUrl,
                    subject: guideResult.subject || 'New Material',
                    subjectCode: guideResult.subjectCode || 'OTHER',
                    guideMarkdown: guideResult.tabs?.guide || '',
                    tabs: guideResult.tabs,
                    blueprint: '',
                    quizData: null,
                    quizScore: null,
                    createdAt: new Date().toISOString()
                });
                
                setCurrentSessionId(sessionId);
                router.push(`/en/study/${sessionId}`);

                if (guideResult.tabs?.guide) {
                   generateQuizAction(guideResult.tabs.guide, 5).then(quizResult => {
                       if (quizResult.success) {
                           updateStudySession(sessionId, { quizData: quizResult.data });
                       }
                   });
                }
            } else {
                alert("Master Teacher Analysis failed. Please try again.");
            }
        } catch (err) {
            console.error("Dashboard Error:", err);
            alert("An error occurred during analysis. Please try again.");
        } finally {
            clearTimeout(analysisTimeout);
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="w-full min-h-screen bg-zinc-900 text-zinc-200 overflow-x-hidden p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-lg">Upload new materials or jump back into your recent study sessions.</p>
                </div>

                {/* Upload Section */}
                <section className="bg-zinc-800/40 border border-zinc-700/50 rounded-3xl p-8 shadow-xl">
                    {isAnalyzing ? (
                         <div className="flex flex-col items-center gap-6 py-10">
                             <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                             <p className="text-indigo-400 font-bold text-xl animate-pulse">Master Teacher is analyzing your material...</p>
                         </div>
                    ) : (
                        <MaterialUploader onUploadComplete={handleUploadComplete} />
                    )}
                </section>

                {/* Recent Subjects List */}
                <section>
                    <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-400">history</span>
                        Recent Study Subjects
                    </h2>
                    
                    {studySessions.length === 0 ? (
                        <div className="text-center py-16 bg-zinc-800/20 rounded-2xl border border-zinc-800/50">
                            <span className="material-symbols-outlined text-5xl text-zinc-600 mb-4 block">search_off</span>
                            <p className="text-zinc-500">No study sessions found. Upload a document to start learning!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {studySessions.map(session => (
                                <div 
                                    key={session.id} 
                                    onClick={() => {
                                        setCurrentSessionId(session.id);
                                        router.push(`/en/study/${session.id}`);
                                    }}
                                    className="bg-zinc-800/40 hover:bg-indigo-900/20 border border-zinc-700 hover:border-indigo-500/50 p-6 rounded-2xl cursor-pointer transition-all duration-300 group shadow-md hover:shadow-indigo-900/20 flex flex-col justify-between min-h-[160px]"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight mb-2">
                                            {session.subject}
                                        </h3>
                                        <p className="text-xs text-zinc-500 font-medium truncate">
                                            From: {session.fileName}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">
                                            {new Date(session.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="material-symbols-outlined text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                                            arrow_forward
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
