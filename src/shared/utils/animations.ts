import type { Variants, TargetAndTransition } from 'framer-motion';

/**
 * Page transition animation
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
 * Fade in animation
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
 * Slide up animation
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
 * Slide down animation
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
 * Fade in from left animation
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
 * Slide right animation (alias)
 */
export const slideRightVariants = fadeInLeftVariants;

/**
 * Scale animation
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
 * Container animation - for staggered children
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
 * Item animation - use with containerVariants
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
 * Nav link hover animation
 */
export const navLinkHover: TargetAndTransition = {
  scale: 1.05,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * List item hover animation
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
 * Link text hover animation
 */
export const linkTextHover: TargetAndTransition = {
  x: 4,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * Button hover animation
 */
export const buttonHover: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

/**
 * Button tap animation
 */
export const buttonTap: TargetAndTransition = {
  scale: 0.98,
};

/**
 * Spinner animation
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
 * Pulse animation
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
