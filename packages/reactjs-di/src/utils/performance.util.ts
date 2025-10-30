import { getService } from './container.util';
import type { ServiceIdentifier } from '../types';
import type { ServiceMetrics, PerformanceReportOptions } from '../interfaces';
import { performanceState } from '../constants';

/**
 * Enable performance monitoring
 *
 * @param enable - Whether to enable monitoring (default: true)
 *
 * @description
 * Enables tracking of service resolution times.
 * Call before resolving services to capture metrics.
 *
 * @example
 * ```ts
 * import { enablePerformanceMonitoring } from '~/di/utils/performance.util';
 *
 * if (import.meta.env.DEV) {
 *   enablePerformanceMonitoring();
 * }
 * ```
 */
export function enablePerformanceMonitoring(enable = true): void {
  performanceState.enabled = enable;

  if (!enable) {
    performanceState.metrics.clear();
    performanceState.startTimes.clear();
  }
}

/**
 * Check if performance monitoring is enabled
 *
 * @returns True if monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(): boolean {
  return performanceState.enabled;
}

/**
 * Track service resolution time
 *
 * @param token - Service identifier
 * @param duration - Resolution time in milliseconds
 *
 * @description
 * Records resolution time for a service. Used internally by monitored getService.
 */
function trackResolution<T>(token: ServiceIdentifier<T>, duration: number): void {
  if (!performanceState.enabled) return;

  const tokenKey =
    typeof token === 'symbol' ? token.description || token.toString() : String(token);
  const existing = performanceState.metrics.get(tokenKey);

  if (existing) {
    const newCount = existing.resolutionCount + 1;
    const newTotal = existing.totalTime + duration;

    performanceState.metrics.set(tokenKey, {
      token: tokenKey,
      resolutionCount: newCount,
      totalTime: newTotal,
      averageTime: newTotal / newCount,
      minTime: Math.min(existing.minTime, duration),
      maxTime: Math.max(existing.maxTime, duration),
      lastTime: duration,
    });
  } else {
    performanceState.metrics.set(tokenKey, {
      token: tokenKey,
      resolutionCount: 1,
      totalTime: duration,
      averageTime: duration,
      minTime: duration,
      maxTime: duration,
      lastTime: duration,
    });
  }
}

/**
 * Get service with performance tracking
 *
 * @template T - Service type
 * @param token - Service identifier
 * @returns Service instance
 *
 * @description
 * Wrapper around getService that tracks resolution time.
 * Use this instead of getService when performance monitoring is enabled.
 *
 * @example
 * ```ts
 * import { getServiceWithMetrics } from '~/di/utils/performance.util';
 *
 * const logger = getServiceWithMetrics<ILogger>(LOGGER_SERVICE);
 * ```
 */
export function getServiceWithMetrics<T>(token: ServiceIdentifier<T>): T {
  if (!performanceState.enabled) {
    return getService<T>(token);
  }

  const start = performance.now();
  const service = getService<T>(token);
  const duration = performance.now() - start;

  trackResolution(token, duration);

  return service;
}

/**
 * Get all performance metrics
 *
 * @returns Array of service metrics
 *
 * @description
 * Returns performance metrics for all tracked services.
 *
 * @example
 * ```ts
 * import { getPerformanceMetrics } from '~/di/utils/performance.util';
 *
 * const metrics = getPerformanceMetrics();
 * metrics.forEach(metric => {
 *   console.log(`${metric.token}: ${metric.averageTime.toFixed(2)}ms`);
 * });
 * ```
 */
export function getPerformanceMetrics(): ServiceMetrics[] {
  return Array.from(performanceState.metrics.values());
}

/**
 * Get metrics for a specific service
 *
 * @param token - Service identifier
 * @returns Service metrics or null if not tracked
 *
 * @description
 * Returns performance metrics for a specific service.
 *
 * @example
 * ```ts
 * import { getServiceMetrics } from '~/di/utils/performance.util';
 *
 * const metrics = getServiceMetrics(LOGGER_SERVICE);
 * if (metrics) {
 *   console.log(`Logger resolved ${metrics.resolutionCount} times`);
 * }
 * ```
 */
export function getServiceMetrics<T>(token: ServiceIdentifier<T>): ServiceMetrics | null {
  const tokenKey =
    typeof token === 'symbol' ? token.description || token.toString() : String(token);
  return performanceState.metrics.get(tokenKey) || null;
}

