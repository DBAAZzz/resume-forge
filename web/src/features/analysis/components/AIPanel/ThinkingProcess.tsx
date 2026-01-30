import { motion } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { cn } from '@/shared/utils/classnames';

interface ThinkingProcessProps {
  content?: string;
  isAnalyzing: boolean;
  className?: string;
}

export const ThinkingProcess = ({ content = '', isAnalyzing, className }: ThinkingProcessProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of content when updated if it's visible
  useEffect(() => {
    if (isAnalyzing && isExpanded && contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      contentRef.current.scrollTop = scrollHeight;
    }
  }, [content, isAnalyzing, isExpanded]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'w-full overflow-hidden border border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300',
        isAnalyzing ? 'shadow-indigo-500/10 border-indigo-200' : 'border-gray-200',
        className
      )}
    >
      {/* Header Section */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-3 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors border-b border-gray-100/50"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isAnalyzing ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 font-display">AI 思考</span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {isAnalyzing ? 'Processing Data...' : 'Analysis Complete'}
            </span>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Content Section */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="overflow-hidden"
      >
        <div className="p-4 pr-0 bg-slate-50/30">
          <div
            ref={contentRef}
            className="font-mono text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
          >
            {content || (
              <span className="text-gray-400 italic">
                Initializing deep learning reasoning chain...
              </span>
            )}
            {isAnalyzing && (
              <span className="inline-block w-1.5 h-3 ml-1 bg-indigo-500 animate-pulse align-middle" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
