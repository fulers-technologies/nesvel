import { Logger } from '@nestjs/common';

/**
 * Base Middleware Abstract
 *
 * Generic, production-ready abstract class for building middleware with lifecycle hooks.
 * Provides before, handle, and after hooks for flexible middleware implementation.
 *
 * Framework-agnostic design - works with Express, Fastify, Koa, or any HTTP framework.
 * Type parameters allow you to specify request, response, and next function types.
 *
 * Inspired by Laravel's middleware pipeline pattern.
 *
 * @abstract
 * @template TRequest - Request type (e.g., Express Request)
 * @template TResponse - Response type (e.g., Express Response)
 * @template TNext - Next function type (e.g., Express NextFunction)
 *
 * @example Express middleware
 * ```typescript
 * import { Request, Response, NextFunction } from 'express';
 *
 * export class LoggingMiddleware extends BaseMiddleware<Request, Response, NextFunction> {
 *   protected async before(req: Request, res: Response): Promise<void> {
 *     console.log('Before request:', req.method, req.url);
 *   }
 *
 *   protected handle(req: Request, res: Response, next: NextFunction): void {
 *     // Main middleware logic
 *     next();
 *   }
 *
 *   protected async after(req: Request, res: Response): Promise<void> {
 *     console.log('After request completed');
 *   }
 * }
 * ```
 *
 * @example Fastify middleware
 * ```typescript
 * import { FastifyRequest, FastifyReply } from 'fastify';
 *
 * export class FastifyLoggingMiddleware extends BaseMiddleware<
 *   FastifyRequest,
 *   FastifyReply,
 *   () => void
 * > {
 *   // Implementation with Fastify types
 * }
 * ```
 */
export abstract class BaseMiddleware<TRequest = any, TResponse = any, TNext = any> {
  /**
   * Logger instance
   *
   * Can be used by subclasses to log important events or errors
   */
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Main middleware entry point.
   * Orchestrates the before -> handle -> after lifecycle.
   *
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function in middleware chain
   */
  public use(req: TRequest, res: TResponse, next: TNext): void {
    this.executeLifecycle(req, res, next).catch((error) => {
      // Pass errors to error handler
      (next as any)(error);
    });
  }

  /**
   * Execute the middleware lifecycle hooks.
   *
   * @param req - Request object
   * @param res - Response object
   * @param next - Next function
   */
  private async executeLifecycle(req: TRequest, res: TResponse, next: TNext): Promise<void> {
    try {
      // Execute before hook
      await this.before(req, res);

      // Check if response was already sent in before hook
      // Note: This check is framework-specific and may need to be overridden
      if (this.isResponseSent(res)) {
        return;
      }

      // Execute main handle logic
      // Wrap next() to track if it was called
      let nextCalled = false;
      const wrappedNext = ((error?: any) => {
        nextCalled = true;
        if (error) {
          (next as any)(error);
        } else {
          // Execute after hook before calling next
          this.after(req, res)
            .catch(next as any)
            .then(() => {
              if (!this.isResponseSent(res)) {
                (next as any)();
              }
            });
        }
      }) as TNext;

      await this.handle(req, res, wrappedNext);

      // If handle didn't call next and response wasn't sent, call after hook
      if (!nextCalled && !this.isResponseSent(res)) {
        await this.after(req, res);
      }
    } catch (error) {
      // Let error propagate to error handler
      throw error;
    }
  }

  /**
   * Hook executed before the main middleware logic.
   *
   * Use for:
   * - Request validation
   * - Logging request details
   * - Setting up request context
   * - Early termination (by sending response)
   *
   * @param req - Request object
   * @param res - Response object
   *
   * @example
   * ```typescript
   * protected async before(req: Request, res: Response): Promise<void> {
   *   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
   *
   *   // Early termination example
   *   if (!req.headers.authorization) {
   *     res.status(401).json({ error: 'Unauthorized' });
   *     return; // Response sent, handle() won't execute
   *   }
   * }
   * ```
   */
  protected async before(req: TRequest, res: TResponse): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Main middleware logic.
   *
   * This is where the core middleware functionality should be implemented.
   * Must call next() to pass control to the next middleware.
   *
   * @param req - Request object
   * @param res - Response object
   * @param next - Call this to pass to next middleware
   *
   * @example
   * ```typescript
   * protected handle(req: Request, res: Response, next: NextFunction): void {
   *   // Modify request
   *   (req as any).timestamp = Date.now();
   *
   *   // Pass to next middleware
   *   next();
   * }
   * ```
   */
  protected abstract handle(req: TRequest, res: TResponse, next: TNext): Promise<void> | void;

  /**
   * Hook executed after the main middleware logic.
   *
   * Use for:
   * - Logging response details
   * - Cleanup operations
   * - Metrics collection
   * - Response modification (if headers not sent yet)
   *
   * Note: This runs BEFORE calling next(), so the final response
   * may not be available yet. Use response event listeners if you
   * need to act on the final response.
   *
   * @param req - Request object
   * @param res - Response object
   *
   * @example
   * ```typescript
   * protected async after(req: Request, res: Response): Promise<void> {
   *   const duration = Date.now() - (req as any).timestamp;
   *   console.log(`Request took ${duration}ms`);
   *
   *   // Cleanup
   *   delete (req as any).timestamp;
   * }
   * ```
   */
  protected async after(req: TRequest, res: TResponse): Promise<void> {
    // Override in subclass if needed
  }

  /**
   * Helper to check if the request should be processed.
   *
   * Override this to conditionally skip middleware execution.
   *
   * @param req - Request object
   * @returns True if middleware should process this request
   *
   * @example
   * ```typescript
   * protected shouldProcess(req: Request): boolean {
   *   // Skip for health check endpoints
   *   return !req.url.startsWith('/health');
   * }
   * ```
   */
  protected shouldProcess(req: TRequest): boolean {
    return true;
  }

  /**
   * Check if the response has been sent.
   *
   * Framework-specific implementation. Override this method for different frameworks.
   * Default implementation works with Express-like responses.
   *
   * @param res - Response object
   * @returns True if response headers have been sent
   *
   * @example Express (default)
   * ```typescript
   * protected isResponseSent(res: Response): boolean {
   *   return res.headersSent;
   * }
   * ```
   *
   * @example Fastify
   * ```typescript
   * protected isResponseSent(res: FastifyReply): boolean {
   *   return res.sent;
   * }
   * ```
   */
  protected isResponseSent(res: TResponse): boolean {
    // Default implementation for Express-like responses
    return (res as any).headersSent ?? false;
  }
}
