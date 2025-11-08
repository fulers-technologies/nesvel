import type { Type } from '@nestjs/common';
import type { IHealthIndicator } from '@interfaces';

/**
 * Indicator Registration Options Interface
 *
 * Configuration for registering individual health indicators.
 * Used with `HealthModule.registerIndicator()` for declarative indicator registration.
 *
 * **Similar to**:
 * - `BullModule.registerQueue()` for queue registration
 * - `SearchModule.registerIndex()` for search index registration
 *
 * @interface IIndicatorRegistrationOptions
 *
 * @example Single indicator registration
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({ ... }),
 *     HealthModule.registerIndicator({
 *       indicator: RedisHealthIndicator,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Multiple indicators
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({ ... }),
 *     HealthModule.registerIndicator({
 *       indicator: RedisHealthIndicator,
 *     }),
 *     HealthModule.registerIndicator({
 *       indicator: KafkaHealthIndicator,
 *     }),
 *     HealthModule.registerIndicator({
 *       indicator: ElasticsearchHealthIndicator,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example Using registerIndicators (batch registration)
 * ```typescript
 * @Module({
 *   imports: [
 *     HealthModule.forRoot({ ... }),
 *     HealthModule.registerIndicators([
 *       { indicator: RedisHealthIndicator },
 *       { indicator: KafkaHealthIndicator },
 *       { indicator: ElasticsearchHealthIndicator },
 *     ]),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IIndicatorRegistrationOptions {
  /**
   * Health Indicator Class
   *
   * The health indicator class to register.
   * Must implement the IHealthIndicator interface.
   *
   * **Requirements**:
   * - Must be decorated with `@Injectable()`
   * - Must implement `IHealthIndicator` interface
   * - Must have a `check()` method
   *
   * **Lifecycle**:
   * - Registered as a provider in the module
   * - Instantiated by NestJS dependency injection
   * - Available for health checks immediately after registration
   *
   * @example
   * ```typescript
   * indicator: RedisHealthIndicator
   * ```
   *
   * @example With dependencies
   * ```typescript
   * @Injectable()
   * export class RedisHealthIndicator implements IHealthIndicator {
   *   constructor(
   *     private readonly healthIndicatorService: HealthIndicatorService,
   *     private readonly redis: RedisService,
   *   ) {}
   *
   *   async check(key: string = 'redis') {
   *     // Implementation
   *   }
   * }
   *
   * // Registration
   * HealthModule.registerIndicator({
   *   indicator: RedisHealthIndicator,
   *   name: 'redis',
   * })
   * ```
   */
  indicator: Type<IHealthIndicator>;

  /**
   * Indicator Name
   *
   * Unique name for the health indicator.
   * This name is used as the key when calling the indicator's `check(key)` method
   * and appears in the health check response.
   *
   * **Requirements**:
   * - Must be unique across all registered indicators
   * - Should be descriptive and lowercase (e.g., 'redis', 'kafka', 'elasticsearch')
   * - Will be used as the key in health check results
   *
   * **Examples**:
   * - `'redis'` - for Redis health indicator
   * - `'kafka'` - for Kafka health indicator
   * - `'elasticsearch'` - for Elasticsearch health indicator
   * - `'custom_api'` - for custom API health indicator
   *
   * @example
   * ```typescript
   * HealthModule.registerIndicator({
   *   indicator: RedisHealthIndicator,
   *   name: 'redis',  // Appears as "redis": { "status": "up" } in response
   * })
   * ```
   *
   * @example Multiple indicators
   * ```typescript
   * HealthModule.registerIndicators([
   *   { indicator: RedisHealthIndicator, name: 'redis' },
   *   { indicator: KafkaHealthIndicator, name: 'kafka' },
   *   { indicator: ElasticsearchHealthIndicator, name: 'elasticsearch' },
   * ])
   * ```
   *
   * @example Health check response
   * ```json
   * GET /health
   * {
   *   "status": "ok",
   *   "info": {
   *     "redis": { "status": "up" },
   *     "kafka": { "status": "up" },
   *     "elasticsearch": { "status": "up" }
   *   }
   * }
   * ```
   */
  name: string;
}
