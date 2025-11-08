import { SetCacheHeadersMiddleware } from './set-cache-headers';
import { SetCacheHeadersOptions } from './set-cache-headers.interface';

/**
 * Set Cache Headers Factory Function
 *
 * Creates a SetCacheHeadersMiddleware instance with the specified options.
 *
 * @param options - Cache headers configuration
 * @returns SetCacheHeadersMiddleware instance
 *
 * @example 1 hour public cache
 * ```typescript
 * consumer.apply(setCacheHeaders({ maxAge: 3600, public: true })).forRoutes('api/*');
 * ```
 *
 * @example Private cache with ETag
 * ```typescript
 * consumer.apply(setCacheHeaders({ maxAge: 300, private: true, etag: true })).forRoutes('*');
 * ```
 */
export function setCacheHeaders(options: SetCacheHeadersOptions = {}): SetCacheHeadersMiddleware {
  return new SetCacheHeadersMiddleware(options);
}
