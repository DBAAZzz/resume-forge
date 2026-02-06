import { Pencil, Building2 } from 'lucide-react';
import { useState } from 'react';

import { useAnalysisStore } from '../../store';

const getScoreLabel = (score: number) => {
  if (score < 0) return '未分析';
  if (score >= 90) return '优秀';
  if (score >= 80) return '良好';
  if (score >= 70) return '还不错，需要润色';
  if (score >= 60) return '一般，需要改进';
  return '需要大幅改进';
};

const getScoreColor = (score: number) => {
  if (score < 0) return 'text-muted-foreground';
  if (score >= 80) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const getCircleColor = (score: number) => {
  if (score < 0) return 'text-muted';
  if (score >= 80) return 'text-emerald-500';
  if (score >= 70) return 'text-blue-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

export const DashboardHeader = () => {
  const [role, setRole] = useState('后端开发');
  const [jdDescription, setJdDescription] = useState('Google, Mountain View (Hybrid)');
  const score = useAnalysisStore((state) => state.aiSuggestions.score);

  return (
    <div className="relative z-10 flex items-center justify-between border-b border-border bg-background/50 px-6 py-3 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-8">
        {/* Role Section */}
        <div className="flex min-w-[200px] flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            面试岗位
          </span>
          <div className="group flex items-center gap-2">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="-ml-1 w-full max-w-[300px] rounded bg-transparent px-1 text-xl font-bold text-foreground transition-colors hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <Pencil className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-50" />
          </div>
        </div>

        <div className="h-10 w-[1px] shrink-0 bg-border" />

        {/* JD Description Section */}
        <div className="flex flex-1 items-center gap-3 text-muted-foreground">
          <Building2 className="h-5 w-5 shrink-0" />
          <input
            type="text"
            value={jdDescription}
            onChange={(e) => setJdDescription(e.target.value)}
            className="w-full rounded bg-transparent px-1 text-sm transition-colors placeholder:text-muted-foreground/50 hover:bg-white/5 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="输入职位描述或公司..."
          />
        </div>
      </div>

      {/* Score Section */}
      <div className="ml-4 flex shrink-0 items-center gap-4 border-l border-border pl-8">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            简历评分
          </span>
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </span>
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center">
          {/* Simple Chart SVG */}
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
            {/* Background Circle */}
            <path
              className="text-muted/20"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Progress Circle */}
            <path
              className={getCircleColor(score)}
              strokeDasharray={`${score < 0 ? 0 : score}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-bold text-foreground">
            {score < 0 ? '-' : score}
          </span>
        </div>
      </div>
    </div>
  );
};
