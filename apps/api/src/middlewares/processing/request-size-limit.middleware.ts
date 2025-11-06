import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nesvel/shared';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestSizeLimitMiddleware implements NestMiddleware {
  private readonly maxSize = parseInt(process.env.MAX_REQUEST_SIZE || '10485760'); // 10MB

  use(req: Request, res: Response, next: NextFunction): void {
    const contentLength = parseInt(req.headers['content-length'] || '0');

    if (contentLength > this.maxSize) {
      throw HttpException.make('Request payload too large', HttpStatus.PAYLOAD_TOO_LARGE);
    }

    next();
  }
}
