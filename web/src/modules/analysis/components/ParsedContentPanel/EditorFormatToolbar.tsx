import { useEditorState } from '@tiptap/react';
import { Bold, Italic } from 'lucide-react';

import { cn } from '@/utils/classnames';

import type { Editor } from '@tiptap/core';

interface EditorFormatToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  className?: string;
}

const headingButtons = [
  { label: 'H1', level: 1 as const },
  { label: 'H2', level: 2 as const },
  { label: 'H3', level: 3 as const },
];

export const EditorFormatToolbar = ({
  editor,
  disabled = false,
  className,
}: EditorFormatToolbarProps) => {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return {
          isBold: false,
          isItalic: false,
          activeHeadingLevel: null as 1 | 2 | 3 | null,
        };
      }

      return {
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        activeHeadingLevel:
          ([1, 2, 3].find((level) => editor.isActive('heading', { level })) as
            | 1
            | 2
            | 3
            | undefined) ?? null,
      };
    },
  }) ?? {
    isBold: false,
    isItalic: false,
    activeHeadingLevel: null as 1 | 2 | 3 | null,
  };

  const toolbarDisabled = disabled || !editor || !editor.isEditable;
  const canToggleBold =
    !toolbarDisabled && (editor?.can().chain().focus().toggleBold().run() ?? false);
  const canToggleItalic =
    !toolbarDisabled && (editor?.can().chain().focus().toggleItalic().run() ?? false);
  const baseButtonClass =
    'h-7 rounded-full px-2.5 text-[10px] font-semibold tracking-[0.02em] transition-colors';
  const activeButtonClass =
    'bg-background text-foreground shadow-sm dark:bg-slate-800 dark:text-slate-100';
  const idleButtonClass =
    'text-slate-500 hover:bg-background/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full bg-slate-900/[0.06] p-0.5 dark:bg-white/[0.08]',
        className
      )}
    >
      {headingButtons.map(({ label, level }) => {
        const isActive = state.activeHeadingLevel === level;
        const canRun =
          !toolbarDisabled &&
          (editor?.can().chain().focus().toggleHeading({ level }).run() ?? false);

        return (
          <button
            key={level}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            disabled={!canRun}
            aria-label={`标题 ${level}`}
            title={`标题 ${level}`}
            className={cn(
              baseButtonClass,
              isActive ? activeButtonClass : idleButtonClass,
              !canRun && 'cursor-not-allowed opacity-40'
            )}
          >
            {label}
          </button>
        );
      })}

      <span className="mx-1 h-3.5 w-px bg-slate-300/60 dark:bg-slate-700/70" />

      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        disabled={!canToggleBold}
        aria-label="粗体"
        title="粗体"
        className={cn(
          'inline-flex h-7 items-center gap-1 rounded-full px-2 text-[10px] font-semibold transition-colors',
          state.isBold ? activeButtonClass : idleButtonClass,
          !canToggleBold && 'cursor-not-allowed opacity-40'
        )}
      >
        <Bold className="h-3 w-3" />
        <span>粗体</span>
      </button>
      <button
        type="button"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        disabled={!canToggleItalic}
        aria-label="斜体"
        title="斜体"
        className={cn(
          'inline-flex h-7 items-center gap-1 rounded-full px-2 text-[10px] font-semibold transition-colors',
          state.isItalic ? activeButtonClass : idleButtonClass,
          !canToggleItalic && 'cursor-not-allowed opacity-40'
        )}
      >
        <Italic className="h-3 w-3" />
        <span>斜体</span>
      </button>
    </div>
  );
};

export default EditorFormatToolbar;
