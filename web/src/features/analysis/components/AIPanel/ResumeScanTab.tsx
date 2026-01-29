import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, memo } from 'react';

import { useAnalysisStore } from '@/features/analysis/store';
import { Typography } from '@/shared/components/base';

import { ChatBubble } from './ChatBubble';
import { PointsList } from './PointsList';
import { StreamingText } from './StreamingText';
import { TypingIndicator } from './TypingIndicator';

type MessageType = 'text' | 'strength-points' | 'weakness-points';

interface MessageStep {
  id: string;
  type: MessageType;
  content?: string;
  role: 'ai' | 'user';
  delay?: number;
}

export const ResumeScanTab = memo(() => {
  const { aiSuggestions, status, thinkingText, startAnalysis } = useAnalysisStore();
  const [animationStep, setAnimationStep] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAnalyzing = status === 'analyzing';

  const renderStartAnalysisButton = useMemo(() => {
    return aiSuggestions.strength.length == 0 && aiSuggestions.weakness.length == 0 && !isAnalyzing;
  }, [aiSuggestions, isAnalyzing]);

  const pipeline = useMemo<MessageStep[]>(() => {
    const steps: MessageStep[] = [];

    // Thinking Process
    if (isAnalyzing || thinkingText) {
      steps.push({
        id: 'thinking',
        type: 'text',
        role: 'ai',
        content: thinkingText
          ? `Thinking Process:\n\n${thinkingText}`
          : 'Connecting to DeepSeek Reasoner...',
      });
    }

    if (aiSuggestions.score >= 0 && isAnalyzing) {
      steps.push({
        id: 'score-msg',
        type: 'text',
        role: 'ai',
        content: `I've analyzed your resume and calculated a logic score of ${aiSuggestions.score}/100`,
      });
    }

    if (aiSuggestions.strength.length > 0) {
      steps.push({
        id: 'strength-list',
        type: 'strength-points',
        role: 'ai',
      });
    }

    if (aiSuggestions.weakness.length > 0) {
      steps.push({
        id: 'weakness-list',
        type: 'weakness-points',
        role: 'ai',
      });
    }

    return steps;
  }, [
    aiSuggestions.score,
    aiSuggestions.strength.length,
    aiSuggestions.weakness.length,
    isAnalyzing,
    thinkingText,
  ]);

  // Derived state: if not analyzing (and we have content), show everything immediately.
  // Otherwise use the animation progress.
  const visibleSteps = !isAnalyzing && pipeline.length > 0 ? pipeline.length - 1 : animationStep;

  useEffect(() => {
    if (bottomRef.current) {
      const container = bottomRef.current;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [visibleSteps, thinkingText]);

  const handleStepComplete = () => {
    if (animationStep < pipeline.length - 1) {
      setAnimationStep((prev) => prev + 1);
    }
  };

  // Handle auto-stepping when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      // Auto-step when data starts coming in (beyond thinking stage)
      if (pipeline.length > 1 && animationStep === 0) {
        const t = setTimeout(() => setAnimationStep(1), 0);
        return () => clearTimeout(t);
      }
      // Reset if we somehow go back to empty/just-thinking state
      else if (pipeline.length <= 1 && animationStep > 0) {
        const t = setTimeout(() => setAnimationStep(0), 0);
        return () => clearTimeout(t);
      }
    }
  }, [isAnalyzing, pipeline.length, animationStep]);

  // If start button is shown, we want it centered nicely, so we might need full height.
  // The parent container provides height.
  return (
    <div
      ref={bottomRef}
      className="h-full overflow-y-auto p-4 sm:p-6 bg-slate-50/50 custom-scrollbar"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-2 pb-4 border-b border-gray-100"
        >
          <Typography variant="h4" className="font-display font-medium text-gray-900">
            AI Assistant
          </Typography>
          {aiSuggestions.score >= 0 ? (
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
              <Sparkles className="w-3 h-3" />
              SCORE: {aiSuggestions.score}
            </div>
          ) : null}
        </motion.div>

        {renderStartAnalysisButton ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Typography variant="p" className="text-muted-foreground text-center">
              Content parsed successfully. Ready to analyze logic and structure.
            </Typography>
            <button
              onClick={() => {
                setAnimationStep(0);
                startAnalysis();
              }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start DeepSeek Analysis
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-5">
          {pipeline.map((step, index) => {
            const isThinking = step.id === 'thinking';

            if (!isThinking && index > visibleSteps) return null;

            const isLast = index === visibleSteps;
            const isStreaming = isLast && visibleSteps < pipeline.length && !isThinking;

            return (
              <div key={step.id}>
                {step.type === 'text' ? (
                  <ChatBubble role={step.role}>
                    {isThinking ? (
                      <p className="min-h-[1.25rem] max-h-48 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                        {step.content}
                        {status === 'analyzing' ? (
                          <span className="inline-block w-2 h-4 ml-1 bg-primary/50 animate-pulse align-middle" />
                        ) : null}
                      </p>
                    ) : isStreaming ? (
                      <StreamingText text={step.content || ''} onComplete={handleStepComplete} />
                    ) : (
                      <p className="whitespace-pre-wrap">{step.content}</p>
                    )}
                  </ChatBubble>
                ) : null}

                {step.type === 'strength-points' && aiSuggestions?.strength ? (
                  <div className="pl-11 pr-2">
                    <PointsList
                      type="strength"
                      points={aiSuggestions.strength}
                      onComplete={isStreaming ? handleStepComplete : undefined}
                    />
                  </div>
                ) : null}

                {step.type === 'weakness-points' && aiSuggestions?.weakness ? (
                  <div className="pl-11 pr-2">
                    <PointsList
                      type="weakness"
                      points={aiSuggestions.weakness}
                      onComplete={isStreaming ? handleStepComplete : undefined}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}

          {status === 'analyzing' || (status === 'done' && visibleSteps < pipeline.length - 1) ? (
            <div className="pl-0">
              <TypingIndicator />
            </div>
          ) : null}
        </div>

        <div className="h-4 w-full" />
      </div>
    </div>
  );
});

ResumeScanTab.displayName = 'ResumeScanTab';
