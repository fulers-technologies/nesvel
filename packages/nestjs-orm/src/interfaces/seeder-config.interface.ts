import type { ISeeder } from './seeder.interface';

/**
 * Seeder Configuration Interface
 *
 * Configuration options for seeder behavior and execution.
 * Provides fine-grained control over when and how seeders run.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface ISeederConfig {
  /**
   * Seeder priority for execution order
   *
   * Lower numbers run first. Useful for ensuring dependencies
   * are seeded before dependent data.
   *
   * @default 0
   *
   * @example
   * ```typescript
   * // RoleSeeder runs first
   * priority: 1
   *
   * // UserSeeder runs after RoleSeeder
   * priority: 2
   * ```
   */
  priority?: number;

  /**
   * Whether this seeder should run in production environments
   *
   * Safety mechanism to prevent accidental seeding in production.
   * Can be overridden with force flag.
   *
   * @default false
   *
   * @example
   * ```typescript
   * // Allow in production for essential data
   * runInProduction: true
   * ```
   */
  runInProduction?: boolean;

  /**
   * Environments where this seeder should run
   *
   * Whitelist of environment names where this seeder is allowed to execute.
   *
   * @default ['development', 'testing', 'local']
   *
   * @example
   * ```typescript
   * // Only run in development and testing
   * environments: ['development', 'testing']
   *
   * // Run in all environments
   * environments: ['*']
   * ```
   */
  environments?: string[];

  /**
   * Whether to use database transactions
   *
   * When enabled, all seeder operations are wrapped in a transaction
   * and rolled back if any operation fails.
   *
   * @default true
   *
   * @example
   * ```typescript
   * // Disable for seeders that need to commit incrementally
   * useTransactions: false
   * ```
   */
  useTransactions?: boolean;

  /**
   * Custom description for the seeder
   *
   * Human-readable description of what this seeder does.
   * Used for logging and documentation purposes.
   *
   * @example
   * ```typescript
   * description: 'Creates initial admin users and default roles'
   * ```
   */
  description?: string;

  /**
   * Dependencies - other seeders that must run before this one
   *
   * Array of seeder classes that this seeder depends on.
   * The seeder manager will ensure dependencies run first.
   *
   * @example
   * ```typescript
   * // UserSeeder depends on RoleSeeder
   * dependencies: [RoleSeeder, PermissionSeeder]
   * ```
   */
  dependencies?: (new () => ISeeder)[];

  /**
   * Whether to skip this seeder if it has already been run
   *
   * Requires seeder tracking to be enabled in the seeder manager.
   * Prevents duplicate seeding of the same data.
   *
   * @default false
   *
   * @example
   * ```typescript
   * // Skip if already run (requires tracking)
   * skipIfExists: true
   * ```
   */
  skipIfExists?: boolean;
}
