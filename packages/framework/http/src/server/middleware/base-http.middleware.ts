import { NestMiddleware } from '@nestjs/common';
import { BaseMiddleware } from '@nesvel/shared';
import { Request, Response, NextFunction } from 'express';

/**
 * Base HTTP Middleware
 *
 * Express-specific implementation of BaseMiddleware for NestJS applications.
 * Extends the generic BaseMiddleware with Express request, response, and next function types.
 *
 * This class provides the bridge between the framework-agnostic BaseMiddleware
 * and NestJS's middleware system with Express types.
 *
 * All HTTP middlewares in the framework should extend this class instead of
 * the generic BaseMiddleware directly.
 *
 * @abstract
 *
 * @example Basic usage
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { Request, Response, NextFunction } from 'express';
 * import { BaseHttpMiddleware } from '@nesvel/framework-http';
 *
 * @Injectable()
 * export class LoggingMiddleware extends BaseHttpMiddleware {
 *   protected async before(req: Request, res: Response): Promise<void> {
 *     this.logger.log(`Incoming request: ${req.method} ${req.url}`);
 *   }
 *
 *   protected handle(req: Request, res: Response, next: NextFunction): void {
 *     // Add timestamp to request
 *     (req as any).timestamp = Date.now();
 *     next();
 *   }
 *
 *   protected async after(req: Request, res: Response): Promise<void> {
 *     const duration = Date.now() - (req as any).timestamp;
 *     this.logger.log(`Request completed in ${duration}ms`);
 *   }
 * }
 * ```
 *
 * @example With lifecycle hooks
 * ```typescript
 * @Injectable()
 * export class AuthMiddleware extends BaseHttpMiddleware {
 *   protected async before(req: Request, res: Response): Promise<void> {
 *     const token = req.headers.authorization;
 *
 *     if (!token) {
 *       res.status(401).json({ error: 'Unauthorized' });
 *       return; // Response sent, handle() won't execute
 *     }
 *   }
 *
 *   protected handle(req: Request, res: Response, next: NextFunction): void {
 *     // Validate token and attach user
 *     next();
 *   }
 * }
 * ```
 *
 * @example Registration in NestJS module
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(LoggingMiddleware)
 *       .forRoutes('*');
 *   }
 * }
 * ```
 */
export abstract class BaseHttpMiddleware
  extends BaseMiddleware<Request, Response, NextFunction>
  implements NestMiddleware
{
  /**
   * Check if the Express response has been sent.
   *
   * Overrides the generic implementation to use Express-specific `headersSent` property.
   *
   * @param res - Express response object
   * @returns True if response headers have been sent
   */
  protected isResponseSent(res: Response): boolean {
    return res.headersSent;
  }
}
