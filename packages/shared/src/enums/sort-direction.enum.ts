/**
 * Sort Direction Enum
 *
 * Defines the available sorting directions for database queries.
 * Used throughout the repository and query builder interfaces to ensure
 * type-safe and consistent ordering operations.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum SortDirection {
  /**
   * Ascending order (A-Z, 0-9, oldest to newest)
   */
  ASC = 'ASC',

  /**
   * Descending order (Z-A, 9-0, newest to oldest)
   */
  DESC = 'DESC',
}
