/**
 * Migration result containing execution information
 *
 * Provides comprehensive feedback about migration execution including
 * success status, performance metrics, and error details.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IMigrationResult {
  /** Whether the migration was successful */
  success: boolean;
  /** Time taken to execute the migration in milliseconds */
  executionTime: number;
  /** Error message if migration failed */
  error?: string;
  /** Additional metadata about the migration execution */
  metadata: {
    /** SQL statements executed during migration */
    queries?: string[];
    /** Number of tables affected */
    tablesAffected?: number;
    /** Size of the migration (lines of code, complexity, etc.) */
    migrationSize?: number;
    /** Additional context or debug information */
    context?: Record<string, any>;
  };
}

// Export as both interface and type alias for compatibility
export type MigrationResult = IMigrationResult;
