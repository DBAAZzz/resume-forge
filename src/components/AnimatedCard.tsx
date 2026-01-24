import { motion, type HTMLMotionProps } from 'framer-motion';
import { scaleVariants } from '@/utils/animations';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  delay?: number;
  hoverScale?: number;
}

/**
 * 带有动画效果的卡片组件
 * 支持淡入、缩放和悬停效果
 */
export default function AnimatedCard({
  children,
  delay = 0,
  hoverScale = 1.02,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={scaleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: hoverScale }}
      transition={{ delay }}
      className={`p-6 border border-gray-200 rounded-lg bg-white shadow-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
