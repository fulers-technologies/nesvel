import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MaintenanceModeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
    const allowedPaths = ['/health', '/healthz', '/ready', '/live'];

    if (isMaintenanceMode && !allowedPaths.includes(req.path)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Service is currently under maintenance',
          retryAfter: 3600,
        },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    next();
  }
}
