import { EntityOperation } from '@/enums';

/**
 * Context for database operations
 *
 * Additional metadata about the operation being performed,
 * used for better error messages and debugging.
 */
export interface DatabaseOperationContext {
  /**
   * Name of the entity being operated on
   */
  entityName: string;
  /**
   * Database operation type - use EntityOperation enum values
   */
  operation: EntityOperation | string;
  /**
   * Additional context data (IDs, filters, etc.)
   */
  context?: Record<string, any>;
  /**
   * Database connection name
   */
  connection?: string;
}
