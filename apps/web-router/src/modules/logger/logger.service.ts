/**
 * Logger Service Implementation
 */

import { injectable } from '@nesvel/reactjs-di';
import type { ILogger, LogLevel } from './logger.interface';

@injectable()
export class LoggerService implements ILogger {
  private level: LogLevel = 'info';
  private prefix: string = '[App]';

  constructor() {
    if (import.meta.env.DEV) {
      this.level = 'debug';
    }
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('DEBUG', message), metadata);
    }
  }

  info(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.info(this.format('INFO', message), metadata);
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', message), metadata);
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(this.format('ERROR', message), {
        ...metadata,
        error: error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${this.prefix} ${message}`;
  }
}
