/**
 * Cache control options for responses.
 *
 * Provides fine-grained control over HTTP caching.
 */
export interface CacheOptions {
  /**
   * Time to live in seconds.
   */
  ttl?: number;

  /**
   * Whether response is public (can be cached by proxies).
   * Default: true
   */
  public?: boolean;

  /**
   * Whether response is private (only client can cache).
   */
  private?: boolean;

  /**
   * Whether response must be revalidated.
   */
  mustRevalidate?: boolean;

  /**
   * Whether to disable caching entirely.
   */
  noCache?: boolean;

  /**
   * Whether to disable storing.
   */
  noStore?: boolean;

  /**
   * ETag value for conditional requests.
   */
  etag?: string;

  /**
   * Last modified date for conditional requests.
   */
  lastModified?: Date;

  /**
   * Max age in seconds.
   */
  maxAge?: number;

  /**
   * Shared max age in seconds (for CDNs).
   */
  sMaxAge?: number;
}
