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
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/50 backdrop-blur-sm z-10 relative">
      <div className="flex items-center gap-8 flex-1">
        {/* Role Section */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            面试岗位
          </span>
          <div className="flex items-center gap-2 group">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent text-xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 -ml-1 w-full max-w-[300px] hover:bg-white/5 transition-colors"
            />
            <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-50 transition-opacity" />
          </div>
        </div>

        <div className="h-10 w-[1px] bg-border shrink-0" />

        {/* JD Description Section */}
        <div className="flex items-center gap-3 text-muted-foreground flex-1">
          <Building2 className="w-5 h-5 shrink-0" />
          <input
            type="text"
            value={jdDescription}
            onChange={(e) => setJdDescription(e.target.value)}
            className="bg-transparent text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary/50 rounded px-1 hover:text-foreground transition-colors hover:bg-white/5 placeholder:text-muted-foreground/50"
            placeholder="输入职位描述或公司..."
          />
        </div>
      </div>

      {/* Score Section */}
      <div className="flex items-center gap-4 shrink-0 border-l border-border pl-8 ml-4">
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            简历评分
          </span>
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </span>
        </div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Simple Chart SVG */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
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
