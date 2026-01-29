import { TiptapEditor } from '@/features/editor';
import { Typography } from '@/shared/components/base';

import { useAnalysisStore } from '../store';

export const ParsedContentPanel = () => {
  const { parsedContent, aiSuggestions } = useAnalysisStore();

  return (
    <div className="h-full overflow-y-auto p-8 border-r border-border bg-card/20">
      <div className="max-w-prose mx-auto">
        <Typography
          variant="h3"
          className="mb-6 font-display text-muted-foreground uppercase tracking-widest text-sm"
        >
          Parsed Content
        </Typography>
        <TiptapEditor
          content={parsedContent || '<p>No content available</p>'}
          className="min-h-[200px]"
          suggestions={aiSuggestions}
        />
      </div>
    </div>
  );
};

export default ParsedContentPanel;
