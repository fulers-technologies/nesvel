import { HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiMovedPermanentlyResponse,
  ApiFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
  ApiTooManyRequestsResponse,
  ApiInternalServerErrorResponse,
  ApiBadGatewayResponse,
  ApiServiceUnavailableResponse,
  ApiGatewayTimeoutResponse,
  ApiDefaultResponse,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { ResponseOptions } from '../interfaces/response-options.interface';
import { DEFAULT_API_RESPONSE_HEADERS } from '../constants/default-headers.constant';

/**
 * Response Decorator Builder Module
 *
 * This module provides comprehensive utilities for building Swagger/OpenAPI response decorators.
 * It handles the creation of documentation for all HTTP status codes (2xx, 3xx, 4xx, 5xx) and
 * automatically merges default headers with custom configurations.
 *
 * The builders follow REST best practices and organize responses by status code ranges:
 * - 2xx: Successful responses (OK, Created, Accepted, No Content)
 * - 3xx: Redirection responses (Moved Permanently, Found)
 * - 4xx: Client error responses (Bad Request, Unauthorized, Not Found, etc.)
 * - 5xx: Server error responses (Internal Error, Bad Gateway, Service Unavailable, etc.)
 *
 * @module ResponseBuilder
 */

/**
 * Builds an array of response decorators from response configuration options.
 *
 * This is the main entry point for generating all Swagger/OpenAPI response documentation
 * decorators for an endpoint. It processes the response configuration object and creates
 * appropriate decorators for each defined response type.
 *
 * The function handles:
 * - Success responses (2xx): ok, created, accepted, noContent
 * - Redirect responses (3xx): movedPermanently, found
 * - Client error responses (4xx): badRequest, unauthorized, forbidden, notFound, conflict, etc.
 * - Server error responses (5xx): internalError, badGateway, serviceUnavailable, gatewayTimeout
 * - Default fallback responses
 * - Custom status code responses
 *
 * Each response is conditionally added only if defined in the configuration,
 * keeping the documentation clean and relevant.
 *
 * @param responses - Complete response configuration object with various status codes
 * @returns Array of NestJS Swagger response decorators ready to be applied
 *
 * @example
 * Complete configuration:
 * ```typescript
 * const decorators = buildResponseDecorators({
 *   ok: { description: 'User retrieved successfully', type: UserDto },
 *   notFound: 'User not found',
 *   unauthorized: { description: 'Invalid credentials' },
 *   internalError: { description: 'Server error occurred' }
 * });
 * // Returns: [
 * //   ApiOkResponse({ description: 'User retrieved successfully', type: UserDto, headers: {...} }),
 * //   ApiNotFoundResponse({ description: 'User not found' }),
 * //   ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
 * //   ApiInternalServerErrorResponse({ description: 'Server error occurred' })
 * // ]
 * ```
 *
 * @example
 * Minimal configuration:
 * ```typescript
 * const decorators = buildResponseDecorators({
 *   ok: { description: 'Success', type: ResponseDto }
 * });
 * // Returns only the OK response decorator
 * ```
 *
 * @example
 * With custom status codes:
 * ```typescript
 * const decorators = buildResponseDecorators({
 *   ok: { description: 'Success' },
 *   custom: {
 *     418: { description: "I'm a teapot" },
 *     429: { description: 'Too many requests' }
 *   }
 * });
 * ```
 */
export function buildResponseDecorators(
  responses: ResponseOptions,
): MethodDecorator[] {
  // Initialize decorator array to collect all response decorators
  const decorators: MethodDecorator[] = [];

  // 200 OK - Standard success response for GET, PUT, PATCH
  if (responses.ok) {
    decorators.push(buildOkResponse(responses.ok));
  }

  // 201 Created - Resource successfully created (typically POST)
  if (responses.created) {
    decorators.push(buildCreatedResponse(responses.created));
  }

  // 202 Accepted - Request accepted but processing not complete (async operations)
  if (responses.accepted) {
    decorators.push(buildAcceptedResponse(responses.accepted));
  }

  // 204 No Content - Success with no response body (typically DELETE)
  if (responses.noContent) {
    decorators.push(buildNoContentResponse(responses.noContent));
  }

  // 301 Moved Permanently - Resource permanently moved to new URL
  if (responses.movedPermanently) {
    decorators.push(buildMovedPermanentlyResponse(responses.movedPermanently));
  }

  // 302 Found - Resource temporarily moved
  if (responses.found) {
    decorators.push(buildFoundResponse(responses.found));
  }

  // 400 Bad Request - Invalid request data or parameters
  if (responses.badRequest) {
    decorators.push(buildBadRequestResponse(responses.badRequest));
  }

  // 401 Unauthorized - Authentication required or failed
  if (responses.unauthorized) {
    decorators.push(buildUnauthorizedResponse(responses.unauthorized));
  }

  // 403 Forbidden - Authenticated but not authorized to access
  if (responses.forbidden) {
    decorators.push(buildForbiddenResponse(responses.forbidden));
  }

  // 404 Not Found - Resource does not exist
  if (responses.notFound) {
    decorators.push(buildNotFoundResponse(responses.notFound));
  }

  // 409 Conflict - Request conflicts with current state (e.g., duplicate resource)
  if (responses.conflict) {
    decorators.push(buildConflictResponse(responses.conflict));
  }

  // 422 Unprocessable Entity - Request well-formed but semantically incorrect
  if (responses.unprocessableEntity) {
    decorators.push(
      buildUnprocessableEntityResponse(responses.unprocessableEntity),
    );
  }

  // 429 Too Many Requests - Rate limit exceeded
  if (responses.tooManyRequests) {
    decorators.push(buildTooManyRequestsResponse(responses.tooManyRequests));
  }

  // 500 Internal Server Error - Generic server error
  if (responses.internalError) {
    decorators.push(buildInternalErrorResponse(responses.internalError));
  }

  // 502 Bad Gateway - Invalid response from upstream server
  if (responses.badGateway) {
    decorators.push(buildBadGatewayResponse(responses.badGateway));
  }

  // 503 Service Unavailable - Service temporarily unavailable (maintenance, overload)
  if (responses.serviceUnavailable) {
    decorators.push(
      buildServiceUnavailableResponse(responses.serviceUnavailable),
    );
  }

  // 504 Gateway Timeout - Upstream server failed to respond in time
  if (responses.gatewayTimeout) {
    decorators.push(buildGatewayTimeoutResponse(responses.gatewayTimeout));
  }

  // Default response - Fallback for undocumented status codes
  if (responses.default) {
    decorators.push(buildDefaultResponse(responses.default));
  }

  // Custom responses - Any additional status codes not covered above
  if (responses.custom) {
    decorators.push(...buildCustomResponses(responses.custom));
  }

  return decorators;
}

/**
 * Merges default API response headers with custom user-provided headers.
 *
 * This internal utility function combines the default headers (defined in constants)
 * with any custom headers specified in the response options. User-provided headers
 * take precedence over defaults, allowing overrides when needed.
 *
 * The function ensures all responses include standard headers like:
 * - X-Request-Id: Request tracking identifier
 * - X-Response-Time: Response processing time
 * - X-API-Version: API version information
 *
 * While allowing custom headers for specific needs:
 * - Cache-Control: Caching directives
 * - Location: Resource location (for redirects/creates)
 * - Retry-After: Rate limiting information
 *
 * @param options - Original response configuration options
 * @returns Enhanced response options with merged headers
 *
 * @internal This function is not exported and used only within this module
 *
 * @example
 * ```typescript
 * const options = {
 *   description: 'Success',
 *   headers: { 'Cache-Control': 'no-cache' }
 * };
 * const merged = mergeResponseHeaders(options);
 * // Result: {
 * //   description: 'Success',
 * //   headers: {
 * //     'X-Request-Id': '...',      // from defaults
 * //     'X-Response-Time': '...',   // from defaults
 * //     'Cache-Control': 'no-cache' // user override
 * //   }
 * // }
 * ```
 */
function mergeResponseHeaders(options: ApiResponseOptions): ApiResponseOptions {
  // Spread operator creates a shallow copy and merges headers
  // Order matters: user headers come last to override defaults
  return {
    ...options,
    headers: {
      // First: Apply all default headers
      ...DEFAULT_API_RESPONSE_HEADERS,
      // Then: Apply user headers (overrides defaults)
      ...options.headers,
    },
  };
}

/**
 * Normalizes response configuration to a consistent ApiResponseOptions format.
 *
 * This internal utility provides flexible response definition by accepting either:
 * 1. Simple string descriptions (converted to { description: string })
 * 2. Full ApiResponseOptions objects (passed through unchanged)
 *
 * This allows developers to use shorthand string notation for simple cases while
 * still supporting complex configurations when needed.
 *
 * The normalization ensures all downstream functions work with a consistent format,
 * simplifying the builder implementation.
 *
 * @param response - Response configuration in either format
 * @returns Normalized ApiResponseOptions object
 *
 * @internal This function is not exported and used only within this module
 *
 * @example
 * String input (simplified):
 * ```typescript
 * const result = normalizeResponse('User not found');
 * // Returns: { description: 'User not found' }
 * ```
 *
 * @example
 * Object input (full configuration):
 * ```typescript
 * const result = normalizeResponse({
 *   description: 'User not found',
 *   type: ErrorDto,
 *   headers: { 'X-Error-Code': 'USER_NOT_FOUND' }
 * });
 * // Returns: Same object unchanged
 * ```
 */
function normalizeResponse(
  response: string | ApiResponseOptions,
): ApiResponseOptions {
  // Type guard: Check if input is a string
  // If string: wrap in description property
  // If object: return as-is (already in correct format)
  return typeof response === 'string' ? { description: response } : response;
}

// ============================================================================
// Success Response Builders (2xx Status Codes)
// ============================================================================

/**
 * Builds a 200 OK response decorator.
 *
 * The most common success response, indicating the request was processed successfully.
 * Used for GET (retrieve), PUT (update), and PATCH (partial update) operations.
 *
 * Automatically merges default response headers with custom headers.
 *
 * @param options - Response configuration including description, type, and headers
 * @returns ApiOkResponse decorator configured with merged headers
 *
 * @example
 * ```typescript
 * const decorator = buildOkResponse({
 *   description: 'User retrieved successfully',
 *   type: UserDto
 * });
 * ```
 */
export function buildOkResponse(options: ApiResponseOptions): MethodDecorator {
  return ApiOkResponse(
    mergeResponseHeaders({ status: HttpStatus.OK, ...options }),
  );
}

/**
 * Builds a 201 Created response decorator.
 *
 * Indicates a new resource was successfully created.
 * Typically used for POST operations. Often includes a Location header
 * pointing to the new resource.
 *
 * Automatically merges default response headers with custom headers.
 *
 * @param options - Response configuration including description, type, and headers
 * @returns ApiCreatedResponse decorator configured with merged headers
 *
 * @example
 * ```typescript
 * const decorator = buildCreatedResponse({
 *   description: 'User created successfully',
 *   type: UserDto,
 *   headers: {
 *     'Location': '/users/123'
 *   }
 * });
 * ```
 */
export function buildCreatedResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiCreatedResponse(
    mergeResponseHeaders({ status: HttpStatus.CREATED, ...options }),
  );
}

