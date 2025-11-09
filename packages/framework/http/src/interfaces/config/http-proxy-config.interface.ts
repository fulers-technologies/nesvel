/**
 * HTTP Proxy Configuration
 *
 * Configuration for routing requests through a proxy server.
 */
export interface HttpProxyConfig {
  /**
   * Proxy server hostname
   *
   * @env HTTP_PROXY_HOST
   */
  host?: string;

  /**
   * Proxy server port
   *
   * @env HTTP_PROXY_PORT
   */
  port?: number;

  /**
   * Proxy authentication
   */
  auth?: {
    /**
     * Proxy username
     *
     * @env HTTP_PROXY_USERNAME
     */
    username?: string;

    /**
     * Proxy password
     *
     * @env HTTP_PROXY_PASSWORD
     */
    password?: string;
  };

  /**
   * Protocol to use
   *
   * @env HTTP_PROXY_PROTOCOL
   * @default 'http'
   */
  protocol?: 'http' | 'https';
}
