/**
 * Sistema de Logging
 * Logs estruturados para monitoramento
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
  ip?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private output(entry: LogEntry): void {
    // Em desenvolvimento, usar console com cores
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };
      const reset = '\x1b[0m';

      console.log(
        `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.context ? entry.context : ''
      );
    } else {
      // Em produção, enviar para serviço de logging
      // Você pode integrar com DataDog, Sentry, etc.
      switch (entry.level) {
        case 'error':
          console.error(JSON.stringify(entry));
          break;
        case 'warn':
          console.warn(JSON.stringify(entry));
          break;
        default:
          console.log(JSON.stringify(entry));
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatEntry('debug', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatEntry('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatEntry('warn', message, context));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const errorContext = error
      ? {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }
      : context;

    this.output(this.formatEntry('error', message, errorContext));
  }

  // Logs específicos para requisições HTTP
  logRequest(params: {
    method: string;
    url: string;
    statusCode?: number;
    duration?: number;
    userAgent?: string;
    ip?: string;
  }): void {
    this.info('HTTP Request', {
      method: params.method,
      url: params.url,
      statusCode: params.statusCode,
      duration: params.duration,
      userAgent: params.userAgent,
      ip: params.ip,
    });
  }

  // Logs específicos para eventos de segurança
  logSecurityEvent(event: 'login' | 'logout' | 'failed_login' | 'rate_limit' | 'blocked_ip', details: Record<string, unknown>): void {
    this.warn(`Security Event: ${event}`, { event, ...details });
  }
}

// Singleton
export const logger = new Logger();

// Função de logging simplificada para uso em handlers
export function logApiRequest(params: {
  method: string;
  url: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
}): void {
  logger.logRequest(params);
}