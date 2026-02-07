import { semanticToneConfig } from './semantic';

import type { SemanticTone } from './semantic';
import type { ReactNode } from 'react';

interface CardBaseProps {
  children: ReactNode;
  className?: string;
  tone?: SemanticTone;
}

export const CardBase = ({ children, className = '', tone = 'optimize' }: CardBaseProps) => {
  const toneConfig = semanticToneConfig[tone];

  return (
    <article
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className={`h-1 w-full ${toneConfig.dot}`} />
      {children}
    </article>
  );
};
