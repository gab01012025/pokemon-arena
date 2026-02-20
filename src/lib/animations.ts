import { Variants } from 'framer-motion';

// Page transitions
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
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
};

// Slide in from bottom
export const slideInBottom: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
};

// Slide in from top
export const slideInTop: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
};

// Scale in
export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    }
  },
};

// Pokemon Card animations
export const pokemonCardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    rotateY: -15,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    }
  },
  hover: {
    scale: 1.05,
    rotateY: 5,
    transition: {
      duration: 0.2,
    }
  },
  tap: {
    scale: 0.95,
  },
};

// Attack animation
export const attackVariants: Variants = {
  initial: { x: 0 },
  attack: {
    x: [0, 30, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
      ease: 'easeInOut',
    }
  },
};

// Damage flash
export const damageFlash: Variants = {
  initial: { 
    filter: 'brightness(1)' 
  },
  flash: {
    filter: [
      'brightness(1)',
      'brightness(3) hue-rotate(340deg)',
      'brightness(0.5)',
      'brightness(2)',
      'brightness(1)',
    ],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.6, 1],
    }
  },
};

// Heal glow
export const healGlow: Variants = {
  initial: { 
    boxShadow: '0 0 0 transparent' 
  },
  glow: {
    boxShadow: [
      '0 0 0 transparent',
      '0 0 20px rgba(100, 255, 100, 0.6)',
      '0 0 0 transparent',
    ],
    transition: {
      duration: 0.8,
      times: [0, 0.5, 1],
    }
  },
};

// Evolution animation
export const evolutionVariants: Variants = {
  initial: { 
    scale: 1,
    filter: 'brightness(1)',
  },
  evolving: {
    scale: [1, 1.1, 1.15, 1.1, 1],
    filter: [
      'brightness(1)',
      'brightness(4) saturate(0)',
      'brightness(8) saturate(0)',
      'brightness(4) saturate(0.5)',
      'brightness(1) saturate(1)',
    ],
    transition: {
      duration: 2,
      times: [0, 0.25, 0.5, 0.75, 1],
    }
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
};

// List item animation
export const listItem: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.3,
    }
  },
};

// Modal animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    }
  },
};

// Button animations
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
};

// Shake animation (for errors)
export const shake: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
    }
  },
};

// Pulse animation
export const pulse: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
    }
  },
};

// Bounce animation
export const bounce: Variants = {
  initial: { y: 0 },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatType: 'loop',
    }
  },
};

// Rotate animation
export const rotate: Variants = {
  initial: { rotate: 0 },
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }
  },
};

// Notification slide in
export const notificationSlide: Variants = {
  initial: { 
    x: 400,
    opacity: 0,
  },
  animate: { 
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    }
  },
  exit: { 
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.2,
    }
  },
};

// Spring animation preset
export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

// Smooth animation preset
export const smoothConfig = {
  duration: 0.3,
  ease: 'easeOut' as const,
};
