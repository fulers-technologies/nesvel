import { Factory } from '@mikro-orm/seeder';
import type { EntityManager } from '@mikro-orm/core';
import { faker, type Faker } from '@faker-js/faker';

import { BaseEntity } from '@/entities/base.entity';

/**
 * Abstract Base Factory
 *
 * Base class for entity factories extending MikroORM's Factory.
 * Factories are used to generate test data for entities.
 *
 * @template T - The entity type this factory creates
 *
 * @see https://mikro-orm.io/docs/seeding#using-entity-factories
 *
 * @example
 * ```typescript
 * import { BaseFactory } from '@nesvel/nestjs-orm';
 * import { User } from './entities/user.entity';
 *
 * export class UserFactory extends BaseFactory<User> {
 *   model = User;
 *
 *   protected definition(): EntityData<User> {
 *     return {
 *       name: this.faker.person.fullName(),
 *       email: this.faker.internet.email(),
 *       password: 'password',
 *     };
 *   }
 * }
 *
 * // Usage in seeders
 * const userFactory = UserFactory.make(em);
 * // Or using static method:
 * const userFactory = UserFactory.make(em);
 *
 * // Make entities without persisting
 * const user = userFactory.makeOne();
 * const users = userFactory.make(10);
 *
 * // Create and persist entities
 * const persistedUser = await userFactory.createOne();
 * const persistedUsers = await userFactory.create(10);
 *
 * // Override attributes
 * const admin = userFactory.makeOne({ role: 'admin' });
 *
 * // Apply custom logic to each entity
 * const users = await userFactory.each((user) => {
 *   user.emailVerified = true;
 * }).create(5);
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseFactory<T extends BaseEntity = BaseEntity> extends Factory<T> {
  /**
   * Faker.js instance for generating fake data
   *
   * Provides access to all Faker.js methods for generating realistic
   * test data in factory definitions and state transformations.
   *
   * @protected
   * @readonly
   *
   * @example
   * ```typescript
   * protected definition(): Partial<User> {
   *   return {
   *     name: this.faker.person.fullName(),
   *     email: this.faker.internet.email(),
   *     password: this.faker.internet.password(),
   *   };
   * }
   * ```
   */
  protected readonly faker: Faker = faker;

  /**
   * Static factory method to create a factory instance
   *
   * Provides a convenient way to instantiate factories without using `new`.
   *
   * @param em - MikroORM EntityManager instance
   * @returns New factory instance
   *
   * @example
   * ```typescript
   * // Instead of: const factory = UserFactory.make(em);
   * const factory = UserFactory.make(em);
   *
   * // Usage:
   * const user = factory.makeOne();
   * const users = await factory.create(10);
   * ```
   */
  static make<T extends BaseEntity>(
    this: new (em: EntityManager) => BaseFactory<T>,
    em: EntityManager,
  ): BaseFactory<T> {
    return this.make(em);
  }

  // ========================================================================
  // FLUENT HELPER METHODS FOR MIXINS
  // ========================================================================

  /**
   * Add timestamps to the entity (createdAt, updatedAt)
   *
   * Automatically sets realistic timestamp values for entities using the
   * HasTimestamps mixin.
   *
   * @param createdAt - Optional custom createdAt date (defaults to recent past)
   * @param updatedAt - Optional custom updatedAt date (defaults to createdAt or now)
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Generate with default timestamps (recent past)
   * const posts = factory.withTimestamps().make(10);
   *
   * // Generate with custom timestamps
   * const oldPost = factory.withTimestamps(
   *   new Date('2020-01-01'),
   *   new Date('2023-06-15')
   * ).makeOne();
   *
   * // Chain with other methods
   * const users = factory
   *   .withTimestamps()
   *   .withUuid()
   *   .make(5);
   * ```
   */
  withTimestamps(createdAt?: Date, updatedAt?: Date): this {
    return this.each((entity: any) => {
      if ('createdAt' in entity) {
        entity.createdAt = createdAt ?? this.faker.date.recent({ days: 30 });
      }
      if ('updatedAt' in entity) {
        entity.updatedAt =
          updatedAt ??
          (createdAt ? this.faker.date.between({ from: createdAt, to: new Date() }) : new Date());
      }
    });
  }

  /**
   * Add UUID primary key to the entity
   *
   * Generates a valid UUID v4 for entities using the HasUuid mixin.
   *
   * @param customUuid - Optional custom UUID to use instead of generating one
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Generate with random UUIDs
   * const users = factory.withUuid().make(10);
   *
   * // Use a specific UUID
   * const user = factory.withUuid('550e8400-e29b-41d4-a716-446655440000').makeOne();
   *
   * // Chain with other methods
   * const posts = factory
   *   .withUuid()
   *   .withTimestamps()
   *   .withUserStamps(authorId)
   *   .make(20);
   * ```
   */
  withUuid(customUuid?: string): this {
    return this.each((entity: any) => {
      if ('id' in entity && (typeof entity.id === 'string' || !entity.id)) {
        entity.id = customUuid ?? this.faker.string.uuid();
      }
    });
  }

  /**
   * Add user stamps to the entity (createdBy, updatedBy, deletedBy)
   *
   * Sets user IDs for entities using the HasUserstamps mixin.
   *
   * @param userId - User ID to set as creator/updater (number or string)
   * @param options - Optional configuration for different user IDs per field
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Set all user stamps to the same user
   * const posts = factory.withUserStamps(123).make(10);
   *
   * // Set different users for create/update
   * const post = factory.withUserStamps(123, {
   *   updatedBy: 456,
   * }).makeOne();
   *
   * // Use with UUID user IDs
   * const posts = factory.withUserStamps('550e8400-e29b-41d4-a716-446655440000').make(5);
   *
   * // Include deletedBy for soft-deleted entities
   * const deletedPosts = factory.withUserStamps(123, {
   *   deletedBy: 789,
   * }).withSoftDeletes(new Date()).make(3);
   * ```
   */
  withUserStamps(
    userId: number | string,
    options?: {
      updatedBy?: number | string;
      deletedBy?: number | string;
    },
  ): this {
    return this.each((entity: any) => {
      if ('createdBy' in entity) {
        entity.createdBy = userId;
      }
      if ('updatedBy' in entity) {
        entity.updatedBy = options?.updatedBy ?? userId;
      }
      if ('deletedBy' in entity && options?.deletedBy !== undefined) {
        entity.deletedBy = options.deletedBy;
      }
    });
  }

  /**
   * Add soft delete timestamp to the entity
   *
   * Sets deletedAt timestamp for entities using the HasSoftDeletes mixin.
   * Useful for generating test data that represents deleted records.
   *
   * @param deletedAt - Optional custom deletedAt date (defaults to recent past)
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Generate soft-deleted entities (deleted recently)
   * const deletedPosts = factory.withSoftDeletes().make(5);
   *
   * // Generate entities deleted at a specific time
   * const oldDeletedPost = factory.withSoftDeletes(
   *   new Date('2022-01-01')
   * ).makeOne();
   *
   * // Combine with user stamps to track who deleted
   * const posts = factory
   *   .withSoftDeletes(new Date())
   *   .withUserStamps(123, { deletedBy: 456 })
   *   .make(3);
   * ```
   */
  withSoftDeletes(deletedAt?: Date): this {
    return this.each((entity: any) => {
      if ('deletedAt' in entity) {
        entity.deletedAt = deletedAt ?? this.faker.date.recent({ days: 7 });
      }
    });
  }

  /**
   * Mark entity as active
   *
   * Sets the isActive flag to true (common in entities with activation states).
   *
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Generate active users
   * const activeUsers = factory.active().make(10);
   *
   * // Chain with other methods
   * const users = factory
   *   .active()
   *   .withTimestamps()
   *   .make(20);
   * ```
   */
  active(): this {
    return this.each((entity: any) => {
      if ('isActive' in entity) {
        entity.isActive = true;
      }
    });
  }

  /**
   * Mark entity as inactive
   *
   * Sets the isActive flag to false (common in entities with activation states).
   *
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Generate inactive users
   * const inactiveUsers = factory.inactive().make(5);
   *
   * // Chain with other methods
   * const users = factory
   *   .inactive()
   *   .withTimestamps()
   *   .make(10);
   * ```
   */
  inactive(): this {
    return this.each((entity: any) => {
      if ('isActive' in entity) {
        entity.isActive = false;
      }
    });
  }

  /**
   * Apply custom state transformation
   *
   * Generic method to apply any custom transformation to entities.
   * Useful for creating reusable state transformations.
   *
   * @param stateName - Name of the state (for documentation/debugging)
   * @param callback - Function to transform the entity
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Create a verified user state
   * const verifiedUsers = factory.state('verified', (user) => {
   *   user.emailVerified = true;
   *   user.emailVerifiedAt = new Date();
   * }).make(10);
   *
   * // Create an admin user state
   * const admins = factory.state('admin', (user) => {
   *   user.role = 'admin';
   *   user.permissions = ['read', 'write', 'delete'];
   * }).make(3);
   *
   * // Chain multiple states
   * const users = factory
   *   .state('verified', (u) => u.emailVerified = true)
   *   .state('premium', (u) => u.subscription = 'premium')
   *   .make(5);
   * ```
   */
  state(stateName: string, callback: (entity: T) => void): this {
    return this.each(callback);
  }

  /**
   * Apply attributes conditionally
   *
   * Allows conditional application of attributes based on a boolean condition.
   *
   * @param condition - Boolean condition or function that returns boolean
   * @param callback - Function to apply if condition is true
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Conditionally add timestamps
   * const users = factory
   *   .when(includeTimestamps, (f) => f.withTimestamps())
   *   .make(10);
   *
   * // Conditional based on environment
   * const posts = factory
   *   .when(process.env.NODE_ENV === 'test', (f) => f.withUserStamps(1))
   *   .make(5);
   *
   * // Multiple conditional chains
   * const entities = factory
   *   .when(isActive, (f) => f.active())
   *   .when(hasTimestamps, (f) => f.withTimestamps())
   *   .make(20);
   * ```
   */
  when(condition: boolean | (() => boolean), callback: (factory: this) => this): this {
    const shouldApply = typeof condition === 'function' ? condition() : condition;
    return shouldApply ? callback(this) : this;
  }

  /**
   * Apply attributes unless condition is true
   *
   * Inverse of `when()` - applies callback if condition is false.
   *
   * @param condition - Boolean condition or function that returns boolean
   * @param callback - Function to apply if condition is false
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // Apply timestamps unless explicitly disabled
   * const users = factory
   *   .unless(disableTimestamps, (f) => f.withTimestamps())
   *   .make(10);
   *
   * // Skip soft deletes in production
   * const posts = factory
   *   .unless(process.env.NODE_ENV === 'production', (f) => f.withSoftDeletes())
   *   .make(5);
   * ```
   */
  unless(condition: boolean | (() => boolean), callback: (factory: this) => this): this {
    const shouldSkip = typeof condition === 'function' ? condition() : condition;
    return !shouldSkip ? callback(this) : this;
  }
}