/**
 * Builds a 202 Accepted response decorator.
 *
 * Indicates the request was accepted for processing but not yet complete.
 * Used for asynchronous operations like batch processing, long-running tasks,
 * or operations that trigger background jobs.
 *
 * Automatically merges default response headers with custom headers.
 *
 * @param options - Response configuration including description and tracking information
 * @returns ApiAcceptedResponse decorator configured with merged headers
 *
 * @example
 * ```typescript
 * const decorator = buildAcceptedResponse({
 *   description: 'Report generation started',
 *   type: JobStatusDto,
 *   headers: {
 *     'X-Job-Id': 'job_abc123'
 *   }
 * });
 * ```
 */
export function buildAcceptedResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiAcceptedResponse(
    mergeResponseHeaders({ status: HttpStatus.ACCEPTED, ...options }),
  );
}

/**
 * Builds a 204 No Content response decorator.
 *
 * Indicates successful processing with no response body.
 * Typically used for DELETE operations or updates where the response
 * doesn't need to include the modified resource.
 *
 * Automatically merges default response headers with custom headers.
 *
 * @param options - Response configuration (typically just description)
 * @returns ApiNoContentResponse decorator configured with merged headers
 *
 * @example
 * ```typescript
 * const decorator = buildNoContentResponse({
 *   description: 'User deleted successfully'
 * });
 * ```
 */
