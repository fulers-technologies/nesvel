/**
 * Configuration options for backpressure control.
 *
 * Controls the maximum number of concurrent operations to prevent
 * system overload.
 */
export interface IBackpressureOptions {
  /**
   * Maximum number of operations that can be in-flight simultaneously.
   * When this limit is reached, new operations will wait until capacity becomes available.
   *
   * @default 1000
   */
  maxInflight: number;

  /**
   * Maximum time in milliseconds to wait for capacity before timing out.
   * If undefined, operations will wait indefinitely.
   *
   * @default undefined (no timeout)
   */
  waitTimeout?: number;

  /**
   * Polling interval in milliseconds when waiting for capacity.
   * Smaller values provide faster response but higher CPU usage.
   *
   * @default 10
   */
  pollInterval?: number;
}
