// Professional logging system

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  battleId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isClient = typeof window !== 'undefined';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  private sendToSentry(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.isClient) return;

    const Sentry = (window as any).Sentry;
    if (!Sentry) return;

    const sentryContext = {
      level: level === 'fatal' ? 'error' : level,
      extra: context,
    };

    if (error) {
      Sentry.captureException(error, sentryContext);
    } else {
      Sentry.captureMessage(message, sentryContext);
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
    this.sendToSentry('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    console.error(this.formatMessage('error', message, context), error);
    this.sendToSentry('error', message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    console.error(this.formatMessage('fatal', message, context), error);
    this.sendToSentry('fatal', message, context, error);
  }

  // Battle-specific logging
  battle = {
    start: (battleId: string, players: string[]) => {
      this.info('Battle started', {
        battleId,
        action: 'battle_start',
        metadata: { players },
      });
    },

    end: (battleId: string, winner: string, duration: number) => {
      this.info('Battle ended', {
        battleId,
        action: 'battle_end',
        metadata: { winner, duration },
      });
    },

    action: (battleId: string, userId: string, action: string, details: any) => {
      this.debug('Battle action', {
        battleId,
        userId,
        action: 'battle_action',
        metadata: { action, details },
      });
    },

    error: (battleId: string, error: Error, context?: any) => {
      this.error('Battle error', error, {
        battleId,
        action: 'battle_error',
        metadata: context,
      });
    },
  };

  // API logging
  api = {
    request: (method: string, endpoint: string, userId?: string) => {
      this.debug('API request', {
        userId,
        action: 'api_request',
        metadata: { method, endpoint },
      });
    },

    response: (method: string, endpoint: string, status: number, duration: number) => {
      this.info('API response', {
        action: 'api_response',
        metadata: { method, endpoint, status, duration },
      });
    },

    error: (method: string, endpoint: string, error: Error, userId?: string) => {
      this.error('API error', error, {
        userId,
        action: 'api_error',
        metadata: { method, endpoint },
      });
    },
  };

  // User action logging
  user = {
    login: (userId: string, username: string) => {
      this.info('User logged in', {
        userId,
        action: 'user_login',
        metadata: { username },
      });
    },

    logout: (userId: string) => {
      this.info('User logged out', {
        userId,
        action: 'user_logout',
      });
    },

    register: (userId: string, username: string) => {
      this.info('User registered', {
        userId,
        action: 'user_register',
        metadata: { username },
      });
    },

    action: (userId: string, action: string, metadata?: any) => {
      this.debug('User action', {
        userId,
        action: 'user_action',
        metadata: { action, ...metadata },
      });
    },
  };

  // Performance logging
  performance = {
    mark: (name: string) => {
      if (this.isClient && window.performance) {
        window.performance.mark(name);
      }
    },

    measure: (name: string, startMark: string, endMark: string) => {
      if (this.isClient && window.performance) {
        try {
          window.performance.measure(name, startMark, endMark);
          const measure = window.performance.getEntriesByName(name)[0];
          if (measure) {
            this.info('Performance measure', {
              action: 'performance_measure',
              metadata: {
                name,
                duration: measure.duration,
              },
            });
          }
        } catch (error) {
          // Marks might not exist
        }
      }
    },

    log: (metric: string, value: number, unit: string = 'ms') => {
      this.info('Performance metric', {
        action: 'performance_metric',
        metadata: { metric, value, unit },
      });
    },
  };
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = logger;
export default logger;
