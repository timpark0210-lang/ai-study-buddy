"use client";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface StudyTabViewProps {
  subjectCode?: string;
  tabs: {
    guide: string;
    walkthrough: string;
    practice: string;
  };
}

export default function StudyTabView({ subjectCode = 'OTHER', tabs }: StudyTabViewProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'walkthrough' | 'practice'>('guide');

  const getTabLabels = () => {
    if (subjectCode === 'ENGLISH' || subjectCode === 'SOCIAL') {
      return {
        guide: '📖 Guide',
        walkthrough: '📝 Analysis',
        practice: '✏️ Questions',
      };
    }
    return {
      guide: '📖 Guide',
      walkthrough: '🔢 Worked Examples',
      practice: '✏️ Practice',
    };
  };

  const labels = getTabLabels();

  return (
    <div className="w-full flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-px">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${
              activeTab === key
                ? 'bg-white border-t border-x border-slate-200 text-indigo-700 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] translate-y-px z-10'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-transparent'
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-white">
        <div className="prose-light selection:bg-indigo-500/10 selection:text-indigo-900 animate-in fade-in duration-500">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {tabs[activeTab]}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
