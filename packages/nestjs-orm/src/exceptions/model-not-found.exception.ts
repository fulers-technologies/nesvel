import { BaseException } from '@nesvel/shared';

/**
 * Model Not Found Exception
 *
 * Thrown when a database query for a specific model or models returns no results.
 * This exception is commonly used in repository methods like findOrFail, firstOrFail,
 * and other methods that expect to find specific entities. Inspired by Laravel's
 * ModelNotFoundException with enhanced functionality for better error handling.
 *
 * @example
 * ```typescript
 * // Single model not found
 * throw ModelNotFoundException.make('User', [123]);
 *
 * // Multiple models not found
 * throw ModelNotFoundException.make('Post', [1, 2, 3]);
 *
 * // Model not found with custom query conditions
 * throw ModelNotFoundException.make('User', [], { email: 'test@example.com' });
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class ModelNotFoundException extends BaseException {
  /**
   * The name of the model/entity that was not found
   */
  public readonly model: string;

  /**
   * The IDs that were searched for but not found
   */
  public readonly ids: (string | number)[];

  /**
   * The query conditions that were used in the search
   */
  public readonly conditions?: Record<string, any>;

  /**
   * Additional context about the failed search
   */
  public readonly context?: string;

  /**
   * Create a new model not found exception
   *
   * @param model - The name of the model/entity that was not found
   * @param ids - The IDs that were searched for (optional)
   * @param conditions - The query conditions used in the search (optional)
   * @param context - Additional context about the failed search (optional)
   */
  constructor(
    model: string,
    ids: (string | number)[] = [],
    conditions?: Record<string, any>,
    context?: string,
  ) {
    let message: string;

    if (context) {
      message = context;
    } else if (ids.length > 0) {
      message =
        ids.length === 1
          ? `No query results for model [${model}] with ID ${ids[0]}`
          : `No query results for model [${model}] with IDs: ${ids.join(', ')}`;
    } else if (conditions && Object.keys(conditions).length > 0) {
      const conditionStr = Object.entries(conditions)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
      message = `No query results for model [${model}] with conditions: ${conditionStr}`;
    } else {
      message = `No query results for model [${model}]`;
    }

    super(message);

    this.name = 'ModelNotFoundException';
    this.model = model;
    this.ids = ids;
    if (conditions !== undefined) {
      this.conditions = conditions;
    }
    if (context !== undefined) {
      this.context = context;
    }
  }

  /**
   * Get the name of the model that was not found
   *
   * @returns The model/entity name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Get the IDs that were searched for
   *
   * @returns Array of IDs or empty array if no specific IDs were used
   */
  getIds(): (string | number)[] {
    return [...this.ids]; // Return a copy to prevent mutation
  }

  /**
   * Get the query conditions that were used
   *
   * @returns Object with query conditions or undefined
   */
  getConditions(): Record<string, any> | undefined {
    return this.conditions ? { ...this.conditions } : undefined;
  }

  /**
   * Get additional context about the failed search
   *
   * @returns Context string or undefined
   */
  getContext(): string | undefined {
    return this.context;
  }

  /**
   * Check if the search was for specific IDs
   *
   * @returns True if specific IDs were provided in the search
   */
  hasSpecificIds(): boolean {
    return this.ids.length > 0;
  }

  /**
   * Check if the search used query conditions
   *
   * @returns True if query conditions were used
   */
  hasConditions(): boolean {
    return !!(this.conditions && Object.keys(this.conditions).length > 0);
  }

  /**
   * Check if this exception is for a specific model type
   *
   * @param modelName - The model name to check
   * @returns True if this exception is for the specified model
   */
  isForModel(modelName: string): boolean {
    return this.model === modelName;
  }

  /**
   * Check if a specific ID was part of the failed search
   *
   * @param id - The ID to check for
   * @returns True if the ID was included in the search
   */
  includesId(id: string | number): boolean {
    return this.ids.includes(id);
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Formatted error message suitable for client consumption
   */
  getApiMessage(): string {
    if (this.context) {
      return this.context;
    }

    const modelName = this.model.toLowerCase();

    if (this.ids.length === 1) {
      return `${this.model} with ID ${this.ids[0]} not found`;
    } else if (this.ids.length > 1) {
      return `${this.model}s with the specified IDs were not found`;
    } else {
      return `No ${modelName} found matching the specified criteria`;
    }
  }

  /**
   * Get detailed error information for logging
   *
   * @returns Object containing all error details for comprehensive logging
   */
  getLogDetails(): {
    model: string;
    ids: (string | number)[];
    conditions?: Record<string, any>;
    context?: string;
    searchType: 'ids' | 'conditions' | 'generic';
  } {
    let searchType: 'ids' | 'conditions' | 'generic';

    if (this.hasSpecificIds()) {
      searchType = 'ids';
    } else if (this.hasConditions()) {
      searchType = 'conditions';
    } else {
      searchType = 'generic';
    }

    const result: {
      model: string;
      ids: (string | number)[];
      conditions?: Record<string, any>;
      context?: string;
      searchType: 'ids' | 'conditions' | 'generic';
    } = {
      model: this.model,
      ids: this.ids,
      searchType,
    };

    if (this.conditions !== undefined) {
      result.conditions = this.conditions;
    }
    if (this.context !== undefined) {
      result.context = this.context;
    }

    return result;
  }

  /**
   * Create exception for model not found by ID
   *
   * @param model - The model name
   * @param id - The ID that was not found
   * @returns New ModelNotFoundException instance
   */
  static forId(model: string, id: string | number): ModelNotFoundException {
    return new ModelNotFoundException(model, [id]);
  }

  /**
   * Create exception for multiple models not found by IDs
   *
   * @param model - The model name
   * @param ids - The IDs that were not found
   * @returns New ModelNotFoundException instance
   */
  static forIds(model: string, ids: (string | number)[]): ModelNotFoundException {
    return new ModelNotFoundException(model, ids);
  }

  /**
   * Create exception for model not found by conditions
   *
   * @param model - The model name
   * @param conditions - The search conditions
   * @returns New ModelNotFoundException instance
   */
  static forConditions(model: string, conditions: Record<string, any>): ModelNotFoundException {
    return new ModelNotFoundException(model, [], conditions);
  }

  /**
   * Create exception with custom context
   *
   * @param model - The model name
   * @param context - Custom error context/message
   * @param ids - Optional IDs that were searched for
   * @param conditions - Optional search conditions
   * @returns New ModelNotFoundException instance
   */
  static withContext(
    model: string,
    context: string,
    ids?: (string | number)[],
    conditions?: Record<string, any>,
  ): ModelNotFoundException {
    return new ModelNotFoundException(model, ids || [], conditions, context);
  }

  /**
   * Create exception for empty result set
   *
   * @param model - The model name
   * @returns New ModelNotFoundException instance
   */
  static forEmptyResult(model: string): ModelNotFoundException {
    return new ModelNotFoundException(
      model,
      [],
      undefined,
      `No ${model.toLowerCase()} records found in the database`,
    );
  }
}
