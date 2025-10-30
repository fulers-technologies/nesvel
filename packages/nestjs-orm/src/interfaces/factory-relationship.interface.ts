import type { IFactory } from './factory.interface';
import { RelationshipType } from '../enums';

/**
 * Factory Relationship Interface
 *
 * Defines how relationships should be created and attached to models.
 * Supports various relationship types and automatic creation of related entities.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface IFactoryRelationship {
  /**
   * The name of the relationship property
   *
   * Must match the property name on the entity where the related
   * entities will be assigned.
   *
   * @example 'posts', 'author', 'comments', 'tags'
   */
  relationName: string;

  /**
   * Factory or callback to create related models
   *
   * Can be either:
   * - A factory instance that will be used to create related entities
   * - A callback function that returns a promise resolving to the related entity/entities
   *
   * @example
   * ```typescript
   * // Using a factory instance
   * factory: PostFactory
   *
   * // Using a callback function
   * factory: async () => {
   *   return await CustomService.createSpecialEntity();
   * }
   * ```
   */
  factory: IFactory<any> | (() => Promise<any>);

  /**
   * Number of related models to create (for has-many relationships)
   *
   * For one-to-many or many-to-many relationships, specifies how many
   * related entities should be created and associated.
   *
   * @default 1
   * @example
   * ```typescript
   * // Create 5 posts for each user
   * count: 5
   *
   * // Create 1 author for each post (belongs-to)
   * count: 1
   * ```
   */
  count?: number;

  /**
   * Type of relationship
   *
   * Optional field that can be used to optimize relationship creation
   * and provide better error messages. If not specified, the factory
   * will infer the relationship type based on the count parameter.
   *
   * @example
   * ```typescript
   * type: RelationshipType.HAS_MANY     // User has many posts
   * type: RelationshipType.BELONGS_TO   // Post belongs to user
   * type: RelationshipType.HAS_ONE      // User has one profile
   * type: RelationshipType.MANY_TO_MANY // User has many roles
   * ```
   */
  type?: RelationshipType;
}
