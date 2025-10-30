/**
 * Seeder Interface
 *
 * Defines the contract for database seeders following Laravel Eloquent patterns.
 * Provides a standardized way to populate databases with test or initial data.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface ISeeder {
  /**
   * Run the seeder
   *
   * This method contains the logic to populate the database with data.
   * It should be idempotent where possible and handle existing data gracefully.
   *
   * @returns Promise resolving when seeding is complete
   *
   * @example
   * ```typescript
   * async run(): Promise<void> {
   *   const users = await this.factoryManager.createMany(User, 10);
   *   console.log(`Created ${users.length} users`);
   * }
   * ```
   */
  run(): Promise<void>;

  /**
   * Optional cleanup method
   *
   * Called when rolling back or cleaning up seeded data.
   * Not all seeders need to implement this method.
   *
   * @returns Promise resolving when cleanup is complete
   *
   * @example
   * ```typescript
   * async rollback(): Promise<void> {
   *   await this.entityManager.createQueryBuilder(User)
   *     .delete()
   *     .where({ email: { $like: '%@seeder.test' } })
   *     .execute();
   * }
   * ```
   */
  rollback?(): Promise<void>;
}
