import { Radar } from 'lucide-react';

import { CardBase } from './CardBase';
import { semanticToneConfig } from './semantic';

import type { SemanticTone } from './semantic';
import type { JobMatchInsight } from '../../../types';

const getJobMatchLevel = (score: number): { label: string; tone: SemanticTone } => {
  if (score >= 85) return { label: '高匹配', tone: 'success' };
  if (score >= 55) return { label: '可提升', tone: 'optimize' };
  return { label: '低匹配', tone: 'gap' };
};

interface JobMatchCardProps {
  jobMatch: JobMatchInsight;
}

export const JobMatchCard = ({ jobMatch }: JobMatchCardProps) => {
  const level = getJobMatchLevel(jobMatch.score);
  const toneConfig = semanticToneConfig[level.tone];

  return (
    <CardBase className="mb-3" tone={level.tone}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Radar className={`h-4 w-4 ${toneConfig.icon}`} />
          <span className="font-mono text-xs font-bold tracking-wider text-slate-700">
            岗位匹配度
          </span>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneConfig.chip}`}
        >
          {level.label}
        </span>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
              匹配摘要
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-800">{jobMatch.summary}</p>
          </div>
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={toneConfig.icon}
                strokeDasharray={`${Math.max(0, Math.min(100, jobMatch.score))}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-base font-bold text-slate-900">{jobMatch.score}</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className={`rounded border p-3 ${semanticToneConfig.success.block}`}>
            <p
              className={`mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${semanticToneConfig.success.icon}`}
            >
              已满足要求
            </p>
            <ul className="space-y-1">
              {jobMatch.matchedRequirements.map((item: string, idx: number) => (
                <li
                  key={`${item}-${idx}`}
                  className={`text-xs leading-relaxed ${semanticToneConfig.success.text}`}
                >
                  {idx + 1}. {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={`rounded border p-3 ${semanticToneConfig.gap.block}`}>
            <p
              className={`mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${semanticToneConfig.gap.icon}`}
            >
              缺口要求
            </p>
            <ul className="space-y-1">
              {jobMatch.missingRequirements.map((item: string, idx: number) => (
                <li
                  key={`${item}-${idx}`}
                  className={`text-xs leading-relaxed ${semanticToneConfig.gap.text}`}
                >
                  {idx + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`rounded border p-3 ${semanticToneConfig.optimize.block}`}>
          <p
            className={`mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${semanticToneConfig.optimize.icon}`}
          >
            优先改进动作
          </p>
          <ul className="space-y-1">
            {jobMatch.recommendations.map((item: string, idx: number) => (
              <li
                key={`${item}-${idx}`}
                className={`text-xs leading-relaxed ${semanticToneConfig.optimize.text}`}
              >
                {idx + 1}. {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardBase>
  );
};
