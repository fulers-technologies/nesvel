/**
 * Factory Interface
 *
 * Defines the contract for model factories following Laravel Eloquent factory patterns.
 * Provides a fluent API for generating test data and seeding databases.
 *
 * @template T - The entity type this factory creates
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface IFactory<T = any> {
  /**
   * Create a single model instance without persisting to database
   *
   * @param attributes - Optional attributes to override defaults
   * @returns Promise resolving to the created model instance
   *
   * @example
   * ```typescript
   * const user = await UserFactory.make({ name: 'John Doe' });
   * // User instance created but not saved to database
   * ```
   */
  make(attributes?: Partial<T>): Promise<T>;

  /**
   * Create multiple model instances without persisting to database
   *
   * @param count - Number of instances to create
   * @param attributes - Optional attributes to apply to all instances
   * @returns Promise resolving to array of model instances
   *
   * @example
   * ```typescript
   * const users = await UserFactory.makeMany(5);
   * // Array of 5 user instances created but not saved
   * ```
   */
  makeMany(count: number, attributes?: Partial<T>): Promise<T[]>;

  /**
   * Create and persist a single model instance to database
   *
   * @param attributes - Optional attributes to override defaults
   * @returns Promise resolving to the persisted model instance
   *
   * @example
   * ```typescript
   * const user = await UserFactory.create({ email: 'john@example.com' });
   * // User created and saved to database
   * ```
   */
  create(attributes?: Partial<T>): Promise<T>;

  /**
   * Create and persist multiple model instances to database
   *
   * @param count - Number of instances to create and persist
   * @param attributes - Optional attributes to apply to all instances
   * @returns Promise resolving to array of persisted model instances
   *
   * @example
   * ```typescript
   * const users = await UserFactory.createMany(10);
   * // Array of 10 users created and saved to database
   * ```
   */
  createMany(count: number, attributes?: Partial<T>): Promise<T[]>;

  /**
   * Apply a state transformation to the factory
   *
   * States allow you to define specific variations of your model data.
   * Common states might be 'admin', 'active', 'suspended', etc.
   *
   * @param state - The state name to apply
   * @param parameters - Optional parameters to pass to the state
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * const adminUser = await UserFactory.state('admin').create();
   * const suspendedUsers = await UserFactory.state('suspended').createMany(5);
   * ```
   */
  state(state: string, ...parameters: any[]): IFactory<T>;

  /**
   * Set up relationships when creating models
   *
   * Allows you to create related models and establish relationships
   * automatically during factory execution.
   *
   * @param relationName - The name of the relationship to populate
   * @param factory - Factory instance or callback to create related models
   * @param count - Number of related models to create (for has-many relationships)
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * // User with 5 posts
   * const user = await UserFactory
   *   .with('posts', PostFactory, 5)
   *   .create();
   *
   * // Post with a specific user
   * const post = await PostFactory
   *   .with('author', UserFactory.state('admin'))
   *   .create();
   * ```
   */
  with(
    relationName: string,
    factory: IFactory<any> | (() => Promise<any>),
    count?: number,
  ): IFactory<T>;

  /**
   * Override specific attributes for the next creation
   *
   * Similar to passing attributes to make/create but allows for
   * more complex attribute building and method chaining.
   *
   * @param attributes - Attributes to override
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * const user = await UserFactory
   *   .set({ name: 'Jane Doe', role: 'admin' })
   *   .create();
   * ```
   */
  set(attributes: Partial<T>): IFactory<T>;

  /**
   * Apply a sequence to generate incremental data
   *
   * Useful for creating unique values across multiple instances,
   * like email addresses, usernames, or sequential numbers.
   *
   * @param callback - Function that receives sequence index
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * const users = await UserFactory
   *   .sequence((index) => ({
   *     email: `user${index}@example.com`,
   *     username: `user_${index}`
   *   }))
   *   .createMany(10);
   * ```
   */
  sequence(callback: (index: number) => Partial<T>): IFactory<T>;

  /**
   * Apply conditional logic to factory creation
   *
   * Allows you to conditionally apply attributes or states
   * based on runtime conditions.
   *
   * @param condition - Boolean condition or function returning boolean
   * @param callback - Callback to apply if condition is true
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * const user = await UserFactory
   *   .when(process.env.NODE_ENV === 'test', (factory) =>
   *     factory.state('verified')
   *   )
   *   .create();
   * ```
   */
  when(
    condition: boolean | (() => boolean),
    callback: (factory: IFactory<T>) => IFactory<T>,
  ): IFactory<T>;

  /**
   * Reset the factory to its default state
   *
   * Clears all applied states, relationships, sequences, and overrides.
   * Useful when reusing factory instances.
   *
   * @returns Factory instance for method chaining
   *
   * @example
   * ```typescript
   * const factory = UserFactory.state('admin').set({ name: 'Test' });
   * await factory.create(); // Creates admin user with name 'Test'
   *
   * const normalUser = await factory.reset().create(); // Creates normal user
   * ```
   */
  reset(): IFactory<T>;
}
