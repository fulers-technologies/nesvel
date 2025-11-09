import { Property } from '@mikro-orm/core';
import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import type { IHasSearchable, SearchableConfig } from '@/interfaces';

/**
 * Constructor type for mixin pattern
 */
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Searchable Mixin
 *
 * Adds full-text search functionality to entities, inspired by Laravel Scout.
 * Allows entities to be searchable across specified columns with various
 * search modes and configurations.
 *
 * This mixin provides:
 * - Configuration for searchable columns
 * - Search query building utilities
 * - Optional search scoring for result ranking
 * - Flexible search modes (partial, exact, starts_with, ends_with)
 *
 * @template TBase - The base class constructor type
 *
 * @param Base - The base class to extend
 * @param config - Searchable configuration
 * @returns Extended class with searchable functionality
 *
 * @example
 * ```typescript
 * // Basic searchable entity
 * @Entity()
 * export class Post extends HasSearchable(BaseEntity, {
 *   searchableColumns: ['title', 'content', 'excerpt'],
 * }) {
 *   @Property()
 *   title!: string;
 *
 *   @Property()
 *   content!: string;
 *
 *   @Property()
 *   excerpt!: string;
 * }
 *
 * // Search usage
 * const results = await PostRepository.search('nestjs tutorial');
 * ```
 *
 * @example
 * ```typescript
 * // Advanced configuration
 * @Entity()
 * export class Article extends HasSearchable(BaseEntity, {
 *   searchableColumns: ['title', 'body', 'tags'],
 *   searchMode: 'partial',
 *   caseSensitive: false,
 *   minSearchLength: 3,
 * }) {
 *   @Property()
 *   title!: string;
 *
 *   @Property()
 *   body!: string;
 *
 *   @Property()
 *   tags!: string;
 *
 *   // Override to exclude draft articles from search
 *   shouldBeSearchable(): boolean {
 *     return this.status === 'published';
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Search with custom filtering
 * const query = em.createQueryBuilder(Post, 'p');
 * const searchTerm = 'typescript';
 *
 * // Use the searchable config
 * const config = Post.make().getSearchableConfig();
 * const conditions = config.searchableColumns.map(column =>
 *   query.getKnex().raw(`LOWER(${column}) LIKE ?`, [`%${searchTerm.toLowerCase()}%`])
 * );
 *
 * const results = await query
 *   .where({ $or: conditions })
 *   .getResultList();
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export function HasSearchable<TBase extends Constructor<object>>(
  Base: TBase,
  config: SearchableConfig,
) {
  abstract class SearchableMixin extends Base implements IHasSearchable {
    /**
     * Search score for ranking results
     *
     * This optional property can be used to rank search results.
     * Higher scores indicate better matches.
     */
    @Property({ nullable: true, persist: false })
    searchScore?: number;

    /**
     * Get the searchable configuration
     *
     * Returns the configuration that defines which columns are searchable
     * and how search operations should be performed.
     *
     * @returns Searchable configuration object
     *
     * @example
     * ```typescript
     * const post = Post.make();
     * const config = post.getSearchableConfig();
     * console.log(config.searchableColumns); // ['title', 'content', 'excerpt']
     * ```
     */
    getSearchableConfig(): SearchableConfig {
      return {
        ...config,
        caseSensitive: config.caseSensitive ?? false,
        searchMode: config.searchMode ?? 'partial',
        minSearchLength: config.minSearchLength ?? 1,
      };
    }

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
     * class Post extends HasSearchable(BaseEntity, config) {
     *   // Only published posts are searchable
     *   shouldBeSearchable(): boolean {
     *     return this.status === 'published' && !this.isDraft;
     *   }
     * }
     * ```
     */
    shouldBeSearchable(): boolean {
      return true;
    }

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
     * const post = await em.findOne(Post, 1);
     * const searchableData = post.toSearchableArray();
     * // { title: 'My Post', content: '...', excerpt: '...' }
     *
     * // Send to external search service
     * await searchService.index(post.id, searchableData);
     * ```
     */
    toSearchableArray(): Record<string, any> {
      const result: Record<string, any> = {};
      const columns = this.getSearchableConfig().searchableColumns;

      for (const column of columns) {
        if (column in this) {
          result[column] = (this as any)[column];
        }
      }

      return result;
    }

    /**
     * Build a search filter query for this entity type
     *
     * Creates a MikroORM FilterQuery that searches across all configured
     * searchable columns for the given search term.
     *
     * @param searchTerm - The term to search for
     * @returns MikroORM filter query for searching
     *
     * @example
     * ```typescript
     * const post = Post.make();
     * const filter = post.buildSearchFilter('typescript tutorial');
     *
     * // Use with repository
     * const results = await em.find(Post, filter);
     * ```
     */
    buildSearchFilter(searchTerm: string): FilterQuery<any> {
      const cfg = this.getSearchableConfig();

      // Check minimum search length
      if (searchTerm.length < (cfg.minSearchLength || 1)) {
        return {};
      }

      // Prepare search term based on mode
      let term = cfg.caseSensitive ? searchTerm : searchTerm.toLowerCase();

      // Build search pattern based on mode
      let pattern: string;
      switch (cfg.searchMode) {
        case 'exact':
          pattern = term;
          break;
        case 'starts_with':
          pattern = `${term}%`;
          break;
        case 'ends_with':
          pattern = `%${term}`;
          break;
        case 'partial':
        default:
          pattern = `%${term}%`;
          break;
      }

      // Build OR conditions for all searchable columns
      const orConditions = cfg.searchableColumns.map((column) => {
        if (cfg.caseSensitive) {
          return { [column]: { $like: pattern } };
        } else {
          return { [column]: { $ilike: pattern } };
        }
      });

      return { $or: orConditions } as FilterQuery<any>;
    }

    /**
     * Set the search score for this entity
     *
     * Used for ranking search results. Higher scores indicate better matches.
     *
     * @param score - The search score (typically 0-1 or 0-100)
     *
     * @example
     * ```typescript
     * // After performing search, set scores
     * results.forEach(post => {
     *   const titleMatch = post.title.includes(searchTerm);
     *   post.setSearchScore(titleMatch ? 1.0 : 0.5);
     * });
     *
     * // Sort by score
     * results.sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
     * ```
     */
    setSearchScore(score: number): void {
      this.searchScore = score;
    }

    /**
     * Get the search score
     *
     * @returns The search score, or undefined if not set
     */
    getSearchScore(): number | undefined {
      return this.searchScore;
    }

    /**
     * Check if this entity matches the search term
     *
     * Performs a simple client-side check if the entity matches
     * the given search term across searchable columns.
     *
     * @param searchTerm - The term to search for
     * @returns True if the entity matches the search term
     *
     * @example
     * ```typescript
     * const post = await em.findOne(Post, 1);
     *
     * if (post.matchesSearchTerm('typescript')) {
     *   console.log('This post is about TypeScript');
     * }
     * ```
     */
    matchesSearchTerm(searchTerm: string): boolean {
      const cfg = this.getSearchableConfig();
      const term = cfg.caseSensitive ? searchTerm : searchTerm.toLowerCase();

      for (const column of cfg.searchableColumns) {
        if (column in this) {
          const value = (this as any)[column];
          if (value == null) continue;

          const strValue = cfg.caseSensitive ? String(value) : String(value).toLowerCase();

          switch (cfg.searchMode) {
            case 'exact':
              if (strValue === term) return true;
              break;
            case 'starts_with':
              if (strValue.startsWith(term)) return true;
              break;
            case 'ends_with':
              if (strValue.endsWith(term)) return true;
              break;
            case 'partial':
            default:
              if (strValue.includes(term)) return true;
              break;
          }
        }
      }

      return false;
    }
  }

  return SearchableMixin;
}

/**
 * Type helper for entities with searchable functionality
 *
 * @template T - The base entity type
 *
 * @example
 * ```typescript
 * function highlightSearchResults<T>(entities: WithSearchable<T>[], term: string) {
 *   return entities
 *     .filter(e => e.matchesSearchTerm(term))
 *     .map(e => ({
 *       ...e,
 *       score: e.getSearchScore(),
 *     }));
 * }
 * ```
 */
export type WithSearchable<T> = T & IHasSearchable;
