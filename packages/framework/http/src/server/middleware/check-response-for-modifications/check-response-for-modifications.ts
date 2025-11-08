import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';
import { CheckResponseForModificationsOptions } from './check-response-for-modifications.interface';

/**
 * Check Response For Modifications Middleware
 *
 * Laravel-style conditional request handling for NestJS.
 * Checks if response has been modified using ETag/Last-Modified headers
 * and returns 304 Not Modified if appropriate.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { CheckResponseForModificationsMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new CheckResponseForModificationsMiddleware())
 *       .forRoutes('*');
 *   }
 * }
 * ```
 */
@Injectable()
export class CheckResponseForModificationsMiddleware extends BaseHttpMiddleware {
  /**
   * Middleware options.
   */
  private readonly options: Required<CheckResponseForModificationsOptions>;

  /**
   * Constructor
   *
   * @param options - Configuration options
   */
  constructor(options: CheckResponseForModificationsOptions = {}) {
    super();

    this.options = {
      enabled: options.enabled ?? true,
    };
  }

  /**
   * After hook: Check if response has been modified.
   * Leverages Express's built-in fresh/stale request checking.
   *
   * @param req - Express request
   * @param res - Express response
   */
  protected async after(req: Request, res: Response): Promise<void> {
    if (!this.options.enabled) {
      return;
    }

    // Check if the request is "fresh" (ETag or Last-Modified match)
    // Express provides req.fresh which checks If-None-Match and If-Modified-Since
    if (req.fresh && res.statusCode >= 200 && res.statusCode < 300) {
      // Remove content for 304 response
      res.status(304);
      res.removeHeader('Content-Type');
      res.removeHeader('Content-Length');
      res.removeHeader('Transfer-Encoding');
      res.end();
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
}
