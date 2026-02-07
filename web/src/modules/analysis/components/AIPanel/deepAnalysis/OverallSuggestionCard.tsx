import { CheckSquare, Lightbulb } from 'lucide-react';

import { CardBase } from './CardBase';
import { semanticToneConfig } from './semantic';

import type { SemanticTone } from './semantic';

interface OverallSuggestionCardProps {
  suggestion: string;
  tone?: SemanticTone;
}

export const OverallSuggestionCard = ({
  suggestion,
  tone = 'optimize',
}: OverallSuggestionCardProps) => {
  const toneConfig = semanticToneConfig[tone];
  const Icon = tone === 'success' ? CheckSquare : Lightbulb;

  return (
    <CardBase tone={tone}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`rounded border p-2 ${toneConfig.block}`}>
            <Icon className={`h-5 w-5 ${toneConfig.icon}`} />
          </div>
          <div>
            <span className={`mb-1 block font-mono text-xs font-bold ${toneConfig.icon}`}>
              分析结论
            </span>
            <p className="text-sm font-medium leading-relaxed text-slate-800">{suggestion}</p>
          </div>
        </div>
      </div>
    </CardBase>
  );
};
