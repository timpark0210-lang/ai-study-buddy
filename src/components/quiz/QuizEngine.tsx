"use client";

import React, { useState } from 'react';
import { QuizQuestion } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface QuizEngineProps {
  quizData: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
  onCancel: () => void;
}

export default function QuizEngine({ quizData, onComplete, onCancel }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!quizData || quizData.length === 0) return null;

  const currentQuestion = quizData[currentIndex];
  const progress = ((currentIndex + 1) / quizData.length) * 100;

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    
    setSelectedOption(index);
    setShowExplanation(true);
    
    if (currentQuestion.options[index].isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      onComplete(score, quizData.length);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-card p-8 relative overflow-hidden">
      {/* Background Decorative Mesh */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div>
          <span className="text-sm font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 px-3 py-1 rounded-full">
            Question {currentIndex + 1} of {quizData.length}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-semibold text-slate-300">
            Score: <span className="text-white bg-slate-800 px-2 py-0.5 rounded-md">{score}</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-400 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 w-full h-1.5 bg-slate-800/50 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="relative z-10 mb-8 text-xl font-medium text-white leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {currentQuestion.question}
        </ReactMarkdown>
      </div>

      {/* Options */}
      <div className="relative z-10 space-y-3 mb-8">
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = opt.isCorrect;
          const showStatus = selectedOption !== null;
          
          let btnClass = "w-full text-left p-4 rounded-xl border border-border bg-card/50 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all font-medium text-slate-200 block shadow-sm";
          
          if (showStatus) {
            if (isCorrect) {
              btnClass = "w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 font-bold text-emerald-300 block shadow-[0_0_15px_rgba(16,185,129,0.1)]";
            } else if (isSelected && !isCorrect) {
              btnClass = "w-full text-left p-4 rounded-xl border-2 border-red-500 bg-red-500/10 font-bold text-red-300 block";
            } else {
              btnClass = "w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900/40 font-medium text-slate-500 block opacity-50";
            }
          }

          return (
            <button 
              key={idx}
              disabled={showStatus}
              onClick={() => handleOptionSelect(idx)}
              className={btnClass}
            >
              <div className="flex items-center">
                <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 font-bold mr-3 shrink-0 ${showStatus && isCorrect ? 'bg-emerald-500 text-white' : showStatus && isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {opt.text}
                </ReactMarkdown>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`relative z-10 rounded-2xl p-6 border mb-8 animate-[fadeIn_0.5s_ease_both] ${currentQuestion.options[selectedOption!].isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            {currentQuestion.options[selectedOption!].isCorrect ? (
              <><span className="material-symbols-outlined text-emerald-400">check_circle</span> <span className="text-emerald-400 font-bold">Correct!</span></>
            ) : (
              <><span className="material-symbols-outlined text-amber-400">lightbulb</span> <span className="text-amber-400 font-bold">Not quite. Here's why:</span></>
            )}
          </div>
          <div className="text-slate-300 prose-premium">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {currentQuestion.explanation}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Next Button */}
      {showExplanation && (
        <div className="relative z-10 flex justify-end animate-[fadeIn_0.5s_ease_both]">
          <button 
            onClick={handleNext}
            className="btn-premium"
          >
            {currentIndex === quizData.length - 1 ? (
              <>Finish Quiz <span className="material-symbols-outlined">flag</span></>
            ) : (
              <>Next Question <span className="material-symbols-outlined">arrow_forward</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
