import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as compression from 'compression';

@Injectable()
export class CompressionMiddleware implements NestMiddleware {
  private compressionHandler = compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    threshold: 1024,
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.compressionHandler(req, res, next);
  }
}
