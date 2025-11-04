import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DebugHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (process.env.NODE_ENV !== 'production') {
      const startMemory = process.memoryUsage();
      const startTime = Date.now();

      res.on('finish', () => {
        const endMemory = process.memoryUsage();
        const duration = Date.now() - startTime;

        res.setHeader(
          'X-Debug-Memory-Used',
          `${Math.round((endMemory.heapUsed - startMemory.heapUsed) / 1024)}KB`
        );
        res.setHeader('X-Debug-Duration', `${duration}ms`);
      });
    }

    next();
  }
}
