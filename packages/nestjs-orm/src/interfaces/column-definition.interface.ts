import { IndexType, ForeignKeyAction } from '../enums';

/**
 * Column definition for fluent API
 *
 * Defines the structure and properties of a database column
 * for use with the Blueprint fluent schema builder.
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IColumnDefinition {
  /** Column name */
  name: string;
  /** Column type (e.g., 'string', 'integer', 'timestamp') */
  type: string;
  /** Whether the column is nullable */
  nullable: boolean;
  /** Default value for the column */
  defaultValue?: any;
  /** Whether this is a primary key */
  primary: boolean;
  /** Whether this column has a unique constraint */
  unique: boolean;
  /** Whether this column is an auto-incrementing integer */
  autoIncrement: boolean;
  /** Length/precision for string/decimal columns */
  length?: number;
  /** Scale for decimal columns */
  scale?: number;
  /** Whether this column is unsigned (for numeric types) */
  unsigned: boolean;
  /** Comment for the column */
  comment?: string;
  /** Foreign key reference */
  references?: {
    /** Referenced table name */
    table: string;
    /** Referenced column name */
    column: string;
    /** Action on delete (CASCADE, RESTRICT, SET NULL, etc.) */
    onDelete?: ForeignKeyAction;
    /** Action on update (CASCADE, RESTRICT, SET NULL, etc.) */
    onUpdate?: ForeignKeyAction;
  };
  /** Index definition */
  index?: {
    /** Index name */
    name?: string;
    /** Index type */
    type?: IndexType;
  };
  /** Enum values for enum columns */
  enumValues?: string[];
}

// Export as both interface and type alias for compatibility
export type ColumnDefinition = IColumnDefinition;
