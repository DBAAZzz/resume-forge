import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

import { Typography } from '@/components/base/Typography';
import { useAnalysisStore } from '@/store/useAnalysisStore';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AISuggestionsPanel = () => {
  const { aiSuggestions } = useAnalysisStore();

  if (!aiSuggestions) return null;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-6"
      >
        <Typography variant="h3" className="font-display">
          AI Analysis
        </Typography>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-bold">{aiSuggestions.score}/100</span>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-4"
      >
        <div>
          <Typography
            variant="h4"
            className="mb-4 flex items-center gap-2 text-green-600 dark:text-green-400"
          >
            <ThumbsUp className="w-5 h-5" /> Strong Points
          </Typography>
          <ul className="space-y-3">
            {aiSuggestions.good.map((point, i) => (
              <motion.li
                key={i}
                variants={itemVariants}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm"
              >
                {point}
              </motion.li>
            ))}
          </ul>
        </div>

        <div>
          <Typography
            variant="h4"
            className="mb-4 flex items-center gap-2 text-red-600 dark:text-orange-400"
          >
            <ThumbsDown className="w-5 h-5" /> Improvements
          </Typography>
          <ul className="space-y-3">
            {aiSuggestions.bad.map((point, i) => (
              <motion.li
                key={i}
                variants={itemVariants}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm"
              >
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default AISuggestionsPanel;
