import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class ETagMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const originalSend = res.send;
    res.send = function (data: any): Response {
      if (data && req.method === 'GET') {
        const etag = createHash('md5').update(JSON.stringify(data)).digest('hex');
        res.setHeader('ETag', `"${etag}"`);

        if (req.headers['if-none-match'] === `"${etag}"`) {
          res.status(304);
          return res.end();
        }
      }
      return originalSend.call(this, data);
    };
    next();
  }
}
