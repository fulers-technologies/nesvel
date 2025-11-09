/**
 * Trust Proxies Configuration Options
 *
 * Configures which proxies to trust for X-Forwarded-* headers.
 * Important for applications behind load balancers, CDNs, or reverse proxies.
 */
export interface TrustProxiesOptions {
  /**
   * Proxies to trust.
   *
   * - false: Don't trust any proxies
   * - true: Trust all proxies (use with caution in production)
   * - string: Trust specific proxy IP address
   * - string[]: Trust array of proxy IP addresses
   * - number: Trust first n hops from the front-facing proxy
   *
   * @default false
   * @example false
   * @example true
   * @example '10.0.0.1'
   * @example ['10.0.0.1', '192.168.1.1']
   * @example 1
   */
  proxies?: boolean | string | string[] | number;

  /**
   * Headers to trust from proxies.
   * Defaults to standard X-Forwarded-* headers.
   *
   * @default
   * {
   *   forwarded: 'Forwarded',
   *   xForwardedFor: 'X-Forwarded-For',
   *   xForwardedHost: 'X-Forwarded-Host',
   *   xForwardedProto: 'X-Forwarded-Proto',
   *   xForwardedPort: 'X-Forwarded-Port',
   * }
   */
  headers?: {
    forwarded?: string;
    xForwardedFor?: string;
    xForwardedHost?: string;
    xForwardedProto?: string;
    xForwardedPort?: string;
  };
}
