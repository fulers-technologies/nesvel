/**
 * Health Check Function Type
 *
 * Function signature for custom health check operations.
 * Returns a promise that resolves to health check result data.
 *
 * **Usage**:
 * - Custom health checks in configuration
 * - Probe-specific health checks (liveness, readiness, startup)
 * - Dynamic health monitoring logic
 *
 * **Return Format**:
 * Should return an object with health status information:
 * ```typescript
 * {
 *   [key: string]: {
 *     status: 'up' | 'down',
 *     // ... additional metadata
 *   }
 * }
 * ```
 *
 * @typedef {Function} HealthCheckFunction
 *
 * @example Basic health check
 * ```typescript
 * const customCheck: HealthCheckFunction = async () => {
 *   return {
 *     redis: {
 *       status: 'up',
 *       connections: 10,
 *     }
 *   };
 * };
 * ```
 *
 * @example With error handling
 * ```typescript
 * const serviceCheck: HealthCheckFunction = async () => {
 *   try {
 *     await externalService.ping();
 *     return {
 *       externalService: {
 *         status: 'up',
 *         latency: 50,
 *       }
 *     };
 *   } catch (error: Error | any) {
 *     return {
 *       externalService: {
 *         status: 'down',
 *         error: error.message,
 *       }
 *     };
 *   }
 * };
 * ```
 *
 * @example Probe-specific checks
 * ```typescript
 * // Liveness check (lightweight)
 * const livenessCheck: HealthCheckFunction = async () => ({
 *   app: { status: 'up', uptime: process.uptime() }
 * });
 *
 * // Readiness check (with dependencies)
 * const readinessCheck: HealthCheckFunction = async () => {
 *   const dbOk = await database.ping();
 *   const cacheOk = await cache.ping();
 *   return {
 *     dependencies: {
 *       status: dbOk && cacheOk ? 'up' : 'down',
 *       database: dbOk,
 *       cache: cacheOk,
 *     }
 *   };
 * };
 *
 * // Startup check (initialization)
 * const startupCheck: HealthCheckFunction = async () => ({
 *   migrations: {
 *     status: await migrationsComplete() ? 'up' : 'down'
 *   }
 * });
 * ```
 *
 * @example In configuration
 * ```typescript
 * HealthModule.forRoot({
 *   customChecks: [
 *     async () => ({ custom: { status: 'up' } }),
 *   ],
 *   livenessChecks: [
 *     async () => ({ app: { status: 'up' } }),
 *   ],
 *   readinessChecks: [
 *     async () => {
 *       const ready = await checkDependencies();
 *       return { ready: { status: ready ? 'up' : 'down' } };
 *     },
 *   ],
 * })
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export type HealthCheckFunction = () => Promise<any>;
