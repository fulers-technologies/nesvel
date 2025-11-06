import { ParsedPath } from '../interfaces/parsed-path.interface';

/**
 * Simple memoization implementation for path parsing.
 *
 * Caches parsing results to avoid redundant computations for the same paths.
 * Uses a Map for O(1) lookup performance.
 */
const parsePathCache = new Map<string, ParsedPath>();

/**
 * Maximum cache size to prevent memory leaks.
 * LRU eviction when limit is reached.
 */
const MAX_CACHE_SIZE = 500;

/**
 * Parses a URL path with memoization for performance.
 *
 * Results are cached to avoid redundant parsing of the same paths.
 * This is especially beneficial in applications with many endpoints
 * using similar path patterns.
 *
 * @param path - URL path to parse
 * @returns Parsed path information (may be cached)
 */
export function parsePath(path: string): ParsedPath {
  // Check cache first
  const cached = parsePathCache.get(path);
  if (cached) {
    return cached;
  }

  // Parse and cache result
  const result = parsePathUncached(path);

  // Implement simple LRU: clear oldest entry when cache is full
  if (parsePathCache.size >= MAX_CACHE_SIZE) {
    const firstKey: string | undefined = parsePathCache.keys().next().value;
    if (firstKey !== undefined) {
      parsePathCache.delete(firstKey);
    }
  }

  parsePathCache.set(path, result);
  return result;
}

/**
 * Clears the path parsing cache.
 *
 * Useful for testing or when you need to free memory.
 * Generally not needed in production.
 *
 * @internal
 */
export function clearParsePathCache(): void {
  parsePathCache.clear();
}

/**
 * Converts a path to a cache key pattern.
 *
 * Transforms path parameters from Express format (:param) to
 * cache key format ({{param}}) for dynamic cache key generation.
 *
 * @param path - URL path to convert
 * @param method - HTTP method (optional)
 * @returns Cache key pattern
 *
 * @example
 * ```typescript
 * const key = pathToCacheKey('/users/:id', 'GET');
 * // Returns: 'users:GET:{{id}}'
 * ```
 *
 * @example
 * Nested path:
 * ```typescript
 * const key = pathToCacheKey('/posts/:postId/comments/:commentId');
 * // Returns: 'posts:{{postId}}:comments:{{commentId}}'
 * ```
 */
export function pathToCacheKey(path: string, method?: string): string {
  const parsed = parsePath(path);

  // Convert path segments to cache key format
  const keySegments = parsed.segments.map((segment) => {
    // Convert :param to {{param}}
    if (segment.startsWith(':')) {
      return `{{${segment.slice(1)}}}`;
    }
    return segment;
  });

  // Build cache key with optional method prefix
  const keyPath = keySegments.join(':') || 'root';

  if (method) {
    return `${parsed.controller}:${method}:${keyPath}`;
  }

  return keyPath;
}

/**
 * Generates an operation ID from method and path.
 *
 * Creates a camelCase operation ID suitable for OpenAPI documentation.
 * Combines HTTP method with resource name and operation type.
 *
 * @param method - HTTP method (e.g., 'GET', 'POST')
 * @param path - URL path
 * @returns CamelCase operation ID
 *
 * @example
 * ```typescript
 * const opId = generateOperationId('GET', '/users');
 * // Returns: 'getUsers'
 * ```
 *
 * @example
 * With parameter:
 * ```typescript
 * const opId = generateOperationId('GET', '/users/:id');
 * // Returns: 'getUserById'
 * ```
 *
 * @example
 * Nested resource:
 * ```typescript
 * const opId = generateOperationId('POST', '/users/:userId/posts');
 * // Returns: 'createUserPosts'
 * ```
 */
