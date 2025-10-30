/**
 * Test suite for PublishFailedException class.
 *
 * This test suite verifies the behavior of the PublishFailedException,
 * which is thrown when a message fails to publish to a topic.
 *
 * Coverage:
 * - Constructor with topic and cause
 * - Constructor with optional message data
 * - Error message formatting
 * - Cause error preservation
 * - Metadata structure
 * - Inheritance from PubSubException
 */

import { PublishFailedException } from '@exceptions/publish-failed.exception';
import { PubSubException } from '@exceptions/pubsub.exception';

describe('PublishFailedException', () => {
  /**
   * Test group: Constructor behavior
   *
   * Verifies that the exception can be instantiated with different
   * parameter combinations and properly captures the cause of failure.
   */
  describe('constructor', () => {
    /**
     * Test: Basic instantiation with topic and cause
     *
     * Ensures that the exception can be created with a topic and a
     * cause error, generating an appropriate error message.
     */
    it('should create exception with topic and cause', () => {
      // Arrange
      const topic = 'user.created';
      const cause = new Error('Connection timeout');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception).toBeInstanceOf(PublishFailedException);
      expect(exception).toBeInstanceOf(PubSubException);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(
        `Failed to publish message to topic 'user.created': Connection timeout`,
      );
      expect(exception.name).toBe('PublishFailedException');
      expect(exception.code).toBe('PUBLISH_FAILED');
    });

    /**
     * Test: Instantiation with message data
     *
     * Verifies that optional message data can be provided and is
     * stored in the exception metadata for debugging purposes.
     */
    it('should create exception with message data', () => {
      // Arrange
      const topic = 'order.placed';
      const cause = new Error('Network error');
      const messageData = { orderId: '123', amount: 99.99 };

      // Act
      const exception = new PublishFailedException(topic, cause, messageData);

      // Assert
      expect(exception.message).toContain('order.placed');
      expect(exception.message).toContain('Network error');
      expect(exception.metadata?.messageData).toEqual(messageData);
    });

    /**
     * Test: Cause with complex error message
     *
     * Ensures that complex error messages from the cause are properly
     * included in the exception message.
     */
    it('should handle complex cause error messages', () => {
      // Arrange
      const topic = 'notification.sent';
      const cause = new Error('Failed to connect to Redis at localhost:6379: ECONNREFUSED');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception.message).toContain('notification.sent');
      expect(exception.message).toContain('ECONNREFUSED');
      expect(exception.message).toContain('localhost:6379');
    });
  });

  /**
   * Test group: Metadata structure
   *
   * Verifies that the exception properly stores metadata about the
   * failed publish operation, including topic, cause, and message data.
   */
  describe('metadata', () => {
    /**
     * Test: Metadata without message data
     *
     * Ensures that metadata includes topic and cause information
     * even when message data is not provided.
     */
    it('should include topic and cause in metadata', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception.metadata).toHaveProperty('topic', topic);
      expect(exception.metadata).toHaveProperty('cause', 'Test error');
      expect(exception.metadata).toHaveProperty('causeStack');
      expect(exception.metadata).toHaveProperty('messageData', undefined);
    });

    /**
     * Test: Metadata with message data
     *
     * Verifies that when message data is provided, it is included
     * in the metadata for debugging purposes.
     */
    it('should include message data in metadata when provided', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');
      const messageData = { key: 'value', count: 42 };

      // Act
      const exception = new PublishFailedException(topic, cause, messageData);

      // Assert
      expect(exception.metadata?.messageData).toEqual(messageData);
    });

    /**
     * Test: Cause stack trace preservation
     *
     * Ensures that the stack trace from the original cause error
     * is preserved in the metadata.
     */
    it('should preserve cause stack trace in metadata', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Original error');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception.metadata?.causeStack).toBeDefined();
      expect(typeof exception.metadata?.causeStack).toBe('string');
      expect(exception.metadata?.causeStack).toContain('Error');
    });

    /**
     * Test: Complex message data
     *
     * Verifies that complex message data structures are properly
     * stored in the metadata.
     */
    it('should handle complex message data structures', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');
      const messageData = {
        user: {
          id: '123',
          email: 'test@example.com',
          profile: {
            name: 'Test User',
            age: 30,
          },
        },
        tags: ['important', 'urgent'],
        timestamp: new Date('2025-01-01'),
      };

      // Act
      const exception = new PublishFailedException(topic, cause, messageData);

      // Assert
      expect(exception.metadata?.messageData).toEqual(messageData);
      expect(exception.metadata?.messageData.user.profile.name).toBe('Test User');
      expect(exception.metadata?.messageData.tags).toEqual(['important', 'urgent']);
    });
  });

  /**
   * Test group: Cause error handling
   *
   * Verifies that the original cause error is properly preserved
   * and accessible for debugging and error chaining.
   */
  describe('cause error', () => {
    /**
     * Test: Cause preservation (if supported by runtime)
     *
     * Checks if the cause error is preserved as a property when
     * the runtime supports error causes.
     */
    it('should preserve cause error when supported', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Original error');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      // Note: Error.cause is a newer feature, check if it exists
      if ('cause' in Error.prototype) {
        expect((exception as any).cause).toBe(cause);
      }
    });

    /**
     * Test: Different error types as cause
     *
     * Ensures that various error types can be used as the cause
     * and their messages are properly captured.
     */
    it('should handle different error types as cause', () => {
      // Arrange
      const topic = 'test.topic';
      const typeError = new TypeError('Invalid type');
      const rangeError = new RangeError('Out of range');
      const syntaxError = new SyntaxError('Invalid syntax');

      // Act
      const exception1 = new PublishFailedException(topic, typeError);
      const exception2 = new PublishFailedException(topic, rangeError);
      const exception3 = new PublishFailedException(topic, syntaxError);

      // Assert
      expect(exception1.message).toContain('Invalid type');
      expect(exception2.message).toContain('Out of range');
      expect(exception3.message).toContain('Invalid syntax');
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
     * PublishFailedException and its parent classes.
     */
    it('should maintain proper inheritance chain', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception instanceof PublishFailedException).toBe(true);
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
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception.name).toBe('PublishFailedException');
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
     * Test: PUBLISH_FAILED code
     *
     * Ensures that the exception always uses the PUBLISH_FAILED
     * error code, regardless of constructor parameters.
     */
    it('should always use PUBLISH_FAILED code', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');

      // Act
      const exception1 = new PublishFailedException(topic, cause);
      const exception2 = new PublishFailedException(topic, cause, {
        data: 'test',
      });

      // Assert
      expect(exception1.code).toBe('PUBLISH_FAILED');
      expect(exception2.code).toBe('PUBLISH_FAILED');
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
      const topic = 'test.topic';
      const cause = new Error('Connection failed');
      const messageData = { id: '123' };
      const exception = new PublishFailedException(topic, cause, messageData);

      // Act
      const json = exception.toJSON();

      // Assert
      expect(json.name).toBe('PublishFailedException');
      expect(json.code).toBe('PUBLISH_FAILED');
      expect(json.message).toContain('test.topic');
      expect(json.message).toContain('Connection failed');
      expect(json.metadata.topic).toBe(topic);
      expect(json.metadata.messageData).toEqual(messageData);
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
     * Test: Network timeout scenario
     *
     * Simulates a common scenario where publishing fails due to
     * a network timeout.
     */
    it('should handle network timeout scenario', () => {
      // Arrange
      const topic = 'payment.processed';
      const cause = new Error('ETIMEDOUT: Connection timed out after 5000ms');
      const messageData = {
        paymentId: 'pay_123',
        amount: 150.0,
        currency: 'USD',
      };

      // Act
      const exception = new PublishFailedException(topic, cause, messageData);

      // Assert
      expect(exception.message).toContain('payment.processed');
      expect(exception.message).toContain('ETIMEDOUT');
      expect(exception.metadata?.messageData.paymentId).toBe('pay_123');
    });

    /**
     * Test: Connection refused scenario
     *
     * Simulates a scenario where the messaging backend is unavailable.
     */
    it('should handle connection refused scenario', () => {
      // Arrange
      const topic = 'user.login';
      const cause = new Error('ECONNREFUSED: Connection refused');

      // Act
      const exception = new PublishFailedException(topic, cause);

      // Assert
      expect(exception.message).toContain('ECONNREFUSED');
      expect(exception.code).toBe('PUBLISH_FAILED');
    });

    /**
     * Test: Serialization error scenario
     *
     * Simulates a scenario where message serialization fails.
     */
    it('should handle serialization error scenario', () => {
      // Arrange
      const topic = 'data.updated';
      const cause = new Error('Failed to serialize message: Converting circular structure to JSON');
      const messageData = { note: 'Contains circular reference' };

      // Act
      const exception = new PublishFailedException(topic, cause, messageData);

      // Assert
      expect(exception.message).toContain('circular structure');
      expect(exception.metadata?.messageData.note).toBe('Contains circular reference');
    });

    /**
     * Test: Exception in catch block
     *
     * Verifies that the exception can be properly caught and its
     * properties accessed in error handling code.
     */
    it('should be usable in catch blocks', () => {
      // Arrange
      const topic = 'test.topic';
      const cause = new Error('Test error');
      const messageData = { test: true };

      // Act & Assert
      try {
        throw new PublishFailedException(topic, cause, messageData);
      } catch (error: Error | any) {
        expect(error).toBeInstanceOf(PublishFailedException);
        if (error instanceof PublishFailedException) {
          expect(error.code).toBe('PUBLISH_FAILED');
          expect(error.metadata?.topic).toBe(topic);
          expect(error.metadata?.messageData).toEqual(messageData);
        }
      }
    });
  });
});
