import Table from 'cli-table3';
import { getTheme } from '@/themes/config';
import type { TableOptions } from '@/interfaces/table-options.interface';

/**
 * Create Table
 *
 * @description
 * Creates a formatted table for console output.
 *
 * @param {Array<Array<string>>} rows - Table rows
 * @param {TableOptions} options - Table options
 * @returns {string} Formatted table string
 *
 * @example
 * ```typescript
 * const tableStr = table(
 *   [
 *     ['John Doe', 'admin', 'active'],
 *     ['Jane Smith', 'user', 'active'],
 *   ],
 *   {
 *     head: ['Name', 'Role', 'Status'],
 *   }
 * );
 *
 * console.log(tableStr);
 * ```
 */
export function table(rows: Array<Array<string | number>>, options: TableOptions = {}): string {
  const theme = getTheme();
  const tableInstance = new Table({
    head: options.head?.map((h) => theme.highlight(theme.primary(h))),
    style: {
      head: [],
      border: ['gray'],
      ...options.style,
    },
  });

  rows.forEach((row) => {
    tableInstance.push(row);
  });

  return tableInstance.toString();
}

/**
 * Display Table
 *
 * @description
 * Displays a table directly to console.
 *
 * @param {Array<Array<string>>} rows - Table rows
 * @param {TableOptions} options - Table options
 *
 * @example
 * ```typescript
 * displayTable(
 *   [
 *     ['Camera 1', 'active', '2025-01-01'],
 *     ['Camera 2', 'inactive', '2025-01-02'],
 *   ],
 *   {
 *     head: ['Name', 'Status', 'Created'],
 *   }
 * );
 * ```
 */
export function displayTable(
  rows: Array<Array<string | number>>,
  options: TableOptions = {},
): void {
  console.log('\n' + table(rows, options) + '\n');
}
