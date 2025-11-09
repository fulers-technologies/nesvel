import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

import { BaseHttpMiddleware } from '../base-http.middleware';
import type { SetCacheHeadersOptions } from '../../../interfaces';

/**
 * Set Cache Headers Middleware
 *
 * Laravel-style HTTP caching headers middleware for NestJS.
 * Configures Cache-Control, ETag, Last-Modified headers for response caching.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage (1 hour cache)
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { SetCacheHeadersMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(SetCacheHeadersMiddleware.make({ maxAge: 3600, public: true }))
 *       .forRoutes('api/public/*');
 *   }
 * }
 * ```
 *
 * @example With ETag
 * ```typescript
 * consumer.apply(SetCacheHeadersMiddleware.make({
 *   maxAge: 3600,
 *   etag: true,
 * })).forRoutes('*');
 * ```
 */
@Injectable()
export class SetCacheHeadersMiddleware extends BaseHttpMiddleware {
  /**
   * Cache configuration options.
   */
  private readonly options: SetCacheHeadersOptions;

  /**
   * Constructor
   *
   * @param options - Cache headers configuration
   */
  constructor(options: SetCacheHeadersOptions = {}) {
    super();
    this.options = options;
  }

  /**
   * After hook: Set cache headers on response.
   *
   * @param req - Express request
   * @param res - Express response
   */
  protected async after(req: Request, res: Response): Promise<void> {
    // Only set cache headers for successful GET/HEAD requests
    if (!this.shouldSetCacheHeaders(req, res)) {
      return;
    }

    this.setCacheControlHeader(res);
    this.setETagHeader(res);
    this.setLastModifiedHeader(res);
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
   * Determine if cache headers should be set.
   *
   * @param req - Express request
   * @param res - Express response
   * @returns True if headers should be set
   */
  private shouldSetCacheHeaders(req: Request, res: Response): boolean {
    // Only for cacheable methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return false;
    }

    // Only for successful responses
    if (res.statusCode < 200 || res.statusCode >= 300) {
      return false;
    }

    return true;
  }

  /**
   * Set Cache-Control header.
   *
   * @param res - Express response
   */
  private setCacheControlHeader(res: Response): void {
    const directives: string[] = [];

    if (this.options.public) {
      directives.push('public');
    }

    if (this.options.private) {
      directives.push('private');
    }

    if (this.options.noCache) {
      directives.push('no-cache');
    }

    if (this.options.noStore) {
      directives.push('no-store');
    }

    if (this.options.maxAge !== undefined) {
      directives.push(`max-age=${this.options.maxAge}`);
    }

    if (this.options.sMaxage !== undefined) {
      directives.push(`s-maxage=${this.options.sMaxage}`);
    }

    if (this.options.mustRevalidate) {
      directives.push('must-revalidate');
    }

    if (this.options.proxyRevalidate) {
      directives.push('proxy-revalidate');
    }

    if (this.options.immutable) {
      directives.push('immutable');
    }

    if (directives.length > 0) {
      res.setHeader('Cache-Control', directives.join(', '));
    }
  }

  /**
   * Set ETag header.
   *
   * @param res - Express response
   */
  private setETagHeader(res: Response): void {
    if (!this.options.etag) {
      return;
    }

    let etagValue: string;

    if (typeof this.options.etag === 'string') {
      etagValue = this.options.etag;
    } else {
      // Auto-generate ETag from response content
      const content = res.get('Content-Length') || '';
      if (content) {
        etagValue = `"${createHash('xxh3').update(content).digest('hex')}"`;
        res.setHeader('ETag', etagValue);
      }
    }

    if (etagValue!) {
      res.setHeader('ETag', etagValue);
    }
  }

  /**
   * Set Last-Modified header.
   *
   * @param res - Express response
   */
  private setLastModifiedHeader(res: Response): void {
    if (!this.options.lastModified) {
      return;
    }

    let date: Date;

    if (typeof this.options.lastModified === 'number') {
      date = new Date(this.options.lastModified * 1000);
    } else {
      date = this.options.lastModified;
    }

    res.setHeader('Last-Modified', date.toUTCString());
  }
}
