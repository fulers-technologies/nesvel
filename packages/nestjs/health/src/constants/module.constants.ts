/**
 * Health Module Constants
 *
 * Injection tokens and constants for the health module.
 *
 * @module ModuleConstants
 *
 * @author Nesvel
 * @since 1.0.0
 */

/**
 * Health Module Configuration Token
 *
 * Injection token for accessing the health module configuration.
 * Used to inject the configuration into services, indicators, and controllers.
 *
 * @constant {string}
 *
 * @example Using with @Inject decorator
 * ```typescript
 * import { Injectable, Inject } from '@nestjs/common';
 * import { HEALTH_MODULE_CONFIG } from '@nesvel/nestjs-health';
 * import type { IHealthConfig } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class CustomService {
 *   constructor(
 *     @Inject(HEALTH_MODULE_CONFIG)
 *     private readonly config: IHealthConfig,
 *   ) {}
 * }
 * ```
 *
 * @example In health indicators
 * ```typescript
 * import { Injectable, Inject, Optional } from '@nestjs/common';
 * import { HEALTH_MODULE_CONFIG } from '@nesvel/nestjs-health';
 * import type { IHealthConfig } from '@nesvel/nestjs-health';
 *
 * @Injectable()
 * export class CustomHealthIndicator {
 *   constructor(
 *     @Optional()
 *     @Inject(HEALTH_MODULE_CONFIG)
 *     private readonly config?: IHealthConfig,
 *   ) {}
 * }
 * ```
 */
export const HEALTH_MODULE_CONFIG = 'HEALTH_MODULE_CONFIG';
