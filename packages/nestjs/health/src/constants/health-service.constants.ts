/**
 * Health Service Constants
 *
 * Injection tokens for health module services and dependencies.
 * These constants are used with NestJS dependency injection decorators
 * to provide type-safe service injection throughout the application.
 *
 * @module HealthServiceConstants
 *
 * @example Using with @Inject decorator
 * ```typescript
 * import { HEALTH_CHECK_SERVICE } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Inject(HEALTH_CHECK_SERVICE)
 *     private readonly healthService: HealthCheckService,
 *   ) {}
 * }
 * ```
 *
 * @example Using with custom decorator
 * ```typescript
 * import { InjectHealthService } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @InjectHealthService()
 *     private readonly healthService: HealthCheckService,
 *   ) {}
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */

/**
 * Health Check Service Injection Token
 *
 * Token for injecting the HealthCheckService from @nestjs/terminus.
 * Used to perform health checks in custom controllers or services.
 *
 * The HealthCheckService provides methods to:
 * - Execute multiple health indicators in parallel
 * - Aggregate health check results
 * - Format responses according to health check standards
 * - Handle health check errors gracefully
 *
 * @constant {string}
 *
 * @example Basic usage with @Inject
 * ```typescript
 * import { Injectable, Inject } from '@nestjs/common';
 * import { HealthCheckService } from '@nestjs/terminus';
 * import { HEALTH_CHECK_SERVICE } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class CustomHealthService {
 *   constructor(
 *     @Inject(HEALTH_CHECK_SERVICE)
 *     private readonly health: HealthCheckService,
 *   ) {}
 *
 *   async performHealthCheck() {
 *     return this.health.check([
 *       async () => ({ app: { status: 'up' } }),
 *     ]);
 *   }
 * }
 * ```
 *
 * @example Using with custom decorator
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
 *   async performHealthCheck() {
 *     return this.health.check([
 *       async () => ({ app: { status: 'up' } }),
 *     ]);
 *   }
 * }
 * ```
 *
 * @example In a controller
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
 *   async check() {
 *     return this.health.check([
 *       async () => ({ custom: { status: 'up' } }),
 *     ]);
 *   }
 * }
 * ```
 */
export const HEALTH_CHECK_SERVICE = 'HealthCheckService';
