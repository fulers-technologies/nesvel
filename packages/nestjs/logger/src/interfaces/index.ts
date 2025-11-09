export * from './logger-module-async-options.interface';
export * from './logger-config.interface';
export * from './logger-module-options-factory.interface';
export * from './logger-module-options.interface';
export * from './transport.interface';

// Transport options
export * from './cloudwatch-transport-options.interface';
export * from './console-transport-options.interface';
export * from './custom-transport-options.interface';
export * from './daily-transport-options.interface';
export * from './file-transport-options.interface';
export * from './http-transport-options.interface';
export * from './slack-transport-options.interface';

import type { ILoggerModuleOptions } from './logger-module-options.interface';

/**
 * Logger Configuration
 *
 * Alias for LoggerModuleOptions to provide a more intuitive name
 * when used in application configuration contexts.
 *
 * @example
 * ```typescript
 * const config: LoggerConfig = {
 *   transporter: TransportType.Console,
 *   console: {},
 * };
 * ```
 */
export interface LoggerConfig extends ILoggerModuleOptions {}
