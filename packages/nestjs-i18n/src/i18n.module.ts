import { DynamicModule, Module } from '@nestjs/common';
import { I18nModule as NestI18nModule, I18nOptions } from 'nestjs-i18n';

/**
 * I18n Module
 *
 * Production-ready internationalization module for NestJS applications.
 * Provides comprehensive multi-language support with type safety.
 *
 * Features:
 * - Multiple language support (EN, AR, FR, ES)
 * - Type-safe translation keys
 * - Multiple language resolvers (Query, Cookie, Header)
 * - Fallback language support
 * - Live reloading in development
 * - RTL language support
 * - Variable formatting
 * - Pluralization support
 *
 * @module I18nModule
 *
 * @example
 * ```typescript
 * import { I18nModule } from './modules/i18n/i18n.module';
 * import { i18nConfig } from './config/i18n.config';
 *
 * @Module({
 *   imports: [I18nModule.forRoot(i18nConfig)],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Using translations in services
 * ```typescript
 * import { I18nService } from 'nestjs-i18n';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(private readonly i18n: I18nService) {}
 *
 *   async getMessage(): Promise<string> {
 *     return this.i18n.t('common.welcome');
 *   }
 * }
 * ```
 *
 * @example Using translations in controllers
 * ```typescript
 * import { I18n, I18nContext } from 'nestjs-i18n';
 *
 * @Controller()
 * export class MyController {
 *   @Get()
 *   async get(@I18n() i18n: I18nContext) {
 *     return i18n.t('common.hello', { args: { name: 'John' } });
 *   }
 * }
 * ```
 *
 * @example Getting current language
 * ```typescript
 * import { I18nContext } from 'nestjs-i18n';
 *
 * const i18n = I18nContext.current();
 * const lang = i18n.lang; // 'en', 'ar', 'fr', or 'es'
 * ```
 */
@Module({})
export class I18nModule {
  /**
   * Create I18n module with configuration
   *
   * @param options - I18n configuration options
   * @returns Dynamic module
   */
  static forRoot(options: I18nOptions): DynamicModule {
    return {
      module: I18nModule,
      imports: [NestI18nModule.forRoot(options)],
      exports: [NestI18nModule],
    };
  }
}
