import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/shared/utils/classnames';

import { editorExtensions } from '../config/extensions';
import { useTagHighlighter } from '../hooks/useTagHighlighter';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  className?: string;
  editable?: boolean;
  suggestions?: {
    strength: Array<{ content: string; reason: string }>;
    weakness: Array<{ content: string; reason: string }>;
    score: number;
  } | null;
  onSuggestionsChange?: (suggestions: TiptapEditorProps['suggestions']) => void;
}

export const TiptapEditor = ({
  content,
  className,
  editable = true,
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

  const recommendations = useMemo(() => {
    if (!suggestions) return [];

    const goodRecs = suggestions.strength.map((item) => ({
      id: item.content,
      originalText: item.content,
      type: 'strength' as const,
      reason: item.reason,
    }));

    const badRecs = suggestions.weakness.map((item) => ({
      id: item.content,
      originalText: item.content,
      type: 'weakness' as const,
      reason: item.reason,
    }));

    return [...goodRecs, ...badRecs];
  }, [suggestions]);
  // 触发更新简历高光
  useTagHighlighter(editor, recommendations);

  // 跟踪内容变化，避免在初始化时重置编辑器
  const prevContentRef = useRef(content);

  // 保持编辑器内容与 prop 同步（仅在内容变化时更新，而非编辑器初始化时）
  useEffect(() => {
    if (editor && content && content !== prevContentRef.current) {
      editor.commands.setContent(content);
      prevContentRef.current = content;
    }
  }, [content, editor]);

  // 更新可编辑状态
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
        <div className="mb-2 flex items-center gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
          <button
            onClick={() => editor.chain().focus().insertTag({ label: 'Skill' }).run()}
            className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            Insert Skill Tag
          </button>
          <button
            onClick={() =>
              onSuggestionsChange({
                strength: [{ content: 'React', reason: 'Strong market demand' }],
                weakness: [{ content: 'Word', reason: 'Use PDF format' }],
                score: 85,
              })
            }
            className="rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 transition-colors hover:bg-green-100"
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
