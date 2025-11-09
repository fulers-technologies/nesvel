import winston from 'winston';
import { Mixin } from 'ts-mixer';
import { Injectable, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ITransport } from '@/interfaces';
import type { LogLevel } from '@enums/log-level.enum';
import { LoggerContextService } from './logger-context.service';
import { LogsMessagesConcern } from '@concerns/logs-messages.concern';
import { LogsActivitiesConcern } from '@concerns/logs-activities.concern';
import { ManagesContextConcern } from '@/concerns/manages-context.concern';
import { ManagesLogLevelConcern } from '@concerns/manages-log-level.concern';

/**
 * Main logger service with mixed-in concerns.
 *
 * This service combines multiple concerns (mixins) to provide a comprehensive
 * logging API. It uses ts-mixer to compose functionality from:
 * - LogsMessagesConcern: Core logging methods (error, warn, info, debug, etc.)
 * - LogsActivitiesConcern: Activity tracking and business event logging
 * - ManagesContextConcern: Contextual data management
 * - ManagesLogLevelConcern: Runtime log level control
 *
 * The service manages multiple transports and coordinates log distribution
 * across all configured destinations. It also integrates with NestJS's
 * EventEmitter for event-driven logging workflows.
 *
 * @class LoggerService
 * @injectable
 *
 * @example Basic usage
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(private readonly logger: LoggerService) {}
 *
 *   async createUser(data: CreateUserDto) {
 *     this.logger.info('Creating new user', { email: data.email });
 *     // ...
 *     this.logger.activity('user.created', user.id, 'New user registered');
 *   }
 * }
 * ```
 *
 * @example With context
 * ```typescript
 * logger.setContext('requestId', 'req_123');
 * logger.setContext('userId', 'user_456');
 * logger.info('Processing request'); // Includes requestId and userId
 * ```
 *
 * @example Dynamic log level
 * ```typescript
 * logger.setLogLevel(LogLevel.DEBUG);
 * logger.debug('Detailed diagnostics'); // Now visible
 * ```
 */
