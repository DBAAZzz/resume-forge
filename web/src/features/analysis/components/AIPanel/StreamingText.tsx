import { useRef, useEffect, memo } from 'react';

export const StreamingText = memo(
  ({ text, onComplete, speed = 15 }: { text: string; onComplete?: () => void; speed?: number }) => {
    const elementRef = useRef<HTMLParagraphElement>(null);
    const requestedRef = useRef<number | null>(null);
    const indexRef = useRef(0);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      indexRef.current = 0;
      element.textContent = '';

      let lastTime = performance.now();

      const animate = (time: number) => {
        if (time - lastTime >= speed) {
          if (indexRef.current < text.length) {
            element.textContent += text.charAt(indexRef.current);
            indexRef.current++;
            lastTime = time;
          } else {
            onComplete?.();
            return;
          }
        }
        requestedRef.current = requestAnimationFrame(animate);
      };

      requestedRef.current = requestAnimationFrame(animate);

      return () => {
        if (requestedRef.current !== null) {
          cancelAnimationFrame(requestedRef.current);
        }
      };
    }, [text, speed, onComplete]);

    return <p ref={elementRef} className="whitespace-pre-wrap min-h-[1.5em]" />;
  }
);

StreamingText.displayName = 'StreamingText';
