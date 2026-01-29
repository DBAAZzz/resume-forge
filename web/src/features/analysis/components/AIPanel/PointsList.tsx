import { motion } from 'framer-motion';
import Quote from 'lucide-react/dist/esm/icons/quote';
import ThumbsDown from 'lucide-react/dist/esm/icons/thumbs-down';
import ThumbsUp from 'lucide-react/dist/esm/icons/thumbs-up';
import { useEffect, memo } from 'react';

import type { AnalysisItem } from '@/features/analysis/types';
import { cn } from '@/shared/utils/classnames';

type PointListProps = {
  points: AnalysisItem[];
  type: 'strength' | 'weakness';
  onComplete?: () => void;
};

export const PointsList = memo(({ points, type, onComplete }: PointListProps) => {
  useEffect(() => {
    const totalTime = points.length * 100 + 400;
    const timer = setTimeout(() => {
      onComplete?.();
    }, totalTime);
    return () => clearTimeout(timer);
  }, [points.length, onComplete]);

  return (
    <div className="space-y-3 mt-2">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'flex items-center gap-2 font-display font-semibold text-sm mb-3',
          type === 'strength' ? 'text-green-600' : 'text-amber-600'
        )}
      >
        {type === 'strength' ? (
          <ThumbsUp className="w-4 h-4" />
        ) : (
          <ThumbsDown className="w-4 h-4" />
        )}
        {type === 'strength' ? 'Highlights' : 'Improvements'}
      </motion.div>

      {points.map((point, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={cn(
            'p-3.5 rounded-xl text-sm border flex flex-col gap-2',
            type === 'strength'
              ? 'bg-green-50/50 border-green-100 text-green-900'
              : 'bg-amber-50/50 border-amber-100 text-amber-900'
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                type === 'strength' ? 'bg-green-500' : 'bg-amber-500'
              )}
            />
            <span className="leading-relaxed font-medium">{point.reason}</span>
          </div>

          {point.content ? (
            <div className="ml-4 pl-3 border-l-2 border-black/5 text-xs text-muted-foreground/80 italic">
              <Quote className="w-3 h-3 inline mr-1 mb-1 opacity-50" />
              {point.content.length > 120 ? `${point.content.substring(0, 120)}...` : point.content}
            </div>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
});

PointsList.displayName = 'PointsList';
