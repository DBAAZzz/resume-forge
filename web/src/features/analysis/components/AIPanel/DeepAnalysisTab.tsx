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
    className={`relative bg-white border ${borderColor} p-0 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
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
        className={`flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${config.color}`} strokeWidth={2} />
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
        <h4 className="font-display font-medium text-slate-900 text-sm mb-2">
          {issue.description}
        </h4>

        {issue.affectedPeriods.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-start gap-2">
            <span className="font-mono text-[10px] text-slate-500 uppercase mt-0.5">影响时段:</span>
            <div className="flex flex-wrap gap-1">
              {issue.affectedPeriods.map((period, idx) => (
                <span
                  key={idx}
                  className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200"
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-orange-600" strokeWidth={2} />
          <span className="font-mono text-xs font-bold text-orange-600 tracking-wider">
            [技能不匹配]
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">错误码: SK_02</span>
      </div>

      <div className="p-4">
        <h4 className="font-display font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Hash className="w-3 h-3 text-slate-400" />
          {issue.skill}
        </h4>

        <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-3">
          <div className="bg-white p-3">
            <span className="font-mono text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              声称水平
            </span>
            <span className="text-sm text-slate-700 font-medium">{issue.claimed}</span>
          </div>
          <div className="bg-white p-3">
            <span className="font-mono text-[10px] text-slate-400 block mb-1 uppercase tracking-wider">
              实际水平
            </span>
            <span className="text-sm text-slate-900 font-bold">{issue.reality}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 border border-slate-200">
          <Target className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className={`w-4 h-4 ${config.color}`} />
            <span className={`font-mono text-xs font-bold ${config.color} uppercase`}>
              {config.label}_优化机会
            </span>
          </div>
        </div>

        <p className="font-display text-sm text-slate-800 italic mb-4 pl-3 border-l-2 border-slate-300">
          "{suggestion.excerpt}"
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-500 mb-2 uppercase">
              <Activity className="w-3 h-3" />
              调查方向
            </div>
            <ul className="space-y-1">
              {suggestion.questions.map((q, idx) => (
                <li
                  key={idx}
                  className="text-xs font-mono text-slate-600 flex items-start gap-2 pl-2 border-l border-slate-200"
                >
                  <span className="text-slate-400 -ml-[13px] bg-white text-[8px] px-0.5">
                    0{idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 mb-2 uppercase">
              <Terminal className="w-3 h-3" />
              建议指标
            </div>
            <div className="text-xs font-mono text-emerald-800 bg-emerald-50/50 p-2 border border-emerald-100 block">
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50">
        <div className="max-w-[480px] w-full border border-slate-300 bg-white p-8 relative shadow-sm">
          {/* Decorative corner markers */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-900" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-900" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-900" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-900" />

          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 border-2 border-slate-900 flex items-center justify-center mb-4 bg-slate-50">
              <Cpu className="w-8 h-8 text-slate-900" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 uppercase tracking-widest mb-1">
              深度分析引擎
            </h3>
            <span className="font-mono text-xs text-slate-400">V.2.0.4 // 系统待命</span>
          </div>

          <div className="text-left bg-slate-50 p-4 border border-slate-200 mb-6 font-mono text-xs text-slate-600 space-y-2">
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
            className="w-full group relative px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
            <span className="relative flex items-center justify-center gap-3 font-mono text-sm font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              启动序列
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-slate-100">
      {isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-slate-200">
          <div className="border-r border-slate-200 p-4 bg-white">
            <ThinkingProcess
              content={basicThinkingText}
              isAnalyzing={basicStatus === 'analyzing'}
            />
          </div>
          <div className="p-4 bg-white">
            <ThinkingProcess content={deepThinkingText} isAnalyzing={deepStatus === 'analyzing'} />
          </div>
        </div>
      )}

      {/* Main Content - No animations that hide content */}
      <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Timeline Section */}
        {deepInsights.timelineIssues.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <div className="w-2 h-2 bg-red-600" />
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-widest">
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
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <div className="w-2 h-2 bg-orange-600" />
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-widest">
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
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <div className="w-2 h-2 bg-indigo-600" />
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-widest">
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
            <div className="flex items-center gap-2 mb-3 border-b border-slate-300 pb-2">
              <div className="w-2 h-2 bg-emerald-600" />
              <h3 className="text-sm font-mono font-bold text-slate-900 uppercase tracking-widest">
                系统总结
              </h3>
            </div>
            <div className="bg-white border text-left border-emerald-500 shadow-[4px_4px_0_0_rgba(16,185,129,0.1)] p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 border border-emerald-200 bg-emerald-50">
                  <CheckSquare className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-600 block mb-1">
                    分析结论
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium">
                    {deepInsights.overallSuggestion}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {basicStatus === 'done' && deepStatus === 'done' && (
          <div className="text-center py-6">
            <div className="inline-block border border-slate-200 bg-slate-50 px-4 py-1">
              <p className="text-[10px] font-mono text-slate-400 uppercase">传输结束</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
