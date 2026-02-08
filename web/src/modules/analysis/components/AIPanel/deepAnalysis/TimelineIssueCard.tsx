import { AlertTriangle } from 'lucide-react';

import { CardBase } from './CardBase';
import { semanticToneConfig } from './semantic';

import type { SemanticTone } from './semantic';
import type { TimelineIssue } from '../../../types';

const severityToneMap: Record<TimelineIssue['severity'], SemanticTone> = {
  high: 'gap',
  medium: 'optimize',
  low: 'optimize',
};

const severityLabelMap: Record<TimelineIssue['severity'], string> = {
  high: '严重缺口',
  medium: '待优化',
  low: '待完善',
};

interface TimelineIssueCardProps {
  issue: TimelineIssue;
}

export const TimelineIssueCard = ({ issue }: TimelineIssueCardProps) => {
  const tone = severityToneMap[issue.severity] ?? 'optimize';
  const toneConfig = semanticToneConfig[tone];

  return (
    <CardBase className="mb-3" tone={tone}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${toneConfig.icon}`} strokeWidth={2} />
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold ${toneConfig.chip}`}
          >
            {severityLabelMap[issue.severity]}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          编号: TL-{issue.description.length.toString().padStart(3, '0')}
        </span>
      </div>

      <div className="p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-900">{issue.description}</h4>

        {issue.affectedPeriods.length > 0 && (
          <div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3">
            <span className="mt-0.5 font-mono text-[10px] uppercase text-slate-500">影响时段:</span>
            <div className="flex flex-wrap gap-1">
              {issue.affectedPeriods.map((period: string, idx: number) => (
                <span
                  key={`${period}-${idx}`}
                  className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700"
                >
                  {period}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardBase>
  );
};
