/**
 * Authentication configuration options for API endpoints.
 *
 * Supports multiple authentication schemes including Bearer tokens (JWT),
 * API keys, cookies, Basic auth, and OAuth2.
 */
export interface AuthOptions {
  /**
   * Bearer token authentication (typically JWT).
   *
   * When enabled, the endpoint expects an Authorization header with Bearer token.
   * Provide a string to specify a custom security scheme name in OpenAPI docs.
   *
   * @example
   * ```typescript
   * // Enable with default name 'JWT-auth'
   * bearer: true
   *
   * // Enable with custom name
   * bearer: 'CustomJWTAuth'
   * ```
   *
   * @default undefined (disabled)
   */
  bearer?: boolean | string;

  /**
   * API key authentication.
   *
   * Expects an API key in headers, query parameters, or cookies.
   * Provide a string to specify a custom security scheme name.
   *
   * @example
   * ```typescript
   * // Enable with default name 'api-key'
   * apiKey: true
   *
   * // Enable with custom name
   * apiKey: 'X-API-KEY'
   * ```
   *
   * @default undefined (disabled)
   */
  apiKey?: boolean | string;

  /**
   * Cookie-based authentication.
   *
   * Uses HTTP cookies for session management and authentication.
   * Provide a string to specify the cookie name or security scheme name.
   *
   * @example
   * ```typescript
   * // Enable with default name 'cookie-auth'
   * cookie: true
   *
   * // Enable with custom cookie name
   * cookie: 'session_id'
   * ```
   *
   * @default undefined (disabled)
   */
  cookie?: boolean | string;

  /**
   * HTTP Basic authentication.
   *
   * Uses username and password encoded in Base64 within Authorization header.
   * Provide a string to specify a custom security scheme name.
   *
   * @example
   * ```typescript
   * // Enable with default name 'basic'
   * basic: true
   *
   * // Enable with custom name
   * basic: 'BasicAuth'
   * ```
   *
   * @default undefined (disabled)
   */
  basic?: boolean | string;

  /**
   * OAuth2 authentication.
   *
   * Supports OAuth2 flows with configurable scopes.
   * Provide an array of required scopes for the endpoint.
   *
   * @example
   * ```typescript
   * // Enable without specific scopes
   * oauth2: true
   *
   * // Enable with required scopes
   * oauth2: ['read:users', 'write:users']
   * ```
   *
   * @default undefined (disabled)
   */
  oauth2?: boolean | string[];
}
