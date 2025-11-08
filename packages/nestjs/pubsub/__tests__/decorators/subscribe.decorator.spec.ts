import 'reflect-metadata';
import { Subscribe } from '@decorators/subscribe.decorator';
import { PUBSUB_SUBSCRIBE_METADATA } from '@constants/pubsub-subscribe-metadata.constant';
import type { ISubscriptionMetadata } from '@interfaces/subscription-metadata.interface';

describe('@Subscribe() Decorator', () => {
  /**
   * Test group: Basic subscription functionality
   *
   * Verifies that the decorator properly attaches metadata with
   * minimal configuration.
   */
  describe('basic subscription', () => {
    /**
     * Test: Subscribe with topic only
     *
     * Ensures that the decorator can be applied with just a topic
     * and stores the correct metadata.
     */
    it('should attach metadata with topic only', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic')
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('test.topic');
      expect(metadata.options).toBeUndefined();
    });

    /**
     * Test: Subscribe with pattern
     *
     * Verifies that pattern-based subscriptions can be configured.
     */
    it('should attach metadata with pattern topic', () => {
      // Arrange
      class TestClass {
        @Subscribe('user.*')
        handleUserEvents() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleUserEvents,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('user.*');
    });
  });

  /**
   * Test group: Subscription with options
   *
   * Verifies that the decorator properly handles subscription options
   * like queue groups and acknowledgment settings.
   */
  describe('subscription with options', () => {
    /**
     * Test: Subscribe with queue group
     *
     * Ensures that queue group configuration is properly stored.
     */
    it('should attach metadata with queue group', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic', { queueGroup: 'worker-group' })
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('test.topic');
      expect(metadata.options).toBeDefined();
      expect(metadata.options?.queueGroup).toBe('worker-group');
    });

    /**
     * Test: Subscribe with acknowledgment enabled
     *
     * Verifies that acknowledgment settings are properly stored.
     */
    it('should attach metadata with acknowledgment enabled', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic', { ack: true })
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.options).toBeDefined();
      expect(metadata.options?.ack).toBe(true);
    });

    /**
     * Test: Subscribe with multiple options
     *
     * Ensures that multiple options can be configured together.
     */
    it('should attach metadata with multiple options', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic', {
          queueGroup: 'workers',
          ack: true,
          maxRetries: 3,
        })
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('test.topic');
      expect(metadata.options?.queueGroup).toBe('workers');
      expect(metadata.options?.ack).toBe(true);
      expect(metadata.options?.maxRetries).toBe(3);
    });
  });

  /**
   * Test group: Multiple subscriptions
   *
   * Verifies that multiple methods can be decorated independently
   * with different configurations.
   */
  describe('multiple subscriptions', () => {
    /**
     * Test: Multiple decorated methods in same class
     *
     * Ensures that multiple methods can have independent subscriptions.
     */
    it('should handle multiple subscriptions in same class', () => {
      // Arrange
      class TestClass {
        @Subscribe('topic.one')
        handleTopicOne() {}

        @Subscribe('topic.two')
        handleTopicTwo() {}

        @Subscribe('topic.three', { queueGroup: 'group-three' })
        handleTopicThree() {}
      }

      // Act
      const metadata1 = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleTopicOne,
      ) as ISubscriptionMetadata;

      const metadata2 = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleTopicTwo,
      ) as ISubscriptionMetadata;

      const metadata3 = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleTopicThree,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata1.topic).toBe('topic.one');
      expect(metadata1.options).toBeUndefined();

      expect(metadata2.topic).toBe('topic.two');
      expect(metadata2.options).toBeUndefined();

      expect(metadata3.topic).toBe('topic.three');
      expect(metadata3.options?.queueGroup).toBe('group-three');
    });

    /**
     * Test: Subscriptions don't interfere with each other
     *
     * Verifies that decorating one method doesn't affect others.
     */
    it('should not interfere between different methods', () => {
      // Arrange
      class TestClass {
        @Subscribe('topic.a', { queueGroup: 'group-a' })
        handleA() {}

        @Subscribe('topic.b', { queueGroup: 'group-b' })
        handleB() {}
      }

      // Act
      const metadataA = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleA,
      ) as ISubscriptionMetadata;

      const metadataB = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleB,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadataA.options?.queueGroup).toBe('group-a');
      expect(metadataB.options?.queueGroup).toBe('group-b');
      expect(metadataA.options?.queueGroup).not.toBe(metadataB.options?.queueGroup);
    });
  });

  /**
   * Test group: Edge cases
   *
   * Verifies that the decorator handles edge cases correctly.
   */
  describe('edge cases', () => {
    /**
     * Test: Empty topic string
     *
     * Ensures that empty topic strings are handled.
     */
    it('should handle empty topic string', () => {
      // Arrange
      class TestClass {
        @Subscribe('')
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('');
    });

    /**
     * Test: Topic with special characters
     *
     * Verifies that topics with special characters are preserved.
     */
    it('should handle topics with special characters', () => {
      // Arrange
      class TestClass {
        @Subscribe('user.created:v2')
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata.topic).toBe('user.created:v2');
    });

    /**
     * Test: Empty options object
     *
     * Ensures that empty options objects are handled correctly.
     */
    it('should handle empty options object', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic', {})
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      ) as ISubscriptionMetadata;

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.options).toEqual({});
    });
  });

  /**
   * Test group: Metadata retrieval
   *
   * Verifies that metadata can be properly retrieved from decorated methods.
   */
  describe('metadata retrieval', () => {
    /**
     * Test: Retrieve metadata from decorated method
     *
     * Ensures that stored metadata can be retrieved correctly.
     */
    it('should retrieve metadata from decorated method', () => {
      // Arrange
      class TestClass {
        @Subscribe('test.topic', { queueGroup: 'workers' })
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      );

      // Assert
      expect(metadata).toBeDefined();
      expect(metadata.topic).toBe('test.topic');
      expect(metadata.options.queueGroup).toBe('workers');
    });

    /**
     * Test: Return undefined for non-decorated methods
     *
     * Verifies that non-decorated methods return undefined.
     */
    it('should return undefined for non-decorated methods', () => {
      // Arrange
      class TestClass {
        handleMessage() {}
      }

      // Act
      const metadata = Reflect.getMetadata(
        PUBSUB_SUBSCRIBE_METADATA,
        TestClass.prototype.handleMessage,
      );

      // Assert
      expect(metadata).toBeUndefined();
    });
  });
});
