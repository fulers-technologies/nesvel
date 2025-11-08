import {
  ApiBearerAuth,
  ApiSecurity,
  ApiCookieAuth,
  ApiBasicAuth,
  ApiOAuth2,
} from '@nestjs/swagger';
import { AuthOptions } from '@interfaces/auth-options.interface';

/**
 * Builds authentication-related decorators.
 *
 * Creates Swagger/OpenAPI security decorators based on authentication
 * configuration. Supports multiple authentication schemes including
 * Bearer tokens, API keys, cookies, Basic auth, and OAuth2.
 */

/**
 * Builds authentication decorators from auth options.
 *
 * Analyzes auth configuration and creates appropriate security decorators
 * for OpenAPI documentation. Multiple auth schemes can be enabled simultaneously.
 *
 * @param auth - Authentication configuration options
 * @returns Array of authentication decorators
 *
 * @example
 * Bearer token authentication:
 * ```typescript
 * const decorators = buildAuthDecorators({ bearer: true });
 * // Returns: [ApiBearerAuth('JWT-auth')]
 * ```
 *
 * @example
 * Multiple authentication schemes:
 * ```typescript
 * const decorators = buildAuthDecorators({
 *   bearer: 'CustomJWT',
 *   apiKey: 'X-API-KEY'
 * });
 * // Returns: [ApiBearerAuth('CustomJWT'), ApiSecurity('X-API-KEY')]
 * ```
 *
 * @example
 * OAuth2 with scopes:
 * ```typescript
 * const decorators = buildAuthDecorators({
 *   oauth2: ['read:users', 'write:users']
 * });
 * // Returns: [ApiOAuth2(['read:users', 'write:users'])]
 * ```
 */
export function buildAuthDecorators(auth: AuthOptions): Array<ClassDecorator | MethodDecorator> {
  const decorators: Array<ClassDecorator | MethodDecorator> = [];

  // Build Bearer token authentication decorator
  if (auth.bearer) {
    const bearerName = typeof auth.bearer === 'string' ? auth.bearer : 'JWT-auth';
    decorators.push(ApiBearerAuth(bearerName));
  }

  // Build API key authentication decorator
  if (auth.apiKey) {
    const apiKeyName = typeof auth.apiKey === 'string' ? auth.apiKey : 'api-key';
    decorators.push(ApiSecurity(apiKeyName));
  }

  // Build cookie authentication decorator
  if (auth.cookie) {
    const cookieName = typeof auth.cookie === 'string' ? auth.cookie : 'cookie-auth';
    decorators.push(ApiCookieAuth(cookieName));
  }

  // Build Basic authentication decorator
  if (auth.basic) {
    const basicName = typeof auth.basic === 'string' ? auth.basic : 'basic';
    decorators.push(ApiBasicAuth(basicName));
  }

  // Build OAuth2 authentication decorator
  if (auth.oauth2) {
    const scopes = Array.isArray(auth.oauth2) ? auth.oauth2 : [];
    decorators.push(ApiOAuth2(scopes));
  }

  return decorators;
}

/**
 * Builds a Bearer authentication decorator.
 *
 * Creates @ApiBearerAuth decorator for JWT or other bearer token authentication.
 *
 * @param name - Security scheme name (default: 'JWT-auth')
 * @returns ApiBearerAuth decorator
 *
 * @example
 * ```typescript
 * const decorator = buildBearerAuth('CustomJWT');
 * ```
 */
export function buildBearerAuth(name: string = 'JWT-auth'): ClassDecorator | MethodDecorator {
  return ApiBearerAuth(name);
}

/**
 * Builds an API key authentication decorator.
 *
 * Creates @ApiSecurity decorator for API key authentication.
 *
 * @param name - Security scheme name (default: 'api-key')
 * @returns ApiSecurity decorator
 *
 * @example
 * ```typescript
 * const decorator = buildApiKeyAuth('X-API-KEY');
 * ```
 */
export function buildApiKeyAuth(name: string = 'api-key'): ClassDecorator | MethodDecorator {
  return ApiSecurity(name);
}

/**
 * Builds a cookie authentication decorator.
 *
 * Creates @ApiCookieAuth decorator for cookie-based authentication.
 *
 * @param name - Security scheme name (default: 'cookie-auth')
 * @returns ApiCookieAuth decorator
 *
 * @example
 * ```typescript
 * const decorator = buildCookieAuth('session_id');
 * ```
 */
export function buildCookieAuth(name: string = 'cookie-auth'): ClassDecorator | MethodDecorator {
  return ApiCookieAuth(name);
}

/**
 * Builds a Basic authentication decorator.
 *
 * Creates @ApiBasicAuth decorator for HTTP Basic authentication.
 *
 * @param name - Security scheme name (default: 'basic')
 * @returns ApiBasicAuth decorator
 *
 * @example
 * ```typescript
 * const decorator = buildBasicAuth();
 * ```
 */
export function buildBasicAuth(name: string = 'basic'): ClassDecorator | MethodDecorator {
  return ApiBasicAuth(name);
}

/**
 * Builds an OAuth2 authentication decorator.
 *
 * Creates @ApiOAuth2 decorator with optional scopes.
 *
 * @param scopes - Array of required OAuth2 scopes
 * @returns ApiOAuth2 decorator
 *
 * @example
 * ```typescript
 * const decorator = buildOAuth2Auth(['read:users', 'write:users']);
 * ```
 */
export function buildOAuth2Auth(scopes: string[] = []): ClassDecorator | MethodDecorator {
  return ApiOAuth2(scopes);
}
