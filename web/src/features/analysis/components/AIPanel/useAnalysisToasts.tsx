import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useAnalysisStore } from '@/features/analysis/store';

export const useAnalysisToasts = () => {
  const { aiSuggestions, status } = useAnalysisStore();

  // Initialize with current length to avoid showing toasts for existing items on mount
  const prevStrengthCount = useRef(aiSuggestions.strength.length);
  const prevWeaknessCount = useRef(aiSuggestions.weakness.length);

  // Monitor status to handle resets if necessary, though the store reset handles the array clearing
  useEffect(() => {
    if (status === 'analyzing') {
      // When analysis restarts, we expect the arrays to be cleared or about to be.
      // However, if we just set ref to 0 here, it might desync if the store hasn't cleared yet.
      // The store clears `aiSuggestions` synchronously when `startAnalysis` is called.
      // So the main effects will see length 0 and update refs accordingly.
    }
  }, [status]);

  useEffect(() => {
    const currentCount = aiSuggestions.strength.length;

    if (currentCount > prevStrengthCount.current) {
      // Get only the new items
      const newItems = aiSuggestions.strength.slice(prevStrengthCount.current);

      newItems.forEach((item) => {
        toast.success(item.reason, {
          description: item.content
            ? `"${item.content.substring(0, 80)}${item.content.length > 80 ? '...' : ''}"`
            : undefined,
          icon: <ThumbsUp className="h-4 w-4" />,
          duration: 4000,
        });
      });
    }

    // Always update ref to current length
    prevStrengthCount.current = currentCount;
  }, [aiSuggestions.strength]);

  useEffect(() => {
    const currentCount = aiSuggestions.weakness.length;

    if (currentCount > prevWeaknessCount.current) {
      // Get only the new items
      const newItems = aiSuggestions.weakness.slice(prevWeaknessCount.current);

      newItems.forEach((item) => {
        toast.warning(item.reason, {
          description: item.content
            ? `"${item.content.substring(0, 80)}${item.content.length > 80 ? '...' : ''}"`
            : undefined,
          icon: <ThumbsDown className="h-4 w-4" />,
          duration: 5000,
        });
      });
    }

    // Always update ref to current length
    prevWeaknessCount.current = currentCount;
  }, [aiSuggestions.weakness]);
};
