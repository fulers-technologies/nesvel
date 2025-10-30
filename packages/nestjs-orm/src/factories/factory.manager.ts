import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { BaseEntity } from '@/entities/base.entity';
import { BaseFactory } from './base.factory';
import type { FactoryMetadata, IFactory, IFactoryConfig } from '@/interfaces';
import { generateFactoryToken, getFactoryMetadata } from '../decorators/factory.decorator';

/**
 * Factory Manager
 *
 * Central coordinator for managing factory instances and providing
 * a unified API for creating entities across the application.
 *
 * The FactoryManager handles:
 * - Factory registration and discovery
 * - Factory instance creation and caching
 * - Bulk operations across multiple factories
 * - Global factory configuration
 * - Transaction coordination for factory operations
 *
 * @example
 * ```typescript
 * // In a service or test
 * @Injectable()
 * export class SomeService {
 *   constructor(private factoryManager: FactoryManager) {}
 *
 *   async createTestData() {
 *     // Get a factory instance
 *     const userFactory = this.factoryManager.get(User);
 *     const user = await userFactory.create();
 *
 *     // Create multiple entities
 *     const users = await this.factoryManager.createMany(User, 10);
 *
 *     // Create with relationships
 *     const userWithPosts = await this.factoryManager
 *       .get(User)
 *       .with('posts', this.factoryManager.get(Post), 5)
 *       .create();
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
@Injectable()
export class FactoryManager {
  /**
   * Logger instance for debugging and monitoring
   *
   * @private
   * @readonly
   */
  private readonly logger = new Logger(FactoryManager.name);

  /**
   * Cache of factory instances
   *
   * @private
   */
  private readonly factoryCache = new Map<string, BaseFactory<any>>();

  /**
   * Registry of factory classes and their metadata
   *
   * @private
   */
  private readonly factoryRegistry = new Map<
    string,
    {
      factoryClass: any;
      metadata: FactoryMetadata;
    }
  >();

  /**
   * Global factory configuration
   *
   * @private
   */
  private globalConfig: IFactoryConfig = {
    autoPersist: true,
    useTransactions: false,
    autoFlush: true,
    batchSize: 100,
    validateBeforePersist: true,
  };

  /**
   * Constructor
   *
   * @param moduleRef - NestJS module reference for dependency resolution
   * @param entityManager - MikroORM EntityManager for database operations
   */
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly entityManager: EntityManager,
  ) {
    this.logger.log('FactoryManager initialized');
  }

  /**
   * Register a factory class
   *
   * Registers a factory class with the manager and stores its metadata.
   * This is typically called automatically by the factory module during
   * application bootstrap.
   *
   * @param factoryClass - The factory class to register
   *
   * @example
   * ```typescript
   * factoryManager.registerFactory(UserFactory);
   * ```
   *
   * @throws Error if factory class is not properly decorated
   */
  public registerFactory(factoryClass: any): void {
    const metadata = getFactoryMetadata(factoryClass);

    if (!metadata) {
      throw new Error(`Cannot register factory ${factoryClass.name}: missing @Factory decorator`);
    }

    const entityName = metadata.entity.name;
    this.factoryRegistry.set(entityName, {
      factoryClass,
      metadata,
    });

    this.logger.debug(`Registered factory for entity: ${entityName}`);
  }

  /**
   * Get a factory instance for an entity
   *
   * Returns a factory instance for the specified entity class.
   * Factory instances are cached for performance.
   *
   * @param entityClass - The entity class to get a factory for
   * @returns Factory instance for the entity
   *
   * @example
   * ```typescript
   * const userFactory = factoryManager.get(User);
   * const user = await userFactory.create();
   * ```
   *
   * @throws Error if no factory is registered for the entity
   */
  public get<T extends BaseEntity>(entityClass: new () => T): IFactory<T> {
    const entityName = entityClass.name;
    const cacheKey = `factory_${entityName}`;

    // Check cache first
    if (this.factoryCache.has(cacheKey)) {
      return this.factoryCache.get(cacheKey) as IFactory<T>;
    }

    // Get factory registration
    const registration = this.factoryRegistry.get(entityName);
    if (!registration) {
      throw new Error(
        `No factory registered for entity: ${entityName}. ` +
          'Make sure to register the factory in your module.',
      );
    }

    // Create factory instance
    const factoryToken = generateFactoryToken(entityClass);
    let factoryInstance: BaseFactory<T>;

    try {
      factoryInstance = this.moduleRef.get(factoryToken, { strict: false });
    } catch (error: Error | any) {
      throw new Error(
        `Failed to resolve factory for entity: ${entityName}. ` +
          'Make sure the factory is properly registered in your module.',
      );
    }

    // Apply global configuration
    const mergedConfig = {
      ...this.globalConfig,
      ...registration.metadata.config,
    };

    // Initialize factory with configuration
    const factory = new registration.factoryClass(this.entityManager, mergedConfig);

    // Cache the instance
    this.factoryCache.set(cacheKey, factory);

    return factory as IFactory<T>;
  }

  /**
   * Create a single entity instance
   *
   * Convenience method for creating a single entity without
   * getting the factory instance explicitly.
   *
   * @param entityClass - The entity class to create
   * @param attributes - Optional attributes to override
   * @returns Promise resolving to created entity
   *
   * @example
   * ```typescript
   * const user = await factoryManager.create(User, { name: 'John Doe' });
   * ```
   */
  public async create<T extends BaseEntity>(
    entityClass: new () => T,
    attributes?: Partial<T>,
  ): Promise<T> {
    const factory = this.get(entityClass);
    return factory.create(attributes);
  }

  /**
   * Create multiple entity instances
   *
   * Convenience method for creating multiple entities without
   * getting the factory instance explicitly.
   *
   * @param entityClass - The entity class to create
   * @param count - Number of instances to create
   * @param attributes - Optional attributes to override
   * @returns Promise resolving to array of created entities
   *
   * @example
   * ```typescript
   * const users = await factoryManager.createMany(User, 10);
   * ```
   */
  public async createMany<T extends BaseEntity>(
    entityClass: new () => T,
    count: number,
    attributes?: Partial<T>,
  ): Promise<T[]> {
    const factory = this.get(entityClass);
    return factory.createMany(count, attributes);
  }

  /**
   * Make a single entity instance without persisting
   *
   * Convenience method for creating entity instances in memory
   * without persisting to the database.
   *
   * @param entityClass - The entity class to create
   * @param attributes - Optional attributes to override
   * @returns Promise resolving to created entity instance
   *
   * @example
   * ```typescript
   * const user = await factoryManager.make(User, { name: 'John Doe' });
   * // User instance created but not saved to database
   * ```
   */
  public async make<T extends BaseEntity>(
    entityClass: new () => T,
    attributes?: Partial<T>,
  ): Promise<T> {
    const factory = this.get(entityClass);
    return factory.make(attributes);
  }

  /**
   * Make multiple entity instances without persisting
   *
   * Convenience method for creating multiple entity instances in memory
   * without persisting to the database.
   *
   * @param entityClass - The entity class to create
   * @param count - Number of instances to create
   * @param attributes - Optional attributes to override
   * @returns Promise resolving to array of created entity instances
   *
   * @example
   * ```typescript
   * const users = await factoryManager.makeMany(User, 5);
   * // Array of 5 user instances created but not saved
   * ```
   */
  public async makeMany<T extends BaseEntity>(
    entityClass: new () => T,
    count: number,
    attributes?: Partial<T>,
  ): Promise<T[]> {
    const factory = this.get(entityClass);
    return factory.makeMany(count, attributes);
  }

  /**
   * Execute factory operations within a transaction
   *
   * Provides a transaction context for executing multiple factory
   * operations atomically. All operations will be rolled back if
   * any operation fails.
   *
   * @param callback - Callback function to execute within transaction
   * @returns Promise resolving to callback result
   *
   * @example
   * ```typescript
   * const result = await factoryManager.transaction(async () => {
   *   const user = await factoryManager.create(User);
   *   const posts = await factoryManager.createMany(Post, 5, { userId: user.id });
   *   return { user, posts };
   * });
   * ```
   */
  public async transaction<T>(callback: () => Promise<T>): Promise<T> {
    return this.entityManager.transactional(callback);
  }

  /**
   * Reset all factory caches
   *
   * Clears the factory instance cache, forcing new instances to be
   * created on the next factory request. Useful for testing scenarios
   * where you want fresh factory instances.
   *
   * @example
   * ```typescript
   * // Clear all cached factory instances
   * factoryManager.resetCache();
   *
   * // Next factory.get() calls will create new instances
   * const userFactory = factoryManager.get(User);
   * ```
   */
  public resetCache(): void {
    this.factoryCache.clear();
    this.logger.debug('Factory cache cleared');
  }

  /**
   * Update global factory configuration
   *
   * Updates the global configuration that will be applied to all
   * new factory instances. Existing cached instances are not affected.
   *
   * @param config - New global configuration options
   *
   * @example
   * ```typescript
   * factoryManager.setGlobalConfig({
   *   useTransactions: true,
   *   batchSize: 50,
   *   autoFlush: false
   * });
   * ```
   */
  public setGlobalConfig(config: Partial<IFactoryConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
    this.logger.log('Global factory configuration updated', config);

    // Clear cache to apply new config to future instances
    this.resetCache();
  }

  /**
   * Get current global factory configuration
   *
   * @returns Current global configuration
   */
  public getGlobalConfig(): IFactoryConfig {
    return { ...this.globalConfig };
  }

  /**
   * Get list of registered factories
   *
   * Returns information about all registered factory classes,
   * useful for debugging and introspection.
   *
   * @returns Array of factory registration information
   *
   * @example
   * ```typescript
   * const factories = factoryManager.getRegisteredFactories();
   * console.log(factories.map(f => f.entityName)); // ['User', 'Post', ...]
   * ```
   */
  public getRegisteredFactories(): Array<{
    entityName: string;
    factoryClass: any;
    metadata: FactoryMetadata;
  }> {
    return Array.from(this.factoryRegistry.entries()).map(([entityName, registration]) => ({
      entityName,
      factoryClass: registration.factoryClass,
      metadata: registration.metadata,
    }));
  }

  /**
   * Check if a factory is registered for an entity
   *
   * @param entityClass - The entity class to check
   * @returns True if a factory is registered for the entity
   *
   * @example
   * ```typescript
   * if (factoryManager.hasFactory(User)) {
   *   const userFactory = factoryManager.get(User);
   * }
   * ```
   */
  public hasFactory<T extends BaseEntity>(entityClass: new () => T): boolean {
    return this.factoryRegistry.has(entityClass.name);
  }

  /**
   * Get factory statistics
   *
   * Returns statistics about factory usage and performance.
   * Useful for monitoring and debugging.
   *
   * @returns Factory statistics
   *
   * @example
   * ```typescript
   * const stats = factoryManager.getStatistics();
   * console.log(`Registered factories: ${stats.registeredFactories}`);
   * console.log(`Cached instances: ${stats.cachedInstances}`);
   * ```
   */
  public getStatistics(): {
    registeredFactories: number;
    cachedInstances: number;
    globalConfig: IFactoryConfig;
  } {
    return {
      registeredFactories: this.factoryRegistry.size,
      cachedInstances: this.factoryCache.size,
      globalConfig: this.getGlobalConfig(),
    };
  }
}
