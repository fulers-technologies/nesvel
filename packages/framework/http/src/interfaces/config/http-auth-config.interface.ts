/**
 * HTTP Authentication Configuration
 *
 * Default authentication credentials for HTTP requests.
 */
export interface HttpAuthConfig {
  /**
   * Username for basic auth
   *
   * @env HTTP_AUTH_USERNAME
   */
  username?: string;

  /**
   * Password for basic auth
   *
   * @env HTTP_AUTH_PASSWORD
   */
  password?: string;

  /**
   * Bearer token for authentication
   *
   * @env HTTP_AUTH_BEARER_TOKEN
   */
  bearerToken?: string;
}
