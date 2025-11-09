import type { LogLevel } from '@enums/log-level.enum';
import { ILoggerModuleOptionsFactory } from './logger-module-options-factory.interface';

/**
 * Logger configuration interface.
 *
 * This interface defines the configuration for the logger module using
 * the transport-based architecture. It supports multiple transports,
 * default log levels, and module-level settings.
 *
 * @interface ILoggerConfig
 *
 * @example Simple console configuration
 * ```typescript
 * const config: ILoggerConfig = {
 *   level: LogLevel.DEBUG,
 *   transports: [
 *     { type: TransportType.CONSOLE, colorize: true }
 *   ]
 * };
 * ```
 *
 * @example Multiple transports
 * ```typescript
 * const config: ILoggerConfig = {
 *   level: LogLevel.INFO,
 *   transports: [
 *     { type: TransportType.CONSOLE, level: LogLevel.DEBUG },
 *     { type: TransportType.FILE, filename: './logs/app.log' }
 *   ],
 *   global: true
 * };
 * ```
 */
export interface ILoggerConfig {
  /**
   * Default minimum log level for all transports.
   * Individual transports can override this.
   */
  level?: LogLevel | string;

  /**
   * Array of transport configurations.
   * Each transport will receive and process log messages.
   */
  transports: ILoggerModuleOptionsFactory[];

  /**
   * Make the logger module global.
   * When true, the module will be available throughout the application
   * without needing to import it in other modules.
   *
   * @default false
   */
  global?: boolean;

  /**
   * Enable event emission for log messages and activities.
   * When true, log events will be emitted via @nestjs/event-emitter.
   *
   * @default true
   */
  enableEvents?: boolean;

  /**
   * Default context identifier for all loggers.
   * Can be overridden per-logger instance.
   */
  defaultContext?: string;
}
