/**
 * Performance metrics for a service
 */
export interface ServiceMetrics {
  /**
   * Service token description
   */
  token: string;

  /**
   * Number of times resolved
   */
  resolutionCount: number;

  /**
   * Total time spent resolving (ms)
   */
  totalTime: number;

  /**
   * Average resolution time (ms)
   */
  averageTime: number;

  /**
   * Minimum resolution time (ms)
   */
  minTime: number;

  /**
   * Maximum resolution time (ms)
   */
  maxTime: number;

  /**
   * Last resolution time (ms)
   */
  lastTime: number;
}
