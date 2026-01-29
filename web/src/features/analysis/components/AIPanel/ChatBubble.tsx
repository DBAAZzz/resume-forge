import { motion } from 'framer-motion';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import User from 'lucide-react/dist/esm/icons/user';
import { memo } from 'react';

import { cn } from '@/shared/utils/classnames';

export const ChatBubble = memo(
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
