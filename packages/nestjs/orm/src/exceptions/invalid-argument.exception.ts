import { BaseException } from '@nesvel/exceptions';

/**
 * Invalid Argument Exception
 *
 * Thrown when a method is called with invalid arguments or parameters.
 * This exception provides detailed information about what argument failed
 * validation and why, helping developers quickly identify and fix issues.
 *
 * @example
 * ```typescript
 * // Invalid perPage value
 * throw InvalidArgumentException.make('perPage', 0, 'Must be greater than 0');
 *
 * // Invalid array argument
 * throw InvalidArgumentException.make('ids', [], 'Cannot be empty array');
 *
 * // Type mismatch
 * throw InvalidArgumentException.forTypeMismatch('userId', 'number', 'string');
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class InvalidArgumentException extends BaseException {
  /**
   * The name of the invalid argument/parameter
   */
  public readonly argumentName: string;

  /**
   * The invalid value that was provided
   */
  public readonly providedValue: any;

  /**
   * Expected value type or format
   */
  public readonly expectedFormat?: string;

  /**
   * Additional context about why the argument is invalid
   */
  public readonly context?: string;

  /**
   * Create a new invalid argument exception
   *
   * @param argumentName - The name of the invalid argument
   * @param providedValue - The invalid value that was provided
   * @param expectedFormat - Expected value type or format (optional)
   * @param context - Additional context about the error (optional)
   */
  constructor(argumentName: string, providedValue: any, expectedFormat?: string, context?: string) {
    let message = `Invalid argument '${argumentName}'`;

    if (context) {
      message += `: ${context}`;
    } else if (expectedFormat) {
      message += `. Expected ${expectedFormat}, got ${typeof providedValue}`;
    }

    super(message);

    this.name = 'InvalidArgumentException';
    this.argumentName = argumentName;
    this.providedValue = providedValue;
    if (expectedFormat !== undefined) {
      this.expectedFormat = expectedFormat;
    }
    if (context !== undefined) {
      this.context = context;
    }
  }

  /**
   * Get the argument name
   *
   * @returns The name of the invalid argument
   */
  getArgumentName(): string {
    return this.argumentName;
  }

  /**
   * Get the provided value
   *
   * @returns The invalid value that was provided
   */
  getProvidedValue(): any {
    return this.providedValue;
  }

  /**
   * Get the expected format
   *
   * @returns The expected format or undefined
   */
  getExpectedFormat(): string | undefined {
    return this.expectedFormat;
  }

  /**
   * Get additional context
   *
   * @returns The context string or undefined
   */
  getContext(): string | undefined {
    return this.context;
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Formatted error message
   */
  getApiMessage(): string {
    if (this.context) {
      return `Invalid argument: ${this.context}`;
    }

    if (this.expectedFormat) {
      return `Invalid value for '${this.argumentName}'. Expected ${this.expectedFormat}`;
    }

    return `Invalid argument: '${this.argumentName}'`;
  }

  /**
   * Get detailed error information for logging
   *
   * @returns Object containing all error details
   */
  getLogDetails(): {
    argumentName: string;
    providedValue: any;
    providedType: string;
    expectedFormat?: string;
    context?: string;
  } {
    return {
      argumentName: this.argumentName,
      providedValue: this.providedValue,
      providedType: typeof this.providedValue,
      ...(this.expectedFormat && { expectedFormat: this.expectedFormat }),
      ...(this.context && { context: this.context }),
    };
  }

  /**
   * Create exception for type mismatch
   *
   * @param argumentName - The argument name
   * @param expectedType - The expected type
   * @param actualType - The actual type received
   * @returns New InvalidArgumentException instance
   */
  static forTypeMismatch(
    argumentName: string,
    expectedType: string,
    actualType: string,
  ): InvalidArgumentException {
    return InvalidArgumentException.make(
      argumentName,
      null,
      expectedType,
      `Expected ${expectedType}, but received ${actualType}`,
    );
  }

  /**
   * Create exception for null/undefined argument
   *
   * @param argumentName - The argument name
   * @returns New InvalidArgumentException instance
   */
  static forNullArgument(argumentName: string): InvalidArgumentException {
    return InvalidArgumentException.make(
      argumentName,
      null,
      'non-null value',
      `Argument '${argumentName}' cannot be null or undefined`,
    );
  }

  /**
   * Create exception for empty array
   *
   * @param argumentName - The argument name
   * @returns New InvalidArgumentException instance
   */
  static forEmptyArray(argumentName: string): InvalidArgumentException {
    return InvalidArgumentException.make(
      argumentName,
      [],
      'non-empty array',
      `Argument '${argumentName}' cannot be an empty array`,
    );
  }

  /**
   * Create exception for out of range value
   *
   * @param argumentName - The argument name
   * @param value - The out of range value
   * @param min - Minimum allowed value
   * @param max - Maximum allowed value (optional)
   * @returns New InvalidArgumentException instance
   */
  static forOutOfRange(
    argumentName: string,
    value: number,
    min: number,
    max?: number,
  ): InvalidArgumentException {
    const range = max ? `between ${min} and ${max}` : `at least ${min}`;
    return InvalidArgumentException.make(
      argumentName,
      value,
      range,
      `Value ${value} is out of valid range (${range})`,
    );
  }

  /**
   * Create exception for invalid page number
   *
   * @param page - The invalid page number
   * @returns New InvalidArgumentException instance
   */
  static forInvalidPage(page: number): InvalidArgumentException {
    return InvalidArgumentException.make(
      'page',
      page,
      'positive integer',
      'Page number must be a positive integer (1 or greater)',
    );
  }

  /**
   * Create exception for invalid perPage value
   *
   * @param perPage - The invalid perPage value
   * @returns New InvalidArgumentException instance
   */
  static forInvalidPerPage(perPage: number): InvalidArgumentException {
    return InvalidArgumentException.make(
      'perPage',
      perPage,
      'positive integer',
      'Items per page must be a positive integer (1 or greater)',
    );
  }
}
