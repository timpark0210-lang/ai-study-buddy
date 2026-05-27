"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useLibraryStore } from "@/store/useLibraryStore";
import { generateStudyGuideAction, generateQuizAction } from "@/lib/actions";

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
    } = useLibraryStore();
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    /**
     * 🔥 "Asher" Orchestration: Upload -> AI Analysis -> Study Room
     */
    const handleUploadComplete = async (fileUrl: string, fileName: string, mimeType: string) => {
        setIsAnalyzing(true);
        try {
            // Step 1: Generate AI Study Guide
            const guideResult = await generateStudyGuideAction(
                `Generate a structured study guide for ${fileName}. Provide clear summary and key takeaways.`, 
                [{ url: fileUrl, mimeType, name: fileName }], 
                'ko'
            );

            if (guideResult.success) {
                const sessionId = `session_${Date.now()}`;
                
                // Step 2: Register New Session
                addStudySession({
                    id: sessionId,
                    fileName,
                    fileType: mimeType.includes('pdf') ? 'pdf' : mimeType.includes('word') ? 'word' : 'image',
                    blobUrl: fileUrl,
                    subject: guideResult.subject || 'New Material',
                    guideMarkdown: guideResult.content || '',
                    quizData: null,
                    quizScore: null,
                    createdAt: new Date().toISOString()
                });
                
                setCurrentSessionId(sessionId);
                setActiveView('STUDY'); // Move to Study Room immediately
                setIsAnalyzing(false);

                // Step 3: Background - Generate Quiz
                if (guideResult.content) {
                   generateQuizAction(guideResult.content, 5).then(quizResult => {
                       if (quizResult.success) {
                           updateStudySession(sessionId, { quizData: quizResult.data });
                       }
                   });
                }
            } else {
                alert("Master Teacher Analysis failed. Please try again.");
                setIsAnalyzing(false);
            }
        } catch (err) {
            console.error("Dashboard Error:", err);
            setIsAnalyzing(false);
        }
    };

    return (
        <main className="w-full min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Header Section */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            AI Study Buddy
                        </h1>
                        <p className="text-slate-500 font-medium">Your personal Master Teacher is ready.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setActiveView('UPLOAD')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'UPLOAD' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                        >
                            Upload
                        </button>
                        <button 
                            onClick={() => setActiveView('LIBRARY')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'LIBRARY' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                        >
                            Library
                        </button>
                    </div>
                </div>

                {/* Dynamic View Content */}
                <div className="tutor-container animate-[fadeIn_0.5s_ease_both]">
                    {activeView === 'UPLOAD' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            {isAnalyzing ? (
                                 <div className="flex flex-col items-center gap-6">
                                     <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                     <p className="text-indigo-400 font-bold text-xl animate-pulse">Master Teacher is analyzing your material...</p>
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
                            onFinish={(score) => { 
                                updateStudySession(currentSessionId, { quizScore: score }); 
                                setActiveView('LIBRARY'); 
                            }} 
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
