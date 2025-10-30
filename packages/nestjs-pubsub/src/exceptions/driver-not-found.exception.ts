import { PubSubException } from './pubsub.exception';

/**
 * Exception thrown when a requested driver is not found or not registered.
 *
 * This exception is typically thrown by the PubSubFactoryService when
 * attempting to create a driver instance for an unsupported or unregistered
 * driver type.
 *
 * @example
 * ```typescript
 * throw new DriverNotFoundException('custom-driver', ['redis', 'kafka', 'google-pubsub']);
 * ```
 */
export class DriverNotFoundException extends PubSubException {
  /**
   * Creates a new DriverNotFoundException.
   *
   * @param driverType - The driver type that was requested but not found
   * @param availableDrivers - Optional list of available driver types
   *
   * @example
   * ```typescript
   * if (!factory.hasDriver(driverType)) {
   *   throw new DriverNotFoundException(
   *     driverType,
   *     factory.getAvailableDrivers()
   *   );
   * }
   * ```
   */
  constructor(driverType: string, availableDrivers?: string[]) {
    const message = availableDrivers
      ? `Driver '${driverType}' not found. Available drivers: ${availableDrivers.join(', ')}`
      : `Driver '${driverType}' not found`;

    super(message, 'DRIVER_NOT_FOUND', {
      driverType,
      availableDrivers,
    });

    this.name = 'DriverNotFoundException';
  }
}
