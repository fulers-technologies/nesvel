import { SwaggerAuthType, SwaggerAuthLocation } from '../enums';

/**
 * Swagger Authentication Configuration Interface
 *
 * Defines the structure for configuring authentication schemes in Swagger/OpenAPI documentation.
 * Supports various authentication types including HTTP, API Key, OAuth2, and OpenID Connect.
 *
 * @interface SwaggerAuthConfig
 *
 * @example JWT Bearer Authentication
 * ```typescript
 * const jwtAuth: SwaggerAuthConfig = {
 *   type: 'http',
 *   scheme: 'bearer',
 *   bearerFormat: 'JWT',
 *   name: 'JWT',
 *   description: 'Enter JWT token',
 *   in: 'header'
 * };
 * ```
 *
 * @example API Key Authentication
 * ```typescript
 * const apiKeyAuth: SwaggerAuthConfig = {
 *   type: 'apiKey',
 *   name: 'X-API-KEY',
 *   description: 'API Key for authorization',
 *   in: 'header'
 * };
 * ```
 */
export interface SwaggerAuthConfig {
  /**
   * Authentication type
   *
   * Specifies the authentication mechanism to be used:
   * - SwaggerAuthType.HTTP: HTTP authentication (Basic, Bearer, etc.)
   * - SwaggerAuthType.API_KEY: API key authentication
   * - SwaggerAuthType.OAUTH2: OAuth 2.0 authentication
   * - SwaggerAuthType.OPEN_ID_CONNECT: OpenID Connect authentication
   *
   * @example SwaggerAuthType.HTTP
   * @example SwaggerAuthType.API_KEY
   */
  type: SwaggerAuthType;

  /**
   * HTTP authentication scheme
   *
   * The name of the HTTP Authorization scheme to be used.
   * Only applicable when type is 'http'.
   *
   * Common values:
   * - `basic`: Basic authentication
   * - `bearer`: Bearer token authentication
   * - `digest`: Digest authentication
   *
   * @optional
   * @example 'bearer'
   */
  scheme?: string;

  /**
   * Bearer token format
   *
   * A hint to the client to identify how the bearer token is formatted.
   * Only applicable when scheme is 'bearer'.
   *
   * @optional
   * @example 'JWT'
   */
  bearerFormat?: string;

  /**
   * Authentication name/identifier
   *
   * A unique name for the authentication scheme.
   * Used to reference this authentication in API operations.
   *
   * @example 'JWT'
   * @example 'X-API-KEY'
   */
  name: string;

  /**
   * Authentication description
   *
   * A brief description of the authentication scheme.
   * Displayed in the Swagger UI to help users understand how to authenticate.
   *
   * @optional
   * @example 'Enter JWT token'
   * @example 'API Key for authorization'
   */
  description?: string;

  /**
   * Location of the authentication parameter
   *
   * Specifies where the authentication parameter should be placed:
   * - SwaggerAuthLocation.HEADER: In the HTTP header
   * - SwaggerAuthLocation.QUERY: In the URL query string
   * - SwaggerAuthLocation.COOKIE: In a cookie
   *
   * Only applicable when type is SwaggerAuthType.API_KEY.
   *
   * @optional
   * @example SwaggerAuthLocation.HEADER
   */
  in?: SwaggerAuthLocation;
}
