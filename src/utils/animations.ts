import type { Variants, TargetAndTransition } from 'framer-motion';

/**
 * 页面切换动画配置
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * 淡入动画
 */
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * 从下方滑入动画
 */
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * 从上方滑入动画
 */
export const slideDownVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * 从左侧滑入动画
 */
export const fadeInLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * 从左侧滑入动画 (别名，用于 Resume 页面那种情况)
 */
export const slideRightVariants = fadeInLeftVariants;

/**
 * 缩放动画
 */
export const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * 容器动画 - 用于子元素的交错动画
 */
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * 子元素动画 - 配合 containerVariants 使用
 */
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * 导航链接悬停动画
 */
export const navLinkHover: TargetAndTransition = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * 列表项悬停动画
 */
export const listItemHover: TargetAndTransition = {
  x: 8,
  backgroundColor: 'rgba(249, 250, 251, 1)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * 链接文字悬停动画
 */
export const linkTextHover: TargetAndTransition = {
  x: 4,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * 按钮悬停动画
 */
export const buttonHover: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * 按钮点击动画
 */
export const buttonTap: TargetAndTransition = {
  scale: 0.98,
};

/**
 * 加载动画配置
 */
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * 脉冲动画
 */
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    borderRadius: ['50%', '30%', '50%'],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};
