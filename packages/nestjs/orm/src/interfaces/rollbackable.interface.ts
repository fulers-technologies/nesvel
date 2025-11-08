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
   */
  down(): Promise<void> | void;
}
