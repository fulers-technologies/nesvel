import type { IHasSearchable } from '@nesvel/nestjs-orm';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { EntityManager, EventSubscriber, BaseEntity } from '@nesvel/nestjs-orm';

import { SearchService } from '@/services';
import { SEARCH_OPTIONS } from '@/constants';
import type { SearchConfig } from '@/interfaces';

/**
 * Searchable Subscriber
 *
 * MikroORM event subscriber that automatically synchronizes entities with the
 * `IHasSearchable` interface to the configured search engine (Elasticsearch or Meilisearch).
 * This subscriber listens to entity lifecycle events and keeps the search index in sync
 * with database changes.
 *
 * **Key Features**:
 * - Automatic indexing on entity creation
 * - Automatic updates when entities are modified
 * - Automatic removal when entities are deleted
 * - Conditional indexing based on `shouldBeSearchable()` method
 * - Configurable index prefix for multi-tenant or environment-specific indexes
 * - Non-blocking (indexing failures don't affect database operations)
 * - Respects `autoSync` configuration flag
 *
 * **How It Works**:
 * 1. Checks if entity implements `IHasSearchable` interface
 * 2. Calls entity's `shouldBeSearchable()` to determine if it should be indexed
 * 3. Uses entity's `toSearchableArray()` to extract searchable data
 * 4. Syncs to search engine using SearchService
 *
 * **Index Naming**: Indexes are named as `{indexPrefix}_{entityName}` (e.g., `nesvel_post`)
 *
 * **Error Handling**: Indexing errors are logged but don't throw, ensuring database
 * operations always succeed even if search indexing fails.
 *
 * @template T - The entity type extending BaseEntity
 *
 * @example
 * ```typescript
 * // Define a searchable entity
 * @Entity()
 * export class Post extends HasSearchable(BaseEntity, {
 *   searchableColumns: ['title', 'content', 'excerpt'],
 * }) {
 *   @PrimaryKey()
 *   id!: number;
 *
 *   @Property()
 *   title!: string;
 *
 *   @Property()
 *   content!: string;
 *
 *   @Property()
 *   status!: 'draft' | 'published';
 *
 *   // Control whether this entity should be searchable
 *   shouldBeSearchable(): boolean {
 *     return this.status === 'published'; // Only index published posts
 *   }
 * }
 *
 * // The subscriber automatically handles:
 * // - When post is created -> indexes to search engine
 * // - When post is updated -> updates in search engine
 * // - When status changes to 'draft' -> removes from search engine
 * // - When post is deleted -> removes from search engine
 * ```
 *
 * @example
 * ```typescript
 * // Usage in service
 * @Injectable()
 * export class PostService {
 *   async createPost(data: CreatePostDto) {
 *     const post = new Post();
 *     post.title = data.title;
 *     post.content = data.content;
 *     post.status = 'published';
 *
 *     await this.em.persistAndFlush(post);
 *     // Subscriber automatically indexes this post to search engine
 *   }
 *
 *   async unpublishPost(id: number) {
 *     const post = await this.em.findOneOrFail(Post, id);
 *     post.status = 'draft';
 *
 *     await this.em.flush();
 *     // Subscriber automatically removes this post from search engine
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 * @see {@link IHasSearchable} For the searchable interface
 * @see {@link HasSearchable} For the searchable mixin
 */
@Injectable()
export class SearchableSubscriber<T extends BaseEntity = BaseEntity> implements EventSubscriber<T> {
  /**
   * Logger instance for debugging and monitoring
   *
   * Logs all indexing operations, successes, and failures.
   * Errors are logged but don't throw to prevent database operation failures.
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(SearchableSubscriber.name);

  /**
   * Constructor
   *
   * Injects the SearchService for performing search operations and
   * SearchConfig for accessing configuration like autoSync and indexPrefix.
   *
   * @param searchService - Service for interacting with the search engine
   * @param options - Search module configuration options
   */
  constructor(
    private readonly searchService: SearchService,
    @Inject(SEARCH_OPTIONS)
    private readonly options: SearchConfig,
  ) {}

