import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';

import { useAnalysisStore } from '@/features/analysis/store';
import { Typography } from '@/shared/components/base';

import { ThinkingProcess } from './ThinkingProcess';
import { useAnalysisToasts } from './useAnalysisToasts';

export const ResumeScanTab = memo(() => {
  const { aiSuggestions, status, thinkingText, startAnalysis } = useAnalysisStore();

  // Enable toast notifications for analysis results
  useAnalysisToasts();

  const isAnalyzing = status === 'analyzing';
  const hasThinkingContent = !!thinkingText || isAnalyzing;

  // Determine if we should show the start button
  // Show if: No strength/weakness points AND not currently analyzing AND no thinking text (meaning fresh state)
  const showStartButton =
    aiSuggestions.strength.length === 0 &&
    aiSuggestions.weakness.length === 0 &&
    !isAnalyzing &&
    !thinkingText;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-slate-50/50 custom-scrollbar">
      <div className="flex flex-col gap-6 pb-10">
        {showStartButton ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div className="space-y-2 text-center max-w-md">
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
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Sparkles className="w-4 h-4" />
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
