import type { IMigrationContext } from '@/interfaces';

/**
 * Rollbackable Interface
 *
 * Interface for migrations that support rollback functionality.
 * Not all migrations can be safely rolled back (e.g., data migrations,
 * destructive operations), so this interface makes rollback optional.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IRollbackable {
  /**
   * Rollback the migration (undo changes)
   * This method must be implemented by migrations that support rollback
   *
   * @param context - Migration context with database connection and utilities
   */
  down(context: IMigrationContext): Promise<void>;
}

/**
 * Type guard to check if a migration implements rollback functionality
 *
 * @param migration - The migration instance to check
 * @returns True if migration implements IRollbackable interface
 */
export function isRollbackable(migration: any): migration is IRollbackable {
  return migration && typeof migration.down === 'function';
}
