import { BaseException } from '@nesvel/exceptions';

/**
 * Relation Not Found Exception
 *
 * Thrown when attempting to access a relationship that doesn't exist on an entity
 * or when a relationship query returns no results. This is similar to Laravel's
 * relationship handling and provides clear error messages for missing relations.
 *
 * @example
 * ```typescript
 * // When trying to access 'posts' relation on User that doesn't exist
 * throw RelationNotFoundException.make('User', 'posts');
 *
 * // When a relationship query returns no results
 * throw RelationNotFoundException.make('User', 'profile', 'No profile found for user');
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export class RelationNotFoundException extends BaseException {
  /**
   * The parent entity/model name
   */
  public readonly model!: string;

  /**
   * The name of the relationship that was not found
   */
  public readonly relation!: string;

  /**
   * Optional additional context about the missing relation
   */
  public readonly context?: string;

  /**
   * Create a new relation not found exception
   *
   * @param model - The parent entity/model name
   * @param relation - The name of the missing relationship
   * @param context - Optional additional context or custom message
   */
  constructor(model: string, relation: string, context?: string) {
    let message: string;

    if (context) {
      message = context;
    } else {
      message = `Relation [${relation}] does not exist on model [${model}]`;
    }

    super(message);

    this.name = 'RelationNotFoundException';
    (this as any).model = model;
    (this as any).relation = relation;
    if (context !== undefined) {
      (this as any).context = context;
    }
  }

  /**
   * Get the parent model/entity name
   *
   * @returns The model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Get the name of the missing relationship
   *
   * @returns The relation name
   */
  getRelation(): string {
    return this.relation;
  }

  /**
   * Get additional context if provided
   *
   * @returns The context string or undefined
   */
  getContext(): string | undefined {
    return this.context;
  }

  /**
   * Check if this exception is for a specific relation
   *
   * @param relationName - The relation name to check
   * @returns True if this exception is for the specified relation
   */
  isForRelation(relationName: string): boolean {
    return this.relation === relationName;
  }

  /**
   * Get a user-friendly error message for API responses
   *
   * @returns Formatted error message
   */
  getApiMessage(): string {
    if (this.context) {
      return this.context;
    }
    return `The relationship '${this.relation}' is not available on ${this.model}`;
  }

  /**
   * Create exception for undefined relation
   *
   * @param model - The parent entity/model name
   * @param relation - The name of the undefined relationship
   * @returns New RelationNotFoundException instance
   */
  static forUndefinedRelation(model: string, relation: string): RelationNotFoundException {
    return RelationNotFoundException.make(
      model,
      relation,
      `Call to undefined relationship [${relation}] on model [${model}]`,
    );
  }

  /**
   * Create exception for empty relation results
   *
   * @param model - The parent entity/model name
   * @param relation - The name of the relationship
   * @returns New RelationNotFoundException instance
   */
  static forEmptyRelation(model: string, relation: string): RelationNotFoundException {
    return RelationNotFoundException.make(
      model,
      relation,
      `No results found for relationship [${relation}] on model [${model}]`,
    );
  }
}