/**
 * Clear all performance metrics
 *
 * @description
 * Resets all collected performance data.
 *
 * @example
 * ```ts
 * import { clearPerformanceMetrics } from '~/di/utils/performance.util';
 *
 * // After each test
 * afterEach(() => {
 *   clearPerformanceMetrics();
 * });
 * ```
 */
export function clearPerformanceMetrics(): void {
  performanceState.metrics.clear();
  performanceState.startTimes.clear();
}

/**
 * Get slowest services
 *
 * @param count - Number of services to return (default: 10)
 * @returns Array of slowest services by average time
 *
 * @description
 * Returns the slowest services by average resolution time.
 * Useful for identifying performance bottlenecks.
 *
 * @example
 * ```ts
 * import { getSlowestServices } from '~/di/utils/performance.util';
 *
 * const slowest = getSlowestServices(5);
 * console.log('Slowest services:');
 * slowest.forEach(({ token, averageTime }) => {
 *   console.log(`  ${token}: ${averageTime.toFixed(2)}ms`);
 * });
 * ```
 */
export function getSlowestServices(count = 10): ServiceMetrics[] {
  return getPerformanceMetrics()
    .sort((a, b) => b.averageTime - a.averageTime)
    .slice(0, count);
}

/**
 * Get most frequently resolved services
 *
 * @param count - Number of services to return (default: 10)
 * @returns Array of most frequently resolved services
 *
 * @description
 * Returns services sorted by resolution count.
 *
 * @example
 * ```ts
 * import { getMostUsedServices } from '~/di/utils/performance.util';
 *
 * const mostUsed = getMostUsedServices(5);
 * console.log('Most frequently resolved:');
 * mostUsed.forEach(({ token, resolutionCount }) => {
 *   console.log(`  ${token}: ${resolutionCount} times`);
 * });
 * ```
 */
export function getMostUsedServices(count = 10): ServiceMetrics[] {
  return getPerformanceMetrics()
    .sort((a, b) => b.resolutionCount - a.resolutionCount)
    .slice(0, count);
}

/**
 * Generate a performance report
 *
 * @param options - Report options
 * @returns Formatted performance report
 *
 * @description
 * Generates a human-readable performance report.
 *
 * @example
 * ```ts
 * import { generatePerformanceReport } from '~/di/utils/performance.util';
 *
 * console.log(generatePerformanceReport({
 *   includeSlowest: true,
 *   includeMostUsed: true,
 *   topCount: 5
 * }));
 * ```
 */
export function generatePerformanceReport(options: PerformanceReportOptions = {}): string {
  const { includeSlowest = true, includeMostUsed = true, topCount = 5 } = options;

  const metrics = getPerformanceMetrics();

  if (metrics.length === 0) {
    return 'No performance data collected';
  }

  const lines: string[] = [
    '='.repeat(60),
    'DI Performance Report',
    '='.repeat(60),
    '',
    `Total services tracked: ${metrics.length}`,
    `Total resolutions: ${metrics.reduce((sum, m) => sum + m.resolutionCount, 0)}`,
    '',
  ];

  if (includeSlowest) {
    lines.push('Slowest Services (by average time):');
    lines.push('-'.repeat(60));
    const slowest = getSlowestServices(topCount);
    slowest.forEach((metric, index) => {
      lines.push(
        `${index + 1}. ${metric.token}`,
        `   Average: ${metric.averageTime.toFixed(2)}ms`,
        `   Min: ${metric.minTime.toFixed(2)}ms | Max: ${metric.maxTime.toFixed(2)}ms`,
        `   Resolutions: ${metric.resolutionCount}`,
        '',
      );
    });
  }

  if (includeMostUsed) {
    lines.push('Most Frequently Resolved Services:');
    lines.push('-'.repeat(60));
    const mostUsed = getMostUsedServices(topCount);
    mostUsed.forEach((metric, index) => {
      lines.push(
        `${index + 1}. ${metric.token}`,
        `   Resolutions: ${metric.resolutionCount}`,
        `   Average time: ${metric.averageTime.toFixed(2)}ms`,
        '',
      );
    });
  }

  lines.push('='.repeat(60));

  return lines.join('\n');
}