  /**
   * Check if an entity implements IHasSearchable interface
   *
   * Performs a runtime check to determine if the entity has all required methods
   * of the IHasSearchable interface. This is a type guard that narrows the type.
   *
   * **Required Methods**:
   * - `getSearchableConfig()` - Returns searchable configuration
   * - `shouldBeSearchable()` - Determines if entity should be indexed
   * - `toSearchableArray()` - Converts entity to searchable document format
   *
   * @param entity - The entity to check
   *
   * @returns True if entity implements IHasSearchable, false otherwise
   *
   * @private
   */
  private isSearchable(entity: BaseEntity): entity is BaseEntity & IHasSearchable {
    return (
      entity &&
      typeof entity === 'object' &&
      'getSearchableConfig' in entity &&
      'shouldBeSearchable' in entity &&
      'toSearchableArray' in entity
    );
  }

  /**
   * Get index name for an entity
   *
   * Generates the search engine index name for an entity by combining
   * the configured index prefix with the entity class name (lowercase).
   *
   * **Naming Convention**: `{indexPrefix}_{entityName}`
   * - Default prefix: 'nesvel'
   * - Entity name is automatically converted to lowercase
   *
   * @param entity - The entity instance
   *
   * @returns The index name (e.g., 'nesvel_post', 'myapp_product')
   *
   * @example
   * ```typescript
   * // For a Post entity with default prefix
   * getIndexName(post); // returns 'nesvel_post'
   *
   * // For a Product entity with custom prefix 'myapp'
   * getIndexName(product); // returns 'myapp_product'
   * ```
   *
   * @private
   */
  private getIndexName(entity: any): string {
    // Extract entity class name and convert to lowercase
    const entityName = entity.constructor.name.toLowerCase();
    // Use configured prefix or default to 'nesvel'
    const prefix = this.options.indexPrefix || 'nesvel';
    // Combine prefix and entity name with underscore
    return `${prefix}_${entityName}`;
  }

  /**
   * After entity is created/persisted
   *
   * MikroORM lifecycle hook called after an entity is successfully created and persisted.
   * Automatically indexes the entity to the search engine if conditions are met.
   *
   * **Conditions for Indexing**:
   * 1. `autoSync` must be enabled in configuration
   * 2. Entity must implement `IHasSearchable` interface
   * 3. Entity's `shouldBeSearchable()` must return true
   *
   * **Error Handling**: Errors are caught and logged but not thrown, ensuring database
   * operations always succeed even if search indexing fails.
   *
   * @param args - MikroORM event arguments containing entity and entity manager
   * @param args.entity - The entity that was created
   * @param args.em - The entity manager instance
   *
   * @example
   * ```typescript
   * // When this happens:
   * const post = new Post();
   * post.title = 'My Post';
   * post.status = 'published';
   * await em.persistAndFlush(post);
   *
   * // This subscriber automatically:
   * // 1. Checks if post.shouldBeSearchable() === true
   * // 2. Calls post.toSearchableArray() to get searchable data
   * // 3. Indexes to search engine with document id = post.id
   * ```
   */
  async afterCreate(args: { entity: any; em: EntityManager }): Promise<void> {
    const { entity } = args;

    // Skip if auto-sync is disabled
    if (!this.options.autoSync) return;

    // Skip if entity doesn't implement IHasSearchable
    if (!this.isSearchable(entity)) return;

    // Skip if entity should not be searchable (e.g., draft status)
    if (!entity.shouldBeSearchable()) return;

    try {
      // Generate index name (e.g., 'nesvel_post')
      const indexName = this.getIndexName(entity);

      // Get searchable data from entity
      const searchableData = entity.toSearchableArray();

      // Index document to search engine
      await this.searchService.indexDocument(indexName, {
        id: (entity as any).id, // Use entity's primary key as document ID
        ...searchableData, // Spread searchable fields
      });

      this.logger.debug(`Indexed entity ${entity.constructor.name} with id ${(entity as any).id}`);
    } catch (error) {
      this.logger.error(`Failed to index entity after create:`, error);
      // Don't throw - allow entity creation to succeed even if indexing fails
      // This ensures database operations are never blocked by search engine issues
    }
  }

