"use client";

import React from 'react';
import { useAppStore } from '@/store/useLibraryStore';

interface MyLibraryViewProps {
  onSessionSelect: (sessionId: string) => void;
}

export default function MyLibraryView({ onSessionSelect }: MyLibraryViewProps) {
  const { studySessions } = useAppStore();

  if (!studySessions || studySessions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-12 text-center mt-20 animate-[fadeIn_0.5s_ease_both]">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-5xl text-slate-500">menu_book</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Your Library is Empty</h2>
        <p className="text-slate-400 max-w-sm mb-8">Upload material in the dashboard to let our AI Tutor generate personalized study sessions.</p>
      </div>
    );
  }

  // Auto-Group by subject
  const sessionsBySubject = studySessions.reduce((acc, session) => {
    const subject = session.subject || "General";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(session);
    return acc;
  }, {} as Record<string, typeof studySessions>);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 animate-[fadeIn_0.5s_ease_both]">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">My Library</h1>
        <p className="text-slate-400 font-medium tracking-wide">Select a past study section to resume learning</p>
      </div>

      <div className="space-y-12">
        {Object.entries(sessionsBySubject).map(([subject, sessions]) => (
          <div key={subject}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">{subject}</h2>
              <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-md ml-2">{sessions.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  onClick={() => onSessionSelect(session.id)}
                  className="glass-card p-6 flex flex-col gap-4 cursor-pointer hover:bg-slate-800/80 hover:border-indigo-500/30 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                      <span className="material-symbols-outlined text-indigo-400 group-hover:text-indigo-300">
                        {session.fileType === 'pdf' ? 'picture_as_pdf' : session.fileType === 'word' ? 'description' : 'image'}
                      </span>
                    </div>
                    {session.quizScore !== null && (
                      <div className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                        Quiz Score: {session.quizScore}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 line-clamp-1 mb-1 group-hover:text-white transition-colors">{session.fileName}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">
                       {session.guideMarkdown ? session.guideMarkdown.slice(0, 100) + '...' : 'Processing...'}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-medium">
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                       Review <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
      
    </div>
  );
}
