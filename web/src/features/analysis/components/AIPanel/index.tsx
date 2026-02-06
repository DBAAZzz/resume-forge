import { motion } from 'framer-motion';
import { Radar } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/utils/classnames';

import { DeepAnalysisTab } from './DeepAnalysisTab';
import { ResumeScanTab } from './ResumeScanTab';

export const AISuggestionsPanel = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'deep'>('deep');

  const tabs = [
    // { id: 'scan', label: 'AI 简历扫描', icon: Sparkles }, // 暂时隐藏
    { id: 'deep', label: '深度竞争力', icon: Radar },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-white font-sans">
      {/* Header with technical border */}
      <div className="flex-none border-b border-slate-200 px-4 pb-0 pt-4">
        <div className="relative flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'group relative flex select-none items-center gap-2 pb-3 text-sm font-medium outline-none transition-colors duration-200', // Added relative here for the line
                activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <tab.icon
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
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
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] w-full bg-slate-900"
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out',
            activeTab === 'scan'
              ? 'pointer-events-auto translate-x-0 opacity-100'
              : 'pointer-events-none -translate-x-4 opacity-0'
          )}
        >
          <ResumeScanTab />
        </div>

        <div
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-out',
            activeTab === 'deep'
              ? 'pointer-events-auto translate-x-0 opacity-100'
              : 'pointer-events-none translate-x-4 opacity-0'
          )}
        >
          <DeepAnalysisTab />
        </div>
      </div>
    </div>
  );
};

AISuggestionsPanel.displayName = 'AISuggestionsPanel';
