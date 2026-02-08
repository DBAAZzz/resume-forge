import { LoaderCircle, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { optimizeTagCandidates } from '@/services/ai/tagOptimizer';
import { Button } from '@/shared/components/base';
import { TiptapEditor } from '@/shared/components/editor';
import { cn } from '@/shared/utils/classnames';
import {
  formatParsedContent as runFormatParsedContent,
  useAnalysisConfigStore,
  useAnalysisDocumentStore,
  useBasicAnalysisStore,
} from '@/store/analysis';

import { EditorFormatToolbar } from './EditorFormatToolbar';

import type { Editor } from '@tiptap/core';

export const ParsedContentPanel = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const parsedContent = useAnalysisDocumentStore((state) => state.parsedContent);
  const formatStreamingContent = useAnalysisDocumentStore((state) => state.formatStreamingContent);
  const formatStatus = useAnalysisDocumentStore((state) => state.formatStatus);
  const setParsedContentDraft = useAnalysisDocumentStore((state) => state.setParsedContentDraft);
  const aiSuggestions = useBasicAnalysisStore((state) => state.aiSuggestions);
  const model = useAnalysisConfigStore((state) => state.model);
  const apiKey = useAnalysisConfigStore((state) => state.apiKey);
  const isFormatting = formatStatus === 'formatting';
  const optimizerContext = useMemo(() => ({ model, apiKey }), [model, apiKey]);
  const hasContent = Boolean(parsedContent?.trim());
  const displayContent = isFormatting
    ? (formatStreamingContent ?? '')
    : parsedContent || '<p>No content available</p>';
  const formatActionLabel = isFormatting
    ? '格式化中'
    : hasContent
      ? '一键格式化'
      : '暂无可格式化内容';

  const handleFormatClick = async () => {
    if (!hasContent || isFormatting) return;

    try {
      await runFormatParsedContent();
      toast.success('文本层次格式化完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文本格式化失败');
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-card/20">
      <div className="h-14 border-b border-border/35 bg-background/70 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-full max-w-prose items-center justify-between gap-4">
          <EditorFormatToolbar editor={editor} disabled={isFormatting} />

          <Button
            variant="ghost"
            size="sm"
            disabled={!hasContent || isFormatting}
            onClick={handleFormatClick}
            className={cn(
              'h-7 rounded-full px-2.5 text-[11px] font-semibold transition-colors',
              'text-slate-600 hover:bg-slate-900/[0.06] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-slate-50',
              'disabled:cursor-not-allowed disabled:opacity-40'
            )}
            title={formatActionLabel}
            aria-label={formatActionLabel}
          >
            {isFormatting ? (
              <LoaderCircle className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3 w-3" />
            )}
            {formatActionLabel}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto max-w-prose">
          <TiptapEditor
            content={displayContent}
            className="min-h-[200px]"
            editable={!isFormatting}
            suggestions={aiSuggestions}
            optimizerContext={optimizerContext}
            onRequestTagCandidates={optimizeTagCandidates}
            onContentChange={isFormatting ? undefined : setParsedContentDraft}
            onEditorReady={setEditor}
          />
        </div>
      </div>
    </div>
  );
};

export default ParsedContentPanel;
