/**
 * Validation result structure returned by message validators.
 *
 * Contains the validation status and detailed error information
 * if validation fails.
 */
export interface IValidationResult {
  /**
   * Whether the validation passed.
   * True if the message is valid, false otherwise.
   */
  valid: boolean;

  /**
   * Array of validation error messages.
   * Only present when valid is false.
   *
   * @example
   * ['Field "email" is required', 'Field "age" must be a positive number']
   */
  errors?: string[];

  /**
   * Additional validation context or metadata.
   * Can include field-specific errors, schema information, or custom data.
   *
   * @example
   * {
   *   fieldErrors: { email: 'Invalid format', age: 'Out of range' },
   *   schemaVersion: '1.0.0'
   * }
   */
  details?: Record<string, any>;
}

/**
 * Interface for message validation functionality.
 *
 * Validators ensure that messages conform to expected schemas and constraints
 * before being published to topics. This helps prevent invalid data from
 * propagating through the system and provides early error detection.
 *
 * @remarks
 * Implementations can use various validation libraries like:
 * - class-validator for decorator-based validation
 * - Joi for schema validation
 * - Ajv for JSON Schema validation
 * - Zod for TypeScript-first schema validation
 *
 * @example
 * ```typescript
 * class SchemaValidator implements IMessageValidator {
 *   private schemas = new Map<string, Schema>();
 *
 *   validate(topic: string, data: any): IValidationResult {
 *     const schema = this.schemas.get(topic);
 *     if (!schema) {
 *       return { valid: true }; // No schema, allow all
 *     }
 *
 *     const result = schema.validate(data);
 *     if (result.error) {
 *       return {
 *         valid: false,
 *         errors: result.error.details.map(d => d.message)
 *       };
 *     }
 *
 *     return { valid: true };
 *   }
 * }
 * ```
 */
export interface IMessageValidator {
  /**
   * Validate a message before publishing.
   *
   * Checks if the message data conforms to the expected schema or constraints
   * for the given topic. This method should be synchronous and fast to avoid
   * impacting publish performance.
   *
   * @param topic - The topic the message will be published to
   * @param data - The message data to validate
   * @returns Validation result indicating success or failure with error details
   *
   * @example
   * ```typescript
   * // Using with PubSub
   * const result = validator.validate('user.created', {
   *   id: '123',
   *   email: 'user@example.com',
   *   age: 25
   * });
   *
   * if (!result.valid) {
   *   throw ValidationError.make(result.errors);
   * }
   * ```
   */
  validate(topic: string, data: any): IValidationResult;

  /**
   * Register a validation schema for a topic.
   *
   * Allows dynamic registration of validation rules for different topics.
   * This is optional and may not be supported by all validators.
   *
   * @param topic - The topic to register the schema for
   * @param schema - The validation schema (format depends on validator implementation)
   *
   * @example
   * ```typescript
   * // Register a Joi schema
   * validator.registerSchema('user.created', Joi.object({
   *   id: Joi.string().required(),
   *   email: Joi.string().email().required(),
   *   age: Joi.number().min(0).required()
   * }));
   * ```
   */
  registerSchema?(topic: string, schema: any): void;

  /**
   * Get the registered schema for a topic.
   *
   * Retrieves the validation schema if one is registered for the topic.
   * Returns undefined if no schema is registered.
   *
   * @param topic - The topic to get the schema for
   * @returns The registered schema or undefined
   */
  getSchema?(topic: string): any | undefined;
}

/**
 * Default no-op validator that accepts all messages.
 *
 * This implementation always returns valid=true and can be used when
 * message validation is disabled or not required.
 *
 * @example
 * ```typescript
 * const validator = NoOpValidator.make();
 * const result = validator.validate('any.topic', { any: 'data' });
 * console.log(result.valid); // true
 * ```
 */
export class NoOpValidator implements IMessageValidator {
  /**
   * Always returns valid result without performing any validation.
   *
   * @param _topic - Ignored
   * @param _data - Ignored
   * @returns Always returns { valid: true }
   */
  validate(_topic: string, _data: any): IValidationResult {
    return { valid: true };
  }
}
