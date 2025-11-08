import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction, Application } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';

import { TrustProxiesOptions } from './trust-proxies.interface';

/**
 * Trust Proxies Middleware
 *
 * Laravel-style proxy trust configuration for NestJS.
 * Configures Express to trust proxies for correct IP detection
 * and proper handling of X-Forwarded-* headers.
 *
 * Important for applications behind load balancers, CDNs, or reverse proxies.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { TrustProxiesMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new TrustProxiesMiddleware({
 *         proxies: true // Trust all proxies
 *       }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example Trust specific proxies
 * ```typescript
 * const middleware = new TrustProxiesMiddleware({
 *   proxies: ['10.0.0.1', '192.168.1.1'],
 *   headers: {
 *     xForwardedFor: 'X-Forwarded-For',
 *     xForwardedProto: 'X-Forwarded-Proto'
 *   }
 * });
 * ```
 */
@Injectable()
export class TrustProxiesMiddleware extends BaseHttpMiddleware {
  /**
   * Proxy configuration options.
   */
  private readonly options: Required<TrustProxiesOptions>;

  /**
   * Whether proxy trust has been configured.
   */
  private isConfigured = false;

  /**
   * Constructor
   *
   * @param options - Proxy trust configuration
   */
  constructor(options: TrustProxiesOptions = {}) {
    super();

    this.options = {
      proxies: options.proxies ?? false,
      headers: options.headers ?? {
        forwarded: 'Forwarded',
        xForwardedFor: 'X-Forwarded-For',
        xForwardedPort: 'X-Forwarded-Port',
        xForwardedHost: 'X-Forwarded-Host',
        xForwardedProto: 'X-Forwarded-Proto',
      },
    };
  }

  /**
   * Before hook: Configure Express trust proxy setting.
   * Only configures once to avoid repeated setting on every request.
   *
   * @param req - Express request
   * @param _res - Express response (unused)
   */
  protected async before(req: Request, _res: Response): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    const app = req.app as Application;

    // Configure Express trust proxy setting
    if (this.options.proxies !== undefined) {
      app.set('trust proxy', this.options.proxies);
      this.isConfigured = true;

      this.logger.debug('Trust proxy configured', {
        proxies: this.options.proxies,
        headers: this.options.headers,
      });
    }
  }

  /**
   * Handle hook: Pass through to next middleware.
   * Express automatically handles X-Forwarded-* headers when trust proxy is enabled.
   *
   * @param _req - Express request (unused)
   * @param _res - Express response (unused)
   * @param next - Next function
   */
  protected handle(_req: Request, _res: Response, next: NextFunction): void {
    next();
  }
}