@Injectable()
export class LoggerService extends Mixin(
  LogsMessagesConcern,
  LogsActivitiesConcern,
  ManagesContextConcern,
  ManagesLogLevelConcern
) {
  /**
   * Logger context identifier (e.g., service or class name).
   */
  protected contextIdentifier?: string;

  /**
   * Array of active transports for log delivery.
   */
  protected transports: ITransport[] = [];

  /**
   * Event emitter for activity events.
   */
  protected eventEmitter?: EventEmitter2;

  /**
   * Context service for managing contextual data.
   */
  protected contextService?: LoggerContextService;

  /**
   * Winston logger instance.
   */
  protected loggerInstance: winston.Logger;

  /**
   * Creates a new logger service instance.
   *
   * @param eventEmitter - Optional event emitter for dispatching log and activity events
   * @param contextService - Optional context service for managing request-scoped context
   * @param context - Optional context identifier (e.g., class or service name)
   * @param initialLevel - Optional initial log level (defaults to 'info')
   *
   * @example
   * ```typescript
   * const logger = LoggerService.make(
   *   eventEmitter,
   *   contextService,
   *   'UserService',
   *   LogLevel.DEBUG
   * );
   * ```
   */
  constructor(
    @Optional() eventEmitter?: EventEmitter2,
    @Optional() contextService?: LoggerContextService,
    contextIdentifier?: string,
    initialLevel?: LogLevel | string
  ) {
    super();
    this.eventEmitter = eventEmitter;
    this.contextService = contextService;
    this.contextIdentifier = contextIdentifier;

    if (initialLevel) {
      this.currentLevel = initialLevel;
    }

    this.loggerInstance = winston.createLogger({
      level: this.currentLevel || process.env.LOG_LEVEL || 'http',
      levels: winston.config.npm.levels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json(),
        winston.format.splat(),
        winston.format.errors({ stack: true })
      ),
    });
  }

  /**
   * Static factory method to create a new logger service instance.
   *
   * This method provides a fluent interface for creating logger instances
   * following the static factory pattern commonly used in Laravel and similar frameworks.
   *
   * @param eventEmitter - Optional event emitter for dispatching log and activity events
   * @param contextService - Optional context service for managing request-scoped context
   * @param contextIdentifier - Optional context identifier (e.g., class or service name)
   * @param initialLevel - Optional initial log level (defaults to 'info')
   * @returns A new LoggerService instance
   *
   * @example
   * ```typescript
   * const logger = LoggerService.make(
   *   eventEmitter,
   *   contextService,
   *   'UserService',
   *   LogLevel.DEBUG
   * );
   * ```
   */
  static make(
    eventEmitter?: EventEmitter2,
    contextService?: LoggerContextService,
    contextIdentifier?: string,
    initialLevel?: LogLevel | string
  ): LoggerService {
    return new LoggerService(eventEmitter, contextService, contextIdentifier, initialLevel);
  }

  /**
   * Adds a transport to the logger.
   *
   * This method registers a new transport for log message delivery.
   * Logs will be sent to all registered transports when methods like
   * info(), error(), etc. are called.
   *
   * @param transport - The transport instance to add
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * const consoleTransport = ConsoleTransport.make({ level: 'debug' });
   * logger.addTransport(consoleTransport);
   * ```
   */
  addTransport(transport: ITransport): this {
    this.transports.push(transport);
    return this;
  }

  /**
   * Adds multiple transports at once.
   *
   * This is a convenience method for registering multiple transports
   * in a single call.
   *
   * @param transports - Array of transport instances to add
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.addTransports([
   *   ConsoleTransport.make({ level: 'debug' }),
   *   FileTransport.make({ filename: 'app.log' })
   * ]);
   * ```
   */
  addTransports(transports: ITransport[]): this {
    this.transports.push(...transports);
    return this;
  }

  /**
   * Removes a specific transport.
   *
   * This method unregisters a transport from the logger.
   * Useful for dynamically adjusting log destinations at runtime.
   *
   * @param transport - The transport instance to remove
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.removeTransport(consoleTransport);
   * ```
   */
  removeTransport(transport: ITransport): this {
    const index = this.transports.indexOf(transport);
    if (index !== -1) {
      this.transports.splice(index, 1);
    }
    return this;
  }

  /**
   * Removes all transports.
   *
   * This method clears all registered transports. Useful for
   * resetting the logger or during cleanup.
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.clearTransports();
   * ```
   */
  clearTransports(): this {
    this.transports = [];
    return this;
  }

  /**
   * Gets all active transports.
   *
   * @returns Array of active transport instances
   *
   * @example
   * ```typescript
   * const transports = logger.getTransports();
   * console.log(`Active transports: ${transports.length}`);
   * ```
   */
  getTransports(): ITransport[] {
    return [...this.transports];
  }

  /**
   * Sets the context identifier.
   *
   * The context identifier is typically a class or service name that
   * helps identify the source of log messages.
   *
   * @param contextIdentifier - Context identifier string
   *
   * @returns The logger instance for method chaining
   *
   * @example
   * ```typescript
   * logger.setContextIdentifier('PaymentService');
   * logger.info('Processing payment'); // Logs with PaymentService context
   * ```
   */
  setContextIdentifier(contextIdentifier: string): this {
    this.contextIdentifier = contextIdentifier;
    return this;
  }

  /**
   * Gets the current context identifier.
   *
   * @returns The context identifier or undefined
   *
   * @example
   * ```typescript
   * const context = logger.getContextIdentifier();
   * ```
   */
  getContextIdentifier(): string | undefined {
    return this.contextIdentifier;
  }

  /**
   * Flushes all transports.
   *
   * This method ensures all buffered log messages are written to their
   * destinations. Useful before application shutdown or when immediate
   * delivery is required.
   *
   * @returns Promise that resolves when all transports are flushed
   *
   * @example
   * ```typescript
   * await logger.flush();
   * ```
   */
  async flush(): Promise<void> {
    await Promise.all(this.transports.map((transport) => transport.flush()));
  }

  /**
   * Closes all transports and releases resources.
   *
   * This method should be called during application shutdown to properly
   * close all transports, flush remaining messages, and release resources.
   *
   * @returns Promise that resolves when all transports are closed
   *
   * @example
   * ```typescript
   * await logger.close();
   * ```
   */
  async close(): Promise<void> {
    await Promise.all(this.transports.map((transport) => transport.close()));
  }

  /**
   * Creates a child logger with the same configuration but a different context.
   *
   * This method is useful for creating service-specific or class-specific
   * loggers that inherit transport and level configuration but have their
   * own context identifier.
   *
   * @param context - Context identifier for the child logger
   *
   * @returns New logger instance with the specified context
   *
   * @example
   * ```typescript
   * class UserService {
   *   private readonly logger: LoggerService;
   *
   *   constructor(parentLogger: LoggerService) {
   *     this.logger = parentLogger.child('UserService');
   *   }
   * }
   * ```
   */
  child(context: string): LoggerService {
    const childLogger = LoggerService.make(
      this.eventEmitter,
      this.contextService,
      context,
      this.currentLevel
    );

    childLogger.transports = [...this.transports];
    return childLogger;
  }

  /**
   * Core write method that writes to all transports.
   *
   * This is the internal method that handles the actual logging logic.
   * All public logging methods delegate to this method.
   * It writes the log message to all configured transports and fires events.
   *
   * @param level - The log level
   * @param message - The log message
   * @param context - Optional contextual data
   *
   * @example
   * ```typescript
   * this.write('info', 'Operation completed', { duration: 100 });
   * ```
   */
  write(level: LogLevel | string, message: string, context: any = []): void {
    // Merge with shared context
    const mergedContext = this.mergeWithSharedContext(context);

    const logData = {
      level,
      message,
      context: this.context,
      ...mergedContext,
      timestamp: new Date().toISOString(),
    };

    // Fire log event
    this.fireLogEvent(level, message, mergedContext);

    // Write to all transports
    this.loggerInstance.log(level, message, logData);
  }

  /**
   * Merges context with shared context.
   *
   * @param context - The context to merge
   * @returns Merged context
   *
   * @protected
   */
  protected mergeWithSharedContext(context: any): any {
    const shared = (this as any).sharedContextData || {};
    return { ...shared, ...context };
  }
}
