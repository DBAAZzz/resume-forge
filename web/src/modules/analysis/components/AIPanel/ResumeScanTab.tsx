import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';

import { Typography } from '@/shared/components/base';
import { useAnalysisStore } from '@/store/useAnalysisStore';

import { ThinkingProcess } from './ThinkingProcess';
import { useAnalysisToasts } from './useAnalysisToasts';

export const ResumeScanTab = memo(() => {
  const { aiSuggestions, status, thinkingText, startAnalysis } = useAnalysisStore();

  // Enable toast notifications for analysis results
  useAnalysisToasts();

  const isAnalyzing = status === 'analyzing';
  const hasThinkingContent = !!thinkingText || isAnalyzing;

  // Determine if we should show the start button
  // Show if: No weakness points AND not currently analyzing AND no thinking text (meaning fresh state)
  const showStartButton = aiSuggestions.weakness.length === 0 && !isAnalyzing && !thinkingText;

  return (
    <div className="custom-scrollbar h-full overflow-y-auto bg-slate-50/50 p-4 sm:p-6">
      <div className="flex flex-col gap-6 pb-10">
        {showStartButton ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-20"
          >
            <div className="max-w-md space-y-2 text-center">
              <Typography variant="h3" className="font-display font-semibold text-gray-900">
                AI Deep Analysis
              </Typography>
              <Typography variant="p" className="text-gray-500">
                Ready to analyze your resume logic, structure, and content quality using DeepSeek's
                reasoning engine.
              </Typography>
            </div>

            <button
              onClick={() => startAnalysis()}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              <Sparkles className="h-4 w-4" />
              <span>开始简历分析</span>
            </button>
          </motion.div>
        ) : null}

        {hasThinkingContent && (
          <ThinkingProcess content={thinkingText || ''} isAnalyzing={isAnalyzing} />
        )}
      </div>
    </div>
  );
});

ResumeScanTab.displayName = 'ResumeScanTab';
