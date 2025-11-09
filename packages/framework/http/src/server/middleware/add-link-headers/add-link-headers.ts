import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';
import type { AddLinkHeadersOptions } from '../../../interfaces';

/**
 * Add Link Headers Middleware
 *
 * Laravel-style resource preloading middleware for NestJS.
 * Adds Link headers for resource preloading (HTTP/2 Server Push, Early Hints).
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { AddLinkHeadersMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new AddLinkHeadersMiddleware({
 *         assets: {
 *           '/assets/app.js': ['rel=preload', 'as=script'],
 *           '/assets/style.css': ['rel=preload', 'as=style'],
 *         }
 *       }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With limit
 * ```typescript
 * consumer.apply(new AddLinkHeadersMiddleware({
 *   assets: {...},
 *   limit: 10,
 * })).forRoutes('*');
 * ```
 */
@Injectable()
export class AddLinkHeadersMiddleware extends BaseHttpMiddleware {
  /**
   * Link headers configuration options.
   */
  private readonly options: AddLinkHeadersOptions & { merge: boolean };

  /**
   * Constructor
   *
   * @param options - Link headers configuration
   */
  constructor(options: AddLinkHeadersOptions = {}) {
    super();

    this.options = {
      assets: options.assets,
      assetsFunction: options.assetsFunction,
      limit: options.limit,
      merge: options.merge ?? true,
    };
  }

  /**
   * After hook: Add Link headers to response.
   *
   * @param req - Express request
   * @param res - Express response
   */
  protected async after(req: Request, res: Response): Promise<void> {
    const assets = this.getAssets(req);

    if (Object.keys(assets).length === 0) {
      return;
    }

    const linkHeaders = this.buildLinkHeaders(assets);

    if (linkHeaders.length === 0) {
      return;
    }

    // Join with comma as per RFC 8288
    const linkHeaderValue = linkHeaders.join(', ');

    if (this.options.merge) {
      // Append to existing Link headers
      const existing = res.get('Link');
      if (existing) {
        res.setHeader('Link', `${existing}, ${linkHeaderValue}`);
      } else {
        res.setHeader('Link', linkHeaderValue);
      }
    } else {
      // Replace existing Link headers
      res.setHeader('Link', linkHeaderValue);
    }
  }

  /**
   * Handle hook: Pass through to next middleware.
   *
   * @param _req - Express request (unused)
   * @param _res - Express response (unused)
   * @param next - Next function
   */
  protected handle(_req: Request, _res: Response, next: NextFunction): void {
    next();
  }

  /**
   * Get assets to preload.
   *
   * @param req - Express request
   * @returns Assets record
   */
  private getAssets(req: Request): Record<string, string[]> {
    if (this.options.assetsFunction) {
      return this.options.assetsFunction(req);
    }

    return this.options.assets || {};
  }

  /**
   * Build Link header strings from assets.
   *
   * @param assets - Assets record
   * @returns Array of Link header strings
   */
  private buildLinkHeaders(assets: Record<string, string[]>): string[] {
    const entries = Object.entries(assets);
    const limited = this.options.limit ? entries.slice(0, this.options.limit) : entries;

    return limited.map(([url, attributes]) => {
      const attrs = attributes.join('; ');
      return `<${url}>; ${attrs}`;
    });
  }
}
