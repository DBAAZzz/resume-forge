import { TiptapEditor } from '@/features/editor';

import { useAnalysisStore } from '../store';

export const ParsedContentPanel = () => {
  const { parsedContent, aiSuggestions } = useAnalysisStore();

  return (
    <div className="h-full overflow-y-auto p-8 border-r border-border bg-card/20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="max-w-prose mx-auto">
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
