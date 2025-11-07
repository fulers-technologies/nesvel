import { PubSubFactoryService } from '@services/pubsub-factory.service';
import { PubSubDriverType } from '@enums/pubsub-driver-type.enum';
import { DriverNotFoundException } from '@exceptions/driver-not-found.exception';
import type { IPubSubOptions } from '@interfaces/pubsub-options.interface';

describe('PubSubFactoryService', () => {
  let factory: PubSubFactoryService;

  /**
   * Setup: Create a fresh factory instance before each test
   *
   * Ensures that each test starts with a clean factory state.
   */
  beforeEach(() => {
    factory = new PubSubFactoryService();
  });

  /**
   * Test group: createDriver() method
   *
   * Verifies that the factory can create driver instances for all
   * supported driver types with correct configuration.
   */
  describe('createDriver', () => {
    /**
     * Test: Create Redis driver
     *
     * Ensures that a Redis driver can be instantiated with valid options.
     */
    it('should create Redis driver', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: {
          host: 'localhost',
          port: 6379,
        },
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
      expect(driver).toHaveProperty('connect');
      expect(driver).toHaveProperty('disconnect');
      expect(driver).toHaveProperty('publish');
      expect(driver).toHaveProperty('subscribe');
    });

    /**
     * Test: Create Kafka driver
     *
     * Ensures that a Kafka driver can be instantiated with valid options.
     */
    it('should create Kafka driver', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.KAFKA,
        driverOptions: {
          clientId: 'test-client',
          brokers: ['localhost:9092'],
        },
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
      expect(driver).toHaveProperty('connect');
      expect(driver).toHaveProperty('disconnect');
      expect(driver).toHaveProperty('publish');
      expect(driver).toHaveProperty('subscribe');
    });

    /**
     * Test: Create Google PubSub driver
     *
     * Ensures that a Google PubSub driver can be instantiated with valid options.
     */
    it('should create Google PubSub driver', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.GOOGLE_PUBSUB,
        driverOptions: {
          projectId: 'test-project',
        },
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
      expect(driver).toHaveProperty('connect');
      expect(driver).toHaveProperty('disconnect');
      expect(driver).toHaveProperty('publish');
      expect(driver).toHaveProperty('subscribe');
    });

    /**
     * Test: Throw error for unsupported driver
     *
     * Verifies that an error is thrown when an unsupported driver type
     * is requested.
     */
    it('should throw DriverNotFoundException for unsupported driver', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: 'unsupported-driver' as any,
        driverOptions: {},
      };

      // Act & Assert
      expect(() => factory.createDriver(options)).toThrow(DriverNotFoundException);
      expect(() => factory.createDriver(options)).toThrow(/Driver 'unsupported-driver' not found/);
    });

    /**
     * Test: Create driver with minimal options
     *
     * Ensures that drivers can be created with minimal configuration
     * and use appropriate defaults.
     */
    it('should create driver with minimal options', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: {},
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
    });

    /**
     * Test: Create driver with comprehensive options
     *
     * Verifies that drivers can be created with full configuration
     * including all optional parameters.
     */
    it('should create driver with comprehensive options', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: {
          host: 'redis.example.com',
          port: 6380,
          password: 'secret',
          db: 1,
          keyPrefix: 'app:',
        },
        global: true,
        autoConnect: true,
        maxRetries: 5,
        retryDelay: 2000,
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
    });
  });

  /**
   * Test group: validateOptions() method
   *
   * Verifies that the factory properly validates configuration options
   * and throws appropriate errors for invalid configurations.
   */
  describe('validateOptions', () => {
    /**
     * Test: Validate valid options
     *
     * Ensures that valid options pass validation without errors.
     */
    it('should validate valid options without error', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: { host: 'localhost' },
      };

      // Act & Assert
      expect(() => factory.validateOptions(options)).not.toThrow();
    });

    /**
     * Test: Throw error for missing driver
     *
     * Verifies that an error is thrown when the driver property is missing.
     */
    it('should throw error for missing driver', () => {
      // Arrange
      const options: any = {
        driverOptions: {},
      };

      // Act & Assert
      expect(() => factory.validateOptions(options)).toThrow();
      expect(() => factory.validateOptions(options)).toThrow(/driver/i);
    });

    /**
     * Test: Throw error for invalid driver type
     *
     * Ensures that an error is thrown for invalid driver types.
     */
    it('should throw error for invalid driver type', () => {
      // Arrange
      const options: any = {
        driver: 123, // Should be string
        driverOptions: {},
      };

      // Act & Assert
      expect(() => factory.validateOptions(options)).toThrow();
    });

    /**
     * Test: Validate options with all properties
     *
     * Verifies that options with all properties are validated correctly.
     */
    it('should validate options with all properties', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.KAFKA,
        driverOptions: {
          clientId: 'test',
          brokers: ['localhost:9092'],
        },
        global: true,
        autoConnect: true,
        maxRetries: 3,
        retryDelay: 1000,
      };

      // Act & Assert
      expect(() => factory.validateOptions(options)).not.toThrow();
    });
  });

  /**
   * Test group: Driver type handling
   *
   * Verifies that the factory correctly handles different driver type
   * formats and edge cases.
   */
  describe('driver type handling', () => {
    /**
     * Test: Handle driver type as enum value
     *
     * Ensures that enum values are handled correctly.
     */
    it('should handle driver type as enum value', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: {},
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
    });

    /**
     * Test: Handle driver type as string literal
     *
     * Verifies that string literals matching enum values work correctly.
     */
    it('should handle driver type as string literal', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: 'redis' as PubSubDriverType,
        driverOptions: {},
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
    });

    /**
     * Test: Case sensitivity in driver type
     *
     * Ensures that driver type comparison is case-sensitive.
     */
    it('should be case-sensitive for driver type', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: 'REDIS' as any, // Wrong case
        driverOptions: {},
      };

      // Act & Assert
      expect(() => factory.createDriver(options)).toThrow(DriverNotFoundException);
    });
  });

  /**
   * Test group: Error messages
   *
   * Verifies that error messages are informative and include
   * helpful information for debugging.
   */
  describe('error messages', () => {
    /**
     * Test: Error message includes available drivers
     *
     * Ensures that the error message lists available driver types
     * to help users fix configuration issues.
     */
    it('should include available drivers in error message', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: 'invalid' as any,
        driverOptions: {},
      };

      // Act & Assert
      try {
        factory.createDriver(options);
        fail('Should have thrown DriverNotFoundException');
      } catch (error: Error | any) {
        expect(error).toBeInstanceOf(DriverNotFoundException);
        const exception = error as DriverNotFoundException;
        expect(exception.message).toContain('redis');
        expect(exception.message).toContain('kafka');
        expect(exception.message).toContain('google-pubsub');
      }
    });

    /**
     * Test: Error metadata includes driver type
     *
     * Verifies that error metadata contains the requested driver type
     * for debugging purposes.
     */
    it('should include driver type in error metadata', () => {
      // Arrange
      const invalidDriver = 'rabbitmq';
      const options: IPubSubOptions = {
        driver: invalidDriver as any,
        driverOptions: {},
      };

      // Act & Assert
      try {
        factory.createDriver(options);
        fail('Should have thrown DriverNotFoundException');
      } catch (error: Error | any) {
        const exception = error as DriverNotFoundException;
        expect(exception.metadata?.driverType).toBe(invalidDriver);
      }
    });
  });

  /**
   * Test group: Real-world scenarios
   *
   * Tests the factory in scenarios that would occur in actual
   * application usage.
   */
  describe('real-world scenarios', () => {
    /**
     * Test: Create multiple drivers
     *
     * Simulates creating multiple driver instances for different
     * messaging backends.
     */
    it('should create multiple different drivers', () => {
      // Arrange
      const redisOptions: IPubSubOptions = {
        driver: PubSubDriverType.REDIS,
        driverOptions: { host: 'localhost' },
      };
      const kafkaOptions: IPubSubOptions = {
        driver: PubSubDriverType.KAFKA,
        driverOptions: {
          clientId: 'test',
          brokers: ['localhost:9092'],
        },
      };

      // Act
      const redisDriver = factory.createDriver(redisOptions);
      const kafkaDriver = factory.createDriver(kafkaOptions);

      // Assert
      expect(redisDriver).toBeDefined();
      expect(kafkaDriver).toBeDefined();
      expect(redisDriver).not.toBe(kafkaDriver);
    });

    /**
     * Test: Typo in driver name
     *
     * Simulates a common user error where the driver name is misspelled.
     */
    it('should handle typo in driver name gracefully', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: 'reddis' as any, // Typo: should be 'redis'
        driverOptions: {},
      };

      // Act & Assert
      try {
        factory.createDriver(options);
        fail('Should have thrown DriverNotFoundException');
      } catch (error: Error | any) {
        expect(error).toBeInstanceOf(DriverNotFoundException);
        const exception = error as DriverNotFoundException;
        expect(exception.message).toContain('reddis');
        expect(exception.message).toContain('redis'); // Suggests correct spelling
      }
    });

    /**
     * Test: Production-like configuration
     *
     * Verifies that a realistic production configuration works correctly.
     */
    it('should handle production-like configuration', () => {
      // Arrange
      const options: IPubSubOptions = {
        driver: PubSubDriverType.KAFKA,
        driverOptions: {
          clientId: 'production-app',
          brokers: [
            'kafka1.example.com:9092',
            'kafka2.example.com:9092',
            'kafka3.example.com:9092',
          ],
          ssl: true,
          sasl: {
            mechanism: 'plain',
            username: 'app-user',
            password: 'secret',
          },
        },
        global: true,
        autoConnect: true,
        maxRetries: 5,
        retryDelay: 2000,
      };

      // Act
      const driver = factory.createDriver(options);

      // Assert
      expect(driver).toBeDefined();
    });
  });
});
