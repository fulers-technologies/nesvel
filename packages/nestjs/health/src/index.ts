/**
 * Health Module
 *
 * Production-ready health check module for NestJS applications.
 * Provides comprehensive monitoring for all critical components.
 *
 * @module Health
 *
 * @example
 * ```typescript
 * // Import module
 * import { HealthModule } from '@/modules/health';
 *
 * // Import indicators
 * import { MikroOrmHealthIndicator, MemoryHealthIndicator } from '@/modules/health';
 *
 * // Import constants
 * import { HEALTH_CHECK_KEYS, MEMORY_THRESHOLDS } from '@/modules/health';
 * ```
 */

// Module
export * from './health.module';

// Constants
export * from './constants';

// Decorators
export * from './decorators';

// Services
export * from './services';

// Indicators
export * from './indicators';

// Interfaces
export * from './interfaces';

// Factories (controller is created dynamically)
export * from './factories';

// Re-export Terminus types and services (excluding indicators)
export { HealthCheckService, HealthCheckError, HealthIndicatorService } from '@nestjs/terminus';
export type {
  HealthCheckResult,
  HealthCheckStatus,
  HealthIndicatorFunction,
  HealthIndicatorResult,
} from '@nestjs/terminus';

// Re-export Terminus decorators
export { HealthCheck } from '@nestjs/terminus';
