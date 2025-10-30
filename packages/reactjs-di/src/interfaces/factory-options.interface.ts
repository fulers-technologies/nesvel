/**
 * Factory options
 */
export interface FactoryOptions {
  /**
   * Whether to cache factory instances (default: false)
   */
  cache?: boolean;

  /**
   * Custom cache key generator
   */
  cacheKey?: (...args: any[]) => string;
}
