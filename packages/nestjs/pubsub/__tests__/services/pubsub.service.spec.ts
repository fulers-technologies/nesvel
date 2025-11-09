import { PubSubService } from '@services/pubsub.service';
import type { IPubSubDriver } from '@interfaces/pubsub-driver.interface';
import type { IPubSubMessage } from '@interfaces/pubsub-message.interface';

describe('PubSubService', () => {
  let service: PubSubService;
  let mockDriver: jest.Mocked<IPubSubDriver>;

  /**
   * Setup: Create mock driver and service instance before each test
   *
   * This ensures that each test starts with a fresh service instance
   * and a clean mock driver with no previous interactions.
   */
  beforeEach(() => {
    // Create mock driver with all required methods
    mockDriver = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn().mockReturnValue(false),
      getSubscribedTopics: jest.fn().mockReturnValue([]),
    };

    // Create service instance with mock driver
    service = PubSubService.make(mockDriver, false);
  });

  /**
   * Cleanup: Clear all mocks after each test
   *
   * Ensures that mock call history doesn't leak between tests.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test group: Constructor and initialization
   *
   * Verifies that the service can be instantiated correctly with
   * different configuration options.
   */
  describe('constructor', () => {
    /**
     * Test: Basic instantiation
     *
     * Ensures that the service can be created with a driver and
     * autoConnect disabled.
     */
    it('should create service instance', () => {
      // Assert
      expect(service).toBeInstanceOf(PubSubService);
      expect(service).toBeDefined();
    });

    /**
     * Test: Auto-connect on initialization
     *
     * Verifies that when autoConnect is true, the driver's connect
     * method is called automatically during module initialization.
     */
    it('should auto-connect when autoConnect is true', async () => {
      // Arrange
      const autoConnectService = PubSubService.make(mockDriver, true);

      // Act
      await autoConnectService.onModuleInit();

      // Assert
      expect(mockDriver.connect).toHaveBeenCalled();
    });

    /**
     * Test: No auto-connect when disabled
     *
     * Ensures that when autoConnect is false, the connect method
     * is not called during construction.
     */
    it('should not auto-connect when autoConnect is false', () => {
      // Arrange & Act
      const noAutoConnectService = PubSubService.make(mockDriver, false);

      // Assert
      expect(mockDriver.connect).not.toHaveBeenCalled();
    });
  });

  /**
   * Test group: connect() method
   *
   * Verifies that the connect method properly delegates to the
   * driver and handles various scenarios.
   */
  describe('connect', () => {
    /**
     * Test: Successful connection
     *
     * Ensures that calling connect() delegates to the driver's
     * connect method.
     */
    it('should call driver connect method', async () => {
      // Act
      await service.connect();

      // Assert
      expect(mockDriver.connect).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Connection error handling
     *
     * Verifies that connection errors are properly propagated.
     */
    it('should propagate connection errors', async () => {
      // Arrange
      const error = new Error('Connection failed');
      mockDriver.connect.mockRejectedValue(error);

      // Act & Assert
      await expect(service.connect()).rejects.toThrow('Connection failed');
    });

    /**
     * Test: Multiple connect calls
     *
     * Ensures that multiple connect calls are handled correctly.
     */
    it('should handle multiple connect calls', async () => {
      // Act
      await service.connect();
      await service.connect();
      await service.connect();

      // Assert
      expect(mockDriver.connect).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Test group: disconnect() method
   *
   * Verifies that the disconnect method properly delegates to the
   * driver and handles cleanup.
   */
  describe('disconnect', () => {
    /**
     * Test: Successful disconnection
     *
     * Ensures that calling disconnect() delegates to the driver's
     * disconnect method.
     */
    it('should call driver disconnect method', async () => {
      // Act
      await service.disconnect();

      // Assert
      expect(mockDriver.disconnect).toHaveBeenCalledTimes(1);
    });

    /**
     * Test: Disconnection error handling
     *
     * Verifies that disconnection errors are properly propagated.
     */
    it('should propagate disconnection errors', async () => {
      // Arrange
      const error = new Error('Disconnection failed');
      mockDriver.disconnect.mockRejectedValue(error);

      // Act & Assert
      await expect(service.disconnect()).rejects.toThrow('Disconnection failed');
    });

    /**
     * Test: Disconnect when not connected
     *
     * Ensures that disconnecting when not connected is handled gracefully.
     */
    it('should handle disconnect when not connected', async () => {
      // Arrange
      mockDriver.isConnected.mockReturnValue(false);

      // Act
      await service.disconnect();

      // Assert
      expect(mockDriver.disconnect).toHaveBeenCalled();
    });
  });

  /**
   * Test group: publish() method
   *
   * Verifies that the publish method correctly sends messages to
   * topics with various data types and options.
   */
  describe('publish', () => {
    /**
     * Test: Publish simple object
     *
     * Ensures that a basic object can be published to a topic.
     */
    it('should publish message to topic', async () => {
      // Arrange
      const topic = 'test.topic';
      const data = { message: 'Hello, World!' };

      // Act
      await service.publish(topic, data);

      // Assert
      expect(mockDriver.publish).toHaveBeenCalledTimes(1);
      expect(mockDriver.publish).toHaveBeenCalledWith(topic, data, undefined);
    });

    /**
     * Test: Publish with options
     *
     * Verifies that driver-specific options can be passed to publish.
     */
    it('should publish message with options', async () => {
      // Arrange
      const topic = 'test.topic';
      const data = { message: 'Test' };
      const options = { priority: 'high', ttl: 3600 };

      // Act
      await service.publish(topic, data, options);

      // Assert
      expect(mockDriver.publish).toHaveBeenCalledWith(topic, data, options);
    });

    /**
     * Test: Publish different data types
     *
     * Ensures that various data types can be published.
     */
    it('should handle different data types', async () => {
      // Arrange
      const topic = 'test.topic';
      const testCases = [
        { type: 'string', data: 'simple string' },
        { type: 'number', data: 42 },
        { type: 'boolean', data: true },
        { type: 'array', data: [1, 2, 3] },
        { type: 'nested object', data: { user: { id: 1, name: 'Test' } } },
        { type: 'null', data: null },
      ];

      // Act & Assert
      for (const testCase of testCases) {
        await service.publish(topic, testCase.data);
        expect(mockDriver.publish).toHaveBeenCalledWith(topic, testCase.data, undefined);
      }
    });

    /**
     * Test: Publish error handling
     *
     * Verifies that publish errors are properly propagated.
     */
    it('should propagate publish errors', async () => {
      // Arrange
      const topic = 'test.topic';
      const data = { message: 'Test' };
      const error = new Error('Publish failed');
      mockDriver.publish.mockRejectedValue(error);

      // Act & Assert
      await expect(service.publish(topic, data)).rejects.toThrow('Publish failed');
    });

    /**
     * Test: Publish to multiple topics
     *
     * Ensures that messages can be published to different topics.
     */
    it('should publish to multiple topics', async () => {
      // Arrange
      const topics = ['topic.one', 'topic.two', 'topic.three'];
      const data = { message: 'Test' };

      // Act
      for (const topic of topics) {
        await service.publish(topic, data);
      }

      // Assert
      expect(mockDriver.publish).toHaveBeenCalledTimes(3);
      topics.forEach((topic) => {
        expect(mockDriver.publish).toHaveBeenCalledWith(topic, data, undefined);
      });
    });
  });

  /**
   * Test group: subscribe() method
   *
   * Verifies that the subscribe method correctly registers message
   * handlers for topics.
   */
  describe('subscribe', () => {
    /**
     * Test: Subscribe to topic with handler
     *
     * Ensures that a handler can be registered for a topic.
     */
    it('should subscribe to topic with handler', async () => {
      // Arrange
      const topic = 'test.topic';
      const handler = jest.fn();

      // Act
      await service.subscribe(topic, handler);

      // Assert
      expect(mockDriver.subscribe).toHaveBeenCalledTimes(1);
      expect(mockDriver.subscribe).toHaveBeenCalledWith(topic, expect.any(Function), undefined);
    });

    /**
     * Test: Subscribe with options
     *
     * Verifies that subscription options can be passed to the driver.
     */
    it('should subscribe with options', async () => {
      // Arrange
      const topic = 'test.topic';
      const handler = jest.fn();
      const options = { ackDeadline: 30 };

      // Act
      await service.subscribe(topic, handler, options);

      // Assert
      expect(mockDriver.subscribe).toHaveBeenCalledWith(topic, expect.any(Function), options);
    });

    /**
     * Test: Handler receives messages
     *
     * Verifies that the registered handler is called when messages arrive.
     */
    it('should call handler when message arrives', async () => {
      // Arrange
      const topic = 'test.topic';
      const handler = jest.fn();
      let capturedHandler: any;

      mockDriver.subscribe.mockImplementation(async (t, h) => {
        capturedHandler = h;
      });

      await service.subscribe(topic, handler);

      const message: IPubSubMessage = {
        id: 'msg-1',
        topic: 'test.topic',
        data: { test: 'data' },
        timestamp: new Date(),
      };

      // Act
      await capturedHandler(message);

      // Assert
      expect(handler).toHaveBeenCalledWith(message);
    });

    /**
     * Test: Subscribe to multiple topics
     *
     * Ensures that multiple subscriptions can be created.
     */
    it('should handle multiple subscriptions', async () => {
      // Arrange
      const subscriptions = [
        { topic: 'topic.one', handler: jest.fn() },
        { topic: 'topic.two', handler: jest.fn() },
        { topic: 'topic.three', handler: jest.fn() },
      ];

      // Act
      for (const sub of subscriptions) {
        await service.subscribe(sub.topic, sub.handler);
      }

      // Assert
      expect(mockDriver.subscribe).toHaveBeenCalledTimes(3);
    });

    /**
     * Test: Subscribe error handling
     *
     * Verifies that subscription errors are properly propagated.
     */
    it('should propagate subscription errors', async () => {
      // Arrange
      const topic = 'test.topic';
      const handler = jest.fn();
      const error = new Error('Subscription failed');
      mockDriver.subscribe.mockRejectedValue(error);

      // Act & Assert
      await expect(service.subscribe(topic, handler)).rejects.toThrow('Subscription failed');
    });
  });

  /**
   * Test group: unsubscribe() method
   *
   * Verifies that the unsubscribe method correctly removes
   * message handlers from topics.
   */
  describe('unsubscribe', () => {
    /**
     * Test: Unsubscribe from topic
     *
     * Ensures that a subscription can be removed.
     */
    it('should unsubscribe from topic', async () => {
      // Arrange
      const topic = 'test.topic';

      // Act
      await service.unsubscribe(topic);

      // Assert
      expect(mockDriver.unsubscribe).toHaveBeenCalledTimes(1);
      expect(mockDriver.unsubscribe).toHaveBeenCalledWith(topic, undefined);
    });

    /**
     * Test: Unsubscribe from non-existent subscription
     *
     * Verifies that unsubscribing from a non-existent topic is handled.
     */
    it('should handle unsubscribe from non-existent topic', async () => {
      // Arrange
      const topic = 'non.existent.topic';

      // Act
      await service.unsubscribe(topic);

      // Assert
      expect(mockDriver.unsubscribe).toHaveBeenCalledWith(topic, undefined);
    });

    /**
     * Test: Unsubscribe error handling
     *
     * Verifies that unsubscribe errors are properly propagated.
     */
    it('should propagate unsubscribe errors', async () => {
      // Arrange
      const topic = 'test.topic';
      const error = new Error('Unsubscribe failed');
      mockDriver.unsubscribe.mockRejectedValue(error);

      // Act & Assert
      await expect(service.unsubscribe(topic)).rejects.toThrow('Unsubscribe failed');
    });

    /**
     * Test: Unsubscribe from multiple topics
     *
     * Ensures that multiple subscriptions can be removed.
     */
    it('should unsubscribe from multiple topics', async () => {
      // Arrange
      const topics = ['topic.one', 'topic.two', 'topic.three'];

      // Act
      for (const topic of topics) {
        await service.unsubscribe(topic);
      }

      // Assert
      expect(mockDriver.unsubscribe).toHaveBeenCalledTimes(3);
    });
  });

  /**
   * Test group: isConnected() method
   *
   * Verifies that the connection status check works correctly.
   */
  describe('isConnected', () => {
    /**
     * Test: Check connected status
     *
     * Ensures that the method returns the driver's connection status.
     */
    it('should return true when connected', () => {
      // Arrange
      mockDriver.isConnected.mockReturnValue(true);

      // Act
      const result = service.isConnected();

      // Assert
      expect(result).toBe(true);
      expect(mockDriver.isConnected).toHaveBeenCalled();
    });

    /**
     * Test: Check disconnected status
     *
     * Verifies that the method returns false when not connected.
     */
    it('should return false when disconnected', () => {
      // Arrange
      mockDriver.isConnected.mockReturnValue(false);

      // Act
      const result = service.isConnected();

      // Assert
      expect(result).toBe(false);
      expect(mockDriver.isConnected).toHaveBeenCalled();
    });
  });

  /**
   * Test group: Integration scenarios
   *
   * Tests the service in realistic usage scenarios that combine
   * multiple operations.
   */
  describe('integration scenarios', () => {
    /**
     * Test: Complete pub/sub flow
     *
     * Simulates a complete publish-subscribe workflow.
     */
    it('should handle complete pub/sub flow', async () => {
      // Arrange
      const topic = 'user.created';
      const handler = jest.fn();
      const messageData = { userId: '123', email: 'test@example.com' };

      // Act
      await service.connect();
      await service.subscribe(topic, handler);
      await service.publish(topic, messageData);
      await service.unsubscribe(topic);
      await service.disconnect();

      // Assert
      expect(mockDriver.connect).toHaveBeenCalled();
      expect(mockDriver.subscribe).toHaveBeenCalled();
      expect(mockDriver.publish).toHaveBeenCalled();
      expect(mockDriver.unsubscribe).toHaveBeenCalled();
      expect(mockDriver.disconnect).toHaveBeenCalled();
    });

    /**
     * Test: Multiple publishers and subscribers
     *
     * Simulates multiple concurrent publish and subscribe operations.
     */
    it('should handle multiple concurrent operations', async () => {
      // Arrange
      const topics = ['topic.one', 'topic.two', 'topic.three'];
      const handlers = topics.map(() => jest.fn());

      await service.connect();

      // Act
      await Promise.all(topics.map((topic, index) => service.subscribe(topic, handlers[index])));

      await Promise.all(
        topics.map((topic) => service.publish(topic, { message: `Data for ${topic}` })),
      );

      // Assert
      expect(mockDriver.subscribe).toHaveBeenCalledTimes(3);
      expect(mockDriver.publish).toHaveBeenCalledTimes(3);
    });
  });
});