export function generateOperationId(method: string, path: string): string {
  const parsed = parsePath(path);

  // Convert method to lowercase action verb
  const action = method.toLowerCase();

  // Convert resource name to PascalCase
  const resourceParts = parsed.resource.split('-');
  const resourceName = resourceParts
    .map((part, idx) => (idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join('');

  // Capitalize first letter of resource
  const capitalizedResource = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  // Add 'ById' suffix if path has parameters
  const suffix = parsed.hasParams ? 'ById' : '';

  // Combine: action + Resource + suffix
  return `${action}${capitalizedResource}${suffix}`;
}

/**
 * Extracts tags from a path for OpenAPI documentation.
 *
 * Generates tag names based on path structure. Primary tag is the
 * controller/resource name. Additional tags may be added for nested
 * resources or special operations.
 *
 * @param path - URL path
 * @returns Array of tag names
 *
 * @example
 * ```typescript
 * const tags = extractTags('/users');
 * // Returns: ['users']
 * ```
 *
 * @example
 * Nested resource:
 * ```typescript
 * const tags = extractTags('/users/:userId/posts');
 * // Returns: ['users', 'posts']
 * ```
 */
export function extractTags(path: string): string[] {
  const parsed = parsePath(path);
  const tags: string[] = [parsed.controller];

  // Add nested resource tags (non-parameter segments after first)
  const nestedResources = parsed.segments.slice(1).filter((segment) => !segment.startsWith(':'));

  tags.push(...nestedResources);

  // Return unique tags
  return [...new Set(tags)];
}

/**
 * Parses a URL path into structured information.
 *
 * Extracts segments, controller name, parameters, and other metadata
 * from a URL path string. Handles both simple and nested paths.
 *
 * @param path - URL path to parse (e.g., '/users/:id/posts/:postId')
 * @returns Parsed path information
 *
 * @example
 * ```typescript
 * const parsed = parsePath('/users/:id');
 * // {
 * //   path: '/users/:id',
 * //   segments: ['users', ':id'],
 * //   controller: 'users',
 * //   resource: 'users',
 * //   params: ['id'],
 * //   hasParams: true
 * // }
 * ```
 *
 * @example
 * Nested path:
 * ```typescript
 * const parsed = parsePath('/posts/:postId/comments/:commentId');
 * // {
 * //   path: '/posts/:postId/comments/:commentId',
 * //   segments: ['posts', ':postId', 'comments', ':commentId'],
 * //   controller: 'posts',
 * //   resource: 'posts',
 * //   params: ['postId', 'commentId'],
 * //   hasParams: true
 * // }
 * ```
 */
/**
 * Internal implementation of path parsing without memoization.
 * Used by the memoized wrapper.
 */
function parsePathUncached(path: string): ParsedPath {
  // Validation: Path should start with '/' or be empty
  if (path && !path.startsWith('/') && path !== '') {
    console.warn(
      `[Path Parser] Warning: Path "${path}" should start with "/" or be empty for controller-level routes.`
    );
  }

  // Validation: Detect optional parameter patterns (not supported)
  const invalidParams = path.match(/:(\w+)\?/g);
  if (invalidParams) {
    throw new Error(
      `[Path Parser] Optional parameters (?) are not supported in NestJS routes: ${invalidParams.join(', ')}. ` +
        'Use separate routes or query parameters instead.'
    );
  }

  // Validation: Detect wildcard patterns and warn
  if (path.includes('*') && !path.endsWith('*')) {
    console.warn(
      `[Path Parser] Warning: Wildcard (*) should typically be at the end of the path: "${path}"`
    );
  }

  // Split path into segments, removing empty parts
  const segments = path.split('/').filter(Boolean);

  // Extract controller name (first segment or default to 'api')
  const controller = segments[0] || 'api';

  // Extract resource name (controller without hyphens)
  const resource = controller.replace(/-/g, '');

  // Extract parameter names (segments starting with ':')
  const params = segments
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => segment.slice(1)); // Remove ':' prefix

  return {
    path,
    segments,
    controller,
    resource,
    params,
    hasParams: params.length > 0,
  };
}
