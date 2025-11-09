import type { ModuleMetadata, Type } from '@nestjs/common';
import { ILoggerModuleOptionsFactory } from './logger-module-options-factory.interface';
import { ILoggerConfig } from './logger-config.interface';

/**
 * Configuration options for asynchronous Logger module registration.
 *
 * This interface supports three patterns for async configuration:
 * - useFactory: Factory function that returns options
 * - useClass: Class that implements ILoggerOptionsFactory
 * - useExisting: Existing provider that implements ILoggerOptionsFactory
 *
 * @interface ILoggerAsyncModuleAsyncOptions
 *
 * @example Using useFactory with ConfigService
 * ```typescript
 * LoggerModule.registerAsync({
 *   imports: [ConfigModule],
 *   inject: [ConfigService],
 *   useFactory: (config: ConfigService): ILoggerOptions => ({
 *     driver: config.get('NODE_ENV') === 'production'
 *       ? LoggerDriverType.FILE
 *       : LoggerDriverType.CONSOLE,
 *     file: {
 *       level: 'info',
 *       destination: config.get('LOG_FILE')
 *     },
 *     console: {
 *       level: 'debug',
 *       colorize: true
 *     }
 *   })
 * });
 * ```
 *
 * @example Using useClass
 * ```typescript
 * @Injectable()
 * class LoggerConfigService implements ILoggerOptionsFactory {
 *   createLoggerOptions(): ILoggerOptions {
 *     return {
 *       driver: LoggerDriverType.CONSOLE,
 *       console: { level: 'debug' }
 *     };
 *   }
 * }
 *
 * LoggerModule.registerAsync({
 *   useClass: LoggerConfigService
 * });
 * ```
 */
export interface ILoggerAsyncModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Whether the module should be registered as global
   *
   * When true, the SearchService and other providers will be available
   * globally across all modules without needing to import SearchModule.
   *
   * @default true
   *
   * @example
   * ```typescript
   * SearchModule.forRoot({
   *   connection: SearchConnectionType.ELASTICSEARCH,
   *   isGlobal: true, // Available in all modules
   * })
   * ```
   */
  isGlobal?: boolean;

  /**
   * Factory function that returns logger options.
   * Can be async and supports dependency injection via 'inject' property.
   */
  useFactory?: (...args: any[]) => Promise<ILoggerConfig> | ILoggerConfig;

  /**
   * Class that implements ILoggerOptionsFactory.
   * Will be instantiated and createLoggerOptions() will be called.
   */
  useClass?: Type<ILoggerModuleOptionsFactory>;

  /**
   * Existing provider that implements ILoggerOptionsFactory.
   * References an already registered provider.
   */
  useExisting?: Type<ILoggerModuleOptionsFactory>;

  /**
   * Providers to inject into the useFactory function.
   * Order must match the factory function parameters.
   */
  inject?: any[];
}
