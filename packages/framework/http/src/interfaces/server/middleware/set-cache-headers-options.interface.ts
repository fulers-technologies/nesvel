/**
 * Set Cache Headers Configuration Options
 *
 * Configures HTTP caching headers (Cache-Control, ETag, Last-Modified, etc.).
 * Improves performance by allowing browsers and proxies to cache responses.
 */
export interface SetCacheHeadersOptions {
  /**
   * Cache-Control max-age in seconds.
   */
  maxAge?: number;

  /**
   * Cache-Control s-maxage in seconds (for shared caches like CDNs).
   */
  sMaxage?: number;

  /**
   * Whether the response must be revalidated (no-cache).
   */
  noCache?: boolean;

  /**
   * Whether the response must not be stored (no-store).
   */
  noStore?: boolean;

  /**
   * Whether the response is public (can be cached by any cache).
   */
  public?: boolean;

  /**
   * Whether the response is private (can only be cached by browser).
   */
  private?: boolean;

  /**
   * Whether the response must be revalidated when stale (must-revalidate).
   */
  mustRevalidate?: boolean;

  /**
   * Whether proxies must revalidate when stale (proxy-revalidate).
   */
  proxyRevalidate?: boolean;

  /**
   * Whether cached response can be used when stale (immutable).
   */
  immutable?: boolean;

  /**
   * ETag value or true to auto-generate from response content.
   */
  etag?: boolean | string;

  /**
   * Last-Modified timestamp (Unix timestamp or Date).
   */
  lastModified?: number | Date;
}
