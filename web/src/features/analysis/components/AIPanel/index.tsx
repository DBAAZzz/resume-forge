import { motion } from 'framer-motion';
import { Sparkles, Radar } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/utils/classnames';

import { ResumeScanTab } from './ResumeScanTab';

// Deep Analysis Placeholder - Squared/Technical Design
const DeepAnalysisTab = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500 bg-slate-50/50">
      <div className="border border-slate-200 bg-white p-8 mb-6 relative">
        {/* Technical decorative corners */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-slate-400" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-slate-400" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-slate-400" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-slate-400" />

        <Radar className="w-8 h-8 text-slate-700" strokeWidth={1.5} />
      </div>

      <h3 className="text-lg font-medium text-slate-900 mb-2 uppercase tracking-wide">
        深度分析模块
      </h3>
      <div className="w-12 h-0.5 bg-slate-300 mb-4" />

      <p className="max-w-[260px] mx-auto text-xs text-slate-500 leading-relaxed font-mono">
        SYSTEM_STATUS: DEVELOPMENT
        <br />
        MODULE: DEEP_ANALYSIS
        <br />
        ETA: PENDING...
      </p>

      <div className="mt-8 flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-slate-300 animate-pulse rounded-none"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export const AISuggestionsPanel = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'deep'>('scan');

  const tabs = [
    { id: 'scan', label: 'AI 简历扫描', icon: Sparkles },
    { id: 'deep', label: '深度竞争力', icon: Radar },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header with technical border */}
      <div className="flex-none px-4 pt-4 pb-0 border-b border-slate-200">
        <div className="flex gap-6 relative">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group flex items-center gap-2 pb-3 text-sm font-medium transition-colors duration-200 outline-none select-none relative', // Added relative here for the line
                activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <tab.icon
                className={cn(
                  'w-4 h-4 transition-transform duration-300',
                  activeTab === tab.id
                    ? 'scale-100'
                    : 'scale-90 opacity-70 group-hover:scale-100 group-hover:opacity-100'
                )}
                strokeWidth={1.5}
              />
              <span className="tracking-tight">{tab.label}</span>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-tab-line"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-slate-900 w-full"
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out',
            activeTab === 'scan'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 -translate-x-4 pointer-events-none'
          )}
        >
          <ResumeScanTab />
        </div>

        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out',
            activeTab === 'deep'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-4 pointer-events-none'
          )}
        >
          <DeepAnalysisTab />
        </div>
      </div>
    </div>
  );
};

AISuggestionsPanel.displayName = 'AISuggestionsPanel';
