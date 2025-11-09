import { Injectable, HttpException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { BaseHttpMiddleware } from '../base-http.middleware';

import type { ValidatePostSizeOptions } from '../../../interfaces';

/**
 * Validate Post Size Middleware
 *
 * Laravel-style request body size validation for NestJS.
 * Prevents oversized POST requests that could cause memory issues.
 *
 * Extends BaseHttpMiddleware to use before/handle/after lifecycle hooks.
 *
 * @example Basic usage
 * ```typescript
 * import { Module, MiddlewareConsumer } from '@nestjs/common';
 * import { ValidatePostSizeMiddleware } from '@nesvel/nestjs-http';
 *
 * @Module({})
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(ValidatePostSizeMiddleware.make({ maxSize: '10mb' }))
 *       .forRoutes('*');
 *   }
 * }
 * ```
 */
@Injectable()
export class ValidatePostSizeMiddleware extends BaseHttpMiddleware {
  /**
   * Validation options.
   */
  private readonly options: Required<ValidatePostSizeOptions>;

  /**
   * Maximum size in bytes.
   */
  private readonly maxSizeBytes: number;

  /**
   * Constructor
   *
   * @param options - Size validation configuration
   */
  constructor(options: ValidatePostSizeOptions = {}) {
    super();

    this.maxSizeBytes = this.parseSize(options.maxSize ?? '10mb');

    this.options = {
      maxSize: options.maxSize ?? '10mb',
      checkContentLength: options.checkContentLength ?? true,
      errorMessage:
        options.errorMessage ??
        `Request entity too large. Maximum size is ${this.maxSizeBytes} bytes.`,
      statusCode: options.statusCode ?? 413, // 413 Payload Too Large
    };
  }

  /**
   * Before hook: Check Content-Length header if enabled.
   *
   * @param req - Express request
   * @param res - Express response
   */
  protected async before(req: Request, res: Response): Promise<void> {
    if (!this.options.checkContentLength) {
      return;
    }

    const contentLength = req.get('content-length');

    if (contentLength) {
      const size = parseInt(contentLength, 10);

      if (!isNaN(size) && size > this.maxSizeBytes) {
        throw HttpException.make(
          {
            statusCode: this.options.statusCode,
            message: this.options.errorMessage,
            error: 'Payload Too Large',
            maxSize: this.maxSizeBytes,
            receivedSize: size,
          },
          this.options.statusCode
        );
      }
    }
  }

  /**
   * Handle hook: Track body size as it's received.
   *
   * @param req - Express request
   * @param res - Express response
   * @param next - Next function
   */
  protected handle(req: Request, res: Response, next: NextFunction): void {
    let receivedBytes = 0;

    // Listen to data chunks
    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;

      if (receivedBytes > this.maxSizeBytes) {
        // Destroy the request stream
        req.pause();
        req.unpipe();

        throw HttpException.make(
          {
            statusCode: this.options.statusCode,
            message: this.options.errorMessage,
            error: 'Payload Too Large',
            maxSize: this.maxSizeBytes,
            receivedSize: receivedBytes,
          },
          this.options.statusCode
        );
      }
    });

    next();
  }

  /**
   * Parse size string to bytes.
   *
   * Supports: '10mb', '1gb', '500kb', or plain numbers.
   *
   * @param size - Size string or number
   * @returns Size in bytes
   */
  private parseSize(size: string | number): number {
    if (typeof size === 'number') {
      return size;
    }

    const units: Record<string, number> = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
      tb: 1024 * 1024 * 1024 * 1024,
    };

    const match = size.toLowerCase().match(/^([\d.]+)\s*(\w+)?$/);

    if (!match || !match[1]) {
      throw new Error(`Invalid size format: ${size}`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';

    const multiplier = units[unit];

    if (multiplier === undefined) {
      throw new Error(`Unknown size unit: ${unit}`);
    }

    return Math.floor(value * multiplier);
  }

  /**
   * Get the maximum size in bytes.
   *
   * @returns Maximum size in bytes
   */
  public getMaxSize(): number {
    return this.maxSizeBytes;
  }

  /**
   * Get the maximum size in human-readable format.
   *
   * @returns Human-readable size
   */
  public getMaxSizeFormatted(): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    if (this.maxSizeBytes === 0) return '0 B';

    const i = Math.floor(Math.log(this.maxSizeBytes) / Math.log(1024));
    const size = this.maxSizeBytes / Math.pow(1024, i);

    return `${size.toFixed(2)} ${sizes[i]}`;
  }
}
