import type { SearchableConfig } from './searchable-config.interface';

/**
 * Interface for entities with searchable functionality
 *
 * Defines the contract for entities that support full-text search.
 * Entities implementing this interface can be indexed and searched
 * across specified columns.
 *
 * @example
 * ```typescript
 * @Entity()
 * export class Post extends HasSearchable(BaseEntity, {
 *   searchableColumns: ['title', 'content'],
 * }) implements IHasSearchable {
 *   @Property()
 *   title!: string;
 *
 *   @Property()
 *   content!: string;
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IHasSearchable {
  /**
   * Get the searchable configuration for this entity
   *
   * Returns configuration defining which columns are searchable
   * and how search operations should be performed.
   *
   * @returns Searchable configuration object
   */
  getSearchableConfig(): SearchableConfig;

  /**
   * Determine if the entity should be searchable
   *
   * Override this method to add conditional logic for whether
   * an entity should be included in search results.
   *
   * @returns True if the entity should be searchable
   *
   * @example
   * ```typescript
   * shouldBeSearchable(): boolean {
   *   return this.status === 'published';
   * }
   * ```
   */
  shouldBeSearchable(): boolean;

  /**
   * Get the searchable data for indexing
   *
   * Returns an object containing only the searchable fields and their values.
   * Useful for external search engines or custom indexing.
   *
   * @returns Object with searchable column values
   *
   * @example
   * ```typescript
   * const searchableData = post.toSearchableArray();
   * // { title: 'My Post', content: '...' }
   * ```
   */
  toSearchableArray(): Record<string, any>;

  /**
   * Search score for ranking results
   *
   * Optional property that can be used to rank search results.
   * Higher scores indicate better matches.
   */
  searchScore?: number;
}
