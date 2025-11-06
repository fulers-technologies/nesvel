import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nesvel/shared';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeout = parseInt(process.env.REQUEST_TIMEOUT || '30000'); // 30 seconds

  use(req: Request, res: Response, next: NextFunction): void {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        throw HttpException.make('Request timeout', HttpStatus.REQUEST_TIMEOUT);
      }
    }, this.timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  }
}
