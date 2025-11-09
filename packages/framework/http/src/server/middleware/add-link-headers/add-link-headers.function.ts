import { AddLinkHeadersMiddleware } from './add-link-headers';
import type { AddLinkHeadersOptions } from '../../../interfaces';

/**
 * Add Link Headers Factory Function
 *
 * Creates an AddLinkHeadersMiddleware instance with the specified options.
 *
 * @param options - Link headers configuration
 * @returns AddLinkHeadersMiddleware instance
 *
 * @example Preload assets
 * ```typescript
 * consumer.apply(addLinkHeaders({
 *   assets: {
 *     '/assets/app.js': ['rel=preload', 'as=script'],
 *     '/assets/style.css': ['rel=preload', 'as=style'],
 *   }
 * })).forRoutes('*');
 * ```
 */
export function addLinkHeaders(options: AddLinkHeadersOptions = {}): AddLinkHeadersMiddleware {
  return AddLinkHeadersMiddleware.make(options);
}
