/**
 * Factory Configuration Interface
 *
 * Configuration options for factory behavior and database interaction.
 * Provides fine-grained control over how factories create and persist entities.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface IFactoryConfig {
  /**
   * Whether to automatically persist created models
   *
   * When enabled, calling create() or createMany() will automatically
   * persist entities to the database. When disabled, entities are only
   * created in memory.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // Auto-persist enabled (default)
   * const user = await UserFactory.create(); // Saved to database
   *
   * // Auto-persist disabled
   * const user = await UserFactory.create(); // Only in memory
   * await entityManager.persistAndFlush(user); // Manual persistence required
   * ```
   */
  autoPersist?: boolean;

  /**
   * Whether to use database transactions for factory operations
   *
   * When enabled, all factory operations within a single call will be
   * wrapped in a database transaction. Useful for ensuring data consistency
   * and enabling rollbacks on failures.
   *
   * @default false
   *
   * @example
   * ```typescript
   * // With transactions enabled
   * const users = await UserFactory.createMany(10);
   * // All 10 users created in a single transaction
   * ```
   */
  useTransactions?: boolean;

  /**
   * Whether to automatically flush the EntityManager after creates
   *
   * When enabled, the EntityManager.flush() method is called automatically
   * after each create operation. When disabled, changes remain in the
   * identity map until manually flushed.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // Auto-flush enabled (default)
   * const user = await UserFactory.create(); // Immediately available in database
   *
   * // Auto-flush disabled
   * const user = await UserFactory.create(); // In identity map only
   * await entityManager.flush(); // Manual flush required
   * ```
   */
  autoFlush?: boolean;

  /**
   * Default batch size for bulk operations
   *
   * When creating multiple entities with createMany(), this setting
   * controls how many entities are processed in each batch. Larger
   * batches are more efficient but use more memory.
   *
   * @default 100
   *
   * @example
   * ```typescript
   * // With batchSize: 50
   * await UserFactory.createMany(150);
   * // Creates users in 3 batches of 50 each
   * ```
   */
  batchSize?: number;

  /**
   * Whether to validate entities before persisting
   *
   * When enabled, entities are validated against their constraints
   * before being persisted to the database. Validation errors will
   * prevent persistence and throw an exception.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // With validation enabled
   * const user = await UserFactory.create({ email: 'invalid-email' });
   * // Throws validation error before persistence
   * ```
   */
  validateBeforePersist?: boolean;

  /**
   * Custom callback for post-creation processing
   *
   * Called after each entity is created and optionally persisted.
   * Useful for performing additional setup, logging, or side effects.
   *
   * @param entity - The created entity
   * @returns Promise<void> or void
   *
   * @example
   * ```typescript
   * afterCreate: async (user: User) => {
   *   console.log(`Created user: ${user.email}`);
   *   await emailService.sendWelcomeEmail(user);
   * }
   * ```
   */
  afterCreate?: <T>(entity: T) => Promise<void> | void;

  /**
   * Custom callback for pre-creation processing
   *
   * Called before entity creation with the final attributes.
   * Can modify attributes or perform validation before entity instantiation.
   *
   * @param attributes - The attributes about to be used for creation
   * @returns Modified attributes or Promise resolving to modified attributes
   *
   * @example
   * ```typescript
   * beforeCreate: async (attributes: Partial<User>) => {
   *   // Hash password if provided
   *   if (attributes.password) {
   *     attributes.password = await bcrypt.hash(attributes.password, 10);
   *   }
   *   return attributes;
   * }
   * ```
   */
  beforeCreate?: <T>(attributes: Partial<T>) => Promise<Partial<T>> | Partial<T>;
}
