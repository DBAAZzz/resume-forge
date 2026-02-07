import { Hash, Target, XCircle } from 'lucide-react';

import { CardBase } from './CardBase';
import { semanticToneConfig } from './semantic';

import type { SkillIssue } from '../../../types';

interface SkillIssueCardProps {
  issue: SkillIssue;
}

export const SkillIssueCard = ({ issue }: SkillIssueCardProps) => {
  const toneConfig = semanticToneConfig.gap;

  return (
    <CardBase className="mb-3" tone="gap">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <XCircle className={`h-4 w-4 ${toneConfig.icon}`} strokeWidth={2} />
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${toneConfig.chip}`}
          >
            技能缺口
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">错误码: SK_02</span>
      </div>

      <div className="p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Hash className="h-3 w-3 text-slate-400" />
          {issue.skill}
        </h4>

        <div className="mb-3 grid grid-cols-2 gap-px rounded border border-slate-200 bg-slate-200">
          <div className="bg-white p-3">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              声称水平
            </span>
            <span className="text-sm font-medium text-slate-700">{issue.claimed}</span>
          </div>
          <div className="bg-white p-3">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-400">
              实际水平
            </span>
            <span className="text-sm font-semibold text-slate-900">{issue.reality}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <span className="font-mono text-xs leading-relaxed">{issue.suggestion}</span>
        </div>
      </div>
    </CardBase>
  );
};