export function buildNoContentResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiNoContentResponse(
    mergeResponseHeaders({ status: HttpStatus.NO_CONTENT, ...options }),
  );
}

// ============================================================================
// Redirection Response Builders (3xx Status Codes)
// ============================================================================

/**
 * Builds a 301 Moved Permanently response decorator.
 *
 * Indicates the resource has been permanently moved to a new URL.
 * Clients should update their bookmarks/links. Search engines will
 * transfer page rank to the new URL.
 *
 * Should include a Location header with the new URL.
 *
 * @param options - Response configuration including Location header
 * @returns ApiMovedPermanentlyResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildMovedPermanentlyResponse({
 *   description: 'Resource permanently moved',
 *   headers: {
 *     'Location': 'https://api.example.com/v2/users/123'
 *   }
 * });
 * ```
 */
export function buildMovedPermanentlyResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiMovedPermanentlyResponse({
    status: HttpStatus.MOVED_PERMANENTLY,
    ...options,
  });
}

/**
 * Builds a 302 Found response decorator.
 *
 * Indicates the resource is temporarily available at a different URL.
 * The original URL should be used for future requests.
 * Often used for temporary redirects during maintenance or A/B testing.
 *
 * Should include a Location header with the temporary URL.
 *
 * @param options - Response configuration including Location header
 * @returns ApiFoundResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildFoundResponse({
 *   description: 'Temporary redirect',
 *   headers: {
 *     'Location': 'https://api.example.com/users/123?temp=true'
 *   }
 * });
 * ```
 */
