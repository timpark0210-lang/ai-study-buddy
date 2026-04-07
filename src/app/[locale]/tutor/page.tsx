"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useLibraryStore";
import { generateStudyGuideAction, generateQuizAction } from "@/lib/actions";

// Dynamic Imports for modular performance
const MaterialUploader = dynamic(() => import("@/components/ui/MaterialUploader"), { ssr: false });
const MyLibraryView = dynamic(() => import("@/components/study/MyLibraryView"), { ssr: false });
const StudyRoom = dynamic(() => import("@/components/study/StudyRoom"), { ssr: false });
const QuizEngine = dynamic(() => import("@/components/quiz/QuizEngine"), { ssr: false });

export default function TutorPage() {
    const { 
        activeView, 
        setActiveView, 
        addStudySession, 
        updateStudySession,
        studySessions,
        currentSessionId,
        setCurrentSessionId
    } = useAppStore();

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // AI Pipeline Orchestrator (Phase 3)
    const handleUploadComplete = async (fileUrl: string, fileName: string, mimeType: string) => {
        setIsAnalyzing(true);
        try {
            // 1. Generate Guide & Subject (AI Auto-Tagging)
            const guideResult = await generateStudyGuideAction(
                `Generate a study guide for ${fileName}`, 
                [{ url: fileUrl, mimeType, name: fileName }], 
                'ko' // Assume KO for global rule
            );

            if (guideResult.success) {
                const sessionId = `session_${Date.now()}`;
                
                // 2. Persist to DB-less store
                addStudySession({
                    id: sessionId,
                    fileName,
                    fileType: mimeType.includes('pdf') ? 'pdf' : mimeType.includes('word') ? 'word' : 'image',
                    blobUrl: fileUrl,
                    subject: guideResult.subject || 'General',
                    guideMarkdown: guideResult.content || '',
                    quizData: null,
                    quizScore: null,
                    createdAt: new Date().toISOString()
                });

                setCurrentSessionId(sessionId);

                // 3. Optimistic UI Switch: Move to STUDY view immediately!
                setActiveView('STUDY');
                setIsAnalyzing(false); // Stop loading indicator early

                // 4. Background Action: Generate Quiz silently while user reads!
                if (guideResult.content) {
                   generateQuizAction(guideResult.content, 4).then(quizResult => {
                       if (quizResult.success) {
                           updateStudySession(sessionId, { quizData: quizResult.data });
                           console.log("[Background AI] Quiz generation successful.");
                       }
                   });
                }
            } else {
                alert("Master Teacher Analysis failed. Please try again.");
                setIsAnalyzing(false);
            }
        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
        }
    };

    const handleQuizFinish = (score: number) => {
        if (currentSessionId) {
            updateStudySession(currentSessionId, { quizScore: score });
            setActiveView('LIBRARY'); // Go back to library after quiz!
        }
    };

    // Full Dashboard Router
    return (
        <div className="w-full h-full relative overflow-y-auto overflow-x-hidden bg-slate-950 text-slate-200">
            {/* View Layering */}
            {activeView === 'UPLOAD' && (
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    {isAnalyzing ? (
                         <div className="flex flex-col items-center gap-4 w-full px-8 animate-[fadeIn_0.5s_ease_both]">
                             <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center animate-pulse mb-2 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                                 <span className="material-symbols-outlined text-white text-3xl animate-bounce">auto_awesome</span>
                             </div>
                             <h3 className="text-xl font-bold text-white tracking-tight">AI Teacher is analyzing your material...</h3>
                             <p className="text-slate-400 font-medium">This takes about 10-15 seconds.</p>
                         </div>
                    ) : (
                        <MaterialUploader onUploadComplete={handleUploadComplete} />
                    )}
                </div>
            )}

            {activeView === 'LIBRARY' && (
                <MyLibraryView onSessionSelect={(id) => {
                    setCurrentSessionId(id);
                    setActiveView('STUDY');
                }} />
            )}

            {activeView === 'STUDY' && currentSessionId && (
                <StudyRoom 
                   session={studySessions.find(s => s.id === currentSessionId)!}
                   onStartQuiz={() => setActiveView('QUIZ')}
                />
            )}

            {activeView === 'QUIZ' && currentSessionId && (
                <QuizEngine 
                   session={studySessions.find(s => s.id === currentSessionId)!}
                   onFinish={handleQuizFinish}
                />
            )}
        </div>
    );
}
