import { ILoggerModuleOptions } from './logger-module-options.interface';

/**
 * Factory interface for creating logger options.
 *
 * Implement this interface to provide logger configuration dynamically
 * through a class-based approach. This is useful when configuration
 * requires complex logic or dependencies.
 *
 * @interface ILoggerModuleOptionsFactory
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class LoggerConfigService implements ILoggerModuleOptionsFactory {
 *   constructor(
 *     private readonly config: ConfigService,
 *     private readonly envService: EnvironmentService
 *   ) {}
 *
 *   createLoggerOptions(): ILoggerOptions {
 *     const isProduction = this.envService.isProduction();
 *
 *     return {
 *       driver: isProduction
 *         ? LoggerDriverType.FILE
 *         : LoggerDriverType.COMBINED,
 *       file: {
 *         level: 'info',
 *         destination: this.config.get('LOG_FILE_PATH')
 *       },
 *       combined: {
 *         console: { level: 'debug', colorize: true },
 *         file: { level: 'info', destination: './logs/dev.log' }
 *       }
 *     };
 *   }
 * }
 * ```
 */
export interface ILoggerModuleOptionsFactory {
  /**
   * Creates and returns logger configuration options.
   *
   * This method is called during module initialization to obtain
   * the logger configuration. It can return options synchronously
   * or asynchronously via a Promise.
   *
   * @returns Logger configuration options or a Promise resolving to options
   */
  createLoggerOptions(): Promise<ILoggerModuleOptions> | ILoggerModuleOptions;
}
