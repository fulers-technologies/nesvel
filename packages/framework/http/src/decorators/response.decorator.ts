import type { Response as ExpressResponse } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Response as EnhancedResponse } from '../server/response';

/**
 * Parameter decorator that extracts the enhanced Response object.
 *
 * This decorator automatically wraps the Express response with our
 * enhanced Response class that provides Laravel-style helper methods.
 *
 * Drop-in replacement for NestJS @Res() decorator with enhanced functionality.
 *
 * @param data - Optional property path to extract from the response
 * @param ctx - Execution context
 * @returns Enhanced Response instance or specific property
 *
 * @example
 * ```typescript
 * import { Controller, Get } from '@nestjs/common';
 * import { Res, NesvelResponse } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   index(@Res() response: NesvelResponse) {
 *     // Use Laravel-style methods with chaining
 *     return response
 *       .status(200)
 *       .header('X-Custom', 'value')
 *       .cache(3600)
 *       .json({ users: [] });
 *   }
 *
 *   @Get('download')
 *   download(@Res() response: Response) {
 *     return response
 *       .header('Content-Type', 'application/pdf')
 *       .cookie('downloaded', 'true')
 *       .send('PDF content');
 *   }
 * }
 * ```
 */
export const Res = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const response = ctx.switchToHttp().getResponse<ExpressResponse>();
  const enhancedResponse = EnhancedResponse.make(response);

  // If a specific property is requested, return that
  if (data) {
    return (response as any)[data];
  }

  // Return the enhanced response
  return enhancedResponse;
});
