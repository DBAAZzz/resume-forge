import { motion } from 'framer-motion';

import { fadeInVariants, pageVariants } from '@/shared/utils/animations';

import type { ReactNode } from 'react';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  transition?: 'slide' | 'fade';
}

export function AnimatedPage({
  children,
  className = '',
  transition = 'slide',
}: AnimatedPageProps) {
  const variants = transition === 'fade' ? fadeInVariants : pageVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedPage;
