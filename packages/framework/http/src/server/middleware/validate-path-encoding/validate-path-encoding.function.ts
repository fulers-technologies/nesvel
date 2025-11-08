import { ValidatePathEncodingMiddleware } from './validate-path-encoding';
import { ValidatePathEncodingOptions } from './validate-path-encoding.interface';

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
export function validatePathEncoding(options: ValidatePathEncodingOptions = {}): ValidatePathEncodingMiddleware {
  return new ValidatePathEncodingMiddleware(options);
}
