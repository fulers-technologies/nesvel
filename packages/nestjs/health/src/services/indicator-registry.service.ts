import { Injectable, Logger, Type } from '@nestjs/common';

import type { IHealthIndicator } from '@interfaces';
import type { IIndicatorRegistrationOptions } from '@interfaces';

/**
 * Indicator Registry Interface
 *
 * Internal structure for storing registered health indicators.
 *
 * @interface IndicatorRegistry
 * @private
 */
interface IndicatorRegistry {
  /**
   * Map of indicator name to registration options
   */
  indicators: Map<string, IIndicatorRegistrationOptions>;
}

/**
 * Indicator Registry Service
 *
 * Manages registered health indicators and their configurations.
 * Provides a centralized registry for all health indicators in the application.
 *
 * This service follows the same pattern as IndexRegistryService from @nesvel/nestjs-search,
 * providing a clean way to register and manage health indicators without manual dependency
 * injection in controllers.
 *
 * **Features**:
 * - Register indicators with configuration options
 * - Store indicator instances
 * - Retrieve all registered indicators
 * - Check if an indicator is registered
 *
 * **Usage**:
 * ```typescript
 * // Typically used internally by HealthModule
 * // Indicators are registered via HealthModule.registerIndicator()
 * ```
 *
 * @class IndicatorRegistryService
 *
 * @example Registering indicators via HealthModule
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({ ... }),
 *     HealthModule.registerIndicator({
 *       indicator: RedisHealthIndicator,
 *       name: 'redis',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Using the registry in a service
 * ```typescript
 * @Injectable()
 * export class CustomHealthService {
 *   constructor(
 *     private readonly registry: IndicatorRegistryService,
 *   ) {}
 *
 *   getAllIndicators() {
 *     return this.registry.getAll();
 *   }
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
export class IndicatorRegistryService {
  /**
   * Logger instance
   *
   * @private
   */
  private readonly logger = new Logger(IndicatorRegistryService.name);

  /**
   * Registry storage
   *
   * Stores all registered indicators and their configurations.
   *
   * @private
   */
  private readonly registry: IndicatorRegistry = {
    indicators: new Map<string, IIndicatorRegistrationOptions>(),
  };

  /**
   * Register a health indicator
   *
   * Adds an indicator to the registry with its configuration.
   * If an indicator with the same name already exists, it will be overwritten.
   *
   * @param {IIndicatorRegistrationOptions} options - Indicator registration options
   * @throws {Error} If indicator class is missing
   * @throws {Error} If indicator name is missing
   *
   * @example
   * ```typescript
   * registry.register({
   *   indicator: RedisHealthIndicator,
   *   name: 'redis',
   * });
   * ```
   */
  register(options: IIndicatorRegistrationOptions): void {
    if (!options.indicator) {
      throw new Error('Indicator class is required');
    }

    if (!options.name) {
      throw new Error('Indicator name is required');
    }

    this.logger.debug(`Registering health indicator: ${options.name}`);

    // Store the indicator configuration
    this.registry.indicators.set(options.name, options);
  }

  /**
   * Register multiple health indicators
   *
   * Convenience method to register multiple indicators at once.
   *
   * @param {IIndicatorRegistrationOptions[]} optionsArray - Array of indicator registration options
   *
   * @example
   * ```typescript
   * registry.registerMultiple([
   *   { indicator: RedisHealthIndicator, name: 'redis' },
   *   { indicator: KafkaHealthIndicator, name: 'kafka' },
   * ]);
   * ```
   */
  registerMultiple(optionsArray: IIndicatorRegistrationOptions[]): void {
    for (const options of optionsArray) {
      this.register(options);
    }
  }

  /**
   * Get indicator configuration by name
   *
   * Retrieves the configuration for a registered indicator.
   *
   * @param {string} name - Indicator name
   * @returns {IIndicatorRegistrationOptions | undefined} Indicator configuration or undefined if not found
   *
   * @example
   * ```typescript
   * const redisIndicator = registry.get('redis');
   * if (redisIndicator) {
   *   console.log(`Found indicator: ${redisIndicator.name}`);
   * }
   * ```
   */
  get(name: string): IIndicatorRegistrationOptions | undefined {
    return this.registry.indicators.get(name);
  }

  /**
   * Get all registered indicators
   *
   * Returns an array of all registered indicator configurations.
   *
   * @returns {IIndicatorRegistrationOptions[]} Array of all registered indicator configurations
   *
   * @example
   * ```typescript
   * const allIndicators = registry.getAll();
   * console.log(`Registered ${allIndicators.length} indicators`);
   * ```
   */
  getAll(): IIndicatorRegistrationOptions[] {
    return Array.from(this.registry.indicators.values());
  }

  /**
   * Get all indicator classes
   *
   * Returns an array of all registered indicator classes (for module providers).
   *
   * @returns {Type<IHealthIndicator>[]} Array of indicator classes
   *
   * @example
   * ```typescript
   * const indicatorClasses = registry.getAllIndicatorClasses();
   * // Use in module providers: [...indicatorClasses]
   * ```
   */
  getAllIndicatorClasses(): Type<IHealthIndicator>[] {
    return Array.from(this.registry.indicators.values()).map((options) => options.indicator);
  }

  /**
   * Check if an indicator is registered
   *
   * @param {string} name - Indicator name
   * @returns {boolean} True if the indicator is registered
   *
   * @example
   * ```typescript
   * if (registry.has('redis')) {
   *   console.log('Redis health indicator is registered');
   * }
   * ```
   */
  has(name: string): boolean {
    return this.registry.indicators.has(name);
  }

  /**
   * Get the count of registered indicators
   *
   * @returns {number} Number of registered indicators
   *
   * @example
   * ```typescript
   * const count = registry.getCount();
   * console.log(`Total indicators: ${count}`);
   * ```
   */
  getCount(): number {
    return this.registry.indicators.size;
  }

  /**
   * Clear all registered indicators
   *
   * Removes all indicators from the registry.
   * Primarily used for testing purposes.
   *
   * @example
   * ```typescript
   * // In tests
   * afterEach(() => {
   *   registry.clear();
   * });
   * ```
   */
  clear(): void {
    this.logger.debug('Clearing all registered indicators');
    this.registry.indicators.clear();
  }
}
