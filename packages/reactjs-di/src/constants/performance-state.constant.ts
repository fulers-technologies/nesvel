/**
 * Performance State Constant
 *
 * @description
 * Global performance monitoring state.
 */

import type { PerformanceState } from '../interfaces';

/**
 * Global performance state
 */
export const performanceState: PerformanceState = {
  enabled: false,
  metrics: new Map(),
  startTimes: new Map(),
};
