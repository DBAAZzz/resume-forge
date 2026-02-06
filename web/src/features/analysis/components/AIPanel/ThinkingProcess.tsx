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
        'w-full overflow-hidden border border-indigo-100 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300',
        isAnalyzing ? 'border-indigo-200 shadow-indigo-500/10' : 'border-gray-200',
        className
      )}
    >
      {/* Header Section */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center justify-between border-b border-gray-100/50 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-50"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'rounded-lg p-1.5 transition-colors',
              isAnalyzing ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-semibold text-gray-800">AI 思考</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              {isAnalyzing ? 'Processing Data...' : 'Analysis Complete'}
            </span>
          </div>
        </div>

        <button className="text-gray-400 transition-colors hover:text-gray-600">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Content Section */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="overflow-hidden"
      >
        <div className="bg-slate-50/30 p-4 pr-0">
          <div
            ref={contentRef}
            className="custom-scrollbar max-h-[50vh] overflow-y-auto whitespace-pre-wrap pr-2 font-mono text-xs leading-relaxed text-gray-600 md:text-sm"
          >
            {content || (
              <span className="italic text-gray-400">
                Initializing deep learning reasoning chain...
              </span>
            )}
            {isAnalyzing && (
              <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-indigo-500 align-middle" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
