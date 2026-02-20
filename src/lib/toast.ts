import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    duration: 3000,
    icon: '✅',
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: '600',
    },
  },
  error: {
    duration: 4000,
    icon: '❌',
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: '600',
    },
  },
  loading: {
    icon: '⏳',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: '600',
    },
  },
  warning: {
    duration: 3500,
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      fontWeight: '600',
    },
  },
  info: {
    duration: 3000,
    icon: 'ℹ️',
    style: {
      background: '#6366F1',
      color: '#fff',
      fontWeight: '600',
    },
  },
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, toastConfig.success);
  },

  error: (message: string) => {
    toast.error(message, toastConfig.error);
  },

  loading: (message: string) => {
    return toast.loading(message, toastConfig.loading);
  },

  warning: (message: string) => {
    toast(message, toastConfig.warning);
  },

  info: (message: string) => {
    toast(message, toastConfig.info);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages, {
      loading: toastConfig.loading,
      success: toastConfig.success,
      error: toastConfig.error,
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  custom: (message: string, options?: any) => {
    toast(message, options);
  },
};

// Battle-specific toasts
export const battleToast = {
  victory: () => {
    showToast.success('🎉 Victory! You won the battle!');
  },

  defeat: () => {
    showToast.error('💔 Defeat! Better luck next time!');
  },

  pokemonFainted: (name: string) => {
    showToast.warning(`${name} fainted!`);
  },

  superEffective: () => {
    showToast.info("It's super effective!");
  },

  notVeryEffective: () => {
    showToast.info("It's not very effective...");
  },

  criticalHit: () => {
    showToast.success('💥 Critical hit!');
  },

  evolution: (from: string, to: string) => {
    showToast.success(`✨ ${from} evolved into ${to}!`);
  },

  itemUsed: (item: string, target: string) => {
    showToast.info(`Used ${item} on ${target}!`);
  },

  statusApplied: (pokemon: string, status: string) => {
    showToast.warning(`${pokemon} was ${status}!`);
  },

  energyGained: (amount: number) => {
    showToast.info(`⚡ Gained ${amount} energy!`);
  },
};

// API toasts
export const apiToast = {
  loading: (action: string) => {
    return showToast.loading(`${action}...`);
  },

  success: (action: string) => {
    showToast.success(`${action} successful!`);
  },

  error: (action: string, error?: string) => {
    showToast.error(error || `${action} failed. Please try again.`);
  },
};

// User action toasts
export const userToast = {
  saved: () => {
    showToast.success('Changes saved successfully!');
  },

  deleted: () => {
    showToast.success('Deleted successfully!');
  },

  copied: () => {
    showToast.success('Copied to clipboard!');
  },

  loginSuccess: () => {
    showToast.success('Welcome back!');
  },

  logoutSuccess: () => {
    showToast.success('Logged out successfully!');
  },

  registerSuccess: () => {
    showToast.success('Account created! Welcome!');
  },

  invalidInput: (field: string) => {
    showToast.error(`Invalid ${field}. Please check and try again.`);
  },

  networkError: () => {
    showToast.error('Network error. Please check your connection.');
  },

  unauthorized: () => {
    showToast.error('Unauthorized. Please log in again.');
  },
};
