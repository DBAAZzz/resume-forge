import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useMemo } from 'react';

import { cn } from '@/shared/utils/classnames';

import { editorExtensions } from '../config/extensions';
import { useTagHighlighter } from '../hooks/useTagHighlighter';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  className?: string;
  editable?: boolean;
  suggestions?: {
    good: Array<{ content: string; reason: string; startIndex: number; endIndex: number }>;
    bad: Array<{ content: string; reason: string; startIndex: number; endIndex: number }>;
    score: number;
  } | null;
  onSuggestionsChange?: (suggestions: TiptapEditorProps['suggestions']) => void;
}

export const TiptapEditor = ({
  content,
  className,
  editable = false,
  suggestions,
  onSuggestionsChange,
}: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'tiptap-editor',
          'prose prose-sm md:prose-base dark:prose-invert max-w-none focus:outline-none',
          className
        ),
      },
    },
  });

  // Prepare recommendations for the highlighter
  const recommendations = useMemo(() => {
    if (!suggestions) return [];

    const goodRecs = suggestions.good.map((item) => ({
      id: item.content,
      originalText: item.content,
      type: 'good' as const,
      suggestion: item.reason,
    }));

    const badRecs = suggestions.bad.map((item) => ({
      id: item.content,
      originalText: item.content,
      type: 'bad' as const,
      suggestion: item.reason,
    }));

    return [...goodRecs, ...badRecs];
  }, [suggestions]);

  useTagHighlighter(editor, recommendations);

  // Keep editor content in sync with prop updates
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {editable && editor && onSuggestionsChange && (
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <button
            onClick={() => editor.chain().focus().insertTag({ label: 'Skill' }).run()}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Insert Skill Tag
          </button>
          <button
            onClick={() =>
              onSuggestionsChange({
                good: [
                  { content: 'React', reason: 'Strong market demand', startIndex: 0, endIndex: 0 },
                ],
                bad: [{ content: 'Word', reason: 'Use PDF format', startIndex: 0, endIndex: 0 }],
                score: 85,
              })
            }
            className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
          >
            Test Analysis
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
