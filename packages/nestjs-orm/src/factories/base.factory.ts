import { EntityManager, EntityRepository, EntityData } from '@mikro-orm/core';
import { Logger } from '@nestjs/common';
import { BaseEntity } from '@/entities/base.entity';
import type { IFactory, IFactoryState, IFactoryRelationship, IFactoryConfig } from '@/interfaces';

/**
 * Abstract Base Factory
 *
 * Laravel Eloquent-inspired factory implementation for NestJS with MikroORM.
 * Provides a fluent API for generating test data, seeding databases, and managing
 * entity relationships with comprehensive state management and batch operations.
 *
 * Features:
 * - Fluent API for method chaining
 * - State management for entity variations
 * - Relationship management with automatic creation
 * - Sequence generation for unique data
 * - Conditional factory logic
 * - Batch operations with transaction support
 * - Comprehensive error handling and logging
 *
 * @template T - The entity type this factory creates
 *
 * @example
 * ```typescript
 * // Define a User factory
 * @Injectable()
 * export class UserFactory extends BaseFactory<User> {
 *   protected entity = User;
 *
 *   protected definition(): Partial<User> {
 *     return {
 *       name: faker.person.fullName(),
 *       email: faker.internet.email(),
 *       password: faker.internet.password(),
 *       isActive: true,
 *       createdAt: new Date(),
 *     };
 *   }
 *
 *   protected states(): Record<string, IFactoryState<User>> {
 *     return {
 *       admin: {
 *         name: 'admin',
 *         apply: (attributes) => ({
 *           ...attributes,
 *           role: 'admin',
 *           permissions: ['*']
 *         })
 *       },
 *       inactive: {
 *         name: 'inactive',
 *         apply: (attributes) => ({
 *           ...attributes,
 *           isActive: false
 *         })
 *       }
 *     };
 *   }
 * }
 *
 * // Usage examples
 * const user = await UserFactory.create();
 * const adminUser = await UserFactory.state('admin').create();
 * const users = await UserFactory.createMany(10);
 * const usersWithPosts = await UserFactory.with('posts', PostFactory, 3).createMany(5);
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseFactory<T extends BaseEntity = BaseEntity> implements IFactory<T> {
  /**
   * Logger instance for debugging and monitoring
   *
   * @protected
   * @readonly
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Entity class that this factory creates
   *
   * Must be implemented by concrete factory classes to specify
   * the entity type being manufactured.
   *
   * @protected
   * @abstract
   */
  protected abstract entity: new () => T;

  /**
   * MikroORM EntityManager for database operations
   *
   * Injected during factory initialization and used for
   * persisting entities and managing transactions.
   *
   * @protected
   */
  protected entityManager: EntityManager;

  /**
   * Current applied states for this factory instance
   *
   * @private
   */
  private appliedStates: string[] = [];

  /**
   * Current state parameters
   *
   * @private
   */
  private stateParameters: Record<string, any[]> = {};

  /**
   * Current relationships to create
   *
   * @private
   */
  private relationships: IFactoryRelationship[] = [];

  /**
   * Attribute overrides for the next creation
   *
   * @private
   */
  private attributeOverrides: Partial<T> = {};

  /**
   * Current sequence callback
   *
   * @private
   */
  private sequenceCallback: ((index: number) => Partial<T>) | undefined;

  /**
   * Current sequence index
   *
   * @private
   */
  private sequenceIndex = 0;

  /**
   * Factory configuration
   *
   * @private
   */
  private config: Required<IFactoryConfig>;

  /**
   * Constructor
   *
   * @param entityManager - MikroORM EntityManager instance
   * @param config - Factory configuration options
   */
  constructor(entityManager: EntityManager, config: IFactoryConfig = {}) {
    this.entityManager = entityManager;
    this.config = {
      autoPersist: true,
      useTransactions: false,
      autoFlush: true,
      batchSize: 100,
      validateBeforePersist: true,
      ...config,
    } as Required<IFactoryConfig>;
  }

  /**
   * Define the base attributes for the entity
   *
   * Abstract method that must be implemented by concrete factories
   * to provide the default attribute generation logic.
   *
   * @returns Partial entity with default attributes
   *
   * @protected
   * @abstract
   *
   * @example
   * ```typescript
   * protected definition(): Partial<User> {
   *   return {
   *     name: faker.person.fullName(),
   *     email: faker.internet.email(),
   *     password: faker.internet.password(),
   *     isActive: true,
   *   };
   * }
   * ```
   */
  protected abstract definition(): Partial<T>;

  /**
   * Define available states for this factory
   *
   * Optional method that can be overridden to provide state definitions
   * for creating entity variations.
   *
   * @returns Record of state name to state definition
   *
   * @protected
   *
   * @example
   * ```typescript
   * protected states(): Record<string, IFactoryState<User>> {
   *   return {
   *     admin: {
   *       name: 'admin',
   *       apply: (attributes) => ({ ...attributes, role: 'admin' })
   *     },
   *     verified: {
   *       name: 'verified',
   *       apply: (attributes) => ({ ...attributes, emailVerifiedAt: new Date() })
   *     }
   *   };
   * }
   * ```
   */
  protected states(): Record<string, IFactoryState<T>> {
    return {};
  }

  /**
   * Create a single model instance without persisting to database
   *
   * @param attributes - Optional attributes to override defaults
   * @returns Promise resolving to the created model instance
   */
  public async make(attributes: Partial<T> = {}): Promise<T> {
    const builtAttributes = await this.buildAttributes(attributes);
    const entity = this.createEntityInstance(builtAttributes);

    // Apply relationships if any
    await this.applyRelationships(entity);

    return entity;
  }

  /**
   * Create multiple model instances without persisting to database
   *
   * @param count - Number of instances to create
   * @param attributes - Optional attributes to apply to all instances
   * @returns Promise resolving to array of model instances
   */
  public async makeMany(count: number, attributes: Partial<T> = {}): Promise<T[]> {
    const entities: T[] = [];

    for (let i = 0; i < count; i++) {
      const entity = await this.make(attributes);
      entities.push(entity);
    }

    return entities;
  }

  /**
   * Create and persist a single model instance to database
   *
   * @param attributes - Optional attributes to override defaults
   * @returns Promise resolving to the persisted model instance
   */
  public async create(attributes: Partial<T> = {}): Promise<T> {
    if (this.config.useTransactions) {
      return this.entityManager.transactional(async (em) => {
        const factory = this.clone();
        factory.entityManager = em;
        return factory.createWithoutTransaction(attributes);
      });
    }

    return this.createWithoutTransaction(attributes);
  }

  /**
   * Create and persist multiple model instances to database
   *
   * @param count - Number of instances to create and persist
   * @param attributes - Optional attributes to apply to all instances
   * @returns Promise resolving to array of persisted model instances
   */
  public async createMany(count: number, attributes: Partial<T> = {}): Promise<T[]> {
    if (this.config.useTransactions) {
      return this.entityManager.transactional(async (em) => {
        const factory = this.clone();
        factory.entityManager = em;
        return factory.createManyWithoutTransaction(count, attributes);
      });
    }

    return this.createManyWithoutTransaction(count, attributes);
  }

  /**
   * Apply a state transformation to the factory
   *
   * @param state - The state name to apply
   * @param parameters - Optional parameters to pass to the state
   * @returns Factory instance for method chaining
   */
  public state(state: string, ...parameters: any[]): IFactory<T> {
    const clone = this.clone();
    clone.appliedStates.push(state);
    clone.stateParameters[state] = parameters;
    return clone;
  }

  /**
   * Set up relationships when creating models
   *
   * @param relationName - The name of the relationship to populate
   * @param factory - Factory instance or callback to create related models
   * @param count - Number of related models to create (for has-many relationships)
   * @returns Factory instance for method chaining
   */
  public with(
    relationName: string,
    factory: IFactory<any> | (() => Promise<any>),
    count = 1,
  ): IFactory<T> {
    const clone = this.clone();
    clone.relationships.push({
      relationName,
      factory,
      count,
    });
    return clone;
  }

  /**
   * Override specific attributes for the next creation
   *
   * @param attributes - Attributes to override
   * @returns Factory instance for method chaining
   */
  public set(attributes: Partial<T>): IFactory<T> {
    const clone = this.clone();
    clone.attributeOverrides = { ...clone.attributeOverrides, ...attributes };
    return clone;
  }

  /**
   * Apply a sequence to generate incremental data
   *
   * @param callback - Function that receives sequence index
   * @returns Factory instance for method chaining
   */
  public sequence(callback: (index: number) => Partial<T>): IFactory<T> {
    const clone = this.clone();
    clone.sequenceCallback = callback;
    return clone;
  }

  /**
   * Apply conditional logic to factory creation
   *
   * @param condition - Boolean condition or function returning boolean
   * @param callback - Callback to apply if condition is true
   * @returns Factory instance for method chaining
   */
  public when(
    condition: boolean | (() => boolean),
    callback: (factory: IFactory<T>) => IFactory<T>,
  ): IFactory<T> {
    const shouldApply = typeof condition === 'function' ? condition() : condition;

    if (shouldApply) {
      return callback(this);
    }

    return this;
  }

  /**
   * Reset the factory to its default state
   *
   * @returns Factory instance for method chaining
   */
  public reset(): IFactory<T> {
    const clone = this.clone();
    clone.appliedStates = [];
    clone.stateParameters = {};
    clone.relationships = [];
    clone.attributeOverrides = {};
    clone.sequenceCallback = undefined;
    clone.sequenceIndex = 0;
    return clone;
  }

  /**
   * Build final attributes by applying definition, states, overrides, and sequences
   *
   * @param attributes - Base attributes to start with
   * @returns Promise resolving to final built attributes
   *
   * @private
   */
  private async buildAttributes(attributes: Partial<T> = {}): Promise<Partial<T>> {
    // Start with factory definition
    let builtAttributes = await this.resolveAttributes(this.definition());

    // Apply states
    const availableStates = this.states();
    for (const stateName of this.appliedStates) {
      const state = availableStates[stateName];
      if (state) {
        const parameters = this.stateParameters[stateName] || [];
        builtAttributes = await this.resolveAttributes(state.apply(builtAttributes, ...parameters));
      } else {
        this.logger.warn(`Unknown factory state: ${stateName}`);
      }
    }

    // Apply sequence if defined
    if (this.sequenceCallback) {
      const sequenceAttributes = await this.resolveAttributes(
        this.sequenceCallback(this.sequenceIndex++),
      );
      builtAttributes = { ...builtAttributes, ...sequenceAttributes };
    }

    // Apply attribute overrides
    const resolvedOverrides = await this.resolveAttributes(this.attributeOverrides);
    builtAttributes = { ...builtAttributes, ...resolvedOverrides };

    // Apply final parameter attributes
    const resolvedAttributes = await this.resolveAttributes(attributes);
    builtAttributes = { ...builtAttributes, ...resolvedAttributes };

    // Apply beforeCreate hook if configured
    if (this.config.beforeCreate) {
      builtAttributes = await this.resolveAttributes(
        await this.config.beforeCreate(builtAttributes),
      );
    }

    return builtAttributes;
  }

  /**
   * Resolve attributes that might contain functions or promises
   *
   * @param attributes - Attributes to resolve
   * @returns Promise resolving to resolved attributes
   *
   * @private
   */
  private async resolveAttributes(attributes: Partial<T>): Promise<Partial<T>> {
    const resolved: Partial<T> = {};

    for (const [key, value] of Object.entries(attributes)) {
      if (typeof value === 'function') {
        resolved[key as keyof T] = await value();
      } else if (value instanceof Promise) {
        resolved[key as keyof T] = await value;
      } else {
        resolved[key as keyof T] = value;
      }
    }

    return resolved;
  }

  /**
   * Create entity instance from attributes
   *
   * @param attributes - Built attributes
   * @returns Created entity instance
   *
   * @private
   */
  private createEntityInstance(attributes: Partial<T>): T {
    const entity = new this.entity();
    Object.assign(entity, attributes);
    return entity;
  }

  /**
   * Apply relationships to an entity
   *
   * @param entity - Entity to apply relationships to
   *
   * @private
   */
  private async applyRelationships(entity: T): Promise<void> {
    for (const relationship of this.relationships) {
      if (typeof relationship.factory === 'function') {
        // Callback function
        const relatedEntity = await relationship.factory();
        (entity as any)[relationship.relationName] = relatedEntity;
      } else {
        // Factory instance
        if (relationship.count && relationship.count > 1) {
          // Has-many relationship
          const relatedEntities = await relationship.factory.createMany(relationship.count);
          (entity as any)[relationship.relationName] = relatedEntities;
        } else {
          // Has-one or belongs-to relationship
          const relatedEntity = await relationship.factory.create();
          (entity as any)[relationship.relationName] = relatedEntity;
        }
      }
    }
  }

  /**
   * Create without transaction wrapper
   *
   * @param attributes - Attributes for creation
   * @returns Promise resolving to created entity
   *
   * @private
   */
  private async createWithoutTransaction(attributes: Partial<T> = {}): Promise<T> {
    const entity = await this.make(attributes);

    if (this.config.autoPersist) {
      if (this.config.validateBeforePersist) {
        // Add validation logic here if needed
      }

      this.entityManager.persist(entity);

      if (this.config.autoFlush) {
        await this.entityManager.flush();
      }
    }

    // Apply afterCreate hook if configured
    if (this.config.afterCreate) {
      await this.config.afterCreate(entity);
    }

    return entity;
  }

  /**
   * Create many without transaction wrapper
   *
   * @param count - Number of entities to create
   * @param attributes - Attributes for creation
   * @returns Promise resolving to array of created entities
   *
   * @private
   */
  private async createManyWithoutTransaction(
    count: number,
    attributes: Partial<T> = {},
  ): Promise<T[]> {
    const entities: T[] = [];
    const batchSize = this.config.batchSize;

    for (let i = 0; i < count; i += batchSize) {
      const currentBatchSize = Math.min(batchSize, count - i);
      const batch: T[] = [];

      // Create batch
      for (let j = 0; j < currentBatchSize; j++) {
        const entity = await this.make(attributes);
        batch.push(entity);

        if (this.config.autoPersist) {
          this.entityManager.persist(entity);
        }
      }

      // Flush batch
      if (this.config.autoPersist && this.config.autoFlush) {
        await this.entityManager.flush();
      }

      // Apply afterCreate hooks
      if (this.config.afterCreate) {
        for (const entity of batch) {
          await this.config.afterCreate(entity);
        }
      }

      entities.push(...batch);
    }

    return entities;
  }

  /**
   * Clone the factory instance for method chaining
   *
   * @returns Cloned factory instance
   *
   * @private
   */
  private clone(): BaseFactory<T> {
    const cloned = Object.create(Object.getPrototypeOf(this));
    cloned.entityManager = this.entityManager;
    cloned.config = this.config;
    cloned.entity = this.entity;
    cloned.appliedStates = [...this.appliedStates];
    cloned.stateParameters = { ...this.stateParameters };
    cloned.relationships = [...this.relationships];
    cloned.attributeOverrides = { ...this.attributeOverrides };
    cloned.sequenceCallback = this.sequenceCallback;
    cloned.sequenceIndex = this.sequenceIndex;
    return cloned;
  }
}
