import { motion } from 'framer-motion';

import { scaleVariants } from '@/shared/utils/animations';

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
      className={`bg-card rounded-xl shadow-sm border border-border p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedCard;
