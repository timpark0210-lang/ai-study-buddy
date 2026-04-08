"use client"; 
import React, { useState } from 'react'; 
import ReactMarkdown from 'react-markdown'; 
import remarkMath from 'remark-math'; 
import rehypeKatex from 'rehype-katex'; 
import 'katex/dist/katex.min.css'; 
import { StudySession } from '@/store/useLibraryStore'; // Matched to our current store path

interface QuizEngineProps { 
  session: StudySession; 
  onFinish: (score: number) => void; 
} 

export default function QuizEngine({ session, onFinish }: QuizEngineProps) { 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [score, setScore] = useState(0); 
  const [selectedOption, setSelectedOption] = useState<number | null>(null); 
  const [showExplanation, setShowExplanation] = useState(false); 

  const quizData = session.quizData; 
  if (!quizData || quizData.length === 0) {
    return (
      <div className="text-center p-12 text-slate-400">
        <p>Generating quiz questions... Please wait a moment.</p>
      </div>
    );
  }

  const currentQuestion = quizData[currentIndex]; 
  const progress = ((currentIndex + 1) / quizData.length) * 100; 

  const handleOptionSelect = (index: number) => { 
    if (selectedOption !== null) return; 
    setSelectedOption(index); 
    setShowExplanation(true); 
    
    // Check if the answer match (supporting both string/index comparison)
    const isCorrect = currentQuestion.answer === index;
    if (isCorrect) { 
      setScore(s => s + 1); 
    } 
  }; 

  const handleNext = () => { 
    if (currentIndex < quizData.length - 1) { 
      setCurrentIndex(c => c + 1); 
      setSelectedOption(null); 
      setShowExplanation(false); 
    } else { 
      onFinish(score); 
    } 
  }; 

  return ( 
    <div className="w-full max-w-3xl mx-auto glass-card p-8 relative overflow-hidden"> 
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div> 
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div> 

      <div className="relative z-10 flex items-center justify-between mb-6"> 
        <div> 
          <span className="text-sm font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20"> 
            Question {currentIndex + 1} of {quizData.length} 
          </span> 
        </div> 
        <div className="flex items-center gap-4"> 
          <div className="font-semibold text-slate-300"> 
            Score: <span className="text-white bg-indigo-600 px-3 py-1 rounded-lg shadow-lg">{score}</span> 
          </div> 
        </div> 
      </div> 

      {/* Progress Bar */}
      <div className="relative z-10 w-full h-1.5 bg-slate-800/50 rounded-full mb-8 overflow-hidden"> 
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /> 
      </div> 

      {/* Question Text */}
      <div className="relative z-10 mb-8 text-xl font-bold text-white leading-relaxed tracking-tight"> 
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}> 
          {currentQuestion.question} 
        </ReactMarkdown> 
      </div> 

      {/* Options */}
      <div className="relative z-10 space-y-3 mb-8"> 
        {currentQuestion.options.map((opt: string, idx: number) => { 
          const isSelected = selectedOption === idx; 
          const isCorrect = currentQuestion.answer === idx; 
          const showStatus = selectedOption !== null; 
          
          let btnClass = "w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all font-medium text-slate-200 block shadow-sm group"; 
          
          if (showStatus) { 
            if (isCorrect) { 
              btnClass = "w-full text-left p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 font-bold text-emerald-300 block shadow-[0_0_20px_rgba(16,185,129,0.1)]"; 
            } else if (isSelected && !isCorrect) { 
              btnClass = "w-full text-left p-5 rounded-2xl border-2 border-red-500/50 bg-red-500/10 font-bold text-red-300 block"; 
            } else { 
              btnClass = "w-full text-left p-5 rounded-2xl border border-slate-800 bg-slate-950 font-medium text-slate-600 block opacity-40 cursor-default"; 
            } 
          } 

          return ( 
            <button key={idx} disabled={showStatus} onClick={() => handleOptionSelect(idx)} className={btnClass} > 
              <div className="flex items-center"> 
                <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold mr-4 shrink-0 transition-all ${
                  showStatus && isCorrect ? 'bg-emerald-500 text-white' : 
                  showStatus && isSelected && !isCorrect ? 'bg-red-500 text-white' : 
                  'bg-slate-800 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white'
                }`}> 
                  {String.fromCharCode(65 + idx)} 
                </span> 
                <ReactMarkdown className="flex-1" remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}> 
                  {opt} 
                </ReactMarkdown> 
              </div> 
            </button> 
          ); 
        })} 
      </div> 

      {/* Explanation */}
      {showExplanation && ( 
        <div className={`relative z-10 rounded-2xl p-6 border mb-8 animate-[fadeIn_0.5s_ease_both] ${currentQuestion.answer === selectedOption ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-amber-500/5 border-amber-500/10'}`}> 
          <div className="flex items-center gap-2 mb-3"> 
            {currentQuestion.answer === selectedOption ? ( 
              <><span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span> <span className="text-emerald-400 font-bold">Excellent!</span></> 
            ) : ( 
              <><span className="material-symbols-outlined text-amber-400 text-lg">lightbulb</span> <span className="text-amber-400 font-bold">Feedback:</span></> 
            )} 
          </div> 
          <div className="text-slate-300 text-sm leading-relaxed antialiased"> 
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}> 
              {currentQuestion.explanation} 
            </ReactMarkdown> 
          </div> 
        </div> 
      )} 

      {/* Navigation */}
      {showExplanation && ( 
        <div className="relative z-10 flex justify-end animate-[fadeIn_0.5s_ease_both]"> 
          <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2" > 
            {currentIndex === quizData.length - 1 ? ( 
              <>See Results <span className="material-symbols-outlined">flag</span></> 
            ) : ( 
              <>Next Step <span className="material-symbols-outlined">arrow_forward</span></> 
            )} 
          </button> 
        </div> 
      )} 
    </div> 
  ); 
}
