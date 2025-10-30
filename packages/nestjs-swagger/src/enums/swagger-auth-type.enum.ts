/**
 * Swagger Authentication Type Enum
 *
 * Defines the supported authentication schemes for OpenAPI/Swagger documentation.
 * Each type represents a different authentication mechanism that can be documented
 * and tested through the Swagger UI.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum SwaggerAuthType {
  /**
   * HTTP authentication
   * Covers HTTP authentication schemes like Basic, Bearer, Digest
   * Uses the Authorization header
   */
  HTTP = 'http',

  /**
   * API Key authentication
   * Custom API key that can be sent in header, query, or cookie
   * Flexible placement and naming
   */
  API_KEY = 'apiKey',

  /**
   * OAuth 2.0 authentication
   * Industry-standard protocol for authorization
   * Supports multiple flows (authorization code, implicit, client credentials, etc.)
   */
  OAUTH2 = 'oauth2',

  /**
   * OpenID Connect authentication
   * Identity layer on top of OAuth 2.0
   * Provides authentication in addition to authorization
   */
  OPEN_ID_CONNECT = 'openIdConnect',
}
