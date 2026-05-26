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
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'DEEP_DIVE' | 'QUICK_REF'>('SUMMARY');

  /**
   * Helper function to extract specific sections from the generated markdown.
   */
  const extractSection = (markdown: string, keywords: string[]): string => {
    if (!markdown) return "";
    const lines = markdown.split('\n');
    let isTarget = false;
    const result: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        const match = keywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()));
        if (match) {
          isTarget = true;
          result.push(line);
          continue;
        } else {
          isTarget = false;
        }
      }
      if (isTarget) {
        result.push(line);
      }
    }
    return result.join('\n');
  };

  // Extract contents for different tabs
  const summaryContent = (() => {
    const overview = extractSection(session.guideMarkdown, ['Overview', '📌']);
    const terms = extractSection(session.guideMarkdown, ['Key Terms', '🔑']);
    const takeaways = extractSection(session.guideMarkdown, ['Takeaways', '✅']);
    
    let combined = [overview, terms, takeaways].filter(Boolean).join('\n\n');
    return combined || session.guideMarkdown; // fallback to full content if empty
  })();

  const quickRefContent = (() => {
    const quickRef = extractSection(session.guideMarkdown, ['Quick Reference', '📊']);
    return quickRef || "No Quick Reference table available for this material.";
  })();

  const activeContent = (() => {
    switch (activeTab) {
      case 'SUMMARY':
        return summaryContent;
      case 'QUICK_REF':
        return quickRefContent;
      case 'DEEP_DIVE':
      default:
        return session.guideMarkdown;
    }
  })();

  /**
   * PDF 저장 기능: 브라우저 기본 Print 기능을 활용한 clean Print-to-PDF 전환
   */
  const handleExportPDF = () => { 
    window.print();
  }; 

  return ( 
    <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[85vh]"> 
      
      {/* Top Action Bar */}
      <div className="glass-card mb-6 p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10 shrink-0 sticky top-4 shadow-2xl border-indigo-500/20 pdf-exclude"> 
        <div className="flex items-center gap-5"> 
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform"> 
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
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-xl cursor-pointer" 
          > 
            <span className="material-symbols-outlined text-xl text-indigo-400">download</span> Print / PDF
          </button> 
          <button 
            onClick={onStartQuiz} 
            disabled={!session.quizData} 
            className={`flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 cursor-pointer ${!session.quizData ? 'opacity-50 grayscale cursor-not-allowed' : 'animate-pulse'}`} 
          > 
            <span className="material-symbols-outlined font-bold">rocket_launch</span> 
            {session.quizData ? "Launch Quiz" : "Master Teacher is thinking..."} 
          </button> 
        </div> 
      </div> 

      {/* Interactive Tabs Navigation */}
      <div className="flex gap-2 rounded-2xl bg-slate-900/60 p-1.5 border border-slate-800/80 mb-6 max-w-md pdf-exclude">
        <button
          onClick={() => setActiveTab('SUMMARY')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === 'SUMMARY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <span className="material-symbols-outlined text-lg">lightbulb</span>
          Summary
        </button>
        <button
          onClick={() => setActiveTab('DEEP_DIVE')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === 'DEEP_DIVE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <span className="material-symbols-outlined text-lg">menu_book</span>
          Deep Dive
        </button>
        <button
          onClick={() => setActiveTab('QUICK_REF')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === 'QUICK_REF' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <span className="material-symbols-outlined text-lg">table_chart</span>
          Quick Ref
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pb-20 relative"> 
        <div ref={contentRef} id="print-area" className="glass-card p-10 md:p-16 min-h-full bg-[#1C1C1F] border-zinc-800/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]" > 
          
          {/* Print Only Header */}
          <div className="hidden print:block mb-8">
            <h1 className="text-3xl font-black text-slate-900 border-b-2 border-slate-900 pb-4 mb-2">{session.subject}</h1>
            <p className="text-sm text-slate-600 font-bold">Study Buddy Guide — Source: {session.fileName}</p>
          </div>

          <div className="prose-premium selection:bg-indigo-500/30 selection:text-white"> 
            
            {/* For printing: print the entire document instead of active tab */}
            <div className="print:hidden">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-sm">
                      <table className="min-w-full divide-y divide-indigo-500/20" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-6 py-4 text-left text-xs font-bold text-indigo-300 uppercase tracking-wider bg-indigo-500/10" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-6 py-4 text-sm text-slate-300 border-t border-indigo-500/10 whitespace-pre-line" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="text-indigo-300 font-extrabold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-amber-500 bg-amber-500/5 px-6 py-4 my-6 rounded-r-2xl text-slate-300 italic shadow-lg shadow-amber-500/5" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-2xl font-black text-white tracking-tight mt-10 mb-6 flex items-center gap-3 border-l-4 border-indigo-500 pl-4" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-xl font-bold text-indigo-400 tracking-tight mt-8 mb-4" {...props} />
                  )
                }}
              > 
                {activeContent} 
              </ReactMarkdown> 
            </div>

            {/* Print Area: Always shows FULL content */}
            <div className="hidden print:block">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
              > 
                {session.guideMarkdown} 
              </ReactMarkdown> 
            </div>

          </div> 
        </div> 

        {/* Ambient Background Glows */}
        <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.06] animate-pulse pointer-events-none pdf-exclude"></div> 
        <div className="fixed bottom-1/4 left-0 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-[0.06] animate-pulse pointer-events-none animation-delay-3000 pdf-exclude"></div> 
      </div> 
    </div> 
  ); 
}
