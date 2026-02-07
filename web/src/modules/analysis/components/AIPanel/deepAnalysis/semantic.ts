export type SemanticTone = 'success' | 'gap' | 'optimize';

export const semanticToneConfig: Record<
  SemanticTone,
  {
    label: string;
    dot: string;
    chip: string;
    icon: string;
    block: string;
    text: string;
  }
> = {
  success: {
    label: '已满足',
    dot: 'bg-emerald-500',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-600',
    block: 'border-emerald-200 bg-emerald-50/40',
    text: 'text-emerald-900',
  },
  gap: {
    label: '缺口',
    dot: 'bg-red-500',
    chip: 'border-red-200 bg-red-50 text-red-700',
    icon: 'text-red-600',
    block: 'border-red-200 bg-red-50/40',
    text: 'text-red-900',
  },
  optimize: {
    label: '待优化',
    dot: 'bg-amber-500',
    chip: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: 'text-amber-600',
    block: 'border-amber-200 bg-amber-50/40',
    text: 'text-amber-900',
  },
};
