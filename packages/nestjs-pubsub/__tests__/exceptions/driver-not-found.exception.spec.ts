/**
 * Test suite for DriverNotFoundException class.
 *
 * This test suite verifies the behavior of the DriverNotFoundException,
 * which is thrown when a requested driver is not found or not registered.
 *
 * Coverage:
 * - Constructor with driver type only
 * - Constructor with available drivers list
 * - Error message formatting
 * - Metadata structure
 * - Inheritance from PubSubException
 */

import { DriverNotFoundException } from '@exceptions/driver-not-found.exception';
import { PubSubException } from '@exceptions/pubsub.exception';

describe('DriverNotFoundException', () => {
  /**
   * Test group: Constructor behavior
   *
   * Verifies that the exception can be instantiated with different
   * parameter combinations and generates appropriate error messages.
   */
  describe('constructor', () => {
    /**
     * Test: Basic instantiation with driver type only
     *
     * Ensures that the exception can be created with just a driver type
     * and generates a basic error message.
     */
    it('should create exception with driver type only', () => {
      // Arrange
      const driverType = 'custom-driver';

      // Act
      const exception = DriverNotFoundException.make(driverType);

      // Assert
      expect(exception).toBeInstanceOf(DriverNotFoundException);
      expect(exception).toBeInstanceOf(PubSubException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(`Driver 'custom-driver' not found`);
      expect(exception.name).toBe('DriverNotFoundException');
      expect(exception.code).toBe('DRIVER_NOT_FOUND');
    });

    /**
     * Test: Instantiation with available drivers list
     *
     * Verifies that when available drivers are provided, they are
     * included in the error message to help users identify valid options.
     */
    it('should create exception with available drivers list', () => {
      // Arrange
      const driverType = 'custom-driver';
      const availableDrivers = ['redis', 'kafka', 'google-pubsub'];

      // Act
      const exception = DriverNotFoundException.make(driverType, availableDrivers);

      // Assert
      expect(exception.message).toBe(
        `Driver 'custom-driver' not found. Available drivers: redis, kafka, google-pubsub`,
      );
      expect(exception.code).toBe('DRIVER_NOT_FOUND');
    });

    /**
     * Test: Empty available drivers array
     *
     * Ensures that an empty array of available drivers is handled
     * gracefully and produces a meaningful error message.
     */
    it('should handle empty available drivers array', () => {
      // Arrange
      const driverType = 'custom-driver';
      const availableDrivers: string[] = [];

      // Act
      const exception = DriverNotFoundException.make(driverType, availableDrivers);

      // Assert
      expect(exception.message).toBe(`Driver 'custom-driver' not found. Available drivers: `);
    });

    /**
     * Test: Single available driver
     *
     * Verifies that the error message is formatted correctly when
     * only one driver is available.
     */
    it('should handle single available driver', () => {
      // Arrange
      const driverType = 'kafka';
      const availableDrivers = ['redis'];

      // Act
      const exception = DriverNotFoundException.make(driverType, availableDrivers);

      // Assert
      expect(exception.message).toBe(`Driver 'kafka' not found. Available drivers: redis`);
    });
  });

  /**
   * Test group: Metadata structure
   *
   * Verifies that the exception properly stores metadata about the
   * missing driver and available alternatives.
   */
  describe('metadata', () => {
    /**
     * Test: Metadata with driver type only
     *
     * Ensures that metadata includes the requested driver type and
     * undefined for available drivers when not provided.
     */
    it('should include driver type in metadata', () => {
      // Arrange
      const driverType = 'custom-driver';

      // Act
      const exception = DriverNotFoundException.make(driverType);

      // Assert
      expect(exception.metadata).toEqual({
        driverType: 'custom-driver',
        availableDrivers: undefined,
      });
    });

    /**
     * Test: Metadata with available drivers
     *
     * Verifies that metadata includes both the requested driver type
     * and the list of available drivers.
     */
    it('should include available drivers in metadata', () => {
      // Arrange
      const driverType = 'custom-driver';
      const availableDrivers = ['redis', 'kafka'];

      // Act
      const exception = DriverNotFoundException.make(driverType, availableDrivers);

      // Assert
      expect(exception.metadata).toEqual({
        driverType: 'custom-driver',
        availableDrivers: ['redis', 'kafka'],
      });
    });
  });

  /**
   * Test group: Inheritance and type checking
   *
   * Verifies that the exception maintains proper inheritance chain
   * and can be identified by type checks.
   */
  describe('inheritance', () => {
    /**
     * Test: instanceof checks
     *
     * Ensures that the exception can be identified as both a
     * DriverNotFoundException and its parent classes.
     */
    it('should maintain proper inheritance chain', () => {
      // Arrange & Act
      const exception = DriverNotFoundException.make('test-driver');

      // Assert
      expect(exception instanceof DriverNotFoundException).toBe(true);
      expect(exception instanceof PubSubException).toBe(true);
      expect(exception instanceof Error).toBe(true);
    });

    /**
     * Test: Error name property
     *
     * Verifies that the error name is correctly set to help identify
     * the specific exception type in logs and error handlers.
     */
    it('should have correct name property', () => {
      // Arrange & Act
      const exception = DriverNotFoundException.make('test-driver');

      // Assert
      expect(exception.name).toBe('DriverNotFoundException');
    });
  });

  /**
   * Test group: Error code
   *
   * Verifies that the exception uses the correct error code for
   * programmatic error handling.
   */
  describe('error code', () => {
    /**
     * Test: DRIVER_NOT_FOUND code
     *
     * Ensures that the exception always uses the DRIVER_NOT_FOUND
     * error code, regardless of constructor parameters.
     */
    it('should always use DRIVER_NOT_FOUND code', () => {
      // Arrange & Act
      const exception1 = DriverNotFoundException.make('driver1');
      const exception2 = DriverNotFoundException.make('driver2', ['redis']);

      // Assert
      expect(exception1.code).toBe('DRIVER_NOT_FOUND');
      expect(exception2.code).toBe('DRIVER_NOT_FOUND');
    });
  });

  /**
   * Test group: Serialization
   *
   * Verifies that the exception can be serialized to JSON format
   * with all relevant information preserved.
   */
  describe('serialization', () => {
    /**
     * Test: JSON serialization includes all data
     *
     * Ensures that the toJSON() method inherited from PubSubException
     * works correctly and includes all exception data.
     */
    it('should serialize to JSON with all information', () => {
      // Arrange
      const driverType = 'custom-driver';
      const availableDrivers = ['redis', 'kafka'];
      const exception = DriverNotFoundException.make(driverType, availableDrivers);

      // Act
      const json = exception.toJSON();

      // Assert
      expect(json.name).toBe('DriverNotFoundException');
      expect(json.code).toBe('DRIVER_NOT_FOUND');
      expect(json.message).toContain('custom-driver');
      expect(json.message).toContain('redis, kafka');
      expect(json.metadata).toEqual({
        driverType,
        availableDrivers,
      });
    });
  });

  /**
   * Test group: Real-world scenarios
   *
   * Tests exception behavior in scenarios that would occur in
   * actual application usage.
   */
  describe('real-world scenarios', () => {
    /**
     * Test: Typo in driver name
     *
     * Simulates a common scenario where a user misspells a driver name.
     */
    it('should handle typo in driver name', () => {
      // Arrange
      const typoDriver = 'reddis'; // User meant 'redis'
      const availableDrivers = ['redis', 'kafka', 'google-pubsub'];

      // Act
      const exception = DriverNotFoundException.make(typoDriver, availableDrivers);

      // Assert
      expect(exception.message).toContain('reddis');
      expect(exception.message).toContain('redis');
      expect(exception.metadata?.driverType).toBe('reddis');
    });

    /**
     * Test: Requesting unsupported driver
     *
     * Simulates a scenario where a user requests a driver that
     * doesn't exist in the system.
     */
    it('should handle request for unsupported driver', () => {
      // Arrange
      const unsupportedDriver = 'rabbitmq';
      const availableDrivers = ['redis', 'kafka', 'google-pubsub'];

      // Act
      const exception = DriverNotFoundException.make(unsupportedDriver, availableDrivers);

      // Assert
      expect(exception.message).toContain('rabbitmq');
      expect(exception.message).toContain('Available drivers');
      expect(exception.metadata?.availableDrivers).toEqual(availableDrivers);
    });

    /**
     * Test: Exception in catch block
     *
     * Verifies that the exception can be properly caught and its
     * properties accessed in error handling code.
     */
    it('should be usable in catch blocks', () => {
      // Arrange
      const driverType = 'invalid-driver';

      // Act & Assert
      try {
        throw DriverNotFoundException.make(driverType, ['redis', 'kafka']);
      } catch (error: Error | any) {
        expect(error).toBeInstanceOf(DriverNotFoundException);
        if (error instanceof DriverNotFoundException) {
          expect(error.code).toBe('DRIVER_NOT_FOUND');
          expect(error.metadata?.driverType).toBe(driverType);
        }
      }
    });
  });
});
