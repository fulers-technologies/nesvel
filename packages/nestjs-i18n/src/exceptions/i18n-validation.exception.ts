import { I18nValidationException as BaseI18nValidationException } from 'nestjs-i18n';
import type { ValidationError } from '@nestjs/common';

/**
 * Custom I18n Validation Exception
 *
 * Extends the base I18nValidationException from nestjs-i18n to add
 * a static factory method for easier instantiation.
 *
 * @description
 * This exception is used for validation errors with internationalization support.
 * It provides a static `make` method that follows the factory pattern.
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Using the make factory method
 * throw I18nValidationException.make(validationErrors);
 *
 * // Traditional instantiation still works
 * throw new I18nValidationException(validationErrors);
 * ```
 */
export class I18nValidationException extends BaseI18nValidationException {
  /**
   * Creates an instance of I18nValidationException
   *
   * @param errors - Array of validation errors from class-validator
   */
  constructor(errors: ValidationError[]) {
    super(errors);
  }

  /**
   * Factory method to create an I18nValidationException instance
   *
   * Provides a static factory method for creating exception instances,
   * following the factory pattern used throughout the Nesvel framework.
   *
   * @param errors - Array of validation errors from class-validator
   * @returns A new instance of I18nValidationException
   *
   * @example
   * ```typescript
   * const errors = await validate(dto);
   * if (errors.length > 0) {
   *   throw I18nValidationException.make(errors);
   * }
   * ```
   */
  static make(errors: ValidationError[]): I18nValidationException {
    return new I18nValidationException(errors);
  }
}
