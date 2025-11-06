import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiHeader,
  ApiConsumes,
  ApiProduces,
  ApiExtension,
  ApiTags,
  ApiExcludeEndpoint,
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
  ApiBodyOptions,
  ApiHeaderOptions,
} from '@nestjs/swagger';
import { Type } from '@nestjs/common';

/**
 * Builds Swagger/OpenAPI documentation decorators.
 *
 * Creates decorators for documenting API endpoints in OpenAPI specification.
 * Handles operation metadata, parameters, request/response bodies, and more.
 */

/**
 * Builds the main API operation decorator.
 *
 * Creates the @ApiOperation decorator with operation metadata including
 * summary, description, operation ID, and tags.
 *
 * @param options - Operation documentation options
 * @returns ApiOperation decorator
 */
export function buildApiOperation(options: ApiOperationOptions): MethodDecorator {
  return ApiOperation(options);
}

/**
 * Builds API parameter decorators.
 *
 * Creates @ApiParam decorators for documenting path parameters.
 *
 * @param params - Array of parameter configurations
 * @returns Array of ApiParam decorators
 *
 * @example
 * ```typescript
 * const decorators = buildApiParams([
 *   { name: 'id', type: 'string', description: 'User ID' }
 * ]);
 * ```
 */
export function buildApiParams(params: ApiParamOptions[]): MethodDecorator[] {
  return params.map((param) => ApiParam(param));
}

/**
 * Builds API query parameter decorators.
 *
 * Creates @ApiQuery decorators for documenting query string parameters.
 *
 * @param queries - Array of query parameter configurations
 * @returns Array of ApiQuery decorators
 *
 * @example
 * ```typescript
 * const decorators = buildApiQueries([
 *   { name: 'page', type: 'number', description: 'Page number' },
 *   { name: 'limit', type: 'number', description: 'Items per page' }
 * ]);
 * ```
 */
export function buildApiQueries(queries: ApiQueryOptions[]): MethodDecorator[] {
  return queries.map((query) => ApiQuery(query));
}

/**
 * Builds API request body decorator.
 *
 * Creates @ApiBody decorator for documenting request body structure.
 * Accepts either a DTO class or detailed configuration object.
 *
 * @param body - Body configuration or DTO class
 * @returns ApiBody decorator
 *
 * @example
 * With DTO class:
 * ```typescript
 * const decorator = buildApiBody(CreateUserDto);
 * ```
 *
 * @example
 * With configuration:
 * ```typescript
 * const decorator = buildApiBody({
 *   description: 'User data',
 *   schema: { type: 'object', properties: { ... } }
 * });
 * ```
 */
export function buildApiBody<T = any>(body: ApiBodyOptions | Type<T>): MethodDecorator {
  // If body is a class (DTO), wrap it in type configuration
  if (typeof body === 'function') {
    return ApiBody({ type: body });
  }

  // Otherwise use the configuration as-is
  return ApiBody(body);
}

/**
 * Builds API header decorators.
 *
 * Creates @ApiHeader decorators for documenting expected request headers.
 *
 * @param headers - Array of header configurations
 * @returns Array of ApiHeader decorators
 *
 * @example
 * ```typescript
 * const decorators = buildApiHeaders([
 *   { name: 'Authorization', description: 'Bearer token' },
 *   { name: 'X-API-Key', description: 'API key' }
 * ]);
 * ```
 */
export function buildApiHeaders(headers: ApiHeaderOptions[]): MethodDecorator[] {
  return headers.map((header) => ApiHeader(header));
}

/**
 * Builds API consumes decorator.
 *
 * Creates @ApiConsumes decorator to document accepted content types.
 *
 * @param consumes - Array of MIME types
 * @returns ApiConsumes decorator
 *
 * @example
 * ```typescript
 * const decorator = buildApiConsumes([
 *   'application/json',
 *   'multipart/form-data'
 * ]);
 * ```
 */
export function buildApiConsumes(consumes: string[]): MethodDecorator {
  return ApiConsumes(...consumes);
}

/**
 * Builds API produces decorator.
 *
 * Creates @ApiProduces decorator to document response content types.
 *
 * @param produces - Array of MIME types
 * @returns ApiProduces decorator
 *
 * @example
 * ```typescript
 * const decorator = buildApiProduces([
 *   'application/json',
 *   'application/xml'
 * ]);
 * ```
 */
export function buildApiProduces(produces: string[]): MethodDecorator {
  return ApiProduces(...produces);
}

/**
 * Builds API extension decorators.
 *
 * Creates @ApiExtension decorators for custom OpenAPI extensions.
 * Extensions should follow the 'x-' naming convention.
 *
 * @param extensions - Map of extension names to values
 * @returns Array of ApiExtension decorators
 *
 * @example
 * ```typescript
 * const decorators = buildApiExtensions({
 *   'x-custom-field': 'value',
 *   'x-rate-limit': { limit: 100, window: 60 }
 * });
 * ```
 */
export function buildApiExtensions(extensions: Record<string, any>): MethodDecorator[] {
  return Object.entries(extensions).map(([key, value]) => ApiExtension(key, value));
}

/**
 * Builds API tags decorator.
 *
 * Creates @ApiTags decorator for grouping endpoints in documentation.
 *
 * @param tags - Array of tag names
 * @returns ApiTags decorator
 *
 * @example
 * ```typescript
 * const decorator = buildApiTags(['users', 'authentication']);
 * ```
 */
export function buildApiTags(tags: string[]): ClassDecorator | MethodDecorator {
  return ApiTags(...tags);
}

/**
 * Builds API exclude endpoint decorator.
 *
 * Creates @ApiExcludeEndpoint decorator to hide endpoint from documentation.
 *
 * @returns ApiExcludeEndpoint decorator
 *
 * @example
 * ```typescript
 * const decorator = buildApiExclude();
 * // Endpoint will not appear in Swagger UI
 * ```
 */
export function buildApiExclude(): MethodDecorator {
  return ApiExcludeEndpoint();
}
