/**
 * Health Interfaces
 *
 * Exports all interfaces for the health module.
 *
 * **Core Interfaces**:
 * - `IHealthIndicator` - Base interface for health indicators
 * - `IHealthConfig` - Health check configuration
 * - `IHealthModuleOptions` - Module registration options
 *
 * **Configuration Interfaces**:
 * - `IProbeConfig` - Probe enable/disable settings
 * - `IIndicatorsConfig` - Built-in indicator settings
 * - `IMemoryThresholds` - Memory threshold configuration
 * - `IDiskThresholds` - Disk threshold configuration
 *
 * **Registration Interfaces**:
 * - `IIndicatorRegistrationOptions` - Indicator registration options
 *
 * **Types**:
 * - `HealthCheckFunction` - Custom health check function type
 *
 * @module Interfaces
 * @author Nesvel
 * @since 1.0.0
 */

// Core interfaces
export * from './health-indicator.interface';
export * from './health-config.interface';
export * from './health-module-options.interface';

// Configuration interfaces
export * from './probe-config.interface';
export * from './indicators-config.interface';
export * from './memory-thresholds.interface';
export * from './disk-thresholds.interface';

// Registration interfaces
export * from './indicator-registration-options.interface';

// Types
export * from './health-check-function.interface';
