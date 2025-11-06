/**
 * Cursor Interface
 *
 * Represents a cursor for cursor-based pagination, which encodes
 * the position in a dataset for efficient forward/backward navigation.
 *
 * @interface Cursor
 *
 * @example
 * ```typescript
 * const cursor: Cursor = {
 *   value: 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0=',
 *   direction: 'next',
 *   parameters: { id: 100, createdAt: '2023-01-01' },
 * };
 * ```
 */
export interface Cursor {
  /**
   * Encoded cursor string
   *
   * A base64-encoded string containing the cursor position.
   * This value is passed in the URL to fetch the next/previous page.
   *
   * @example 'eyJpZCI6MTAwLCJjcmVhdGVkQXQiOiIyMDIzLTAxLTAxIn0='
   */
  value: string;

  /**
   * Direction of pagination
   *
   * Indicates whether this cursor is for moving forward ('next')
   * or backward ('prev') through the result set.
   *
   * @optional
   * @default 'next'
   * @example 'next'
   */
  direction?: 'next' | 'prev';

  /**
   * Parameters used to create cursor
   *
   * The decoded cursor data containing the fields and values
   * that identify the cursor position (e.g., last ID, timestamp).
   * Useful for debugging or manual cursor construction.
   *
   * @example { id: 100, createdAt: '2023-01-01' }
   */
  parameters: Record<string, any>;
}