export function buildFoundResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiFoundResponse({ status: HttpStatus.FOUND, ...options });
}

// ============================================================================
// Client Error Response Builders (4xx Status Codes)
// ============================================================================

/**
 * Builds a 400 Bad Request response decorator.
 *
 * Indicates the request was malformed or contains invalid data.
 * Common causes:
 * - Invalid JSON syntax
 * - Missing required fields
 * - Type mismatches
 * - Constraint violations
 *
 * Accepts either a simple string description or full configuration object.
 *
 * @param response - String description or full response configuration
 * @returns ApiBadRequestResponse decorator
 *
 * @example
 * Simple string:
 * ```typescript
 * const decorator = buildBadRequestResponse('Invalid request data');
 * ```
 *
 * @example
 * Full configuration:
 * ```typescript
 * const decorator = buildBadRequestResponse({
 *   description: 'Validation failed',
 *   type: ValidationErrorDto
 * });
 * ```
 */
export function buildBadRequestResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiBadRequestResponse({
    status: HttpStatus.BAD_REQUEST,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 401 Unauthorized response decorator.
 *
 * Indicates authentication is required or has failed.
 * Common causes:
 * - Missing authentication token
 * - Invalid/expired token
 * - Invalid credentials
 *
 * Client should authenticate and retry.
 *
 * @param response - String description or full response configuration
 * @returns ApiUnauthorizedResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildUnauthorizedResponse('Authentication required');
 * ```
 */
export function buildUnauthorizedResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiUnauthorizedResponse({
    status: HttpStatus.UNAUTHORIZED,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 403 Forbidden response decorator.
 *
 * Indicates the user is authenticated but lacks permission to access the resource.
 * Common causes:
 * - Insufficient role/permissions
 * - Resource ownership mismatch
 * - Feature access restrictions
 *
 * Unlike 401, re-authenticating won't help.
 *
 * @param response - String description or full response configuration
 * @returns ApiForbiddenResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildForbiddenResponse('Admin access required');
 * ```
 */
export function buildForbiddenResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiForbiddenResponse({
    status: HttpStatus.FORBIDDEN,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 404 Not Found response decorator.
 *
 * Indicates the requested resource does not exist.
 * Common causes:
 * - Invalid/non-existent ID
 * - Deleted resource
 * - Incorrect URL
 *
 * Should include helpful error messages to distinguish from other errors.
 *
 * @param response - String description or full response configuration
 * @returns ApiNotFoundResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildNotFoundResponse('User not found');
 * ```
 */
export function buildNotFoundResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiNotFoundResponse({
    status: HttpStatus.NOT_FOUND,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 409 Conflict response decorator.
 *
 * Indicates the request conflicts with the current state of the resource.
 * Common causes:
 * - Duplicate resource (email, username, etc.)
 * - Concurrent modification conflicts
 * - Business rule violations
 *
 * Client may be able to resolve by modifying the request.
 *
 * @param response - String description or full response configuration
 * @returns ApiConflictResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildConflictResponse('Email already exists');
 * ```
 */
export function buildConflictResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiConflictResponse({
    status: HttpStatus.CONFLICT,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 422 Unprocessable Entity response decorator.
 *
 * Indicates the request was well-formed but contains semantic errors.
 * Common causes:
 * - Business validation failures
 * - Logical inconsistencies
 * - Referential integrity violations
 *
 * Different from 400: syntax is valid but content is semantically incorrect.
 *
 * @param response - String description or full response configuration
 * @returns ApiUnprocessableEntityResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildUnprocessableEntityResponse(
 *   'Age must be greater than 18 for account creation'
 * );
 * ```
 */
export function buildUnprocessableEntityResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiUnprocessableEntityResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 429 Too Many Requests response decorator.
 *
 * Indicates the user has exceeded the rate limit.
 * Should include Retry-After header indicating when to retry.
 *
 * Common in:
 * - API rate limiting
 * - DDoS protection
 * - Resource throttling
 *
 * @param response - String description or full response configuration
 * @returns ApiTooManyRequestsResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildTooManyRequestsResponse({
 *   description: 'Rate limit exceeded',
 *   headers: {
 *     'Retry-After': '60',
 *     'X-RateLimit-Limit': '100',
 *     'X-RateLimit-Remaining': '0'
 *   }
 * });
 * ```
 */
export function buildTooManyRequestsResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiTooManyRequestsResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    ...normalizeResponse(response),
  });
}

// ============================================================================
// Server Error Response Builders (5xx Status Codes)
// ============================================================================

/**
 * Builds a 500 Internal Server Error response decorator.
 *
 * Indicates an unexpected error occurred on the server.
 * This is a generic "catch-all" error when no specific 5xx code applies.
 *
 * Common causes:
 * - Unhandled exceptions
 * - Null pointer errors
 * - Database connection failures
 *
 * Should be logged and monitored but not expose sensitive internal details.
 *
 * @param response - String description or full response configuration
 * @returns ApiInternalServerErrorResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildInternalErrorResponse(
 *   'An unexpected error occurred'
 * );
 * ```
 */
export function buildInternalErrorResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiInternalServerErrorResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 502 Bad Gateway response decorator.
 *
 * Indicates the server received an invalid response from an upstream server.
 * Common in microservices or proxy scenarios.
 *
 * Common causes:
 * - Upstream service returned invalid response
 * - Network issues between services
 * - Upstream service crashed mid-request
 *
 * @param response - String description or full response configuration
 * @returns ApiBadGatewayResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildBadGatewayResponse(
 *   'Upstream service returned invalid response'
 * );
 * ```
 */
export function buildBadGatewayResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiBadGatewayResponse({
    status: HttpStatus.BAD_GATEWAY,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 503 Service Unavailable response decorator.
 *
 * Indicates the service is temporarily unavailable.
 * Should include Retry-After header when known.
 *
 * Common causes:
 * - Server maintenance
 * - Server overload
 * - Temporary outage
 *
 * Differs from 500: this is temporary and expected to resolve.
 *
 * @param response - String description or full response configuration
 * @returns ApiServiceUnavailableResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildServiceUnavailableResponse({
 *   description: 'Service under maintenance',
 *   headers: {
 *     'Retry-After': '3600' // 1 hour
 *   }
 * });
 * ```
 */
export function buildServiceUnavailableResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiServiceUnavailableResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    ...normalizeResponse(response),
  });
}

