import type { ValidationError } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { ValidationPipeOptions } from '@nestjs/common';
import { I18nContext, I18nValidationException, I18nValidationExceptionFilter } from 'nestjs-i18n';

/**
 * I18n Validation Pipe
 *
 * Custom validation pipe that provides internationalized error messages
 * for DTO validation failures.
 *
 * @example
 * ```typescript
 * // In main.ts
 * app.useGlobalPipes(createI18nValidationPipe());
 *
 * // In controller
 * @Post()
 * create(@Body() dto: CreateDto) {
 *   // Validation errors will be translated
 * }
 * ```
 */

/**
 * Create I18n Validation Pipe
 *
 * Creates a validation pipe with internationalized error messages.
 *
 * @param options - Validation pipe options
 * @returns Configured validation pipe
 *
 * @example
 * ```typescript
 * const pipe = createI18nValidationPipe({
 *   whitelist: true,
 *   forbidNonWhitelisted: true,
 *   transform: true,
 * });
 * ```
 */
export function createI18nValidationPipe(
  options?: ValidationPipeOptions,
): ValidationPipe {
  return new ValidationPipe({
    ...options,
    exceptionFactory: (errors: ValidationError[]) => {
      return new I18nValidationException(errors);
    },
  });
}

/**
 * Get I18n Validation Exception Filter
 *
 * Returns the exception filter for handling validation exceptions
 * with internationalized messages.
 *
 * @returns I18n validation exception filter
 *
 * @example
 * ```typescript
 * // In main.ts
 * app.useGlobalFilters(getI18nValidationExceptionFilter());
 * ```
 */
export function getI18nValidationExceptionFilter(): I18nValidationExceptionFilter {
  return new I18nValidationExceptionFilter();
}
