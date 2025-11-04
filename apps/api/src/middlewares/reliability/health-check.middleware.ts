import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HealthCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.path === '/health' || req.path === '/healthz') {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    if (req.path === '/ready') {
      res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
      return;
    }

    if (req.path === '/live') {
      res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
      return;
    }

    next();
  }
}