/**
 * Builds a 504 Gateway Timeout response decorator.
 *
 * Indicates an upstream server failed to respond within the timeout period.
 * Common in proxy/gateway scenarios with slow backends.
 *
 * Common causes:
 * - Upstream service too slow
 * - Network congestion
 * - Upstream service hanging
 *
 * Client may retry, but should implement exponential backoff.
 *
 * @param response - String description or full response configuration
 * @returns ApiGatewayTimeoutResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildGatewayTimeoutResponse(
 *   'Upstream service did not respond in time'
 * );
 * ```
 */
export function buildGatewayTimeoutResponse(
  response: string | ApiResponseOptions,
): MethodDecorator {
  return ApiGatewayTimeoutResponse({
    status: HttpStatus.GATEWAY_TIMEOUT,
    ...normalizeResponse(response),
  });
}

// ============================================================================
// Default and Custom Response Builders
// ============================================================================

/**
 * Builds a default response decorator.
 *
 * This serves as a fallback for any status code not explicitly documented.
 * Useful for covering edge cases without documenting every possible response.
 *
 * Typically used when an endpoint might return various status codes
 * under different error conditions.
 *
 * @param options - Response configuration
 * @returns ApiDefaultResponse decorator
 *
 * @example
 * ```typescript
 * const decorator = buildDefaultResponse({
 *   description: 'Unexpected error occurred'
 * });
 * ```
 */
export function buildDefaultResponse(
  options: ApiResponseOptions,
): MethodDecorator {
  return ApiDefaultResponse(options);
}

