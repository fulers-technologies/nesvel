/**
 * Performance report options
 */
export interface PerformanceReportOptions {
  /**
   * Include slowest services (default: true)
   */
  includeSlowest?: boolean;

  /**
   * Include most used services (default: true)
   */
  includeMostUsed?: boolean;

  /**
   * Number of services to include in each section (default: 5)
   */
  topCount?: number;
}
