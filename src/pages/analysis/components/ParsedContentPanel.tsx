import { Typography } from '@/components/base/Typography';
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
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-mono opacity-90 whitespace-pre-wrap">
          {parsedContent}
        </div>
      </div>
    </div>
  );
};

export default ParsedContentPanel;
