import { ThumbsDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useBasicAnalysisStore } from '@/store/analysis';

export const useAnalysisToasts = () => {
  const aiSuggestions = useBasicAnalysisStore((state) => state.aiSuggestions);
  const status = useBasicAnalysisStore((state) => state.status);

  // Initialize with current length to avoid showing toasts for existing items on mount
  const prevWeaknessCount = useRef(aiSuggestions.weakness.length);

  // Monitor status to handle resets if necessary, though the store reset handles the array clearing
  useEffect(() => {
    if (status === 'analyzing') {
      // When analysis restarts, we expect the arrays to be cleared or about to be.
      // However, if we just set ref to 0 here, it might desync if the store hasn't cleared yet.
      // The store clears `aiSuggestions` synchronously when `startBasicAnalysis` is called.
      // So the main effects will see length 0 and update refs accordingly.
    }
  }, [status]);

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
