import { Constructor } from '@nesvel/shared';
import { helper, BaseEntity as MikroBaseEntity, wrap } from '@mikro-orm/core';

/**
 * Fluent Base Entity
 *
 * Extends MikroORM's BaseEntity with Laravel-inspired convenience methods
 * for better developer experience. All MikroORM native methods remain available.
 *
 * Features:
 * - Laravel-style factory methods (make, create)
 * - Fluent assignment and persistence (fill, save, delete, refresh)
 * - Change tracking (isDirty, getDirty, getOriginal, wasChanged)
 * - All native MikroORM methods (assign, populate, serialize, etc.)
 *
 * Use mixins for additional features:
 * - HasTimestamps: for createdAt/updatedAt
 * - HasSoftDeletes: for deletedAt functionality
 * - HasUserstamps: for user tracking
 * - HasUuid: for UUID primary keys
 *
 * @example
 * ```typescript
 * @Entity()
 * export class User extends BaseEntity {
 *   @PrimaryKey()
 *   id!: number;
 *
 *   @Property()
 *   email!: string;
 *
 *   @Property()
 *   name!: string;
 * }
 *
 * // Laravel-style usage
 * const user = User.make({ email: 'john@example.com', name: 'John' });
 * await user.save();
 *
 * // Or with MikroORM native methods
 * const user = em.create(User, { email: 'john@example.com' });
 * await em.persistAndFlush(user);
 * ```
 */
