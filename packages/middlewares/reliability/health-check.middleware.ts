import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HealthCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.path === '/health' || req.path === '/healthz') {
      return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (req.path === '/ready') {
      return res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
    }

    if (req.path === '/live') {
      return res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
    }

    next();
  }
}
