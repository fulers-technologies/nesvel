import { TrustHostsMiddleware } from './trust-hosts';
import { TrustHostsOptions } from './trust-hosts.interface';

/**
 * Trust Hosts Factory Function
 *
 * Creates a TrustHostsMiddleware instance with the specified options.
 * This is the recommended way to use the middleware in functional style.
 *
 * @param options - Trust hosts configuration
 * @returns TrustHostsMiddleware instance
 *
 * @example Basic usage (trust app URL subdomains)
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { trustHosts } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(trustHosts({ appUrl: 'https://example.com' }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With specific hosts
 * ```typescript
 * consumer
 *   .apply(trustHosts({
 *     hosts: ['^(.+\\.)?example\\.com$', 'api\\.trusted\\.com'],
 *     trustSubdomains: false,
 *   }))
 *   .forRoutes('*');
 * ```
 *
 * @example With function
 * ```typescript
 * consumer
 *   .apply(trustHosts({
 *     hosts: () => [
 *       '^(.+\\.)?example\\.com$',
 *       '^(.+\\.)?trusted\\.org$',
 *     ],
 *   }))
 *   .forRoutes('*');
 * ```
 */
export function trustHosts(options: TrustHostsOptions = {}): TrustHostsMiddleware {
  return new TrustHostsMiddleware(options);
}
