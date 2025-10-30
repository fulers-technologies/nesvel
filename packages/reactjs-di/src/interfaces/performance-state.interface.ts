import type { ServiceMetrics } from './service-metrics.interface';

/**
 * Performance monitoring state
 */
export interface PerformanceState {
  enabled: boolean;
  metrics: Map<string, ServiceMetrics>;
  startTimes: Map<string, number>;
}
