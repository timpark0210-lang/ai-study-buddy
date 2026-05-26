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
        
        // 30-second timeout safety gate to prevent UI deadlock
        const analysisTimeout = setTimeout(() => {
            setIsAnalyzing(false);
            alert("Analysis timed out. Please try again or check your network connection.");
        }, 30000);

        try {
            const structuredPrompt = `Generate a highly detailed and structured study guide based on the provided material.
CRITICAL RULE: The entire guide MUST be written in New Zealand English (NZ English). Do NOT write any Korean (한글) or any other languages under any circumstances. Ensure NZ English style spelling is used (e.g., "colour", "summarise", "programme"), and the currency unit is always New Zealand Dollars $(NZD) if any financial references are made.

Please output the guide in valid Markdown with the following specific structure:
- Begin with a main title using '# [Subject Name]'.
- Section 1: '## 📌 Overview' — A clear, 3-4 sentence summary of the study material.
- Section 2: '## 🔑 Key Terms' — A definitions table using markdown table format ('| Term | Definition |'). List key terms from the document. Make sure the table syntax is perfectly valid markdown.
- Section 3: '## 📖 Core Concepts' — Deep-dive analysis of the main concepts. Break down into subheadings '### Concept Name' and explain clearly with examples.
- Section 4: '## 📊 Quick Reference' — A quick summary table or key formulas/rules using valid markdown table format.
- Section 5: '## ✅ Key Takeaways' — A bulleted list of crucial points the student must remember.

Double check that all markdown tables have proper alignment headers, row separators (|---|---|), and no broken pipe characters, to prevent layout breaking.`;

            // Step 1: Generate AI Study Guide
            const guideResult = await generateStudyGuideAction(
                structuredPrompt, 
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
        <main className="w-full min-h-screen bg-zinc-900 text-zinc-200 overflow-x-hidden">
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
