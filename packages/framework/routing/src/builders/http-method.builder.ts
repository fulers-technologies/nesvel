import { HttpMethod } from '@nesvel/shared';
import { Get, Post, Put, Patch, Delete, Options, Head, All } from '@nestjs/common';

/**
 * HTTP Method Decorator Builder Module
 *
 * This module provides utility functions for creating NestJS HTTP method decorators
 * based on the HttpMethod enum. It maps enum values to their corresponding NestJS
 * route decorators (Get, Post, Put, etc.).
 *
 * @module HttpMethodBuilder
 */

/**
 * Creates an HTTP method decorator from an HttpMethod enum value or string.
 *
 * This function maps HttpMethod enum values to their corresponding NestJS decorators
 * and applies them with the specified path. It serves as a bridge between the
 * type-safe HttpMethod enum and NestJS's route decorators.
 *
 * The function performs case-insensitive matching and falls back to GET for unknown methods.
 *
 * @param method - HTTP method enum value or string (GET, POST, PUT, etc.)
 * @param path - URL path or array of paths for the route
 * @returns NestJS method decorator configured with the specified path
 *
 * @example
 * Using HttpMethod enum (recommended):
 * ```typescript
 * const decorator = buildHttpMethodDecorator(HttpMethod.GET, '/users');
 * // Returns: Get('/users')
 * ```
 *
 * @example
 * Using string value:
 * ```typescript
 * const decorator = buildHttpMethodDecorator('POST', '/users');
 * // Returns: Post('/users')
 * ```
 *
 * @example
 * Multiple paths:
 * ```typescript
 * const decorator = buildHttpMethodDecorator(HttpMethod.GET, ['/users', '/accounts']);
 * // Returns: Get(['/users', '/accounts'])
 * ```
 *
 * @example
 * With empty path (controller-level routing):
 * ```typescript
 * const decorator = buildHttpMethodDecorator(HttpMethod.POST);
 * // Returns: Post('')
 * ```
 */
export function buildHttpMethodDecorator(
  method: HttpMethod | string,
  path: string | string[] = ''
): MethodDecorator {
  // Normalize method to uppercase for case-insensitive matching
  // Cast to HttpMethod for type-safe switch comparison
  const normalizedMethod = method.toUpperCase() as HttpMethod;

  // Map method to corresponding NestJS decorator
  // Each case returns the appropriate decorator with the path applied
  switch (normalizedMethod) {
    case HttpMethod.GET:
      return Get(path);

    case HttpMethod.POST:
      return Post(path);

    case HttpMethod.PUT:
      return Put(path);

    case HttpMethod.PATCH:
      return Patch(path);

    case HttpMethod.DELETE:
      return Delete(path);

    case HttpMethod.OPTIONS:
      return Options(path);

    case HttpMethod.HEAD:
      return Head(path);

    case HttpMethod.ALL:
      return All(path);

    default:
      // Fallback to GET for unknown/invalid methods
      // This ensures the decorator always returns a valid value
      console.warn(
        `Unknown HTTP method "${method}", defaulting to GET. Use HttpMethod enum for type safety.`
      );
      return Get(path);
  }
}

/**
 * Validates if a method string corresponds to a valid HTTP method.
 *
 * Checks if the provided method matches one of the supported HTTP methods
 * defined in the HttpMethod enum. Performs case-insensitive comparison.
 *
 * This is useful for runtime validation of method strings, especially when
 * accepting method values from external sources (config files, API requests, etc.).
 *
 * @param method - Method string to validate
 * @returns True if the method is valid, false otherwise
 *
 * @example
 * Valid methods:
 * ```typescript
 * isValidHttpMethod('GET');     // true
 * isValidHttpMethod('post');    // true (case-insensitive)
 * isValidHttpMethod('DELETE');  // true
 * ```
 *
 * @example
 * Invalid methods:
 * ```typescript
 * isValidHttpMethod('INVALID'); // false
 * isValidHttpMethod('');        // false
 * isValidHttpMethod('CONNECT'); // false (not in our enum)
 * ```
 *
 * @example
 * Using with HttpMethod enum:
 * ```typescript
 * isValidHttpMethod(HttpMethod.GET); // true
 * ```
 */
export function isValidHttpMethod(method: string): boolean {
  // Extract all enum values for validation
  // This ensures we stay in sync with the HttpMethod enum
  const validMethods = Object.values(HttpMethod);

  // Perform case-insensitive comparison
  return validMethods.includes(method.toUpperCase() as HttpMethod);
}

/**
 * Gets all valid HTTP methods from the HttpMethod enum.
 *
 * Returns an array of all HTTP method values supported by the decorator.
 * Useful for generating documentation, validation schemas, or UI components.
 *
 * @returns Array of all valid HTTP method strings
 *
 * @example
 * ```typescript
 * const methods = getValidHttpMethods();
 * // Returns: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'ALL']
 * ```
 */
export function getValidHttpMethods(): string[] {
  return Object.values(HttpMethod);
}
