"use client";

import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { StudySession } from '@/types';

interface StudyRoomProps {
  session: StudySession;
  onStartQuiz: () => void;
}

export default function StudyRoom({ session, onStartQuiz }: StudyRoomProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    try {
      setIsExporting(true);
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: `KiaOraTutor_${session.fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(contentRef.current).save();
    } catch (err: any) {
      alert('PDF generation failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
      {/* Header Panel */}
      <div className="glass-card mb-6 p-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
             <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Personalized Study Guide</h1>
            <div className="text-xs text-indigo-400 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">label</span>
              {session.subject} • {session.fileName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm text-slate-300 bg-slate-800/50 hover:bg-slate-700 hover:text-white transition-all"
          >
            {isExporting ? (
              <><span className="material-symbols-outlined animate-spin text-lg">sync</span> Exporting...</>
            ) : (
              <><span className="material-symbols-outlined text-lg">picture_as_pdf</span> PDF</>
            )}
          </button>
          <button 
            onClick={onStartQuiz} 
            disabled={!session.quizData}
            className={`btn-premium py-2 px-5 text-sm ${!session.quizData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-lg">quiz</span> 
            {session.quizData ? "Start Quiz" : "Generating Quiz..."}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-12 z-10">
        <div 
          ref={contentRef}
          className="glass-card p-8 md:p-12 min-h-full bg-card"
        >
          {/* We wrap the markdown in our tailored typography class */}
          <div className="prose-premium selection:bg-indigo-500/30">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {session.guideMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      {/* Background Decorative Mesh */}
      <div className="fixed top-20 right-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>
    </div>
  );
}
