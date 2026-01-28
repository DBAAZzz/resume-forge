import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import { editorExtensions } from './config/extensions';
import { cn } from '@/lib/utils';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  className?: string;
  editable?: boolean;
}

export const TiptapEditor = ({ content, className, editable = false }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content, // Initial content
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

  // Keep editor content in sync with prop updates
  useEffect(() => {
    if (editor && content) {
      // Robust check: Only update if content fundamentally differs or to force markdown parsing
      // With tiptap-markdown, we can just setContent.
      // Note: Comparing editor.getHTML() vs markdown string isn't perfect,
      // but for only-read scenarios, simpler is better.
      // Force update to ensure markdown is re-parsed if string changes.
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

  return <EditorContent editor={editor} />;
};
