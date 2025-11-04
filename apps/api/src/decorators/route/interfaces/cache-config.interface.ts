/**
 * Cache configuration for API endpoints.
 *
 * Enables response caching to improve performance and reduce server load.
 * Supports dynamic cache keys with parameter interpolation and configurable TTL.
 */
export interface CacheConfig {
  /**
   * Enable or disable caching for this endpoint.
   *
   * When enabled, responses will be cached according to the specified key and TTL.
   * Disable for endpoints with frequently changing data or user-specific content.
   *
   * @default false
   */
  enabled?: boolean;

  /**
   * Cache key pattern with support for dynamic parameters.
   *
   * Supports parameter interpolation using double curly braces syntax: {{param}}.
   * If not specified, a key is auto-generated based on controller, method, and path.
   * Use descriptive keys that uniquely identify the cached resource.
   *
   * Auto-generated pattern: {controller}:{method}:{path}
   *
   * @example
   * Simple key with single parameter:
   * ```typescript
   * key: 'users:{{id}}'
   * // Request: GET /users/123 -> Cache key: users:123
   * ```
   *
   * @example
   * Nested resource with multiple parameters:
   * ```typescript
   * key: 'posts:{{postId}}:comments:{{commentId}}'
   * // Request: GET /posts/5/comments/42 -> Cache key: posts:5:comments:42
   * ```
   *
   * @example
   * Search results with query parameters:
   * ```typescript
   * key: 'search:{{query}}:page:{{page}}'
   * // Request: GET /search?query=nestjs&page=2 -> Cache key: search:nestjs:page:2
   * ```
   *
   * @example
   * Auto-generated examples:
   * ```typescript
   * // GET /users/:id -> users:GET:{{id}}
   * // POST /posts/:postId/comments -> posts:POST:{{postId}}:comments
   * ```
   *
   * @default Auto-generated based on endpoint configuration
   */
  key?: string;

  /**
   * Time to live (TTL) in seconds.
   *
   * Specifies how long the cached response remains valid before expiring.
   * After expiration, the next request will fetch fresh data and update the cache.
   * Balance between data freshness and performance when setting this value.
   *
   * @example
   * ```typescript
   * ttl: 300    // 5 minutes
   * ttl: 3600   // 1 hour
   * ttl: 86400  // 24 hours
   * ```
   *
   * @default 300 (5 minutes)
   */
  ttl?: number;
}
