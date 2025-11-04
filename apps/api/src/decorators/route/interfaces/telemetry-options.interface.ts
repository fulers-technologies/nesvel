/**
 * Telemetry and observability configuration for API endpoints.
 *
 * Enables distributed tracing and metrics collection for monitoring
 * and debugging endpoint performance and behavior.
 */
export interface TelemetryOptions {
  /**
   * Enable distributed tracing for this endpoint.
   *
   * Creates trace spans for request processing, allowing correlation
   * across service boundaries in distributed systems.
   *
   * @default false
   */
  trace?: boolean;

  /**
   * Enable metrics collection for this endpoint.
   *
   * Collects performance metrics such as request count, duration,
   * error rates, and other operational statistics.
   *
   * @default false
   */
  metrics?: boolean;

  /**
   * Custom span name for tracing.
   *
   * Overrides the default span name (usually method and path).
   * Useful for grouping related operations or providing clearer names.
   *
   * @example 'user.authentication'
   * @default Auto-generated from method and path
   */
  spanName?: string;
}
