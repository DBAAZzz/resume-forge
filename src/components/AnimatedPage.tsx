import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { pageVariants } from '../utils/animations';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * 带有页面切换动画的容器组件
 * 用于包裹页面内容，提供统一的进入/退出动画
 */
export default function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
