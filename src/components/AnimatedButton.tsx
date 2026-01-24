import { motion, type HTMLMotionProps } from 'framer-motion';
import { buttonHover, buttonTap } from '../utils/animations';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * 带有动画效果的按钮组件
 * 支持多种样式变体和自定义属性
 */
export default function AnimatedButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: AnimatedButtonProps) {
  const baseStyles =
    'px-6 py-3 font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white focus:ring-black',
  };

  return (
    <motion.button
      whileHover={buttonHover}
      whileTap={buttonTap}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
