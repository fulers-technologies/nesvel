import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ErrorContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    req['errorContext'] = {
      requestId: req.headers['x-request-id'],
      correlationId: req.headers['x-correlation-id'],
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    };

    next();
  }
}
