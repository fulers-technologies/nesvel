import { RouteOptions } from '@interfaces/api-endpoint-options.interface';

/**
 * Custom error class for Route decorator option validation errors.
 *
 * Provides detailed context about validation failures including the
 * conflicting options that caused the error.
 */
export class RouteOptionsValidationError extends Error {
  constructor(
    message: string,
    public readonly conflictingOptions: string[]
  ) {
    super(message);
    this.name = 'RouteOptionsValidationError';
  }
}

/**
 * Validates Route decorator options for incompatible or conflicting configurations.
 *
 * This function checks for mutually exclusive options that would result in
 * runtime errors or unexpected behavior. It throws detailed errors when
 * incompatible options are detected.
 *
 * Validations performed:
 * - SSE endpoints cannot have request bodies
 * - File upload endpoints should not specify body DTOs
 * - Redirect endpoints cannot have responses
 * - SSE endpoints cannot have redirects
 *
 * @param options - Route options to validate
 * @throws {RouteOptionsValidationError} When incompatible options are detected
 *
 * @example
 * ```typescript
 * // Valid options
 * validateRouteOptions({
 *   method: HttpMethod.GET,
 *   path: '/users'
 * }); // No error
 * ```
 *
 * @example
 * ```typescript
 * // Invalid options - throws error
 * validateRouteOptions({
 *   sse: true,
 *   body: UserDto
 * }); // Throws: SSE endpoints cannot have request bodies
 * ```
 */
export function validateRouteOptions(options: RouteOptions): void {
  // Validation 1: SSE endpoints cannot have request bodies
  if (options.sse && options.body) {
    throw RouteOptionsValidationError.make(
      'Server-Sent Events (SSE) endpoints cannot have request bodies. ' +
        'SSE is for server-to-client streaming only.',
      ['sse', 'body']
    );
  }

  // Validation 2: File upload endpoints should not specify body DTOs
  // This is a warning rather than an error since technically both can coexist
  if ((options.file || options.files) && options.body) {
    console.warn(
      '[Route Decorator] Warning: File upload endpoints typically should not specify a body DTO. ' +
        'File upload data is handled separately from the body. Consider removing the body option.'
    );
  }

  // Validation 3: Redirect endpoints should not have responses configured
  if (options.redirect && options.responses) {
    console.warn(
      '[Route Decorator] Warning: Redirect endpoints should not have response documentation. ' +
        'The response is handled by the redirect itself.'
    );
  }

  // Validation 4: SSE endpoints cannot redirect
  if (options.sse && options.redirect) {
    throw RouteOptionsValidationError.make(
      'Server-Sent Events (SSE) endpoints cannot have redirects. ' +
        'SSE requires maintaining a persistent connection.',
      ['sse', 'redirect']
    );
  }

  // Validation 5: SSE endpoints should have specific produces content type
  if (options.sse && options.produces && !options.produces.includes('text/event-stream')) {
    console.warn(
      '[Route Decorator] Warning: SSE endpoints should produce "text/event-stream". ' +
        'The current produces configuration may not work correctly.'
    );
  }

  // Validation 6: File upload should have multipart/form-data content type
  if ((options.file || options.files) && options.consumes) {
    if (!options.consumes.includes('multipart/form-data')) {
      console.warn(
        '[Route Decorator] Warning: File upload endpoints should consume "multipart/form-data". ' +
          'The current consumes configuration may not work correctly.'
      );
    }
  }

  // Validation 7: Render cannot be used with SSE
  if (options.render && options.sse) {
    throw RouteOptionsValidationError.make(
      'Template rendering (render) cannot be used with Server-Sent Events (SSE). ' +
        'These are mutually exclusive response types.',
      ['render', 'sse']
    );
  }

  // Validation 8: Both file and files cannot be specified together
  if (options.file && options.files) {
    throw RouteOptionsValidationError.make(
      'Cannot specify both "file" (single file) and "files" (multiple files) options. ' +
        'Choose one based on whether you need single or multiple file upload.',
      ['file', 'files']
    );
  }

  // Validation 9: Cache should not be used with non-GET methods (warning only)
  if (options.cache?.enabled && options.method && options.method.toUpperCase() !== 'GET') {
    console.warn(
      '[Route Decorator] Warning: Caching is typically only used with GET requests. ' +
        `Current method is ${options.method}. Ensure this is intentional.`
    );
  }

  // Validation 10: Redirect status code validation
  if (options.redirect && options.httpCode) {
    if (options.httpCode < 300 || options.httpCode >= 400) {
      console.warn(
        '[Route Decorator] Warning: Redirect endpoints typically use 3xx status codes. ' +
          `Current httpCode is ${options.httpCode}.`
      );
    }
  }
}

/**
 * Validates cache configuration for correctness.
 *
 * Ensures cache TTL is a positive number and key patterns are valid.
 *
 * @param cache - Cache configuration to validate
 * @throws {Error} When cache configuration is invalid
 *
 * @internal
 */
export function validateCacheConfig(cache: any): void {
  if (!cache) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (cache.enabled && cache.ttl !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof cache.ttl !== 'number' || cache.ttl <= 0) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Invalid cache TTL: ${cache.ttl}. TTL must be a positive number (milliseconds).`
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (cache.key && typeof cache.key !== 'string') {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `Invalid cache key: ${cache.key}. Cache key must be a string.`
    );
  }
}

/**
 * Validates throttle/rate limit configuration.
 *
 * Ensures limit and TTL values are positive numbers.
 *
 * @param throttle - Throttle configuration to validate
 * @throws {Error} When throttle configuration is invalid
 *
 * @internal
 */
export function validateThrottleConfig(throttle: any): void {
  if (!throttle) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (throttle.limit !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof throttle.limit !== 'number' || throttle.limit <= 0) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Invalid throttle limit: ${throttle.limit}. Limit must be a positive number.`
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (throttle.ttl !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof throttle.ttl !== 'number' || throttle.ttl <= 0) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Invalid throttle TTL: ${throttle.ttl}. TTL must be a positive number (seconds).`
      );
    }
  }
}
