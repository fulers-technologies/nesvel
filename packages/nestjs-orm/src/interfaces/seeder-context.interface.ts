/**
 * Seeder Execution Context Interface
 *
 * Provides context and utilities to seeders during execution.
 * Contains runtime information about the environment, arguments,
 * and execution settings.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface ISeederContext {
  /**
   * Current environment (development, testing, production, etc.)
   *
   * Used by seeders to determine if they should run and how
   * they should behave in different environments.
   *
   * @example 'development', 'testing', 'production', 'staging'
   */
  environment: string;

  /**
   * Command line arguments passed to the seeder
   *
   * Key-value pairs of arguments that were passed when
   * running the seeder command. Useful for customizing
   * seeder behavior based on runtime parameters.
   *
   * @example
   * ```typescript
   * {
   *   count: 100,
   *   type: 'admin',
   *   skipExisting: true
   * }
   * ```
   */
  args: Record<string, any>;

  /**
   * Whether to run in verbose mode
   *
   * When true, seeders should output detailed information
   * about their operations for debugging and monitoring.
   *
   * @default false
   */
  verbose: boolean;

  /**
   * Whether to force execution (ignore environment restrictions)
   *
   * When true, seeders will run even if they're normally
   * restricted in the current environment (e.g., production).
   *
   * @default false
   *
   * @example
   * ```typescript
   * // Force run production seeder in production
   * force: true
   * ```
   */
  force: boolean;

  /**
   * Database connection name to use
   *
   * Optional connection name for multi-database setups.
   * If not specified, the default connection is used.
   *
   * @example 'primary', 'analytics', 'logging'
   */
  connection?: string;
}
