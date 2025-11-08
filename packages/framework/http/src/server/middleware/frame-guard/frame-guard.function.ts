import { FrameGuardMiddleware } from './frame-guard';
import { FrameGuardOptions } from './frame-guard.interface';

/**
 * Frame Guard Factory Function
 *
 * Creates a FrameGuardMiddleware instance with the specified options.
 *
 * @param options - Frame guard configuration
 * @returns FrameGuardMiddleware instance
 *
 * @example Basic usage
 * ```typescript
 * consumer.apply(frameGuard()).forRoutes('*');
 * ```
 *
 * @example Deny all framing
 * ```typescript
 * consumer.apply(frameGuard({ action: 'DENY' })).forRoutes('*');
 * ```
 */
export function frameGuard(options: FrameGuardOptions = {}): FrameGuardMiddleware {
  return new FrameGuardMiddleware(options);
}
