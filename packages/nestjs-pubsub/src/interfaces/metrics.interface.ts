/**
 * Interface for PubSub metrics and telemetry integration.
 *
 * This interface provides a standardized way to collect metrics from the PubSub system,
 * enabling integration with monitoring systems like Prometheus, DataDog, New Relic, etc.
 *
 * @remarks
 * Implementations should be thread-safe and handle high-frequency metric updates efficiently.
 * Metrics are used to track message throughput, handler performance, error rates, and system health.
 *
 * @example
 * ```typescript
 * class PrometheusMetrics implements IPubSubMetrics {
 *   incrementCounter(metric: string, tags?: Record<string, string>): void {
 *     this.prometheus.counter(metric, tags).inc();
 *   }
 * }
 * ```
 */
export interface IPubSubMetrics {
  /**
   * Increment a counter metric by 1.
   *
   * Counters are monotonically increasing values used for tracking totals like message counts,
   * error counts, or operation counts. They only increase and never decrease.
   *
   * @param metric - The metric name (e.g., 'pubsub.messages.published')
   * @param tags - Optional key-value pairs for metric dimensions (e.g., { topic: 'orders', driver: 'memory' })
   *
   * @example
   * ```typescript
   * metrics.incrementCounter('pubsub.messages.published', { topic: 'user.created', driver: 'memory' });
   * metrics.incrementCounter('pubsub.errors.total', { topic: 'orders', errorType: 'timeout' });
   * ```
   */
  incrementCounter(metric: string, tags?: Record<string, string>): void;

  /**
   * Set a gauge metric to a specific value.
   *
   * Gauges represent instantaneous values that can increase or decrease, such as
   * connection counts, queue depths, or memory usage.
   *
   * @param metric - The metric name (e.g., 'pubsub.subscriptions.active')
   * @param value - The current value to set
   * @param tags - Optional key-value pairs for metric dimensions
   *
   * @example
   * ```typescript
   * metrics.setGauge('pubsub.subscriptions.active', 42, { driver: 'memory' });
   * metrics.setGauge('pubsub.messages.inflight', 150, { topic: 'orders' });
   * ```
   */
  setGauge(metric: string, value: number, tags?: Record<string, string>): void;

  /**
   * Record a value in a histogram metric.
   *
   * Histograms track the distribution of values over time, useful for measuring
   * message sizes, processing times, or batch sizes.
   *
   * @param metric - The metric name (e.g., 'pubsub.message.size.bytes')
   * @param value - The value to record in the histogram
   * @param tags - Optional key-value pairs for metric dimensions
   *
   * @example
   * ```typescript
   * metrics.recordHistogram('pubsub.message.size.bytes', messageSize, { topic: 'events' });
   * metrics.recordHistogram('pubsub.batch.size', batchCount, { driver: 'kafka' });
   * ```
   */
  recordHistogram(metric: string, value: number, tags?: Record<string, string>): void;

  /**
   * Start a timer and return a function to stop it.
   *
   * Timers measure duration of operations. The returned function should be called
   * when the operation completes to record the elapsed time.
   *
   * @param metric - The metric name (e.g., 'pubsub.handler.duration')
   * @param tags - Optional key-value pairs for metric dimensions
   * @returns A function that stops the timer and records the duration
   *
   * @example
   * ```typescript
   * const endTimer = metrics.startTimer('pubsub.handler.duration', { topic: 'orders', handler: 'processOrder' });
   * try {
   *   await processMessage(message);
   * } finally {
   *   endTimer(); // Records the duration automatically
   * }
   * ```
   */
  startTimer(metric: string, tags?: Record<string, string>): () => void;
}
