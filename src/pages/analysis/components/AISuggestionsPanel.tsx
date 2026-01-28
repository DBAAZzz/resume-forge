import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Sparkles, User } from 'lucide-react';

import { useAnalysisStore } from '@/store/useAnalysisStore';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/base/Typography';

// --- Types ---

type MessageType = 'text' | 'good-points' | 'bad-points';

interface MessageStep {
  id: string;
  type: MessageType;
  content?: string;
  role: 'ai' | 'user';
  delay?: number;
}

// --- Components ---

const ChatBubble = memo(
  ({
    role,
    children,
    className,
  }: {
    role: 'ai' | 'user';
    children: React.ReactNode;
    className?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex gap-3 max-w-[90%]',
        role === 'user' ? 'ml-auto flex-row-reverse' : '',
        className
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
          role === 'ai' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-500'
        )}
      >
        {role === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          'p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
          role === 'ai'
            ? 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
            : 'bg-black text-white rounded-tr-none'
        )}
      >
        {children}
      </div>
    </motion.div>
  )
);

ChatBubble.displayName = 'ChatBubble';

const TypingIndicator = () => (
  <ChatBubble role="ai">
    <div className="flex gap-1.5 h-5 items-center px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  </ChatBubble>
);

/**
 * Optimized Text Streamer
 * Uses Direct DOM Manipulation to avoid React Render Cycle for every character
 */
const StreamingText = memo(
  ({ text, onComplete, speed = 15 }: { text: string; onComplete?: () => void; speed?: number }) => {
    const elementRef = useRef<HTMLParagraphElement>(null);
    const requestedRef = useRef<number | null>(null);
    const indexRef = useRef(0);

    useEffect(() => {
      // Reset
      indexRef.current = 0;
      if (elementRef.current) elementRef.current.textContent = '';

      let lastTime = performance.now();
      const animate = (time: number) => {
        // Throttle speed
        if (time - lastTime >= speed) {
          if (indexRef.current < text.length) {
            if (elementRef.current) {
              // DIRECT DOM UPDATE: No Re-render
              elementRef.current.textContent += text.charAt(indexRef.current);
            }
            indexRef.current++;
            lastTime = time;
          } else {
            onComplete?.();
            return; // Stop loop
          }
        }
        requestedRef.current = requestAnimationFrame(animate);
      };

      requestedRef.current = requestAnimationFrame(animate);

      return () => {
        if (requestedRef.current) cancelAnimationFrame(requestedRef.current);
      };
    }, [text, speed, onComplete]);

    return <p ref={elementRef} className="whitespace-pre-wrap min-h-[1.5em]" />;
  }
);

StreamingText.displayName = 'StreamingText';

const PointsList = memo(
  ({
    points,
    type,
    onComplete,
  }: {
    points: string[];
    type: 'good' | 'bad';
    onComplete?: () => void;
  }) => {
    useEffect(() => {
      // Determine total animation time based on staggering
      const totalTime = points.length * 100 + 400; // 100ms stagger + 400ms duration
      const timer = setTimeout(() => {
        onComplete?.();
      }, totalTime);
      return () => clearTimeout(timer);
    }, [points.length, onComplete]);

    return (
      <div className="space-y-3 mt-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'flex items-center gap-2 font-display font-semibold text-sm mb-3',
            type === 'good' ? 'text-green-600' : 'text-amber-600'
          )}
        >
          {type === 'good' ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />}
          {type === 'good' ? 'Highlights' : 'Improvements'}
        </motion.div>

        {points.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={cn(
              'p-3.5 rounded-xl text-sm border flex items-start gap-3',
              type === 'good'
                ? 'bg-green-50/50 border-green-100 text-green-900'
                : 'bg-amber-50/50 border-amber-100 text-amber-900'
            )}
          >
            <div
              className={cn(
                'mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0',
                type === 'good' ? 'bg-green-500' : 'bg-amber-500'
              )}
            />
            <span className="leading-relaxed">{point}</span>
          </motion.div>
        ))}
      </div>
    );
  }
);

PointsList.displayName = 'PointsList';

// --- Main Panel ---

const AISuggestionsPanel = () => {
  const { aiSuggestions } = useAnalysisStore();
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new steps appear
  useEffect(() => {
    if (bottomRef.current) {
      // use requestAnimationFrame to ensure DOM has painted new size
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  }, [visibleSteps]);

  // Construct the narrative sequence
  const pipeline = useMemo<MessageStep[]>(() => {
    if (!aiSuggestions) return [];
    return [
      {
        id: 'intro',
        type: 'text',
        role: 'ai',
        content: `I've analyzed your resume. Your ATS Score is **${aiSuggestions.score}/100**.`,
      },
      {
        id: 'good-intro',
        type: 'text',
        role: 'ai',
        content: 'Here are the strong points relying on your profile:',
      },
      {
        id: 'good-list',
        type: 'good-points',
        role: 'ai',
      },
      {
        id: 'bad-intro',
        type: 'text',
        role: 'ai',
        content: 'I also found some areas we can improve to increase your interview chances:',
      },
      {
        id: 'bad-list',
        type: 'bad-points',
        role: 'ai',
      },
      {
        id: 'outro',
        type: 'text',
        role: 'ai',
        content: 'You can use the editor on the left to fix these issues. Good luck!',
      },
    ];
  }, [aiSuggestions]);

  if (!aiSuggestions) return null;

  const handleStepComplete = () => {
    // Advance to next step
    if (visibleSteps < pipeline.length) {
      // Add a small "reading" pause before showing the next bubble
      setTimeout(() => {
        setVisibleSteps((prev) => prev + 1);
      }, 500);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 bg-slate-50/50 custom-scrollbar">
      <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-10">
        {/* Header Area */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-2 pb-4 border-b border-gray-100"
        >
          <Typography variant="h4" className="font-display font-medium text-gray-900">
            AI Assistant
          </Typography>
          {aiSuggestions.score >= 0 && (
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold font-mono">
              <Sparkles className="w-3 h-3" />
              SCORE: {aiSuggestions.score}
            </div>
          )}
        </motion.div>

        {/* Message Feed */}
        <div className="flex flex-col gap-5">
          {pipeline.map((step, index) => {
            if (index > visibleSteps) return null;

            const isLast = index === visibleSteps;
            // Only streaming if it is the LAST visible item AND we haven't finished the whole pipeline
            const isStreaming = isLast && visibleSteps < pipeline.length;

            return (
              <div key={step.id}>
                {step.type === 'text' && (
                  <ChatBubble role={step.role}>
                    {isStreaming ? (
                      <StreamingText text={step.content || ''} onComplete={handleStepComplete} />
                    ) : (
                      <p className="whitespace-pre-wrap">{step.content}</p>
                    )}
                  </ChatBubble>
                )}

                {step.type === 'good-points' && aiSuggestions.good && (
                  <div className="pl-11 pr-2">
                    <PointsList
                      type="good"
                      points={aiSuggestions.good}
                      onComplete={isStreaming ? handleStepComplete : undefined}
                    />
                  </div>
                )}

                {step.type === 'bad-points' && aiSuggestions.bad && (
                  <div className="pl-11 pr-2">
                    <PointsList
                      type="bad"
                      points={aiSuggestions.bad}
                      onComplete={isStreaming ? handleStepComplete : undefined}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator: Show when we are waiting for the next step (e.g. during the pause) */}
          {visibleSteps < pipeline.length && (
            <div className="pl-0">
              <TypingIndicator />
            </div>
          )}
        </div>

        <div ref={bottomRef} className="h-4 w-full" />
      </div>
    </div>
  );
};

export default AISuggestionsPanel;
