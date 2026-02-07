import { Activity, Lightbulb, Terminal } from 'lucide-react';

import { CardBase } from './CardBase';
import { semanticToneConfig } from './semantic';

import type { MetricSuggestion } from '../../../types';

const categoryLabelMap: Record<MetricSuggestion['category'], string> = {
  performance: '性能',
  scale: '规模',
  impact: '影响',
  efficiency: '效率',
};

interface MetricSuggestionCardProps {
  suggestion: MetricSuggestion;
}

export const MetricSuggestionCard = ({ suggestion }: MetricSuggestionCardProps) => {
  const toneConfig = semanticToneConfig.optimize;

  return (
    <CardBase className="mb-3" tone="optimize">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className={`h-4 w-4 ${toneConfig.icon}`} />
            <span
              className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${toneConfig.chip}`}
            >
              {categoryLabelMap[suggestion.category]} · 待优化
            </span>
          </div>
        </div>

        <p className="mb-4 border-l-2 border-slate-300 pl-3 text-sm italic text-slate-800">
          &quot;{suggestion.excerpt}&quot;
        </p>

        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-slate-500">
              <Activity className="h-3 w-3" />
              调查方向
            </div>
            <ul className="space-y-1">
              {suggestion.questions.map((question, idx) => (
                <li
                  key={`${question}-${idx}`}
                  className="flex items-start gap-2 border-l border-slate-200 pl-2 font-mono text-xs text-slate-600"
                >
                  <span className="-ml-[13px] bg-white px-0.5 text-[8px] text-slate-400">
                    {`${idx + 1}`.padStart(2, '0')}
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-slate-500">
              <Terminal className="h-3 w-3" />
              建议指标
            </div>
            <div
              className={`block rounded border p-2 font-mono text-xs ${toneConfig.block} ${toneConfig.text}`}
            >
              {'>'} {suggestion.exampleMetric}
            </div>
          </div>
        </div>
      </div>
    </CardBase>
  );
};
