import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestSizeLimitMiddleware implements NestMiddleware {
  private readonly maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB

  use(req: Request, res: Response, next: NextFunction): void {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > this.maxSize) {
      throw new HttpException('Request payload too large', HttpStatus.PAYLOAD_TOO_LARGE);
    }

    next();
  }
}
