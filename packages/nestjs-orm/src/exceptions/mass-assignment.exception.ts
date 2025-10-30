/**
 * Mass Assignment Exception
 *
 * Thrown when attempting to mass assign attributes that are not fillable
 * or are explicitly guarded on an entity. This provides protection against
 * mass assignment vulnerabilities, similar to Laravel's Eloquent.
 *
 * @example
 * ```typescript
 * // If User entity only allows 'name' and 'email' to be fillable
 * // This would throw MassAssignmentException for 'role' field
 * throw new MassAssignmentException('User', ['role']);
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class MassAssignmentException extends Error {
  /**
   * The entity/model name that the mass assignment was attempted on
   */
  public readonly model: string;

  /**
   * Array of attribute names that were not fillable
   */
  public readonly attributes: string[];

  /**
   * Create a new mass assignment exception
   *
   * @param model - The entity/model name
   * @param attributes - Array of non-fillable attributes that were attempted to be assigned
   */
  constructor(model: string, attributes: string[] = []) {
    const message =
      attributes.length > 0
        ? `Mass assignment is not allowed on [${model}] for attributes: ${attributes.join(', ')}`
        : `Mass assignment is not allowed on [${model}]`;

    super(message);

    this.name = 'MassAssignmentException';
    this.model = model;
    this.attributes = attributes;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MassAssignmentException);
    }
  }

  /**
   * Get the affected model/entity name
   *
   * @returns The model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Get the list of attributes that caused the exception
   *
   * @returns Array of attribute names
   */
  getAttributes(): string[] {
    return this.attributes;
  }

  /**
   * Check if a specific attribute caused this exception
   *
   * @param attribute - The attribute name to check
   * @returns True if the attribute is in the exception list
   */
  hasAttribute(attribute: string): boolean {
    return this.attributes.includes(attribute);
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Formatted error message
   */
  getApiMessage(): string {
    if (this.attributes.length === 1) {
      return `The attribute '${this.attributes[0]}' is not fillable on ${this.model}`;
    } else if (this.attributes.length > 1) {
      return `The attributes ${this.attributes.map((attr) => `'${attr}'`).join(', ')} are not fillable on ${this.model}`;
    }
    return `Mass assignment is not allowed on ${this.model}`;
  }
}
