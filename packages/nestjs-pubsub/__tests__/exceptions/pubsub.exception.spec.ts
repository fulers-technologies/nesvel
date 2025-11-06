/**
 * Test suite for PubSubException class.
 *
 * This test suite verifies the behavior of the base PubSubException class,
 * including proper error message handling, metadata attachment, error code
 * support, and serialization capabilities.
 *
 * Coverage:
 * - Constructor with various parameter combinations
 * - Error message preservation
 * - Error code handling
 * - Metadata attachment
 * - Stack trace capture
 * - JSON serialization
 * - Inheritance from Error class
 */

import { PubSubException } from '@exceptions/pubsub.exception';

describe('PubSubException', () => {
  /**
   * Test group: Constructor behavior
   *
   * Verifies that the exception can be instantiated with different
   * combinations of parameters and that all properties are set correctly.
   */
  describe('constructor', () => {
    /**
     * Test: Basic instantiation with message only
     *
     * Ensures that the exception can be created with just an error message
     * and that optional parameters default to undefined.
     */
    it('should create exception with message only', () => {
      // Arrange
      const message = 'Test error message';

      // Act
      const exception = PubSubException.make(message);

      // Assert
      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(PubSubException);
      expect(exception.message).toBe(message);
      expect(exception.name).toBe('PubSubException');
      expect(exception.code).toBeUndefined();
      expect(exception.metadata).toBeUndefined();
    });

    /**
     * Test: Instantiation with message and error code
     *
     * Verifies that an error code can be provided and is properly stored.
     */
    it('should create exception with message and code', () => {
      // Arrange
      const message = 'Test error message';
      const code = 'TEST_ERROR';

      // Act
      const exception = PubSubException.make(message, code);

      // Assert
      expect(exception.message).toBe(message);
      expect(exception.code).toBe(code);
      expect(exception.metadata).toBeUndefined();
    });

    /**
     * Test: Full instantiation with all parameters
     *
     * Ensures that all constructor parameters can be provided and are
     * correctly assigned to the exception instance.
     */
    it('should create exception with message, code, and metadata', () => {
      // Arrange
      const message = 'Test error message';
      const code = 'TEST_ERROR';
      const metadata = { key: 'value', count: 42 };

      // Act
      const exception = PubSubException.make(message, code, metadata);

      // Assert
      expect(exception.message).toBe(message);
      expect(exception.code).toBe(code);
      expect(exception.metadata).toEqual(metadata);
    });

    /**
     * Test: Stack trace capture
     *
     * Verifies that the exception captures a stack trace when created,
     * which is essential for debugging.
     */
    it('should capture stack trace', () => {
      // Arrange & Act
      const exception = PubSubException.make('Test error');

      // Assert
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
      expect(exception.stack).toContain('PubSubException');
    });
  });

  /**
   * Test group: Inheritance behavior
   *
   * Verifies that PubSubException properly extends the Error class and
   * maintains standard error behavior.
   */
  describe('inheritance', () => {
    /**
     * Test: instanceof Error
     *
     * Ensures that the exception is recognized as an Error instance,
     * which is important for error handling and catch blocks.
     */
    it('should be instance of Error', () => {
      // Arrange & Act
      const exception = PubSubException.make('Test error');

      // Assert
      expect(exception instanceof Error).toBe(true);
    });

    /**
     * Test: instanceof PubSubException
     *
     * Verifies that the exception can be identified as a PubSubException
     * for type-specific error handling.
     */
    it('should be instance of PubSubException', () => {
      // Arrange & Act
      const exception = PubSubException.make('Test error');

      // Assert
      expect(exception instanceof PubSubException).toBe(true);
    });

    /**
     * Test: Error name property
     *
     * Ensures that the error name is correctly set to 'PubSubException',
     * which helps identify the error type in logs.
     */
    it('should have correct name property', () => {
      // Arrange & Act
      const exception = PubSubException.make('Test error');

      // Assert
      expect(exception.name).toBe('PubSubException');
    });
  });

  /**
   * Test group: JSON serialization
   *
   * Verifies that the exception can be serialized to JSON format,
   * which is useful for logging, API responses, and error reporting.
   */
  describe('toJSON', () => {
    /**
     * Test: Basic serialization
     *
     * Ensures that the exception can be converted to a plain object
     * containing all relevant error information.
     */
    it('should serialize to JSON with all properties', () => {
      // Arrange
      const message = 'Test error message';
      const code = 'TEST_ERROR';
      const metadata = { key: 'value' };
      const exception = PubSubException.make(message, code, metadata);

      // Act
      const json = exception.toJSON();

      // Assert
      expect(json).toHaveProperty('name', 'PubSubException');
      expect(json).toHaveProperty('message', message);
      expect(json).toHaveProperty('code', code);
      expect(json).toHaveProperty('metadata', metadata);
      expect(json).toHaveProperty('stack');
      expect(typeof json.stack).toBe('string');
    });

    /**
     * Test: Serialization without optional properties
     *
     * Verifies that serialization works correctly even when optional
     * properties (code, metadata) are not provided.
     */
    it('should serialize to JSON without optional properties', () => {
      // Arrange
      const message = 'Test error message';
      const exception = PubSubException.make(message);

      // Act
      const json = exception.toJSON();

      // Assert
      expect(json).toHaveProperty('name', 'PubSubException');
      expect(json).toHaveProperty('message', message);
      expect(json).toHaveProperty('code', undefined);
      expect(json).toHaveProperty('metadata', undefined);
      expect(json).toHaveProperty('stack');
    });

    /**
     * Test: JSON stringification
     *
     * Ensures that the exception can be converted to a JSON string
     * using JSON.stringify(), which is common in logging scenarios.
     */
    it('should be stringifiable with JSON.stringify', () => {
      // Arrange
      const exception = PubSubException.make('Test error', 'TEST_CODE');

      // Act
      const jsonString = JSON.stringify(exception.toJSON());

      // Assert
      expect(typeof jsonString).toBe('string');
      expect(jsonString).toContain('Test error');
      expect(jsonString).toContain('TEST_CODE');
    });
  });

  /**
   * Test group: Error throwing and catching
   *
   * Verifies that the exception can be thrown and caught properly,
   * which is essential for error handling in real applications.
   */
  describe('throwing and catching', () => {
    /**
     * Test: Exception can be thrown
     *
     * Ensures that the exception can be thrown and caught in a
     * try-catch block.
     */
    it('should be throwable and catchable', () => {
      // Arrange
      const message = 'Test error';

      // Act & Assert
      expect(() => {
        throw PubSubException.make(message);
      }).toThrow(PubSubException);
    });

    /**
     * Test: Caught exception preserves properties
     *
     * Verifies that when an exception is caught, all its properties
     * are still accessible.
     */
    it('should preserve properties when caught', () => {
      // Arrange
      const message = 'Test error';
      const code = 'TEST_CODE';
      const metadata = { detail: 'test' };

      // Act
      try {
        throw PubSubException.make(message, code, metadata);
      } catch (error: Error | any) {
        // Assert
        expect(error).toBeInstanceOf(PubSubException);
        expect((error as PubSubException).message).toBe(message);
        expect((error as PubSubException).code).toBe(code);
        expect((error as PubSubException).metadata).toEqual(metadata);
      }
    });

    /**
     * Test: Exception can be caught as Error
     *
     * Ensures that the exception can be caught as a generic Error,
     * which is important for compatibility with existing error handling.
     */
    it('should be catchable as Error', () => {
      // Arrange & Act & Assert
      expect(() => {
        throw PubSubException.make('Test error');
      }).toThrow(Error);
    });
  });

  /**
   * Test group: Metadata handling
   *
   * Verifies that metadata can be attached to exceptions and is
   * properly preserved and accessible.
   */
  describe('metadata', () => {
    /**
     * Test: Complex metadata objects
     *
     * Ensures that complex metadata objects with nested structures
     * can be attached to exceptions.
     */
    it('should handle complex metadata objects', () => {
      // Arrange
      const metadata = {
        driver: 'redis',
        host: 'localhost',
        port: 6379,
        nested: {
          level1: {
            level2: 'value',
          },
        },
        array: [1, 2, 3],
      };

      // Act
      const exception = PubSubException.make('Test error', 'TEST', metadata);

      // Assert
      expect(exception.metadata).toEqual(metadata);
      expect(exception.metadata?.nested.level1.level2).toBe('value');
      expect(exception.metadata?.array).toEqual([1, 2, 3]);
    });

    /**
     * Test: Empty metadata object
     *
     * Verifies that an empty metadata object can be provided.
     */
    it('should handle empty metadata object', () => {
      // Arrange
      const metadata = {};

      // Act
      const exception = PubSubException.make('Test error', 'TEST', metadata);

      // Assert
      expect(exception.metadata).toEqual({});
    });
  });
});
