import { motion, type HTMLMotionProps } from 'framer-motion';

import { buttonHover, buttonTap } from '@/shared/utils/animations';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline';
  primary?: boolean;
}

export function AnimatedButton({
  children,
  variant = 'primary',
  primary,
  className = '',
  ...props
}: AnimatedButtonProps) {
  // If primary prop is true, force variant to 'primary'
  const finalVariant = primary ? 'primary' : variant;

  const baseStyles =
    'px-6 py-3 font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full font-bold';

  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-800 focus:ring-black',
    secondary: 'bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border-2 border-black text-black hover:bg-black hover:text-white focus:ring-black',
  };

  const { disabled } = props;

  return (
    <motion.button
      whileHover={disabled ? undefined : buttonHover}
      whileTap={disabled ? undefined : buttonTap}
      className={`${baseStyles} ${variantStyles[finalVariant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default AnimatedButton;
