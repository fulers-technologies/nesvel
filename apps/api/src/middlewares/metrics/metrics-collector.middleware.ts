import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MetricsCollectorMiddleware implements NestMiddleware {
  private metrics = {
    totalRequests: 0,
    requestsByMethod: {} as Record<string, number>,
    requestsByStatus: {} as Record<number, number>,
    averageResponseTime: 0,
  };

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    this.metrics.totalRequests++;
    this.metrics.requestsByMethod[req.method] =
      (this.metrics.requestsByMethod[req.method] || 0) + 1;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.metrics.requestsByStatus[res.statusCode] =
        (this.metrics.requestsByStatus[res.statusCode] || 0) + 1;

      // Update average response time
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + duration) /
        this.metrics.totalRequests;
    });

    // Expose metrics endpoint
    if (req.path === '/metrics') {
      res.json(this.metrics);
      return;
    }

    next();
  }
}
