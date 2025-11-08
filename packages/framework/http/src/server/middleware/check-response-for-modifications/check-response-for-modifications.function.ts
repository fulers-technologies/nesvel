import { CheckResponseForModificationsMiddleware } from './check-response-for-modifications';
import { CheckResponseForModificationsOptions } from './check-response-for-modifications.interface';

/**
 * Check Response For Modifications Factory Function
 *
 * Creates a CheckResponseForModificationsMiddleware instance.
 *
 * @param options - Configuration options
 * @returns CheckResponseForModificationsMiddleware instance
 *
 * @example
 * ```typescript
 * consumer.apply(checkResponseForModifications()).forRoutes('*');
 * ```
 */
export function checkResponseForModifications(options: CheckResponseForModificationsOptions = {}): CheckResponseForModificationsMiddleware {
  return new CheckResponseForModificationsMiddleware(options);
}
