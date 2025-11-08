/**
 * Health status enum for PubSub system components.
 *
 * Represents the operational health of the PubSub system or its components.
 * Used by monitoring systems and health check endpoints to determine system state.
 */
export enum HealthStatus {
  /**
   * System is operating normally with no issues.
   * All operations are functioning as expected.
   */
  HEALTHY = 'healthy',

  /**
   * System is operational but experiencing non-critical issues.
   * Some subscriptions may have failed to register, or there are minor errors.
   * The system can still process messages but may not be at full capacity.
   */
  DEGRADED = 'degraded',

  /**
   * System is not operational or experiencing critical failures.
   * Driver is disconnected, or too many subscriptions have failed.
   * Immediate attention required.
   */
  UNHEALTHY = 'unhealthy',
}

/**
 * Detailed health status information for the PubSub system.
 *
 * Provides comprehensive information about the system's health including
 * connection status, subscription counts, error details, and uptime metrics.
 *
 * @remarks
 * This interface is used by health check endpoints (e.g., Kubernetes liveness/readiness probes)
 * and monitoring dashboards to determine if the system is functioning properly.
 */
export interface IPubSubHealthStatus {
  /**
   * Overall health status of the system.
   */
  status: HealthStatus;

  /**
   * The active PubSub driver type (memory, redis, kafka, google-pubsub).
   */
  driver: string;

  /**
   * Whether the driver is currently connected to its backend.
   * For MEMORY driver, this is always true if the EventEmitter is initialized.
   * For other drivers, this reflects the actual connection state.
   */
  connected: boolean;

  /**
   * Total number of active subscriptions across all topics.
   * This includes all registered message handlers.
   */
  subscriptions: number;

  /**
   * The most recent error encountered by the system, if any.
   * Null if no errors have occurred or errors have cleared.
   */
  lastError?: {
    /**
     * Error message describing what went wrong.
     */
    message: string;

    /**
     * Error stack trace for debugging.
     */
    stack?: string;

    /**
     * Timestamp when the error occurred.
     */
    timestamp: Date;

    /**
     * Context information about where the error occurred.
     */
    context?: Record<string, any>;
  };

  /**
   * System uptime in milliseconds since initialization.
   */
  uptime: number;

  /**
   * Additional driver-specific health information.
   *
   * @example
   * For Redis: { redisVersion: '6.2.0', memoryUsage: '1.2MB', clientCount: 5 }
   * For Kafka: { brokerCount: 3, consumerGroupLag: 42 }
   */
  details?: Record<string, any>;
}

/**
 * Interface for health check functionality.
 *
 * Components implementing this interface can report their health status
 * and provide detailed diagnostic information for monitoring systems.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PubSubService implements IPubSubHealth {
 *   isHealthy(): boolean {
 *     return this.driver.isConnected() && !this.hasRecentErrors();
 *   }
 *
 *   getStatus(): IPubSubHealthStatus {
 *     return {
 *       status: this.determineStatus(),
 *       driver: this.driverType,
 *       connected: this.driver.isConnected(),
 *       subscriptions: this.driver.getSubscribedTopics().length,
 *       uptime: Date.now() - this.startTime
 *     };
 *   }
 * }
 * ```
 */
export interface IPubSubHealth {
  /**
   * Quick health check method.
   *
   * Returns a boolean indicating whether the system is healthy (true)
   * or unhealthy/degraded (false). This is optimized for fast checks
   * by load balancers and liveness probes.
   *
   * @returns True if system is healthy, false otherwise
   *
   * @example
   * ```typescript
   * if (!pubsubService.isHealthy()) {
   *   logger.error('PubSub system is unhealthy');
   *   // Trigger alerts
   * }
   * ```
   */
  isHealthy(): boolean;

  /**
   * Get detailed health status information.
   *
   * Returns comprehensive health information including connection status,
   * subscription counts, error details, and uptime. Used by monitoring
   * dashboards and diagnostic endpoints.
   *
   * @returns Detailed health status object
   *
   * @example
   * ```typescript
   * // Health check endpoint
   * @Get('health')
   * getHealth(): IPubSubHealthStatus {
   *   return this.pubsubService.getStatus();
   * }
   * ```
   */
  getStatus(): IPubSubHealthStatus;
}
