import { semanticToneConfig } from './semantic';

import type { SemanticTone } from './semantic';

interface SectionHeaderProps {
  title: string;
  tone: SemanticTone;
  count?: number;
}

export const SectionHeader = ({ title, tone, count }: SectionHeaderProps) => {
  const toneConfig = semanticToneConfig[tone];

  return (
    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${toneConfig.dot}`} />
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900">
          {title}
          {typeof count === 'number' ? ` (${count})` : ''}
        </h3>
      </div>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneConfig.chip}`}
      >
        {toneConfig.label}
      </span>
    </div>
  );
};
