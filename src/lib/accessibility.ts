// Accessibility utilities and helpers

// Screen reader only text
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

// Focus visible styles
export const focusVisible = {
  outline: '2px solid #667eea',
  outlineOffset: '2px',
};

// Keyboard navigation helper
export const handleKeyboardNav = (
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onSpace?: () => void
) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      onEscape?.();
      break;
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      onSpace?.();
      break;
  }
};

// ARIA announcer for screen readers
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (typeof window === 'undefined') return;

  const announcer = document.getElementById('aria-live-announcer');
  if (announcer) {
    announcer.textContent = message;
    announcer.setAttribute('aria-live', priority);
  } else {
    // Create announcer if it doesn't exist
    const newAnnouncer = document.createElement('div');
    newAnnouncer.id = 'aria-live-announcer';
    newAnnouncer.setAttribute('role', 'status');
    newAnnouncer.setAttribute('aria-live', priority);
    newAnnouncer.setAttribute('aria-atomic', 'true');
    newAnnouncer.style.cssText = Object.entries(srOnly)
      .map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${value}`)
      .join('; ');
    newAnnouncer.textContent = message;
    document.body.appendChild(newAnnouncer);
  }
};

// Battle-specific announcements
export const battleAnnounce = {
  turnStart: (player: string) => {
    announce(`${player}'s turn`, 'polite');
  },

  attack: (attacker: string, move: string, target: string) => {
    announce(`${attacker} used ${move} on ${target}`, 'polite');
  },

  damage: (target: string, damage: number) => {
    announce(`${target} took ${damage} damage`, 'polite');
  },

  fainted: (pokemon: string) => {
    announce(`${pokemon} fainted`, 'assertive');
  },

  victory: () => {
    announce('Victory! You won the battle!', 'assertive');
  },

  defeat: () => {
    announce('Defeat. Better luck next time.', 'assertive');
  },

  statusApplied: (pokemon: string, status: string) => {
    announce(`${pokemon} was ${status}`, 'polite');
  },

  evolution: (from: string, to: string) => {
    announce(`${from} evolved into ${to}!`, 'assertive');
  },

  itemUsed: (item: string, target: string) => {
    announce(`Used ${item} on ${target}`, 'polite');
  },
};

// Focus management
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Return focus to previous element
  returnFocus: (previousElement: HTMLElement | null) => {
    previousElement?.focus();
  },

  // Get all focusable elements
  getFocusableElements: (container: HTMLElement) => {
    return container.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );
  },
};

// Color contrast checker (WCAG AA compliance)
export const checkContrast = (foreground: string, background: string): boolean => {
  // Simplified contrast check - in production, use a proper library
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= 4.5; // WCAG AA for normal text
};

// Skip link component helper
export const skipLinkProps = {
  href: '#main-content',
  className: 'skip-link',
  style: {
    position: 'absolute' as const,
    left: '-9999px',
    top: '0',
    zIndex: 9999,
    padding: '1rem',
    background: '#667eea',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '0 0 4px 0',
  },
  onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = '0';
  },
  onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.left = '-9999px';
  },
};

// Reduced motion check
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// High contrast mode check
export const prefersHighContrast = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};

// Dark mode check
export const prefersDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// ARIA label helpers
export const ariaLabel = {
  button: (action: string, context?: string) => {
    return context ? `${action} ${context}` : action;
  },

  loading: (action: string) => {
    return `Loading ${action}`;
  },

  error: (message: string) => {
    return `Error: ${message}`;
  },

  success: (message: string) => {
    return `Success: ${message}`;
  },
};

// Keyboard shortcuts helper
export const keyboardShortcuts = {
  battle: {
    endTurn: 'Enter',
    cancel: 'Escape',
    selectPokemon1: '1',
    selectPokemon2: '2',
    selectPokemon3: '3',
    useItem: 'I',
    evolve: 'E',
  },

  navigation: {
    home: 'H',
    profile: 'P',
    battles: 'B',
    settings: 'S',
  },
};

// Generate keyboard shortcut description
export const describeShortcut = (key: string, action: string) => {
  return `Press ${key} to ${action}`;
};
