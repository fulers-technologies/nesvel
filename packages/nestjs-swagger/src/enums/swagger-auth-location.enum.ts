/**
 * Swagger Authentication Location Enum
 *
 * Defines where API key authentication parameters should be placed in HTTP requests.
 * Only applicable when using API Key authentication type.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum SwaggerAuthLocation {
  /**
   * API key in HTTP header
   * Most common and recommended location for API keys
   * Example: X-API-KEY: your-api-key
   */
  HEADER = 'header',

  /**
   * API key in URL query parameter
   * Convenient but less secure (logged in URLs, browser history)
   * Example: /api/endpoint?api_key=your-api-key
   */
  QUERY = 'query',

  /**
   * API key in HTTP cookie
   * Automatically sent with requests, good for web applications
   * Subject to CSRF considerations
   */
  COOKIE = 'cookie',
}
