import { RouteOptions } from '@interfaces/api-endpoint-options.interface';

/**
 * Deep merges two objects with special handling for arrays.
 *
 * Recursively merges source object into target object. Arrays are
 * concatenated rather than replaced, and nested objects are merged.
 *
 * @param target - Target object to merge into
 * @param source - Source object to merge from
 * @returns Merged object
 *
 * @internal
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    // Use Object.prototype.hasOwnProperty.call to avoid prototype pollution
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      // Handle array concatenation
      if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Type assertion: we know this is valid since both are arrays
        (result[key] as unknown[]) = [...targetValue, ...sourceValue];
      }
      // Handle nested object merging
      else if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        // Type assertion: we know both are objects from the checks above
        (result[key] as Record<string, unknown>) = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        );
      }
      // Handle primitive values and null
      else if (sourceValue !== undefined) {
        // Type assertion: source value is defined
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Merges multiple endpoint option objects with precedence.
 *
 * Combines default options, preset options, and user options into a
 * single configuration object. Later arguments take precedence over
 * earlier ones.
 *
 * Special handling:
 * - Arrays are concatenated (e.g., headers, guards)
 * - Nested objects are deep merged (e.g., responses, cache)
 * - Primitive values from later options override earlier ones
 *
 * @param options - Variable number of option objects to merge
 * @returns Merged endpoint options
 *
 * @example
 * ```typescript
 * const merged = mergeOptions(
 *   { method: 'GET', httpCode: 200 },
 *   { httpCode: 201, path: '/users' },
 *   { auth: { bearer: true } }
 * );
 * // Result: { method: 'GET', httpCode: 201, path: '/users', auth: { bearer: true } }
 * ```
 *
 * @example
 * Array concatenation:
 * ```typescript
 * const merged = mergeOptions(
 *   { headers: [{ name: 'X-Default' }] },
 *   { headers: [{ name: 'X-Custom' }] }
 * );
 * // Result: { headers: [{ name: 'X-Default' }, { name: 'X-Custom' }] }
 * ```
 */
export function mergeOptions(...options: Partial<RouteOptions>[]): Partial<RouteOptions> {
  // Start with empty object
  let result: Partial<RouteOptions> = {};

  // Merge each option object in order
  for (const option of options) {
    if (option && typeof option === 'object') {
      result = deepMerge(result, option);
    }
  }

  return result;
}

/**
 * Merges user options with defaults, respecting the disableDefaults flag.
 *
 * If disableDefaults is true, only user options are returned.
 * Otherwise, defaults are merged with user options taking precedence.
 *
 * @param defaults - Default options to apply
 * @param userOptions - User-provided options
 * @returns Merged options respecting disableDefaults flag
 *
 * @example
 * ```typescript
 * const merged = mergeWithDefaults(
 *   { httpCode: 200, consumes: ['application/json'] },
 *   { httpCode: 201 }
 * );
 * // Result: { httpCode: 201, consumes: ['application/json'] }
 * ```
 *
 * @example
 * With disableDefaults:
 * ```typescript
 * const merged = mergeWithDefaults(
 *   { httpCode: 200, consumes: ['application/json'] },
 *   { httpCode: 201, disableDefaults: true }
 * );
 * // Result: { httpCode: 201, disableDefaults: true }
 * ```
 */
export function mergeWithDefaults(
  defaults: Partial<RouteOptions>,
  userOptions: Partial<RouteOptions>
): Partial<RouteOptions> {
  // If defaults are disabled, return only user options
  if (userOptions.disableDefaults === true) {
    return userOptions;
  }

  // Otherwise merge defaults with user options
  return mergeOptions(defaults, userOptions);
}
