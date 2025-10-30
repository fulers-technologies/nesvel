/**
 * Seeder Result Interface
 *
 * Contains information about seeder execution results.
 * Used for tracking, reporting, and debugging seeder operations.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface ISeederResult {
  /**
   * Name of the seeder that was executed
   *
   * Typically the class name of the seeder.
   *
   * @example 'UserSeeder', 'RoleSeeder'
   */
  seederName: string;

  /**
   * Whether the seeder executed successfully
   *
   * True if the seeder completed without errors,
   * false if any errors occurred during execution.
   */
  success: boolean;

  /**
   * Execution time in milliseconds
   *
   * Total time taken from start to completion,
   * useful for performance monitoring and optimization.
   *
   * @example 1250 // 1.25 seconds
   */
  executionTime: number;

  /**
   * Number of records created/affected
   *
   * Optional count of database records that were
   * created, updated, or otherwise affected by the seeder.
   *
   * @example 150 // Created 150 user records
   */
  recordsAffected?: number;

  /**
   * Error message if execution failed
   *
   * Contains the error message if success is false.
   * Undefined if the seeder executed successfully.
   *
   * @example 'Duplicate key constraint violation'
   */
  error?: string;

  /**
   * Additional metadata about the execution
   *
   * Flexible object for storing additional information
   * about the seeder execution, such as:
   * - Environment details
   * - Configuration used
   * - Custom metrics
   * - Debug information
   *
   * @example
   * ```typescript
   * {
   *   environment: 'development',
   *   batchSize: 100,
   *   customMetric: 42
   * }
   * ```
   */
  metadata?: Record<string, any>;

  /**
   * Timestamp when the seeder was executed
   *
   * ISO timestamp marking when the seeder completed
   * (successfully or with errors).
   *
   * @example new Date('2024-01-15T10:30:00Z')
   */
  executedAt: Date;
}
