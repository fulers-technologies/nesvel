/**
 * Parsed path information extracted from URL paths.
 *
 * Represents the structured data extracted from parsing a URL path,
 * including segments, parameters, and resource identifiers.
 * Used for generating cache keys, operation IDs, and documentation.
 *
 * @example
 * ```typescript
 * const parsedPath: ParsedPath = {
 *   path: '/users/:id',
 *   segments: ['users', ':id'],
 *   controller: 'users',
 *   resource: 'users',
 *   params: ['id'],
 *   hasParams: true
 * };
 * ```
 */
export interface ParsedPath {
  /**
   * Full original path string.
   *
   * The complete, unmodified URL path that was parsed.
   *
   * @example '/users/:id/posts/:postId'
   */
  path: string;

  /**
   * Path segments (non-empty parts split by '/').
   *
   * Array of all path components excluding empty segments.
   *
   * @example ['users', ':id', 'posts', ':postId']
   */
  segments: string[];

  /**
   * Controller/resource name (first segment).
   *
   * The primary resource identifier extracted from the first path segment.
   * Used for grouping endpoints by resource type.
   *
   * @example 'users' (from '/users/:id')
   */
  controller: string;

  /**
   * Resource name (cleaned controller name).
   *
   * Controller name with hyphens removed for use in identifiers.
   *
   * @example 'users' (from 'users' or 'user-profiles')
   */
  resource: string;

  /**
   * Parameter names extracted from path.
   *
   * Array of parameter identifiers extracted from path segments
   * that start with ':'. The colon prefix is removed.
   *
   * @example ['id', 'postId'] (from '/users/:id/posts/:postId')
   */
  params: string[];

  /**
   * Whether path contains any parameters.
   *
   * Boolean flag indicating if the path includes dynamic parameters.
   * Useful for determining if path requires parameter substitution.
   *
   * @example true (for '/users/:id')
   * @example false (for '/users')
   */
  hasParams: boolean;
}
