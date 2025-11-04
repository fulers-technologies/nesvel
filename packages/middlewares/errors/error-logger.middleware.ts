import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ErrorLogger');

  use(req: Request, res: Response, next: NextFunction): void {
    const originalSend = res.send;

    res.send = function (data: any): Response {
      if (res.statusCode >= 400) {
        const errorContext = req['errorContext'] || {};
        const errorLog = {
          ...errorContext,
          statusCode: res.statusCode,
          error: data,
        };

        if (res.statusCode >= 500) {
          this.logger.error('Server Error', JSON.stringify(errorLog));
        } else {
          this.logger.warn('Client Error', JSON.stringify(errorLog));
        }
      }

      return originalSend.call(this, data);
    }.bind(this);

    next();
  }
}
