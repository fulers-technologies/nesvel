import { Injectable, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';
import type { ValidatePathEncodingOptions } from '../../../interfaces';

/**
 * Validate Path Encoding Middleware
 *
 * Laravel-style URL path encoding validation for NestJS.
 * Ensures incoming request paths have valid UTF-8 encoding to prevent
 * security issues from malformed URLs.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { ValidatePathEncodingMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(new ValidatePathEncodingMiddleware())
 *       .forRoutes('*');
 *   }
 * }
 * ```
 */
@Injectable()
export class ValidatePathEncodingMiddleware extends BaseHttpMiddleware {
  /**
   * Validation options.
   */
  private readonly options: Required<ValidatePathEncodingOptions>;

  /**
   * Constructor
   *
   * @param options - Path encoding validation configuration
   */
  constructor(options: ValidatePathEncodingOptions = {}) {
    super();

    this.options = {
      statusCode: options.statusCode ?? 400,
      errorMessage: options.errorMessage ?? 'Malformed URL path encoding',
    };
  }

  /**
   * Before hook: Validate path encoding.
   *
   * @param req - Express request
   * @param _res - Express response (unused)
   */
  protected async before(req: Request, _res: Response): Promise<void> {
    const path = req.path;
    const decodedPath = decodeURIComponent(path);

    if (!this.isValidUTF8(decodedPath)) {
      throw new HttpException(
        {
          statusCode: this.options.statusCode,
          message: this.options.errorMessage,
          error: 'Bad Request',
          path,
        },
        this.options.statusCode
      );
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
   * Check if string is valid UTF-8.
   * Uses TextEncoder/TextDecoder to validate UTF-8 encoding.
   *
   * @param str - String to validate
   * @returns True if valid UTF-8
   */
  private isValidUTF8(str: string): boolean {
    try {
      // Try to encode and decode the string
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8', { fatal: true });
      const encoded = encoder.encode(str);
      decoder.decode(encoded);
      return true;
    } catch (error) {
      return false;
    }
  }
}
