/**
 * Memory Thresholds Configuration Interface
 *
 * Configuration for memory usage thresholds in bytes.
 * Used by MemoryHealthIndicator to determine if memory usage is acceptable.
 *
 * **Memory Types**:
 * - **Heap**: V8 heap memory (allocated objects)
 * - **RSS**: Resident Set Size (total memory allocated to process)
 *
 * @interface IMemoryThresholds
 *
 * @example
 * ```typescript
 * const memoryThresholds: IMemoryThresholds = {
 *   heap: 150 * 1024 * 1024,  // 150 MB
 *   rss: 300 * 1024 * 1024,   // 300 MB
 * };
 * ```
 *
 * @example Development vs Production
 * ```typescript
 * // Development
 * const devThresholds: IMemoryThresholds = {
 *   heap: 200 * 1024 * 1024,   // 200 MB
 *   rss: 400 * 1024 * 1024,    // 400 MB
 * };
 *
 * // Production
 * const prodThresholds: IMemoryThresholds = {
 *   heap: 512 * 1024 * 1024,   // 512 MB
 *   rss: 1024 * 1024 * 1024,   // 1 GB
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IMemoryThresholds {
  /**
   * Heap Memory Threshold
   *
   * Maximum acceptable heap memory usage in bytes.
   * Heap memory is the V8 JavaScript heap where objects are allocated.
   *
   * **Monitoring**:
   * - If heap usage exceeds this threshold, health check fails
   * - Indicates potential memory leaks or excessive object allocation
   *
   * **Recommendations**:
   * - Development: 150-200 MB
   * - Production: 512 MB - 1 GB
   * - Set based on your application's actual usage patterns
   *
   * @default 150 * 1024 * 1024 (150 MB)
   *
   * @example
   * ```typescript
   * heap: 200 * 1024 * 1024  // 200 MB threshold
   * ```
   */
  heap?: number;

  /**
   * RSS Memory Threshold
   *
   * Maximum acceptable Resident Set Size in bytes.
   * RSS is the total memory allocated to the process (heap + stack + buffers).
   *
   * **Monitoring**:
   * - If RSS exceeds this threshold, health check fails
   * - Indicates overall memory pressure on the system
   *
   * **Recommendations**:
   * - Development: 300-400 MB
   * - Production: 1-2 GB
   * - Should be higher than heap threshold
   * - Consider container/pod memory limits
   *
   * @default 300 * 1024 * 1024 (300 MB)
   *
   * @example
   * ```typescript
   * rss: 400 * 1024 * 1024  // 400 MB threshold
   * ```
   */
  rss?: number;
}
