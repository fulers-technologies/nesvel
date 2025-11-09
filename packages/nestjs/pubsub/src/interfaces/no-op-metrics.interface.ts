import { IPubSubMetrics } from './metrics.interface';

/**
 * Default no-op implementation of IPubSubMetrics.
 *
 * This implementation does nothing and can be used when metrics collection is disabled.
 * It ensures that the PubSub system can operate without a metrics provider.
 *
 * @example
 * ```typescript
 * const metrics = NoOpMetrics.make();
 * metrics.incrementCounter('test'); // Does nothing
 * ```
 */
export class NoOpMetrics implements IPubSubMetrics {
  /**
   * No-op counter increment.
   * @param _metric - Ignored
   * @param _tags - Ignored
   */
  incrementCounter(_metric: string, _tags?: Record<string, string>): void {
    // No operation
  }

  /**
   * No-op gauge setter.
   * @param _metric - Ignored
   * @param _value - Ignored
   * @param _tags - Ignored
   */
  setGauge(_metric: string, _value: number, _tags?: Record<string, string>): void {
    // No operation
  }

  /**
   * No-op histogram recorder.
   * @param _metric - Ignored
   * @param _value - Ignored
   * @param _tags - Ignored
   */
  recordHistogram(_metric: string, _value: number, _tags?: Record<string, string>): void {
    // No operation
  }

  /**
   * No-op timer that returns a no-op stop function.
   * @param _metric - Ignored
   * @param _tags - Ignored
   * @returns A no-op function
   */
  startTimer(_metric: string, _tags?: Record<string, string>): () => void {
    return () => {
      // No operation
    };
  }
}
