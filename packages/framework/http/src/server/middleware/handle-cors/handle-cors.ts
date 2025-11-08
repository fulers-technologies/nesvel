import { Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpMethod } from '@nesvel/shared';

import { HandleCorsOptions } from './handle-cors.interface';
import { BaseHttpMiddleware } from '../base-http.middleware';

/**
 * Handle CORS Middleware
 *
 * Laravel-style CORS handling for NestJS applications.
 * Handles Cross-Origin Resource Sharing with configurable options.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { HandleCorsMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new HandleCorsMiddleware())
 *       .forRoutes('*');
 *   }
 * }
 * ```
 *
 * @example With custom options
 * ```typescript
 * const corsMiddleware = new HandleCorsMiddleware({
 *   origin: ['https://example.com', 'https://app.example.com'],
 *   credentials: true,
 *   methods: ['GET', 'POST', 'PUT', 'DELETE'],
 * });
 * ```
 */
@Injectable()
export class HandleCorsMiddleware extends BaseHttpMiddleware {
  /**
   * CORS configuration options.
   */
  private readonly options: Required<HandleCorsOptions>;

  /**
   * Constructor
   *
   * @param options - CORS configuration options
   */
  constructor(options: HandleCorsOptions = {}) {
    super();

    this.options = {
      methods: options.methods ?? [
        HttpMethod.GET,
        HttpMethod.PUT,
        HttpMethod.HEAD,
        HttpMethod.POST,
        HttpMethod.PATCH,
        HttpMethod.DELETE,
      ],
      origin: options.origin ?? '*',
      credentials: options.credentials ?? false,
      maxAge: options.maxAge ?? 86400, // 24 hours
      exposedHeaders: options.exposedHeaders ?? [],
      allowedHeaders: options.allowedHeaders ?? ['*'],
      preflightContinue: options.preflightContinue ?? false,
      optionsSuccessStatus: options.optionsSuccessStatus ?? 204,
    };
  }

  /**
   * Before hook: Set CORS headers for all requests.
   *
   * @param req - Express request
   * @param res - Express response
   */
  protected async before(req: Request, res: Response): Promise<void> {
    const origin = req.get('origin');

    // Set Access-Control-Allow-Origin
    if (this.isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else if (typeof this.options.origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', this.options.origin);
    }

    // Set Access-Control-Allow-Credentials
    if (this.options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  /**
   * Handle hook: Process CORS logic and handle preflight OPTIONS requests.
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  protected handle(req: Request, res: Response, next: NextFunction): void {
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      this.handlePreflight(req, res, next);
    } else {
      this.handleActualRequest(res, next);
    }
  }

  /**
   * Handle preflight OPTIONS request.
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  private handlePreflight(req: Request, res: Response, next: NextFunction): void {
    // Set Access-Control-Allow-Methods
    const methods = Array.isArray(this.options.methods)
      ? this.options.methods.join(',')
      : this.options.methods;
    res.setHeader('Access-Control-Allow-Methods', methods);

    // Set Access-Control-Allow-Headers
    const allowedHeaders = this.getAllowedHeaders(req);
    if (allowedHeaders) {
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
    }

    // Set Access-Control-Max-Age
    if (this.options.maxAge) {
      res.setHeader('Access-Control-Max-Age', String(this.options.maxAge));
    }

    // Set Access-Control-Expose-Headers
    if (this.options.exposedHeaders && Array.isArray(this.options.exposedHeaders)) {
      res.setHeader('Access-Control-Expose-Headers', this.options.exposedHeaders.join(','));
    }

    if (!this.options.preflightContinue) {
      res.status(this.options.optionsSuccessStatus).end();
      return;
    }

    next();
  }

  /**
   * Handle actual (non-preflight) request.
   *
   * @param res - Express response
   * @param next - Next function
   */
  private handleActualRequest(res: Response, next: NextFunction): void {
    // Set Access-Control-Expose-Headers for actual requests
    if (this.options.exposedHeaders && Array.isArray(this.options.exposedHeaders)) {
      res.setHeader('Access-Control-Expose-Headers', this.options.exposedHeaders.join(','));
    }

    next();
  }

  /**
   * Check if the origin is allowed.
   *
   * @param origin - Request origin
   * @returns True if origin is allowed
   */
  private isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) {
      return false;
    }

    const allowedOrigin = this.options.origin;

    if (allowedOrigin === '*') {
      return true;
    }

    if (typeof allowedOrigin === 'string') {
      return origin === allowedOrigin;
    }

    if (Array.isArray(allowedOrigin)) {
      return allowedOrigin.includes(origin);
    }

    if (typeof allowedOrigin === 'function') {
      return allowedOrigin(origin);
    }

    return false;
  }

  /**
   * Get allowed headers for CORS.
   *
   * @param req - Express request
   * @returns Comma-separated allowed headers
   */
  private getAllowedHeaders(req: Request): string | null {
    const allowedHeaders = this.options.allowedHeaders;

    if (!allowedHeaders) {
      return null;
    }

    if (Array.isArray(allowedHeaders)) {
      if (allowedHeaders.includes('*')) {
        // Echo back requested headers
        return req.get('access-control-request-headers') || '';
      }
      return allowedHeaders.join(',');
    }

    if (allowedHeaders === '*') {
      return req.get('access-control-request-headers') || '';
    }

    return allowedHeaders;
  }
}
