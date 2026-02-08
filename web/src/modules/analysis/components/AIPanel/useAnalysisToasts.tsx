import { ThumbsDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { useBasicAnalysisStore, useDeepAnalysisStore } from '@/store/analysis';

export const useAnalysisToasts = () => {
  const aiSuggestions = useBasicAnalysisStore((state) => state.aiSuggestions);
  const basicError = useBasicAnalysisStore((state) => state.error);
  const deepError = useDeepAnalysisStore((state) => state.error);

  const prevWeaknessCount = useRef(aiSuggestions.weakness.length);
  const lastBasicError = useRef<string | null>(null);
  const lastDeepError = useRef<string | null>(null);

  useEffect(() => {
    if (basicError && basicError !== lastBasicError.current) {
      toast.error(basicError);
      lastBasicError.current = basicError;
      return;
    }

    if (!basicError) {
      lastBasicError.current = null;
    }
  }, [basicError]);

  useEffect(() => {
    if (deepError && deepError !== lastDeepError.current) {
      toast.error(deepError);
      lastDeepError.current = deepError;
      return;
    }

    if (!deepError) {
      lastDeepError.current = null;
    }
  }, [deepError]);

  useEffect(() => {
    const currentCount = aiSuggestions.weakness.length;

    if (currentCount > prevWeaknessCount.current) {
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

    prevWeaknessCount.current = currentCount;
  }, [aiSuggestions.weakness]);
};
