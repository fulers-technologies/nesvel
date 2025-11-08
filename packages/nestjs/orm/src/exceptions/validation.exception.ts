import { BaseException } from '@nesvel/exceptions';

/**
 * Validation Exception
 *
 * Thrown when entity validation fails. This exception can hold multiple
 * validation errors and provides detailed information about what failed
 * validation. Useful for API error responses and debugging.
 *
 * @example
 * ```typescript
 * // Single validation error
 * throw ValidationException.make('email', 'Invalid email format');
 *
 * // Multiple validation errors
 * const errors = new Map([
 *   ['email', 'Invalid email format'],
 *   ['password', 'Password must be at least 8 characters']
 * ]);
 * throw ValidationException.make(errors);
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class ValidationException extends BaseException {
  /**
   * Map of field names to their validation error messages
   */
  public readonly errors: Map<string, string | string[]>;

  /**
   * The entity/model being validated
   */
  public readonly entity?: string;

  /**
   * Create a new validation exception
   *
   * @param fieldOrErrors - Either a field name (string) or Map of validation errors
   * @param message - Error message (required if first param is string)
   * @param entity - Optional entity/model name being validated
   */
  constructor(
    fieldOrErrors: string | Map<string, string | string[]>,
    message?: string,
    entity?: string,
  );
  constructor(errors: Map<string, string | string[]>, entity?: string);
  constructor(
    fieldOrErrors: string | Map<string, string | string[]>,
    messageOrEntity?: string,
    entity?: string,
  ) {
    let errors: Map<string, string | string[]>;
    let entityName: string | undefined;
    let errorMessage: string;

    // Handle overloaded constructor
    if (typeof fieldOrErrors === 'string') {
      // Single field validation error
      if (!messageOrEntity) {
        throw new Error('Message is required when providing a single field name');
      }
      errors = new Map([[fieldOrErrors, messageOrEntity]]);
      entityName = entity;
      errorMessage = `Validation failed for field: ${fieldOrErrors}`;
    } else {
      // Multiple validation errors
      errors = fieldOrErrors;
      entityName = messageOrEntity;

      const fieldCount = errors.size;
      if (fieldCount === 1) {
        const [field] = errors.keys();
        errorMessage = `Validation failed for field: ${field}`;
      } else {
        errorMessage = `Validation failed for ${fieldCount} fields`;
      }
    }

    // If entity is provided, include it in the message
    if (entityName) {
      errorMessage = `${errorMessage} on ${entityName}`;
    }

    super(errorMessage);

    this.name = 'ValidationException';
    this.errors = errors;

    // Use type assertion to assign readonly property during construction
    (this as any).entity = entityName;
  }

  /**
   * Get all validation errors
   *
   * @returns Map of field names to error messages
   */
  getErrors(): Map<string, string | string[]> {
    return new Map(this.errors);
  }

  /**
   * Get validation errors as a plain object
   *
   * @returns Object with field names as keys and error messages as values
   */
  getErrorsAsObject(): Record<string, string | string[]> {
    const obj: Record<string, string | string[]> = {};
    for (const [field, message] of this.errors) {
      obj[field] = message;
    }
    return obj;
  }

  /**
   * Get error message(s) for a specific field
   *
   * @param field - The field name
   * @returns Error message(s) or undefined if field has no errors
   */
  getFieldError(field: string): string | string[] | undefined {
    return this.errors.get(field);
  }

  /**
   * Check if a specific field has validation errors
   *
   * @param field - The field name to check
   * @returns True if the field has validation errors
   */
  hasFieldError(field: string): boolean {
    return this.errors.has(field);
  }

  /**
   * Get all fields that have validation errors
   *
   * @returns Array of field names with errors
   */
  getErrorFields(): string[] {
    return Array.from(this.errors.keys());
  }

  /**
   * Get the total number of validation errors
   *
   * @returns Number of fields with validation errors
   */
  getErrorCount(): number {
    return this.errors.size;
  }

  /**
   * Add a validation error for a field
   *
   * @param field - The field name
   * @param message - The error message
   */
  addFieldError(field: string, message: string): void {
    const existingError = this.errors.get(field);

    if (existingError) {
      // Convert to array if not already
      const errorArray = Array.isArray(existingError) ? existingError : [existingError];
      errorArray.push(message);
      this.errors.set(field, errorArray);
    } else {
      this.errors.set(field, message);
    }
  }

  /**
   * Get the entity/model name being validated
   *
   * @returns Entity name or undefined
   */
  getEntity(): string | undefined {
    return this.entity;
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Formatted error message
   */
  getApiMessage(): string {
    const fieldCount = this.getErrorCount();

    if (fieldCount === 1) {
      const firstEntry = this.errors.entries().next().value;
      if (firstEntry) {
        const [field, message] = firstEntry;
        const errorMessage = Array.isArray(message) ? message[0] : message;
        return `Validation failed: ${errorMessage}`;
      }
    }

    return `Validation failed for ${fieldCount} fields`;
  }

  /**
   * Get detailed validation errors for API responses
   *
   * @returns Object with error details suitable for API responses
   */
  getApiErrorDetails(): {
    message: string;
    errors: Record<string, string | string[]>;
    entity?: string;
  } {
    return {
      message: this.getApiMessage(),
      errors: this.getErrorsAsObject(),
      ...(this.entity && { entity: this.entity }),
    };
  }

  /**
   * Create validation exception from array of error messages
   *
   * @param field - The field name
   * @param messages - Array of error messages
   * @param entity - Optional entity name
   * @returns New ValidationException instance
   */
  static forField(
    field: string,
    messages: string | string[],
    entity?: string,
  ): ValidationException {
    const errors = new Map([[field, messages]]);
    return ValidationException.make(errors, entity);
  }

  /**
   * Create validation exception for required field
   *
   * @param field - The required field name
   * @param entity - Optional entity name
   * @returns New ValidationException instance
   */
  static forRequiredField(field: string, entity?: string): ValidationException {
    return ValidationException.forField(field, `The ${field} field is required`, entity);
  }

  /**
   * Create validation exception for invalid field value
   *
   * @param field - The field name
   * @param value - The invalid value
   * @param entity - Optional entity name
   * @returns New ValidationException instance
   */
  static forInvalidValue(field: string, value: any, entity?: string): ValidationException {
    const message = `The ${field} field has an invalid value: ${String(value)}`;
    return ValidationException.forField(field, message, entity);
  }
}
