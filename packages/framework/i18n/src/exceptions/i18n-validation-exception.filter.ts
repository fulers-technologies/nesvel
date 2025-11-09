import { I18nValidationExceptionFilter as BaseI18nValidationExceptionFilter } from 'nestjs-i18n';
import type { ArgumentsHost } from '@nestjs/common';

/**
 * Custom I18n Validation Exception Filter
 *
 * Extends the base I18nValidationExceptionFilter from nestjs-i18n to add
 * a static factory method for easier instantiation.
 *
 * @description
 * This exception filter handles I18nValidationException instances and formats
 * the error response with internationalized messages. It provides a static
 * `make` method that follows the factory pattern.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Using the make factory method in providers
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useValue: I18nValidationExceptionFilter.make(),
 *     },
 *   ],
 * })
 * export class AppModule {}
 *
 * // Or use directly
 * app.useGlobalFilters(I18nValidationExceptionFilter.make());
 * ```
 */
export class I18nValidationExceptionFilter extends BaseI18nValidationExceptionFilter {
  /**
   * Creates an instance of I18nValidationExceptionFilter
   *
   * @param options - Optional configuration for the filter
   */
  constructor(options?: any) {
    super(options);
  }

  /**
   * Factory method to create an I18nValidationExceptionFilter instance
   *
   * Provides a static factory method for creating filter instances,
   * following the factory pattern used throughout the Nesvel framework.
   *
   * @param options - Optional configuration for the filter
   * @returns A new instance of I18nValidationExceptionFilter
   *
   * @example
   * ```typescript
   * // Create with default options
   * const filter = I18nValidationExceptionFilter.make();
   *
   * // Create with custom options
   * const filter = I18nValidationExceptionFilter.make({
   *   detailedErrors: true,
   *   errorHttpStatusCode: 422
   * });
   * ```
   */
  static make(options?: any): I18nValidationExceptionFilter {
    return I18nValidationExceptionFilter.make(options);
  }
}
