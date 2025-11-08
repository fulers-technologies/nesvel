import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';
import { FrameGuardOptions } from './frame-guard.interface';

/**
 * Frame Guard Middleware
 *
 * Laravel-style X-Frame-Options header middleware for NestJS.
 * Sets the X-Frame-Options header to prevent clickjacking attacks.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage (SAMEORIGIN)
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { FrameGuardMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new FrameGuardMiddleware())
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example Deny all framing
 * ```typescript
 * const middleware = new FrameGuardMiddleware({ action: 'DENY' });
 * ```
 */
@Injectable()
export class FrameGuardMiddleware extends BaseHttpMiddleware {
  /**
   * Frame guard configuration options.
   */
  private readonly options: Required<FrameGuardOptions>;

  /**
   * Constructor
   *
   * @param options - Frame guard configuration
   */
  constructor(options: FrameGuardOptions = {}) {
    super();

    this.options = {
      action: options.action ?? 'SAMEORIGIN',
      domain: options.domain ?? '',
    };
  }

  /**
   * After hook: Set X-Frame-Options header on response.
   *
   * @param _req - Express request (unused)
   * @param res - Express response
   */
  protected async after(_req: Request, res: Response): Promise<void> {
    let headerValue: string = this.options.action;

    if (this.options.action === 'ALLOW-FROM' && this.options.domain) {
      headerValue = `ALLOW-FROM ${this.options.domain}`;
    }

    // Only set if not already set
    if (!res.hasHeader('X-Frame-Options')) {
      res.setHeader('X-Frame-Options', headerValue);
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
