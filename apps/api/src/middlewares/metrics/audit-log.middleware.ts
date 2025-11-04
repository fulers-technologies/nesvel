import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuditLog');

  use(req: Request, res: Response, next: NextFunction): void {
    const sensitiveActions = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (sensitiveActions.includes(req.method)) {
      res.on('finish', () => {
        const auditLog = {
          timestamp: new Date().toISOString(),
          userId: req.user?.id,
          tenantId: req.tenantId,
          action: req.method,
          resource: req.originalUrl,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
          requestId: req.headers['x-request-id'],
        };

        this.logger.log(JSON.stringify(auditLog));
      });
    }

    next();
  }
}