  /**
   * After entity is updated
   *
   * MikroORM lifecycle hook called after an entity is successfully updated.
   * Updates the document in the search engine or removes it if it's no longer searchable.
   *
   * **Behavior**:
   * - If `shouldBeSearchable()` returns true: Updates document in search engine
   * - If `shouldBeSearchable()` returns false: Removes document from search engine
   *
   * **Use Case**: This handles scenarios like changing a post from 'published' to 'draft',
   * which should remove it from search results.
   *
   * **Error Handling**: Errors are caught and logged but not thrown.
   *
   * @param args - MikroORM event arguments containing entity and entity manager
   * @param args.entity - The entity that was updated
   * @param args.em - The entity manager instance
   *
   * @example
   * ```typescript
   * // Scenario 1: Entity remains searchable (update in search)
   * const post = await em.findOne(Post, 1);
   * post.title = 'Updated Title'; // Still published
   * await em.flush();
   * // Subscriber updates the document in search engine
   *
   * // Scenario 2: Entity becomes non-searchable (remove from search)
   * post.status = 'draft'; // No longer published
   * await em.flush();
   * // Subscriber removes the document from search engine
   * ```
   */
  async afterUpdate(args: { entity: any; em: EntityManager }): Promise<void> {
    const { entity } = args;

    // Skip if auto-sync is disabled
    if (!this.options.autoSync) return;

    // Skip if entity doesn't implement IHasSearchable
    if (!this.isSearchable(entity)) return;

    try {
      // Generate index name
      const indexName = this.getIndexName(entity);
      const entityId = (entity as any).id;

      if (entity.shouldBeSearchable()) {
        // Entity should be in search index - update it
        const searchableData = entity.toSearchableArray();
        await this.searchService.updateDocument(indexName, entityId, searchableData);
        this.logger.debug(`Updated entity ${entity.constructor.name} with id ${entityId}`);
      } else {
        // Entity should NOT be in search index - remove it
        // (e.g., status changed from 'published' to 'draft')
        await this.searchService.deleteDocument(indexName, entityId);
        this.logger.debug(
          `Removed entity ${entity.constructor.name} with id ${entityId} (no longer searchable)`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to update entity in search index:`, error);
      // Don't throw - allow entity update to succeed even if search sync fails
    }
  }

  /**
   * After entity is deleted
   *
   * MikroORM lifecycle hook called after an entity is successfully deleted.
   * Removes the corresponding document from the search engine index.
   *
   * **Note**: This is called for both hard deletes and soft deletes.
   * For soft deletes, consider using the `afterUpdate` hook instead if you want
   * to keep the document but mark it as deleted in search results.
   *
   * **Error Handling**: Errors are caught and logged but not thrown, ensuring
   * database deletions always succeed even if search removal fails.
   *
   * @param args - MikroORM event arguments containing entity and entity manager
   * @param args.entity - The entity that was deleted
   * @param args.em - The entity manager instance
   *
   * @example
   * ```typescript
   * // When this happens:
   * const post = await em.findOne(Post, 1);
   * await em.removeAndFlush(post);
   *
   * // This subscriber automatically:
   * // 1. Gets the index name ('nesvel_post')
   * // 2. Removes document with id=1 from search engine
   * ```
   */
  async afterDelete(args: { entity: any; em: EntityManager }): Promise<void> {
    const { entity } = args;

    // Skip if auto-sync is disabled
    if (!this.options.autoSync) return;

    // Skip if entity doesn't implement IHasSearchable
    if (!this.isSearchable(entity)) return;

    try {
      // Generate index name
      const indexName = this.getIndexName(entity);
      const entityId = (entity as any).id;

      // Remove document from search engine
      await this.searchService.deleteDocument(indexName, entityId);
      this.logger.debug(`Deleted entity ${entity.constructor.name} with id ${entityId} from index`);
    } catch (error) {
      this.logger.error(`Failed to delete entity from search index:`, error);
      // Don't throw - allow entity deletion to succeed even if search removal fails
      // The document may not exist in search engine (already deleted or never indexed)
    }
  }
}
