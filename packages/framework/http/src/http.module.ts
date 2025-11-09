import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { DynamicModule, Module, Global } from '@nestjs/common';

/**
 * HTTP Module for NestJS
 *
 * Provides HTTP client and server utilities for NestJS applications.
 * This module re-exports the NestJS HttpModule and can be extended
 * with additional providers for custom HTTP functionality.
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [HttpModule.register()],
 * })
 * export class AppModule {}
 *
 * // Or with custom configuration
 * @Module({
 *   imports: [
 *     HttpModule.register({
 *       timeout: 5000,
 *       maxRedirects: 5,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class HttpModule {
  /**
   * Register the HTTP module with optional configuration.
   *
   * This method registers the NestJS HttpModule with optional Axios
   * configuration and makes it available globally in your application.
   *
   * @param config - Optional Axios configuration
   * @returns Dynamic module configuration
   *
   * @example
   * ```typescript
   * HttpModule.register({
   *   timeout: 5000,
   *   maxRedirects: 5,
   *   headers: {
   *     'User-Agent': 'My App',
   *   },
   * })
   * ```
   */
  static register(config?: any): DynamicModule {
    return {
      module: HttpModule,
      imports: [],
      exports: [NestHttpModule],
    };
  }

  /**
   * Register the HTTP module asynchronously.
   *
   * Allows injecting dependencies to configure the HTTP module.
   *
   * @param options - Async configuration options
   * @returns Dynamic module configuration
   *
   * @example
   * ```typescript
   * HttpModule.registerAsync({
   *   imports: [ConfigModule],
   *   useFactory: (configService: ConfigService) => ({
   *     timeout: configService.get('HTTP_TIMEOUT'),
   *     baseURL: configService.get('API_BASE_URL'),
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  static registerAsync(options: any): DynamicModule {
    return {
      module: HttpModule,
      imports: [],
      exports: [NestHttpModule],
    };
  }
}
