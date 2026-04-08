"use client"; 
import React from 'react'; 
import { useLibraryStore, StudySession } from '@/store/useLibraryStore'; 

interface MyLibraryViewProps { 
  onSessionSelect: (sessionId: string) => void; 
} 

export default function MyLibraryView({ onSessionSelect }: MyLibraryViewProps) { 
  const { studySessions } = useLibraryStore(); 

  if (!studySessions || studySessions.length === 0) { 
    return ( 
      <div className="w-full flex flex-col items-center justify-center p-20 text-center animate-[fadeIn_0.5s_ease_both]"> 
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-800 shadow-xl"> 
          <span className="material-symbols-outlined text-5xl text-slate-700">inventory_2</span> 
        </div> 
        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Your Library is Empty</h2> 
        <p className="text-slate-500 max-w-sm mb-10 font-medium font-sans">Upload your study materials in the dashboard and the AI Tutor will curate them here.</p>
        <button 
           onClick={() => window.location.reload()} 
           className="px-6 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all"
        >
           Refresh Library
        </button>
      </div> 
    ) ; 
  } 

  // Grouping logic for organized view
  const sessionsBySubject = studySessions.reduce((acc, session) => { 
    const subject = session.subject || "General Study"; 
    if (!acc[subject]) acc[subject] = []; 
    acc[subject].push(session); 
    return acc; 
  }, {} as Record<string, StudySession[]>); 

  return ( 
    <div className="w-full max-w-6xl mx-auto py-4 animate-[fadeIn_0.5s_ease_both]"> 
      <div className="flex flex-col gap-12"> 
        {Object.entries(sessionsBySubject).map(([subject, sessions]) => ( 
          <section key={subject} className="library-section"> 
            <div className="flex items-center gap-4 mb-8"> 
              <div className="h-8 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full shrink-0"></div> 
              <h2 className="text-2xl font-bold text-white tracking-tight">{subject}</h2> 
              <span className="bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold px-3 py-1 rounded-full">{sessions.length} Items</span> 
            </div> 
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
              {sessions.map((session) => ( 
                <button 
                  key={session.id} 
                  onClick={() => onSessionSelect(session.id)} 
                  className="glass-card p-6 flex flex-col gap-6 cursor-pointer text-left hover:bg-slate-800/80 hover:border-indigo-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all group group relative" 
                > 
                  <div className="flex justify-between items-start"> 
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all duration-500"> 
                      <span className="material-symbols-outlined text-indigo-400 text-2xl group-hover:text-indigo-300"> 
                        {session.fileType === 'pdf' ? 'picture_as_pdf' : session.fileType === 'word' ? 'description' : 'image'} 
                      </span> 
                    </div> 
                    {session.quizScore !== null && ( 
                      <div className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-lg"> 
                        Score: {session.quizScore} 
                      </div> 
                    )} 
                  </div> 
                  
                  <div className="flex-1"> 
                    <h3 className="text-xl font-bold text-slate-100 line-clamp-1 mb-2 group-hover:text-white transition-colors tracking-tight">{session.fileName}</h3> 
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium"> 
                      {session.guideMarkdown ? session.guideMarkdown.replace(/[#*]/g, '').slice(0, 100) + '...' : 'Analysis in progress...'} 
                    </p> 
                  </div> 
                  
                  <div className="mt-4 pt-5 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-500 font-bold"> 
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span> 
                    <span className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors uppercase tracking-widest text-[10px]"> 
                      Resume Session <span className="material-symbols-outlined text-[16px] animate-bounce-x">arrow_forward</span> 
                    </span> 
                  </div> 
                </button> 
              ))} 
            </div> 
          </section> 
        ))} 
      </div> 
    </div> 
  ); 
}
