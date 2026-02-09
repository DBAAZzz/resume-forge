import { motion } from 'framer-motion';

import { scaleVariants } from '@/utils/animations';

import type { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = '' }: AnimatedCardProps) {
  return (
    <motion.div
      variants={scaleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedCard;
