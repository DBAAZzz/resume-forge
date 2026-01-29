import { motion } from 'framer-motion';
import { memo } from 'react';

import { ChatBubble } from './ChatBubble';

export const TypingIndicator = memo(() => (
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
));

TypingIndicator.displayName = 'TypingIndicator';
