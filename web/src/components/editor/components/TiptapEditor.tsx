import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useMemo, useRef } from 'react';

import { cn } from '@/utils/classnames';

import { createEditorExtensions } from '../config/extensions';
import { useTagHighlighter } from '../hooks/useTagHighlighter';
import './TiptapEditor.css';

import type { TagCandidateRequest, TagOptimizerContext } from '../extensions/TagNode';
import type { Editor } from '@tiptap/core';

interface TiptapEditorProps {
  content: string;
  className?: string;
  editable?: boolean;
  onContentChange?: (content: string) => void;
  suggestions?: {
    weakness: Array<{ content: string; reason: string }>;
    score: number;
  } | null;
  onSuggestionsChange?: (suggestions: TiptapEditorProps['suggestions']) => void;
  onEditorReady?: (editor: Editor | null) => void;
  optimizerContext?: TagOptimizerContext;
  onRequestTagCandidates?: (params: TagCandidateRequest) => Promise<string[]>;
}

export const TiptapEditor = ({
  content,
  className,
  editable = true,
  onContentChange,
  suggestions,
  onEditorReady,
  optimizerContext,
  onRequestTagCandidates,
}: TiptapEditorProps) => {
  // 跟踪最新内容，避免外部状态同步时重复 setContent 导致光标抖动
  const prevContentRef = useRef(content);

  const extensions = useMemo(
    () =>
      createEditorExtensions({
        getOptimizerContext: () => optimizerContext,
        requestTagCandidates: onRequestTagCandidates,
      }),
    [optimizerContext, onRequestTagCandidates]
  );

  const editor = useEditor(
    {
      extensions,
      content,
      editable,
      editorProps: {
        attributes: {
          class: cn(
            'tiptap-editor',
            'prose prose-sm md:prose-base dark:prose-invert max-w-none text-sm focus:outline-none',
            className
          ),
        },
      },
      onUpdate: ({ editor }) => {
        if (!onContentChange) return;

        const markdown = (
          editor.storage as {
            markdown?: {
              getMarkdown?: () => string;
            };
          }
        ).markdown?.getMarkdown?.();

        const nextContent = markdown ?? editor.getText({ blockSeparator: '\n' });
        prevContentRef.current = nextContent;
        onContentChange(nextContent);
      },
    },
    [optimizerContext, onRequestTagCandidates]
  );

  const recommendations = useMemo(() => {
    if (!suggestions) return [];

    const badRecs = suggestions.weakness.map((item) => ({
      id: item.content,
      originalText: item.content,
      type: 'weakness' as const,
      reason: item.reason,
    }));

    return badRecs;
  }, [suggestions]);
  // 触发更新简历高光
  useTagHighlighter(editor, recommendations);

  // 保持编辑器内容与 prop 同步（仅在内容变化时更新，而非编辑器初始化时）
  useEffect(() => {
    if (editor && content !== prevContentRef.current) {
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

  useEffect(() => {
    if (!onEditorReady) return;
    onEditorReady(editor ?? null);

    return () => {
      onEditorReady(null);
    };
  }, [editor, onEditorReady]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
};

export default TiptapEditor;
