/**
 * Health Indicators
 *
 * Exports all health indicators for the health module.
 *
 * @module Indicators
 */

export * from './disk-health.indicator';
export * from './http-health.indicator';
export * from './memory-health.indicator';

export {
  DiskHealthIndicator as TerminusDiskHealthIndicator,
  HttpHealthIndicator as TerminusHttpHealthIndicator,
  MemoryHealthIndicator as TerminusMemoryHealthIndicator,
  MikroOrmHealthIndicator as TerminusMikroOrmHealthIndicator,
} from '@nestjs/terminus';
