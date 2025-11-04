import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ErrorLogger');

  use(req: Request, res: Response, next: NextFunction): void {
    const originalSend = res.send;
    const logger = this.logger;

    res.send = function (this: Response, data: any): Response {
      if (res.statusCode >= 400) {
        const errorContext = req.errorContext || {};
        const errorLog = {
          ...errorContext,
          statusCode: res.statusCode,
          error: data,
        };

        if (res.statusCode >= 500) {
          logger.error('Server Error', JSON.stringify(errorLog));
        } else {
          logger.warn('Client Error', JSON.stringify(errorLog));
        }
      }

      return originalSend.call(this, data);
    };

    next();
  }
}
