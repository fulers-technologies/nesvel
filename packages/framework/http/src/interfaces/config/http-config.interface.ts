import type { HttpClientConfig } from './http-client-config.interface';
import type { HttpServerConfig } from './http-server-config.interface';

/**
 * HTTP Module Configuration Interface
 *
 * Defines the structure for HTTP client and server configuration.
 * Provides type-safe configuration for both Axios-based HTTP client
 * and Express-based server middleware.
 */
export interface HttpConfig {
  /**
   * Register module globally
   *
   * When true, the module will be available globally without imports.
   *
   * @env HTTP_GLOBAL
   * @default false
   */
  isGlobal?: boolean;

  /**
   * HTTP client configuration
   *
   * Options for the Axios-based HTTP client used for making requests.
   */
  client?: HttpClientConfig;

  /**
   * HTTP server configuration
   *
   * Options for Express-based server middleware and response handling.
   */
  server?: HttpServerConfig;
}
