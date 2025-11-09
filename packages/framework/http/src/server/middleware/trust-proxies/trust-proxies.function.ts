import { TrustProxiesMiddleware } from './trust-proxies';
import type { TrustProxiesOptions } from '../../../interfaces';

/**
 * Trust Proxies Factory Function
 *
 * Creates a TrustProxiesMiddleware instance with the specified options.
 * This is the recommended way to use the middleware in functional style.
 *
 * @param options - Proxy trust configuration
 * @returns TrustProxiesMiddleware instance
 *
 * @example Trust all proxies
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { trustProxies } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(trustProxies({ proxies: true }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example Trust specific IPs
 * ```typescript
 * consumer
 *   .apply(trustProxies({
 *     proxies: ['10.0.0.1', '192.168.1.1']
 *   }))
 *   .forRoutes('*');
 * ```
 *
 * @example Trust first hop only
 * ```typescript
 * consumer
 *   .apply(trustProxies({ proxies: 1 }))
 *   .forRoutes('*');
 * ```
 *
 * @example With custom headers
 * ```typescript
 * consumer
 *   .apply(trustProxies({
 *     proxies: true,
 *     headers: {
 *       xForwardedFor: 'X-Forwarded-For',
 *       xForwardedProto: 'X-Forwarded-Proto',
 *     }
 *   }))
 *   .forRoutes('*');
 * ```
 */
export function trustProxies(options: TrustProxiesOptions = {}): TrustProxiesMiddleware {
  return new TrustProxiesMiddleware(options);
}