export abstract class BaseEntity extends MikroBaseEntity {
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
  static make<T extends BaseEntity>(this: Constructor<T>, data?: Partial<T>): T {
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
   * Fill entity with data (Laravel-style)
   *
   * Uses MikroORM's native assign() under the hood for proper change tracking.
   * This method modifies the existing instance and returns it for method chaining.
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
   * @see {@link assign} For MikroORM's native method with more options
   */
  fill(data: Partial<this>): this {
    wrap(this).assign(data as any);
    return this;
  }

  // ============================================================================
  // ATTRIBUTE INSPECTION METHODS
  // ============================================================================

  /**
   * Get entity attributes as array
   *
   * Returns all property names defined in the entity metadata.
   *
   * @returns Array of property names
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.getAttributes(); // ['id', 'name', 'email', 'createdAt', ...]
   * ```
   */
  getAttributes(): string[] {
    const h = helper(this);
    return h ? Object.keys(h.__meta.properties) : [];
  }

  /**
   * Get original value of an attribute (before changes)
   *
   * Returns the value of a property as it was when loaded from the database.
   *
   * @param attribute - The property name to get the original value for
   * @returns The original value, or undefined if not available
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * console.log(user.name); // 'John'
   * user.name = 'Jane';
   * console.log(user.name); // 'Jane'
   * console.log(user.getOriginal('name')); // 'John'
   * ```
   */
  getOriginal<K extends keyof this>(attribute: K): this[K] | undefined {
    const wrapped = wrap(this, true);
    const original = wrapped.__originalEntityData;
    return original ? (original as any)[attribute as string] : undefined;
  }

  // ============================================================================
  // CHANGE TRACKING METHODS
  // ============================================================================

  /**
   * Get dirty attributes (changed since last sync)
   *
   * Returns the list of properties that have been modified since the entity
   * was loaded from the database or last persisted.
   *
   * Note: This performs a shallow comparison. For deep object comparison,
   * consider using JSON.stringify or custom comparison logic.
   *
   * @returns Array of property names that have been changed
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'New Name';
   * user.getDirty(); // ['name']
   * ```
   */
  getDirty(): string[] {
    const wrapped = wrap(this, true);
    if (!wrapped.__initialized) return [];

    const payload = wrapped.toPOJO() as Record<string, any>;
    const original = wrapped.__originalEntityData as Record<string, any> | undefined;

    if (!original) return [];

    const dirty: string[] = [];
    for (const key in payload) {
      if (payload[key] !== original[key]) {
        dirty.push(key);
      }
    }
    return dirty;
  }

  /**
   * Check if entity has changes
   *
   * @param attribute - Optional specific attribute to check
   * @returns True if entity (or specific attribute) has been modified
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'New Name';
   * user.isDirty(); // true
   * user.isDirty('name'); // true
   * user.isDirty('email'); // false
   * ```
   */
  isDirty(attribute?: string): boolean {
    if (attribute) {
      return this.getDirty().includes(attribute);
    }
    return this.getDirty().length > 0;
  }

  /**
   * Get changes with their current values
   *
   * Returns an object containing only the properties that have changed,
   * with their current (new) values. More convenient than getDirty() when
   * you need the actual values.
   *
   * @returns Object with changed properties and their new values
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'Jane';
   * user.email = 'jane@example.com';
   * user.getChanges(); // { name: 'Jane', email: 'jane@example.com' }
   * ```
   */
  getChanges(): Partial<this> {
    const dirty = this.getDirty();
    const changes: Partial<this> = {};
    dirty.forEach((key) => {
      (changes as any)[key] = (this as any)[key];
    });
    return changes;
  }

  /**
   * Check if attribute was changed (alias for isDirty)
   *
   * @param attribute - Optional specific attribute to check
   * @returns True if entity (or specific attribute) has been modified
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'Jane';
   * user.wasChanged(); // true
   * user.wasChanged('name'); // true
   * ```
   */
  wasChanged(attribute?: keyof this): boolean {
    return this.isDirty(attribute as string);
  }

  // ============================================================================
  // PERSISTENCE METHODS
  // ============================================================================

  /**
   * Update and save entity in one call (Laravel-style)
   *
   * Combines fill() and save() into a single convenient method.
   * Updates the entity with provided data and persists immediately.
   *
   * @param data - Partial entity data to update
   * @returns The updated and saved entity instance
   * @throws Error if entity is not managed by an EntityManager
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * await user.update({ name: 'Jane', email: 'jane@example.com' });
   * ```
   */
  async update(data: Partial<this>): Promise<this> {
    return this.fill(data).save();
  }

  /**
   * Save the entity (Laravel-style)
   *
   * Persists the entity to the database and flushes changes immediately.
   * For new entities, inserts them. For existing entities, updates them.
   *
   * @returns The saved entity instance
   * @throws Error if entity is not managed by an EntityManager
   *
   * @example
   * ```typescript
   * // Create and save new entity
   * const user = User.make({ email: 'john@example.com', name: 'John' });
   * await user.save();
   *
   * // Update existing entity
   * user.name = 'Jane';
   * await user.save();
   * ```
   */
  async save(): Promise<this> {
    const wrapped = wrap(this, true);
    const em = (wrapped as any).__em;
    if (!em) {
      throw new Error('Entity is not managed. Cannot save. Use em.persist() first.');
    }
    await em.persistAndFlush(this);
    return this;
  }

  /**
   * Delete the entity (Laravel-style hard delete)
   *
   * Removes the entity from the database permanently and flushes immediately.
   * For soft deletes, use the HasSoftDeletes mixin instead.
   *
   * @throws Error if entity is not managed by an EntityManager
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * await user.delete(); // Permanently removes from database
   * ```
   *
   * @see HasSoftDeletes For soft delete functionality
   */
  async delete(): Promise<void> {
    const wrapped = wrap(this, true);
    const em = (wrapped as any).__em;
    if (!em) {
      throw new Error('Entity is not managed. Cannot delete.');
    }
    await em.removeAndFlush(this);
  }

  /**
   * Refresh entity from database (Laravel-style)
   *
   * Reloads the entity data from the database, discarding any local changes.
   * Useful when you want to revert changes or get the latest database state.
   *
   * @returns The refreshed entity instance
   * @throws Error if entity is not managed by an EntityManager
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'Changed';
   * await user.refresh(); // Reverts to database value
   * ```
   */
  async refresh(): Promise<this> {
    const wrapped = wrap(this, true);
    const em = (wrapped as any).__em;
    if (!em) {
      throw new Error('Entity is not managed. Cannot refresh.');
    }
    await em.refresh(this);
    return this;
  }

  /**
   * Get a fresh instance from database (Laravel-style)
   *
   * Fetches a new instance of the entity from the database without
   * affecting the current instance. Returns null if entity doesn't exist
   * or if the entity has no primary key set.
   *
   * @returns A new entity instance from database, or null
   * @throws Error if entity is not managed by an EntityManager
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'Changed locally';
   * const freshUser = await user.fresh();
   * console.log(user.name); // 'Changed locally'
   * console.log(freshUser?.name); // Original database value
   * ```
   */
  async fresh(): Promise<this | null> {
    const wrapped = wrap(this, true);
    const em = (wrapped as any).__em;
    if (!em) {
      throw new Error('Entity is not managed. Cannot fetch fresh instance.');
    }

    // Get primary key value(s) using MikroORM's metadata
    const pk = wrapped.getPrimaryKey();
    if (!pk) return null;

    return em.findOne(this.constructor as any, pk);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Replicate/clone the entity (Laravel-style)
   *
   * Creates a copy of the entity without the primary key(s), useful for
   * duplicating records. Optionally exclude specific attributes.
   *
   * Note: This creates a shallow copy. For entities with complex nested
   * objects, consider implementing custom cloning logic.
   *
   * @param except - Array of attribute names to exclude from the clone
   * @returns A new unmanaged entity instance (not persisted)
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * const clone = user.replicate(['email']); // Clone without email
   * clone.email = 'newemail@example.com';
   * await em.persistAndFlush(clone);
   * ```
   */
  replicate(except: (keyof this)[] = []): this {
    const Constructor = this.constructor as new () => this;
    const wrapped = wrap(this, true);
    const data = wrapped.toPOJO();

    // Remove primary key(s) using metadata
    const primaryKeys = wrapped.__meta.primaryKeys;
    primaryKeys.forEach((pk) => delete (data as any)[pk]);

    // Remove specified attributes
    except.forEach((key) => delete (data as any)[key]);

    return (Constructor as any).make(data);
  }

  /**
   * Get only specified attributes (Laravel-style)
   *
   * Returns an object containing only the specified properties.
   * Useful for API responses or when you need a subset of data.
   *
   * @param keys - Property names to include
   * @returns Object with only the specified properties
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * const data = user.only('id', 'name', 'email');
   * // Returns: { id: 1, name: 'John', email: 'john@example.com' }
   * ```
   */
  only<K extends keyof this>(...keys: K[]): Pick<this, K> {
    const result = {} as Pick<this, K>;
    keys.forEach((key) => (result[key] = this[key]));
    return result;
  }

  /**
   * Get all attributes except specified ones (Laravel-style)
   *
   * Returns an object with all properties except the specified ones.
   * Useful for excluding sensitive data from API responses.
   *
   * @param keys - Property names to exclude
   * @returns Object without the specified properties
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * const data = user.except('password', 'token');
   * // Returns all properties except password and token
   * ```
   */
  except<K extends keyof this>(...keys: K[]): Omit<this, K> {
    const data = { ...this };
    keys.forEach((key) => delete (data as any)[key]);
    return data as Omit<this, K>;
  }

  /**
   * Get the primary key value of the entity
   *
   * Returns the primary key value, handling both single and composite keys.
   *
   * @returns Primary key value or array of values for composite keys
   *
   * @example
   * ```typescript
   * const userId = user.getPrimaryKey();
   * console.log(userId); // 123
   * ```
   */
  getPrimaryKey(): any {
    const wrapped = wrap(this, true);
    return wrapped.getPrimaryKey();
  }

  /**
   * Check if entity is persisted to database
   *
   * Returns true if the entity has been saved to database (has a primary key).
   *
   * @returns Boolean indicating if entity is persisted
   *
   * @example
   * ```typescript
   * const user = User.make({ name: 'John' });
   * console.log(user.isPersisted()); // false
   *
   * await user.save();
   * console.log(user.isPersisted()); // true
   * ```
   */
  isPersisted(): boolean {
    const pk = this.getPrimaryKey();
    return pk != null && pk !== undefined;
  }

  /**
   * Get entity as plain object
   *
   * Converts the entity to a plain JavaScript object.
   *
   * @returns Plain object representation
   *
   * @example
   * ```typescript
   * const userObj = user.toObject();
   * console.log(userObj); // { id: 1, name: 'John', ... }
   * ```
   */
  toObject(): Record<string, any> {
    return wrap(this, true).toPOJO();
  }

  /**
   * Get entity as JSON
   *
   * Returns a JSON-serializable representation of the entity.
   *
   * @returns JSON representation
   *
   * @example
   * ```typescript
   * const json = user.toJSON();
   * console.log(JSON.stringify(json));
   * ```
   */
  toJSON(): Record<string, any> {
    return wrap(this, true).toJSON();
  }

  /**
   * Check if entity is initialized
   *
   * Returns true if entity is fully loaded (not a reference/proxy).
   *
   * @returns Boolean indicating if entity is initialized
   *
   * @example
   * ```typescript
   * if (user.isInitialized()) {
   *   console.log(user.name); // Safe to access
   * }
   * ```
   */
  isInitialized(): boolean {
    return wrap(this, true).__initialized;
  }

  /**
   * Get the entity manager instance
   *
   * Returns the EntityManager associated with this entity.
   *
   * @returns EntityManager instance
   *
   * @example
   * ```typescript
   * const em = user.getEntityManager();
   * await em.flush();
   * ```
   */
  getEntityManager() {
    return helper(this).__em;
  }

  /**
   * Get entity metadata
   *
   * Returns the MikroORM metadata for this entity type.
   *
   * @returns Entity metadata
   *
   * @example
   * ```typescript
   * const metadata = user.getMetadata();
   * console.log(metadata.tableName);
   * console.log(metadata.properties);
   * ```
   */
  getMetadata() {
    return helper(this).__em?.getMetadata().get(this.constructor.name);
  }

  // ============================================================================
  // COMPARISON METHODS
  // ============================================================================

  /**
   * Check if two entities are the same (same PK and type)
   *
   * Compares two entity instances to determine if they represent the same
   * database record. Checks both entity type and primary key value(s).
   * Essential for identity checking and preventing duplicates.
   *
   * @param other - Another entity to compare with
   * @returns True if both entities are the same record
   *
   * @example
   * ```typescript
   * const user1 = await em.findOne(User, 1);
   * const user2 = await em.findOne(User, 1);
   * const user3 = await em.findOne(User, 2);
   *
   * console.log(user1.is(user2)); // true - same ID
   * console.log(user1.is(user3)); // false - different IDs
   * console.log(user1.is(null)); // false - null comparison
   *
   * // Useful in conditional logic
   * if (currentUser.is(postAuthor)) {
   *   console.log('You are the author of this post');
   * }
   *
   * // Prevent self-following
   * if (follower.is(followee)) {
   *   throw new Error('Cannot follow yourself');
   * }
   * ```
   *
   * @remarks
   * - Returns false if other is null or undefined
   * - Compares entity types (must be same class)
   * - Compares primary key values
   * - Handles composite primary keys
   * - Uses JSON.stringify for reliable comparison
   *
   * @see {@link isNot} For negated comparison
   */
  is(other: BaseEntity | null | undefined): boolean {
    if (!other) return false;
    if (this.constructor !== other.constructor) return false;

    const thisPk = this.getPrimaryKey();
    const otherPk = other.getPrimaryKey();

    if (!thisPk || !otherPk) return false;

    return JSON.stringify(thisPk) === JSON.stringify(otherPk);
  }

  /**
   * Check if two entities are different
   *
   * Inverse of is(). Returns true if entities are different or if
   * comparison entity is null/undefined. Convenient for negative checks.
   *
   * @param other - Another entity to compare with
   * @returns True if entities are different
   *
   * @example
   * ```typescript
   * const currentUser = await em.findOne(User, userId);
   * const author = await em.findOne(User, authorId);
   *
   * if (currentUser.isNot(author)) {
   *   console.log('Different users');
   * }
   *
   * // Guard clauses
   * if (user.isNot(admin)) {
   *   throw UnauthorizedException.make();
   * }
   * ```
   *
   * @see {@link is} For positive comparison
   */
  isNot(other: BaseEntity | null | undefined): boolean {
    return !this.is(other);
  }

  /**
   * Check if entity is clean (no changes)
   *
   * Returns true if the entity has not been modified since loading or last save.
   * Opposite of isDirty(). Useful for validation and conditional logic.
   *
   * @returns True if entity has no changes
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * console.log(user.isClean()); // true
   *
   * user.name = 'New Name';
   * console.log(user.isClean()); // false
   *
   * // Guard against unnecessary saves
   * if (user.isClean()) {
   *   console.log('No changes to save');
   *   return;
   * }
   * ```
   *
   * @see {@link isDirty} For checking if entity has changes
   */
  isClean(): boolean {
    return !this.isDirty();
  }

  /**
   * Get all original values
   *
   * Returns all attribute values as they were when the entity was loaded
   * from the database or last persisted. Useful for tracking what changed
   * and implementing undo functionality.
   *
   * @returns Object with all original attribute values
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   * user.name = 'Jane';
   *
   * const original = user.getAllOriginal();
   * console.log(original.name); // Original name
   * ```
   *
   * @see {@link getOriginal} For getting single original value
   */
  getAllOriginal(): Record<string, any> {
    const wrapped = wrap(this, true);
    return wrapped.__originalEntityData || {};
  }

  /**
   * Convert to JSON string
   *
   * Serializes the entity to a JSON string. Optionally formats with indentation
   * for readability. Convenience wrapper around JSON.stringify(toJSON()).
   *
   * @param pretty - Whether to format with indentation (default: false)
   * @returns JSON string representation
   *
   * @example
   * ```typescript
   * const user = await em.findOne(User, 1);
   *
   * // Compact JSON
   * const json = user.toJsonString();
   *
   * // Pretty-printed JSON
   * const prettyJson = user.toJsonString(true);
   * ```
   *
   * @see {@link toJSON} For getting JSON object
   */
  toJsonString(pretty: boolean = false): string {
    const obj = this.toJSON();
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  }

  /**
   * Get only filled attributes (non-null/undefined)
   *
   * Returns an object containing only attributes that have truthy values.
   * Filters out null and undefined values. Useful for partial updates.
   *
   * @returns Object with only non-null/undefined attributes
   *
   * @example
   * ```typescript
   * const user = User.make({
   *   name: 'John',
   *   email: 'john@example.com',
   *   phone: null,
   *   address: undefined
   * });
   *
   * const filled = user.getFilled();
   * // { name: 'John', email: 'john@example.com' }
   * ```
   *
   * @see {@link only} For selecting specific attributes
   */
  getFilled(): Record<string, any> {
    const obj = this.toObject();
    return Object.entries(obj)
      .filter(([_, value]) => value !== null && value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }
}
