import { Typography } from '@/components/base/Typography';
import { TiptapEditor } from '@/components/editor/TiptapEditor'; // Adjust path if needed
import { useAnalysisStore } from '@/store/useAnalysisStore';

const ParsedContentPanel = () => {
  const { parsedContent } = useAnalysisStore();

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
        />
      </div>
    </div>
  );
};

export default ParsedContentPanel;
