import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Popover,
  PopoverButton,
  PopoverPanel,
} from '@headlessui/react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Loader2, PencilLine, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { TagNodeOptions } from './TagNode';

interface TextDiff {
  prefix: string;
  removed: string;
  added: string;
  suffix: string;
}

const TagComponent = (props: NodeViewProps) => {
  const { node, selected, updateAttributes, editor, getPos } = props;
  const type = node.attrs.type || 'neutral';
  const reason = (node.attrs.reason as string) || '';
  const isWeaknessTag = type === 'weakness';
  const isEditableTag = type === 'neutral';
  const extensionOptions = props.extension.options as TagNodeOptions;

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);

  const getTypeStyles = () => {
    if (isWeaknessTag) {
      return 'bg-red-50 text-neutral-700 underline decoration-dotted underline-offset-8 decoration-red-400';
    }

    return selected
      ? 'bg-slate-200/80 text-slate-800 shadow-sm ring-1 ring-slate-300'
      : 'bg-slate-100/85 text-slate-700 hover:bg-slate-200/75';
  };

  const getCurrentPosition = () => {
    if (typeof getPos !== 'function') {
      return null;
    }

    try {
      const pos = getPos();
      return typeof pos === 'number' ? pos : null;
    } catch {
      return null;
    }
  };

  const getSourceText = () => {
    return node.textContent.trim() || ((node.attrs.label as string) || '').trim();
  };

  const buildContextWindow = () => {
    const pos = getCurrentPosition();
    if (typeof pos !== 'number') {
      return '';
    }

    const from = Math.max(0, pos - 140);
    const to = Math.min(editor.state.doc.content.size, pos + node.nodeSize + 140);

    return editor.state.doc.textBetween(from, to, '\n', ' ').trim();
  };

  const requestCandidates = async (sourceText: string) => {
    setIsOptimizing(true);
    setCandidateError(null);

    try {
      const requestTagCandidates = extensionOptions.requestTagCandidates;
      if (!requestTagCandidates) {
        setCandidates([]);
        setCandidateError('未配置 AI 优化服务');
        return;
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
        setCandidates([]);
        setCandidateError('暂未生成可用候选，请重试');
        return;
      }

      setCandidates(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成候选失败';
      setCandidates([]);
      setCandidateError(message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const closeCandidateModal = () => {
    setIsCandidateModalOpen(false);
    setCandidateError(null);
  };

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

  const applyCandidateText = (candidate: string) => {
    const nextText = candidate.trim();
    if (!nextText) return;

    const position = getCurrentPosition();
    if (typeof position !== 'number') {
      toast.error('无法定位当前标签，请重试');
      return;
    }

    const from = position + 1;
    const to = position + node.nodeSize - 1;

    editor.chain().focus(from).insertContentAt({ from, to }, nextText).run();

    updateAttributes({
      label: nextText,
      type: 'neutral',
      reason: null,
    });

    setCandidates([]);
    closeCandidateModal();

    toast.success('AI 优化文案已应用');
  };

  const handleOptimize = async (
    event: React.MouseEvent<HTMLButtonElement>,
    closePopover?: () => void
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (isOptimizing) {
      return;
    }

    const sourceText = getSourceText();
    setCandidates([]);
    setCandidateError(null);
    setIsCandidateModalOpen(true);
    closePopover?.();

    if (!sourceText) {
      setCandidateError('当前标签没有可优化文本');
      return;
    }

    await requestCandidates(sourceText);
  };

  const hasText = node.textContent.trim().length > 0;
  const currentText = hasText ? node.textContent : '';
  const fallbackLabel = (node.attrs.label as string) || 'tag';
  const sourceForDiff = currentText || fallbackLabel;

  const EditableTagContent = (
    <span
      className={`
        inline-flex items-center font-medium transition-colors duration-200
        ${getTypeStyles()}
      `}
      data-id={node.attrs.id as string}
    >
      <NodeViewContent className="inline min-w-[1ch] whitespace-pre-wrap rounded-sm px-0.5 focus:outline-none focus:ring-1 focus:ring-slate-300" />
      {!hasText && <span className="pointer-events-none opacity-80">{fallbackLabel}</span>}
    </span>
  );

  const StaticTagContent = (
    <span
      className={`
        inline-flex items-center font-medium transition-colors duration-200
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
                setCandidateError(null);
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
                    className="group flex w-fit items-center justify-center gap-1.5 rounded-md bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-100 hover:text-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
                    onClick={(event) => {
                      void handleOptimize(event, close);
                    }}
                    disabled={isOptimizing}
                  >
                    {isOptimizing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    )}
                    <span>{isOptimizing ? '优化中…' : 'AI 优化'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">候选结果将在独立弹窗中展示</p>
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>

      <Dialog
        open={isCandidateModalOpen}
        onClose={closeCandidateModal}
        className="relative z-[120]"
      >
        <div className="fixed inset-0 bg-slate-900/45 p-4" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div>
                <DialogTitle className="font-display text-base font-semibold text-slate-900">
                  AI 候选（含原文差异）
                </DialogTitle>
                <p className="mt-0.5 text-xs text-slate-500">选择一条候选并应用到当前标签</p>
              </div>
              <button
                className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={closeCandidateModal}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-2.5 overflow-auto px-5 py-3.5">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                {reason || '建议优化此部分描述'}
              </div>

              {isOptimizing && (
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  正在生成候选文案...
                </div>
              )}

              {!isOptimizing && candidateError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700">
                  {candidateError}
                </div>
              )}

              {!isOptimizing && candidates.length > 0 && (
                <div className="space-y-2">
                  {candidates.map((candidate, idx) => {
                    const diff = buildTextDiff(sourceForDiff, candidate);

                    return (
                      <div
                        key={`${candidate}-${idx}`}
                        className="rounded-md border border-slate-200 bg-slate-50/65 p-2.5"
                      >
                        <p className="mb-1.5 text-xs font-semibold text-slate-700">
                          候选 {idx + 1}
                        </p>

                        <div className="space-y-0.5 rounded bg-white px-2 py-1.5 text-xs leading-relaxed">
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
                          className="mt-1.5 inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                          onClick={(event) => {
                            event.stopPropagation();
                            applyCandidateText(candidate);
                          }}
                        >
                          应用该候选
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-2.5">
              <button
                className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                onClick={() => {
                  const sourceText = getSourceText();
                  if (!sourceText) {
                    setCandidateError('当前标签没有可优化文本');
                    return;
                  }

                  void requestCandidates(sourceText);
                }}
                disabled={isOptimizing}
              >
                重新生成
              </button>
              <button
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                onClick={closeCandidateModal}
              >
                关闭
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
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