/**
 * Builds custom response decorators for non-standard status codes.
 *
 * Allows documenting responses with status codes not covered by the
 * standard builder functions. Useful for:
 * - Custom application-specific status codes
 * - Less common HTTP status codes (418, 451, etc.)
 * - Vendor-specific extensions
 *
 * Each entry in the custom object maps a status code to its configuration.
 *
 * @param custom - Map of status codes to response configurations
 * @returns Array of ApiResponse decorators for each custom status
 *
 * @example
 * ```typescript
 * const decorators = buildCustomResponses({
 *   418: {
 *     description: "I'm a teapot",
 *     type: TeapotErrorDto
 *   },
 *   451: {
 *     description: 'Unavailable for legal reasons'
 *   },
 *   507: {
 *     description: 'Insufficient storage'
 *   }
 * });
 * ```
 *
 * @example
 * Application-specific codes:
 * ```typescript
 * const decorators = buildCustomResponses({
 *   460: { description: 'Client closed request' },
 *   499: { description: 'Client closed connection' }
 * });
 * ```
 */
export function buildCustomResponses(
  custom: Record<number, ApiResponseOptions>,
): MethodDecorator[] {
  // Convert the status code map into an array of decorators
  return Object.entries(custom).map(([statusCode, config]) =>
    // Create a generic ApiResponse with the specified status code
    // Number() ensures status is numeric (TypeScript safety)
    ApiResponse({ status: Number(statusCode), ...config }),
  );
}

// ============================================================================
// Response Helper Utilities
// ============================================================================

/**
 * Adds Cache-Control headers to response options.
 *
 * Helper utility for easily adding cache directives to API responses.
 * Merges with existing headers to avoid overwriting other headers.
 *
 * Common cache-control directives:
 * - 'public, max-age=3600' - Cacheable by browsers and CDNs for 1 hour
 * - 'private, max-age=300' - Only browser cache for 5 minutes
 * - 'no-cache' - Must revalidate before using cached copy
 * - 'no-store' - Never cache the response
 *
 * @param options - Response configuration to enhance
 * @param cacheControl - Cache-Control header value
 * @returns Enhanced response options with cache headers
 *
 * @example
 * ```typescript
 * const response = addCacheHeaders(
 *   { description: 'Success', type: UserDto },
 *   'public, max-age=3600'
 * );
 * // Returns: {
 * //   description: 'Success',
 * //   type: UserDto,
 * //   headers: {
 * //     'Cache-Control': { description: 'public, max-age=3600' }
 * //   }
 * // }
 * ```
 *
 * @example
 * With existing headers:
 * ```typescript
 * const response = addCacheHeaders(
 *   {
 *     description: 'Success',
 *     headers: { 'X-Custom': { description: 'value' } }
 *   },
 *   'no-cache'
 * );
 * // Preserves existing headers and adds Cache-Control
 * ```
 */
export function addCacheHeaders(
  options: ApiResponseOptions,
  cacheControl: string,
): ApiResponseOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Cache-Control': {
        description: cacheControl,
        schema: { type: 'string' },
      },
    },
  };
}

/**
 * Adds ETag header to response options.
 *
 * Helper for adding ETag headers to enable conditional requests.
 * Useful for optimizing bandwidth and supporting cache validation.
 *
 * @param options - Response configuration to enhance
 * @param example - Example ETag value (optional)
 * @returns Enhanced response options with ETag header
 *
 * @example
 * ```typescript
 * const response = addETagHeader(
 *   { description: 'Success', type: UserDto },
 *   '"33a64df551425fcc55e4d42a148795d9f25f89d4"'
 * );
 * ```
 */
export function addETagHeader(
  options: ApiResponseOptions,
  example?: string,
): ApiResponseOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      ETag: {
        description: 'Entity tag for cache validation',
        schema: { type: 'string' },
        ...(example && { example }),
      },
    },
  };
}

/**
 * Adds Last-Modified header to response options.
 *
 * Helper for adding Last-Modified headers to support conditional requests.
 *
 * @param options - Response configuration to enhance
 * @returns Enhanced response options with Last-Modified header
 *
 * @example
 * ```typescript
 * const response = addLastModifiedHeader(
 *   { description: 'Success', type: UserDto }
 * );
 * ```
 */
export function addLastModifiedHeader(
  options: ApiResponseOptions,
): ApiResponseOptions {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Last-Modified': {
        description: 'Last modification date of the resource',
        schema: { type: 'string', format: 'date-time' },
      },
    },
  };
}
