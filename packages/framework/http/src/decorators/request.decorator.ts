import type { Request as ExpressRequest } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request as EnhancedRequest } from '../server/request';

/**
 * Parameter decorator that extracts the enhanced Request object.
 *
 * This decorator automatically wraps the Express request with our
 * enhanced Request class that provides Laravel-style helper methods.
 *
 * Drop-in replacement for NestJS @Req() decorator with enhanced functionality.
 *
 * @param data - Optional property path to extract from the request
 * @param ctx - Execution context
 * @returns Enhanced Request instance or specific property
 *
 * @example
 * ```typescript
 * import { Controller, Post } from '@nestjs/common';
 * import { Req, NesvelRequest } from '@nesvel/nestjs-http';
 *
 * @Controller('users')
 * export class UsersController {
 *   @Post()
 *   create(@Req() request: NesvelRequest) {
 *     // Use Laravel-style methods
 *     const data = request.only('name', 'email');
 *     const name = request.input('name', 'Guest');
 *
 *     if (request.filled('bio')) {
 *       // Bio was provided
 *     }
 *
 *     return { data };
 *   }
 *
 *   @Post('profile')
 *   updateProfile(@Req('body') body: any) {
 *     // Extract just the body
 *     return body;
 *   }
 * }
 * ```
 */
export const Req = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<ExpressRequest>();
  
  // Cast the Express request to our enhanced Request type
  // This works because Express request objects at runtime already have all properties
  const enhancedRequest = request as any as EnhancedRequest;

  // If a specific property is requested, return that
  if (data) {
    return (request as any)[data];
  }

  // Return the enhanced request
  return enhancedRequest;
});
