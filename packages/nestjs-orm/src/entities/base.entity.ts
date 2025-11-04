import { BaseEntity as MikroBaseEntity, PrimaryKey } from '@mikro-orm/core';

/**
 * Clean Base Entity
 *
 * Provides only essential functionality. Use mixins for additional features:
 * - HasTimestamps: for createdAt/updatedAt
 * - HasSoftDeletes: for deletedAt functionality
 * - HasUserstamps: for user tracking
 * - HasUuid: for UUID primary keys
 *
 * @example
 * ```typescript
 * // Entity with all features
 * @Entity()
 * export class User extends HasUserstamps(
 *   HasSoftDeletes(
 *     HasTimestamps(BaseEntity)
 *   ),
 *   UserEntity
 * ) {
 *   @Property()
 *   email: string;
 * }
 *
 * // Simple entity with just timestamps
 * @Entity()
 * export class Post extends HasTimestamps(BaseEntity) {
 *   @Property()
 *   title: string;
 * }
 * ```
 */
export abstract class BaseEntity extends MikroBaseEntity {
  /**
   * Primary key identifier
   *
   * Auto-incrementing integer primary key for the entity. This field is
   * automatically managed by the database and should not be manually set.
   * The value is assigned when the entity is first persisted to the database.
   *
   * @remarks
   * - Automatically incremented by the database
   * - Unique across all records in the table
   * - Cannot be null (required field)
   * - Immutable once set by the database
   */
  @PrimaryKey()
  id!: number;

  /**
   * Create a new entity instance (factory method)
   *
   * Static factory method that creates a new instance of the entity without
   * persisting it to the database. This provides a Laravel-style convenience
   * method for entity instantiation with initial data. The instance is not
   * managed by the EntityManager until explicitly persisted.
   *
   * This method is useful for:
   * - Creating entity instances in tests
   * - Building entities before validation
   * - Creating temporary entities for business logic
   * - Initializing entities with default values
   *
   * @template T - The entity type being created
   * @param data - Partial entity data to initialize the instance
   * @returns A new unmanaged entity instance with the provided data
   *
   * @example
   * ```typescript
   * // Create a new user instance without persisting
   * const user = User.make({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   isActive: true
   * });
   *
   * // Validate before saving
   * if (user.email.includes('@')) {
   *   await em.persistAndFlush(user);
   * }
   *
   * // Create multiple instances for testing
   * const users = [
   *   User.make({ name: 'Alice', email: 'alice@example.com' }),
   *   User.make({ name: 'Bob', email: 'bob@example.com' })
   * ];
   * ```
   *
   * @remarks
   * - The created instance is not persisted to the database
   * - The instance is not managed by the EntityManager
   * - To persist, use EntityManager.persistAndFlush() or Repository.insert()
   * - This method does not trigger database-level defaults or auto-increment
   *
   * @see {@link fill} For modifying existing instances
   * @see {@link save} For persisting the instance
   * @since 1.0.0
   */
  static make<T extends BaseEntity>(this: new () => T, data?: Partial<T>): T {
    // Create a new instance using the entity's constructor
    // 'this' refers to the entity class itself (e.g., User, Post, etc.)
    const instance = new this();

    // If initial data is provided, assign it to the instance
    // This uses Object.assign for shallow property copying
    if (data) {
      Object.assign(instance, data);
    }

    // Return the newly created instance
    // The instance is not yet persisted or managed by the EntityManager
    return instance;
  }

  /**
   * Fill entity with data
   *
   * Populates the current entity instance with the provided data using shallow
   * assignment. This method modifies the existing instance and returns it for
   * method chaining. Unlike the static `make()` method, this works on an
   * already instantiated entity.
   *
   * @param data - Partial entity data to merge into the instance
   * @returns The entity instance for method chaining
   *
   * @example
   * ```typescript
   * const user = await userRepository.findOne({ id: 123 });
   * user.fill({ name: 'Updated Name', isActive: false });
   * await user.save();
   * ```
   *
   * @see {@link make} For creating new instances
   */
  fill(data: Partial<this>): this {
    Object.assign(this, data);
    return this;
  }

  /**
   * Get entity attributes as array
   */
  getAttributes(): string[] {
    const helper = (this as any).__helper;
    return helper ? Object.keys(helper.getMetadata().properties) : [];
  }

  /**
   * Get dirty attributes (changed since last sync)
   */
  getDirty(): string[] {
    const helper = (this as any).__helper;
    return helper && helper.isDirty() ? Object.keys(helper.getPayload()) : [];
  }

  /**
   * Check if entity has changes
   */
  isDirty(attribute?: string): boolean {
    if (attribute) {
      return this.getDirty().includes(attribute);
    }
    const helper = (this as any).__helper;
    return helper ? helper.isDirty() : false;
  }

  /**
   * Get original value of an attribute
   */
  getOriginal<K extends keyof this>(attribute: K): this[K] | undefined {
    const helper = (this as any).__helper;
    const snapshot = helper ? helper.getOriginSnapshot() : null;
    return snapshot ? snapshot[attribute as string] : undefined;
  }

  /**
   * Check if attribute was changed
   */
  wasChanged(attribute?: keyof this): boolean {
    if (attribute) {
      return this.getDirty().includes(attribute as string);
    }
    const helper = (this as any).__helper;
    return helper ? helper.isDirty() : false;
  }

  /**
   * Refresh entity from database
   */
  async refresh(): Promise<this> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.refresh();
    }
    return this;
  }

  /**
   * Save the entity
   */
  async save(): Promise<this> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.persistAndFlush();
    }
    return this;
  }

  /**
   * Delete the entity (hard delete)
   */
  async delete(): Promise<void> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.remove();
    }
  }
}
