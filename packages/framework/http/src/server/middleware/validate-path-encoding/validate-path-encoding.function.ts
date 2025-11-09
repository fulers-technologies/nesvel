import { ValidatePathEncodingMiddleware } from './validate-path-encoding';
import type { ValidatePathEncodingOptions } from '../../../interfaces';

/**
 * Validate Path Encoding Factory Function
 *
 * Creates a ValidatePathEncodingMiddleware instance with the specified options.
 *
 * @param options - Path encoding validation configuration
 * @returns ValidatePathEncodingMiddleware instance
 *
 * @example Basic usage
 * ```typescript
 * consumer.apply(validatePathEncoding()).forRoutes('*');
 * ```
 */
export function validatePathEncoding(
  options: ValidatePathEncodingOptions = {}
): ValidatePathEncodingMiddleware {
  return ValidatePathEncodingMiddleware.make(options);
}
