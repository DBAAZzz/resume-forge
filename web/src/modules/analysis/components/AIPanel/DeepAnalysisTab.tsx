import { toast } from 'sonner';

import { MISSING_DEEPSEEK_API_KEY_MESSAGE, requireDeepseekApiKey } from '@/services/security';
import {
  startBasicAnalysis,
  startDeepAnalysisWorkflow,
  useAnalysisConfigStore,
  useAnalysisDocumentStore,
  useBasicAnalysisStore,
  useDeepAnalysisStore,
} from '@/store/analysis';

import {
  IdleStateCard,
  JobMatchCard,
  MetricSuggestionCard,
  OverallSuggestionCard,
  SectionHeader,
  SkillIssueCard,
  TimelineIssueCard,
} from './deepAnalysis';
import { ThinkingProcess } from './ThinkingProcess';

import type { SemanticTone } from './deepAnalysis/semantic';

const getJobMatchTone = (score: number): SemanticTone => {
  if (score >= 85) return 'success';
  if (score >= 55) return 'optimize';
  return 'gap';
};

export const DeepAnalysisTab = () => {
  const parsedContent = useAnalysisDocumentStore((state) => state.parsedContent);
  const apiKey = useAnalysisConfigStore((state) => state.apiKey);
  const basicStatus = useBasicAnalysisStore((state) => state.status);
  const basicThinkingText = useBasicAnalysisStore((state) => state.thinkingText);

  const {
    deepInsights,
    status: deepStatus,
    thinkingText: deepThinkingText,
  } = useDeepAnalysisStore();

  const handleStartAnalysis = async () => {
    if (!parsedContent) {
      toast.error('请先上传并解析简历');
      return;
    }

    try {
      requireDeepseekApiKey(apiKey);
    } catch {
      toast.error(MISSING_DEEPSEEK_API_KEY_MESSAGE);
      return;
    }

    await Promise.all([startBasicAnalysis(), startDeepAnalysisWorkflow()]);
  };

  const isAnalyzing = basicStatus === 'analyzing' || deepStatus === 'analyzing';

  const hasInsights =
    deepInsights.timelineIssues.length > 0 ||
    deepInsights.skillIssues.length > 0 ||
    deepInsights.metricSuggestions.length > 0 ||
    Boolean(deepInsights.jobMatch) ||
    Boolean(deepInsights.overallSuggestion);

  if (!isAnalyzing && !hasInsights) {
    return <IdleStateCard onStart={handleStartAnalysis} disabled={!parsedContent} />;
  }

  const overallTone = deepInsights.jobMatch
    ? getJobMatchTone(deepInsights.jobMatch.score)
    : 'optimize';

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

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6">
        {deepInsights.jobMatch && (
          <section>
            <SectionHeader title="岗位匹配度" tone={getJobMatchTone(deepInsights.jobMatch.score)} />
            <JobMatchCard jobMatch={deepInsights.jobMatch} />
          </section>
        )}

        {deepInsights.timelineIssues.length > 0 && (
          <section>
            <SectionHeader
              title="时间线审计日志"
              tone="gap"
              count={deepInsights.timelineIssues.length}
            />
            <div>
              {deepInsights.timelineIssues.map((issue, idx) => (
                <TimelineIssueCard key={`${issue.description}-${idx}`} issue={issue} />
              ))}
            </div>
          </section>
        )}

        {deepInsights.skillIssues.length > 0 && (
          <section>
            <SectionHeader
              title="技能一致性矩阵"
              tone="gap"
              count={deepInsights.skillIssues.length}
            />
            <div>
              {deepInsights.skillIssues.map((issue, idx) => (
                <SkillIssueCard key={`${issue.skill}-${idx}`} issue={issue} />
              ))}
            </div>
          </section>
        )}

        {deepInsights.metricSuggestions.length > 0 && (
          <section>
            <SectionHeader
              title="指标优化协议"
              tone="optimize"
              count={deepInsights.metricSuggestions.length}
            />
            <div>
              {deepInsights.metricSuggestions.map((suggestion, idx) => (
                <MetricSuggestionCard
                  key={`${suggestion.excerpt}-${idx}`}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </section>
        )}

        {deepInsights.overallSuggestion && (
          <section className="mb-8">
            <SectionHeader title="系统总结" tone={overallTone} />
            <OverallSuggestionCard suggestion={deepInsights.overallSuggestion} tone={overallTone} />
          </section>
        )}

        {basicStatus === 'done' && deepStatus === 'done' && (
          <div className="py-6 text-center">
            <div className="inline-block rounded border border-slate-200 bg-slate-50 px-4 py-1">
              <p className="font-mono text-[10px] uppercase text-slate-400">传输结束</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
