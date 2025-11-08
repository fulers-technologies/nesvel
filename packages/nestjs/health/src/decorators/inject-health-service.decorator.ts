import { Inject } from '@nestjs/common';
import { HEALTH_CHECK_SERVICE } from '@constants';

/**
 * InjectHealthService Decorator
 *
 * Parameter decorator that injects the HealthCheckService from @nestjs/terminus.
 * Provides a cleaner, more semantic alternative to using @Inject(HEALTH_CHECK_SERVICE).
 *
 * This decorator simplifies dependency injection for the HealthCheckService,
 * following the Nesvel pattern established in other packages (e.g., @InjectMailService,
 * @InjectPubSub). It automatically resolves the correct injection token and provides
 * better code readability.
 *
 * **Benefits**:
 * - Cleaner syntax compared to @Inject
 * - Type-safe injection
 * - Consistent with other Nesvel decorators
 * - Self-documenting code
 * - IDE auto-completion support
 *
 * @decorator
 * @returns {ParameterDecorator} Parameter decorator for dependency injection
 *
 * @example Basic usage in a service
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { HealthCheckService } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class CustomHealthService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   async performCustomCheck() {
 *     return this.health.check([
 *       async () => ({ app: { status: 'up', timestamp: Date.now() } }),
 *       async () => ({ version: { value: '1.0.0' } }),
 *     ]);
 *   }
 * }
 * ```
 *
 * @example Usage in a controller
 * ```typescript
 * import { Controller, Get } from '@nestjs/common';
 * import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Controller('custom-health')
 * export class CustomHealthController {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   @Get()
 *   @HealthCheck()
 *   async checkHealth() {
 *     return this.health.check([
 *       async () => ({ api: { status: 'running' } }),
 *     ]);
 *   }
 * }
 * ```
 *
 * @example Advanced usage with multiple health indicators
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import {
 *   HealthCheckService,
 *   MikroOrmHealthIndicator,
 *   MemoryHealthIndicator,
 * } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class AppHealthService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *     private readonly db: MikroOrmHealthIndicator,
 *     private readonly memory: MemoryHealthIndicator,
 *   ) {}
 *
 *   async checkFullHealth() {
 *     return this.health.check([
 *       () => this.db.pingCheck('database'),
 *       () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
 *       async () => ({ custom: { status: 'ok' } }),
 *     ]);
 *   }
 *
 *   async checkReadiness() {
 *     return this.health.check([
 *       () => this.db.pingCheck('database'),
 *     ]);
 *   }
 * }
 * ```
 *
 * @example Background job health monitoring
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { HealthCheckService } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 * import { Cron, CronExpression } from '@nestjs/schedule';
 *
 * @Injectable()
 * export class HealthMonitorService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   @Cron(CronExpression.EVERY_MINUTE)
 *   async monitorHealth() {
 *     const result = await this.health.check([
 *       async () => ({ monitor: { timestamp: Date.now() } }),
 *     ]);
 *
 *     if (result.status === 'error') {
 *       // Send alert
 *       console.error('Health check failed:', result);
 *     }
 *   }
 * }
 * ```
 *
 * @example Custom health check aggregator
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class HealthAggregatorService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   async aggregateChecks(
 *     checks: Array<() => Promise<any>>,
 *   ): Promise<HealthCheckResult> {
 *     try {
 *       return await this.health.check(checks);
 *     } catch (error: Error | any) {
 *       console.error('Health check aggregation failed:', error);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 *
 * @example Integration with external monitoring
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { HealthCheckService } from '@nestjs/terminus';
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class MonitoringIntegrationService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   async reportToMonitoring() {
 *     const healthStatus = await this.health.check([
 *       async () => ({ uptime: { value: process.uptime() } }),
 *       async () => ({ memory: { value: process.memoryUsage().heapUsed } }),
 *     ]);
 *
 *     // Send to external monitoring service (e.g., DataDog, New Relic)
 *     await this.sendToMonitoring(healthStatus);
 *   }
 *
 *   private async sendToMonitoring(status: any) {
 *     // Implementation for external monitoring
 *   }
 * }
 * ```
 *
 * @see {@link HEALTH_CHECK_SERVICE} - The injection token used internally
 * @see {@link https://docs.nestjs.com/recipes/terminus | NestJS Terminus Documentation}
 *
 * @author Nesvel
 * @since 1.0.0
 */
export const InjectHealthService = (): ParameterDecorator => {
  return Inject(HEALTH_CHECK_SERVICE);
};
