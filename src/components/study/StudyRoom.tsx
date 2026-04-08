"use client"; 
import React, { useRef, useState } from 'react'; 
import ReactMarkdown from 'react-markdown'; 
import remarkMath from 'remark-math'; 
import rehypeKatex from 'rehype-katex'; 
import 'katex/dist/katex.min.css'; 
import { StudySession } from '@/store/useLibraryStore'; 

interface StudyRoomProps { 
  session: StudySession; 
  onStartQuiz: () => void; 
} 

export default function StudyRoom({ session, onStartQuiz }: StudyRoomProps) { 
  const contentRef = useRef<HTMLDivElement>(null); 
  const [isExporting, setIsExporting] = useState(false); 

  /**
   * 🔥 Export study guide to PDF for offline learning
   */
  const handleExportPDF = async () => { 
    if (!contentRef.current) return; 
    try { 
      setIsExporting(true); 
      // Dynamic import to keep bundle small
      const html2pdf = (await import('html2pdf.js')).default; 
      const opt = { 
        margin: 0.5, 
        filename: `StudyBuddy_${session.subject}_${Date.now()}.pdf`, 
        image: { type: 'jpeg' as const, quality: 0.98 }, 
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#020617' }, // Slate-950
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const } 
      }; 
      await html2pdf().set(opt).from(contentRef.current).save(); 
    } catch (err: any) { 
      console.error(err);
      alert('PDF generation failed. Please try again.'); 
    } finally { 
      setIsExporting(false); 
    } 
  }; 

  return ( 
    <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[85vh]"> 
      
      {/* Top Action Bar */}
      <div className="glass-card mb-8 p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10 shrink-0 sticky top-4 shadow-2xl border-indigo-500/20"> 
        <div className="flex items-center gap-5"> 
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform"> 
            <span className="material-symbols-outlined text-3xl font-bold">auto_stories</span> 
          </div> 
          <div> 
            <h1 className="text-xl font-black text-white tracking-tighter uppercase">{session.subject}</h1> 
            <div className="text-xs text-indigo-400 font-bold flex items-center gap-2 mt-1"> 
              <span className="bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{session.fileType.toUpperCase()}</span> 
              <span className="text-slate-500">•</span> 
              <span className="line-clamp-1 max-w-[200px]">{session.fileName}</span> 
            </div> 
          </div> 
        </div> 
        
        <div className="flex items-center gap-4 w-full md:w-auto"> 
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting} 
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-xl" 
          > 
            {isExporting ? ( 
              <><span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> Exporting...</> 
            ) : ( 
              <><span className="material-symbols-outlined text-xl text-indigo-400">download</span> Save as PDF</> 
            )} 
          </button> 
          <button 
            onClick={onStartQuiz} 
            disabled={!session.quizData} 
            className={`flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 ${!session.quizData ? 'opacity-50 grayscale cursor-not-allowed' : 'animate-pulse'}`} 
          > 
            <span className="material-symbols-outlined font-bold">rocket_launch</span> 
            {session.quizData ? "Launch Quiz" : "Master Teacher is thinking..."} 
          </button> 
        </div> 
      </div> 

      {/* Main Content Area */}
      <div className="flex-1 pb-20 relative"> 
        <div ref={contentRef} className="glass-card p-10 md:p-16 min-h-full bg-slate-950 border-slate-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]" > 
          <div className="prose-premium selection:bg-indigo-500/30 selection:text-white"> 
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}> 
              {session.guideMarkdown} 
            </ReactMarkdown> 
          </div> 
        </div> 

        {/* Ambient Background Glows */}
        <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.03] animate-pulse pointer-events-none"></div> 
        <div className="fixed bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.03] animate-pulse pointer-events-none animation-delay-3000"></div> 
      </div> 
    </div> 
  ); 
}
