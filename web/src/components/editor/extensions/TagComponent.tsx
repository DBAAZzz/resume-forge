import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Loader2, PencilLine, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { toast } from 'sonner';

import { useDialog } from '@/dialogs';
import { cn } from '@/utils/classnames';

import type { TagNodeOptions } from './TagNode';

interface TextDiff {
  prefix: string;
  removed: string;
  added: string;
  suffix: string;
}

interface CandidateDialogContentProps {
  reason: string;
  sourceText: string;
  sourceForDiff: string;
  onApplyCandidate: (candidate: string) => boolean | Promise<boolean>;
  fetchCandidates: (sourceText: string) => Promise<string[]>;
}

const CandidateDialogContent = ({
  reason,
  sourceText,
  sourceForDiff,
  onApplyCandidate,
  fetchCandidates,
}: CandidateDialogContentProps) => {
  const { closeDialog } = useDialog();
  const [isOptimizing, setIsOptimizing] = useState(true);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [applyingCandidate, setApplyingCandidate] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    if (!sourceText.trim()) {
      setIsOptimizing(false);
      setCandidates([]);
      setCandidateError('当前标签没有可优化文本');
      return;
    }

    setIsOptimizing(true);
    setCandidateError(null);

    try {
      const result = await fetchCandidates(sourceText);
      setCandidates(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成候选失败';
      setCandidates([]);
      setCandidateError(message);
    } finally {
      setIsOptimizing(false);
    }
  }, [fetchCandidates, sourceText]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  return (
    <>
      <div className="max-h-[68vh] space-y-4 overflow-y-auto">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            优化建议
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {reason || '建议优化此部分描述'}
          </p>
        </div>

        {isOptimizing && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            正在生成候选文案，请稍候...
          </div>
        )}

        {!isOptimizing && candidateError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {candidateError}
          </div>
        )}

        {!isOptimizing && !candidateError && candidates.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center text-sm text-slate-500">
            暂无可用候选，请重新生成
          </div>
        )}

        {!isOptimizing && candidates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5 text-[11px] font-medium text-slate-500">
              <span>共生成 {candidates.length} 条候选</span>
              <span>点击“应用该候选”将立即替换</span>
            </div>

            {candidates.map((candidate, idx) => {
              const diff = buildTextDiff(sourceForDiff, candidate);
              const isApplying = applyingCandidate === candidate;

              return (
                <div
                  key={`${candidate}-${idx}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/65 p-3 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">候选 {idx + 1}</p>
                  </div>

                  <div className="space-y-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed">
                    <p className="text-slate-500">
                      <span className="mr-1 font-semibold">原:</span>
                      {renderDiffLine(diff, 'original')}
                    </p>
                    <p className="text-slate-700">
                      <span className="mr-1 font-semibold">新:</span>
                      {renderDiffLine(diff, 'candidate')}
                    </p>
                  </div>

                  <button
                    className={cn(
                      'mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      'bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60'
                    )}
                    onClick={async (event) => {
                      event.stopPropagation();
                      setApplyingCandidate(candidate);

                      try {
                        const applied = await onApplyCandidate(candidate);
                        if (applied) {
                          closeDialog('apply');
                        }
                      } finally {
                        setApplyingCandidate((current) => (current === candidate ? null : current));
                      }
                    }}
                    disabled={isApplying}
                  >
                    {isApplying ? '应用中...' : '应用该候选'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="sticky bottom-0 flex items-center justify-end border-t border-slate-100 bg-white/95 pb-1 pt-3 backdrop-blur">
          <button
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              void loadCandidates();
            }}
            disabled={isOptimizing}
          >
            重新生成
          </button>
        </div>
      </div>
    </>
  );
};

const TagComponent = (props: NodeViewProps) => {
  const { openDialog } = useDialog();
  const { node, selected, updateAttributes, editor, getPos } = props;
  const type = node.attrs.type || 'neutral';
  const reason = (node.attrs.reason as string) || '';
  const isWeaknessTag = type === 'weakness';
  const isEditableTag = type === 'neutral';
  const extensionOptions = props.extension.options as TagNodeOptions;

  const getTypeStyles = () => {
    if (isWeaknessTag) {
      return 'cursor-pointer px-2 bg-red-50 text-neutral-700 underline decoration-dotted underline-offset-8 decoration-red-400 hover:bg-red-100/80 hover:text-red-700 hover:decoration-red-500 hover:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.25)]';
    }

    return selected
      ? 'bg-slate-200/80 text-slate-800 shadow-sm ring-1 ring-slate-300'
      : 'bg-slate-100/85 text-slate-700 hover:bg-slate-200/75 hover:text-slate-800 hover:shadow-sm hover:ring-1 hover:ring-slate-300/70';
  };

  const getCurrentPosition = useCallback(() => {
    if (typeof getPos !== 'function') {
      return null;
    }

    try {
      const pos = getPos();
      return typeof pos === 'number' ? pos : null;
    } catch {
      return null;
    }
  }, [getPos]);

  const getSourceText = () => {
    return node.textContent.trim() || ((node.attrs.label as string) || '').trim();
  };

  const buildContextWindow = useCallback(() => {
    const pos = getCurrentPosition();
    if (typeof pos !== 'number') {
      return '';
    }

    const from = Math.max(0, pos - 140);
    const to = Math.min(editor.state.doc.content.size, pos + node.nodeSize + 140);

    return editor.state.doc.textBetween(from, to, '\n', ' ').trim();
  }, [editor.state.doc, getCurrentPosition, node.nodeSize]);

  const fetchCandidates = useCallback(
    async (sourceText: string) => {
      const requestTagCandidates = extensionOptions.requestTagCandidates;
      if (!requestTagCandidates) {
        throw new Error('未配置 AI 优化服务');
      }

      const optimizerContext = extensionOptions.getOptimizerContext?.() ?? {};
      const result = await requestTagCandidates({
        text: sourceText,
        reason,
        context: buildContextWindow(),
        candidateCount: 3,
        model: optimizerContext.model,
        apiKey: optimizerContext.apiKey,
      });

      if (!result.length) {
        throw new Error('暂未生成可用候选，请重试');
      }

      return result;
    },
    [buildContextWindow, extensionOptions, reason]
  );

  const switchToEditableTag = (close?: () => void) => {
    updateAttributes({
      type: 'neutral',
      reason: null,
    });

    close?.();

    requestAnimationFrame(() => {
      const position = getCurrentPosition();
      if (typeof position === 'number') {
        editor.commands.focus(position + 1);
      } else {
        editor.commands.focus();
      }
    });
  };

  const applyCandidateText = (candidate: string): boolean => {
    const nextText = candidate.trim();
    if (!nextText) return false;

    const position = getCurrentPosition();
    if (typeof position !== 'number') {
      toast.error('无法定位当前标签，请重试');
      return false;
    }

    const from = position + 1;
    const to = position + node.nodeSize - 1;

    editor.chain().focus(from).insertContentAt({ from, to }, nextText).run();

    updateAttributes({
      label: nextText,
      type: 'neutral',
      reason: null,
    });

    toast.success('AI 优化文案已应用');
    return true;
  };

  const hasText = node.textContent.trim().length > 0;
  const currentText = hasText ? node.textContent : '';
  const fallbackLabel = (node.attrs.label as string) || 'tag';
  const sourceForDiff = currentText || fallbackLabel;

  const handleOptimize = async (
    event: MouseEvent<HTMLButtonElement>,
    closePopover?: () => void
  ) => {
    event.preventDefault();
    event.stopPropagation();
    closePopover?.();

    const sourceText = getSourceText();

    await openDialog({
      title: 'AI 候选（含原文差异）',
      description: '点击候选卡片中的按钮可直接应用',
      panelClassName: 'max-w-4xl rounded-xl',
      dismissActionKey: 'cancel',
      content: (
        <CandidateDialogContent
          reason={reason}
          sourceText={sourceText}
          sourceForDiff={sourceForDiff}
          onApplyCandidate={applyCandidateText}
          fetchCandidates={fetchCandidates}
        />
      ),
    });
  };

  const EditableTagContent = (
    <span
      className={`
        inline-flex items-center font-medium transition-all duration-200
        ${getTypeStyles()}
      `}
      data-id={node.attrs.id as string}
    >
      <NodeViewContent className="inline min-w-[1ch] whitespace-pre-wrap rounded-sm px-2 focus:outline-none focus:ring-1 focus:ring-slate-300" />
      {!hasText && <span className="pointer-events-none opacity-80">{fallbackLabel}</span>}
    </span>
  );

  const StaticTagContent = (
    <span
      className={`
        inline-flex items-center font-medium transition-all duration-200
        ${getTypeStyles()}
      `}
      data-id={node.attrs.id as string}
    >
      {currentText || fallbackLabel}
    </span>
  );

  if (isEditableTag) {
    return (
      <NodeViewWrapper className="tag-node-view inline-block align-middle" as="span">
        {EditableTagContent}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="tag-node-view inline-block align-middle" as="span">
      <Popover className="relative inline-block w-full">
        {({ close }) => (
          <>
            <PopoverButton
              className="w-full border-0 bg-transparent p-0 text-left focus:outline-none"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {StaticTagContent}
            </PopoverButton>

            <PopoverPanel
              transition
              anchor={{ to: 'top', gap: 10 }}
              portal
              className="relative z-50 w-[320px] overflow-visible rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-xl ring-1 ring-black/5 transition duration-200 ease-out data-[closed]:translate-y-1 data-[closed]:opacity-0"
            >
              <div className="flex flex-col gap-3 p-1">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  </div>
                  <span className="whitespace-normal text-sm leading-relaxed text-slate-600">
                    {reason || '建议优化此部分描述'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="group flex w-fit items-center justify-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-200 hover:text-slate-800"
                    onClick={(event) => {
                      event.stopPropagation();
                      switchToEditableTag(close);
                    }}
                  >
                    <PencilLine className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    <span>手动编辑</span>
                  </button>

                  <button
                    className="group flex w-fit items-center justify-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 hover:text-purple-800"
                    onClick={(event) => {
                      void handleOptimize(event, close);
                    }}
                  >
                    <Wand2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    <span>AI 优化</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">候选结果将在独立弹窗中展示</p>
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>
    </NodeViewWrapper>
  );
};

function buildTextDiff(original: string, candidate: string): TextDiff {
  const source = original.trim();
  const target = candidate.trim();

  if (!source) {
    return {
      prefix: '',
      removed: '',
      added: target,
      suffix: '',
    };
  }

  if (!target) {
    return {
      prefix: '',
      removed: source,
      added: '',
      suffix: '',
    };
  }

  let prefixLength = 0;
  while (
    prefixLength < source.length &&
    prefixLength < target.length &&
    source[prefixLength] === target[prefixLength]
  ) {
    prefixLength += 1;
  }

  let sourceSuffixIndex = source.length - 1;
  let targetSuffixIndex = target.length - 1;

  while (
    sourceSuffixIndex >= prefixLength &&
    targetSuffixIndex >= prefixLength &&
    source[sourceSuffixIndex] === target[targetSuffixIndex]
  ) {
    sourceSuffixIndex -= 1;
    targetSuffixIndex -= 1;
  }

  return {
    prefix: source.slice(0, prefixLength),
    removed: source.slice(prefixLength, sourceSuffixIndex + 1),
    added: target.slice(prefixLength, targetSuffixIndex + 1),
    suffix: source.slice(sourceSuffixIndex + 1),
  };
}

function renderDiffLine(diff: TextDiff, type: 'original' | 'candidate') {
  const changedText = type === 'original' ? diff.removed : diff.added;
  const changedClassName =
    type === 'original'
      ? 'rounded bg-red-100 px-0.5 text-red-700 line-through'
      : 'rounded bg-emerald-100 px-0.5 text-emerald-700';

  return (
    <>
      {diff.prefix}
      {changedText ? <span className={changedClassName}>{changedText}</span> : null}
      {diff.suffix}
    </>
  );
}

export default TagComponent;
