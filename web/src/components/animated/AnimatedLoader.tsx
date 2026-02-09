import { motion } from 'framer-motion';

import { spinnerVariants } from '@/utils/animations';

interface AnimatedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedLoader({ size = 'md', className = '' }: AnimatedLoaderProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizes[size]} rounded-full border-2 border-gray-200 border-t-black`}
        variants={spinnerVariants}
        animate="animate"
      />
    </div>
  );
}

export default AnimatedLoader;
