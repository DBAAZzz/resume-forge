import { TiptapEditor } from '@/features/editor';

import { useAnalysisStore } from '../../store';

export const ParsedContentPanel = () => {
  const { parsedContent, aiSuggestions } = useAnalysisStore();

  return (
    <div className="h-full overflow-y-auto bg-card/20 p-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto max-w-prose">
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
