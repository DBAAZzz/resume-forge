import {
  AlertTriangle,
  CheckSquare,
  Lightbulb,
  XCircle,
  Target,
  Activity,
  Terminal,
  Hash,
  Cpu,
} from 'lucide-react';

import { useDeepAnalysisStore } from '../../deepAnalysisStore';
import { useAnalysisStore } from '../../store';

import { ThinkingProcess } from './ThinkingProcess';
import { useAnalysisToasts } from './useAnalysisToasts';

import type { TimelineIssue, SkillIssue, MetricSuggestion } from '../../types';

// -----------------------------------------------------------------------------
// UI Components
// -----------------------------------------------------------------------------

const severityConfig = {
  high: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-600', label: '严重' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-600', label: '警告' },
  low: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', label: '提示' },
};

const categoryConfig = {
  performance: {
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-600',
    label: '性能',
  },
  scale: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-600', label: '规模' },
  impact: {
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-600',
    label: '影响',
  },
  efficiency: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-600',
    label: '效率',
  },
};

// -----------------------------------------------------------------------------
// Cards (Industrial / Boxy Design)
// -----------------------------------------------------------------------------

const CardBase = ({
  children,
  className = '',
  borderColor = 'border-slate-200',
}: {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
}) => (
  <div
    className={`relative border bg-white ${borderColor} p-0 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
  >
    {children}
  </div>
);

const TimelineIssueCard = ({ issue }: { issue: TimelineIssue }) => {
  const config = severityConfig[issue.severity] || severityConfig.low;

  return (
    <CardBase className="mb-3" borderColor="border-slate-300">
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`h-4 w-4 ${config.color}`} strokeWidth={2} />
          <span className={`font-mono text-xs font-bold ${config.color} tracking-wider`}>
            [{config.label}]
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          编号: TL-{issue.description.length.toString().padStart(3, '0')}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="mb-2 font-display text-sm font-medium text-slate-900">
          {issue.description}
        </h4>

        {issue.affectedPeriods.length > 0 && (
          <div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3">
            <span className="mt-0.5 font-mono text-[10px] uppercase text-slate-500">影响时段:</span>
            <div className="flex flex-wrap gap-1">
              {issue.affectedPeriods.map((period, idx) => (
                <span
                  key={idx}
                  className="border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700"
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

const SkillIssueCard = ({ issue }: { issue: SkillIssue }) => {
  return (
    <CardBase className="mb-3" borderColor="border-slate-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-orange-600" strokeWidth={2} />
          <span className="font-mono text-xs font-bold tracking-wider text-orange-600">
            [技能不匹配]
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">错误码: SK_02</span>
      </div>

      <div className="p-4">
        <h4 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-slate-900">
          <Hash className="h-3 w-3 text-slate-400" />
          {issue.skill}
        </h4>

        <div className="mb-3 grid grid-cols-2 gap-px border border-slate-200 bg-slate-200">
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
            <span className="text-sm font-bold text-slate-900">{issue.reality}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
          <span className="font-mono text-xs leading-relaxed">{issue.suggestion}</span>
        </div>
      </div>
    </CardBase>
  );
};

const MetricSuggestionCard = ({ suggestion }: { suggestion: MetricSuggestion }) => {
  const config = categoryConfig[suggestion.category] || categoryConfig.impact;

  return (
    <CardBase
      className="mb-3"
      borderColor={`border-l-4 ${config.border} border-y-slate-200 border-r-slate-200`}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className={`h-4 w-4 ${config.color}`} />
            <span className={`font-mono text-xs font-bold ${config.color} uppercase`}>
              {config.label}_优化机会
            </span>
          </div>
        </div>

        <p className="mb-4 border-l-2 border-slate-300 pl-3 font-display text-sm italic text-slate-800">
          "{suggestion.excerpt}"
        </p>

        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-slate-500">
              <Activity className="h-3 w-3" />
              调查方向
            </div>
            <ul className="space-y-1">
              {suggestion.questions.map((q, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 border-l border-slate-200 pl-2 font-mono text-xs text-slate-600"
                >
                  <span className="-ml-[13px] bg-white px-0.5 text-[8px] text-slate-400">
                    0{idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase text-emerald-600">
              <Terminal className="h-3 w-3" />
              建议指标
            </div>
            <div className="block border border-emerald-100 bg-emerald-50/50 p-2 font-mono text-xs text-emerald-800">
              {'>'} {suggestion.exampleMetric}
            </div>
          </div>
        </div>
      </div>
    </CardBase>
  );
};

// -----------------------------------------------------------------------------
// Layout
// -----------------------------------------------------------------------------

export const DeepAnalysisTab = () => {
  const parsedContent = useAnalysisStore((state) => state.parsedContent);
  const basicStatus = useAnalysisStore((state) => state.status);
  const basicThinkingText = useAnalysisStore((state) => state.thinkingText);
  const startBasicAnalysis = useAnalysisStore((state) => state.startAnalysis);

  const {
    deepInsights,
    status: deepStatus,
    thinkingText: deepThinkingText,
    startDeepAnalysis,
  } = useDeepAnalysisStore();

  useAnalysisToasts();

  const handleStartAnalysis = async () => {
    if (!parsedContent) {
      alert('请先上传并解析简历');
      return;
    }
    await Promise.all([startBasicAnalysis(), startDeepAnalysis(parsedContent)]);
  };

  const isAnalyzing = basicStatus === 'analyzing' || deepStatus === 'analyzing';

  // Empty State (Industrial / System Idle)
  if (basicStatus === 'idle' && deepStatus === 'idle' && deepInsights.timelineIssues.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
        <div className="relative w-full max-w-[480px] border border-slate-300 bg-white p-8 shadow-sm">
          {/* Decorative corner markers */}
          <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-slate-900" />
          <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-slate-900" />
          <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-slate-900" />
          <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-slate-900" />

          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-slate-900 bg-slate-50">
              <Cpu className="h-8 w-8 text-slate-900" strokeWidth={1.5} />
            </div>
            <h3 className="mb-1 font-display text-xl font-bold uppercase tracking-widest text-slate-900">
              深度分析引擎
            </h3>
            <span className="font-mono text-xs text-slate-400">V.2.0.4 // 系统待命</span>
          </div>

          <div className="mb-6 space-y-2 border border-slate-200 bg-slate-50 p-4 text-left font-mono text-xs text-slate-600">
            <div className="flex justify-between">
              <span>[目标]:</span>
              <span className="text-slate-900">简历逻辑核心</span>
            </div>
            <div className="flex justify-between">
              <span>[模块_1]:</span>
              <span className="text-slate-900">时间线审计</span>
            </div>
            <div className="flex justify-between">
              <span>[模块_2]:</span>
              <span className="text-slate-900">技能验证</span>
            </div>
            <div className="flex justify-between">
              <span>[模块_3]:</span>
              <span className="text-slate-900">指标提取</span>
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!parsedContent}
            className="group relative w-full overflow-hidden bg-slate-900 px-6 py-3 text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="animate-shimmer absolute inset-0 h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%]" />
            <span className="relative flex items-center justify-center gap-3 font-mono text-sm font-bold uppercase tracking-wider">
              <Terminal className="h-4 w-4" />
              启动序列
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-slate-100">
      {isAnalyzing && (
        <div className="grid grid-cols-1 gap-0 border-b border-slate-200 lg:grid-cols-2">
          <div className="border-r border-slate-200 bg-white p-4">
            <ThinkingProcess
              content={basicThinkingText}
              isAnalyzing={basicStatus === 'analyzing'}
            />
          </div>
          <div className="bg-white p-4">
            <ThinkingProcess content={deepThinkingText} isAnalyzing={deepStatus === 'analyzing'} />
          </div>
        </div>
      )}

      {/* Main Content - No animations that hide content */}
      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        {/* Timeline Section */}
        {deepInsights.timelineIssues.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 border-b border-slate-300 pb-2">
              <div className="h-2 w-2 bg-red-600" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900">
                时间线审计日志 ({deepInsights.timelineIssues.length})
              </h3>
            </div>
            <div className="grid gap-0">
              {deepInsights.timelineIssues.map((issue, idx) => (
                <TimelineIssueCard key={idx} issue={issue} />
              ))}
            </div>
          </section>
        )}

        {/* Skill Section */}
        {deepInsights.skillIssues.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 border-b border-slate-300 pb-2">
              <div className="h-2 w-2 bg-orange-600" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900">
                技能一致性矩阵 ({deepInsights.skillIssues.length})
              </h3>
            </div>
            <div className="grid gap-0">
              {deepInsights.skillIssues.map((issue, idx) => (
                <SkillIssueCard key={idx} issue={issue} />
              ))}
            </div>
          </section>
        )}

        {/* Metrics Section */}
        {deepInsights.metricSuggestions.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2 border-b border-slate-300 pb-2">
              <div className="h-2 w-2 bg-indigo-600" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900">
                指标优化协议 ({deepInsights.metricSuggestions.length})
              </h3>
            </div>
            <div className="grid gap-0">
              {deepInsights.metricSuggestions.map((suggestion, idx) => (
                <MetricSuggestionCard key={idx} suggestion={suggestion} />
              ))}
            </div>
          </section>
        )}

        {/* Overall Suggestion */}
        {deepInsights.overallSuggestion && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2 border-b border-slate-300 pb-2">
              <div className="h-2 w-2 bg-emerald-600" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-slate-900">
                系统总结
              </h3>
            </div>
            <div className="border border-emerald-500 bg-white p-6 text-left shadow-[4px_4px_0_0_rgba(16,185,129,0.1)]">
              <div className="flex items-start gap-4">
                <div className="border border-emerald-200 bg-emerald-50 p-2">
                  <CheckSquare className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <span className="mb-1 block font-mono text-xs font-bold text-emerald-600">
                    分析结论
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-slate-800">
                    {deepInsights.overallSuggestion}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {basicStatus === 'done' && deepStatus === 'done' && (
          <div className="py-6 text-center">
            <div className="inline-block border border-slate-200 bg-slate-50 px-4 py-1">
              <p className="font-mono text-[10px] uppercase text-slate-400">传输结束</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
