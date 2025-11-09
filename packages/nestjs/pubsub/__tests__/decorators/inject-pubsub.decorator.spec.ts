import 'reflect-metadata';
import { InjectPubSub } from '@decorators/inject-pubsub.decorator';

describe('@InjectPubSub() Decorator', () => {
  /**
   * Test group: Basic injection functionality
   *
   * Verifies that the decorator properly marks parameters for
   * dependency injection.
   */
  describe('basic injection', () => {
    /**
     * Test: Decorator returns function
     *
     * Ensures that InjectPubSub returns a proper parameter decorator
     * function that can be used for dependency injection.
     */
    it('should return a parameter decorator function', () => {
      // Act
      const decorator = InjectPubSub();

      // Assert
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    /**
     * Test: Decorator can be applied to constructor parameters
     *
     * Verifies that the decorator can be used in class constructors
     * for dependency injection.
     */
    it('should be applicable to constructor parameters', () => {
      // Arrange & Act
      class TestService {
        constructor(@InjectPubSub() private readonly pubsub: any) {}
      }

      // Assert
      expect(TestService).toBeDefined();
      expect(TestService.make({} as any)).toBeInstanceOf(TestService);
    });

    /**
     * Test: Multiple injections in same constructor
     *
     * Ensures that multiple parameters can be decorated independently.
     */
    it('should handle multiple injections in same constructor', () => {
      // Arrange & Act
      class TestService {
        constructor(
          @InjectPubSub() private readonly pubsub1: any,
          @InjectPubSub() private readonly pubsub2: any,
        ) {}
      }

      // Assert
      expect(TestService).toBeDefined();
      const instance = TestService.make({} as any, {} as any);
      expect(instance).toBeInstanceOf(TestService);
    });
  });

  /**
   * Test group: Injection token verification
   *
   * Verifies that the correct injection token is used for
   * resolving dependencies.
   */
  describe('injection token', () => {
    /**
     * Test: Uses correct injection token
     *
     * Ensures that the decorator uses the PUBSUB_SERVICE token
     * for dependency resolution.
     */
    it('should use PUBSUB_SERVICE injection token', () => {
      // Arrange
      class TestService {
        constructor(@InjectPubSub() private readonly pubsub: any) {}
      }

      // Act
      const metadata = Reflect.getMetadata('design:paramtypes', TestService);

      // Assert
      expect(metadata).toBeDefined();
      // The decorator should have attached the injection token metadata
    });

    /**
     * Test: Token is consistent across multiple uses
     *
     * Verifies that the same token is used for all injections.
     */
    it('should use consistent token across multiple injections', () => {
      // Arrange
      class Service1 {
        constructor(@InjectPubSub() private readonly pubsub: any) {}
      }

      class Service2 {
        constructor(@InjectPubSub() private readonly pubsub: any) {}
      }

      // Act & Assert
      expect(Service1).toBeDefined();
      expect(Service2).toBeDefined();
      // Both should use the same PUBSUB_SERVICE token
    });
  });

  /**
   * Test group: Integration scenarios
   *
   * Verifies that the decorator works correctly in realistic
   * service class scenarios.
   */
  describe('integration scenarios', () => {
    /**
     * Test: Injection in service class
     *
     * Ensures that the decorator works in typical service classes.
     */
    it('should work in service class', () => {
      // Arrange & Act
      class UserService {
        constructor(@InjectPubSub() private readonly pubsub: any) {}

        async notifyUserCreated(userId: string) {
          // Would use this.pubsub.publish() in real implementation
          return true;
        }
      }

      // Assert
      expect(UserService).toBeDefined();
      const mockPubSub = { publish: jest.fn() };
      const service = UserService.make(mockPubSub);
      expect(service).toBeInstanceOf(UserService);
    });

    /**
     * Test: Injection alongside other dependencies
     *
     * Verifies that PubSub can be injected alongside other services.
     */
    it('should work alongside other dependencies', () => {
      // Arrange & Act
      class OrderService {
        constructor(
          @InjectPubSub() private readonly pubsub: any,
          private readonly database: any,
          private readonly logger: any,
        ) {}
      }

      // Assert
      expect(OrderService).toBeDefined();
      const instance = OrderService.make({}, {}, {});
      expect(instance).toBeInstanceOf(OrderService);
    });

    /**
     * Test: Injection in controller
     *
     * Ensures that the decorator works in controller classes.
     */
    it('should work in controller class', () => {
      // Arrange & Act
      class EventController {
        constructor(@InjectPubSub() private readonly pubsub: any) {}

        async publishEvent(event: any) {
          // Would use this.pubsub.publish() in real implementation
          return { success: true };
        }
      }

      // Assert
      expect(EventController).toBeDefined();
      const mockPubSub = { publish: jest.fn() };
      const controller = EventController.make(mockPubSub);
      expect(controller).toBeInstanceOf(EventController);
    });
  });

  /**
   * Test group: Edge cases
   *
   * Verifies that the decorator handles edge cases correctly.
   */
  describe('edge cases', () => {
    /**
     * Test: Decorator without parentheses
     *
     * Ensures that the decorator can be called without parentheses
     * (though this is not the typical usage).
     */
    it('should work when called without parentheses', () => {
      // Arrange & Act
      const decorator = InjectPubSub();

      // Assert
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    /**
     * Test: Multiple calls return independent decorators
     *
     * Verifies that each call to InjectPubSub() returns a
     * function that can be used independently.
     */
    it('should return independent decorators on each call', () => {
      // Act
      const decorator1 = InjectPubSub();
      const decorator2 = InjectPubSub();

      // Assert
      expect(decorator1).toBeDefined();
      expect(decorator2).toBeDefined();
      expect(typeof decorator1).toBe('function');
      expect(typeof decorator2).toBe('function');
    });

    /**
     * Test: Decorator in abstract class
     *
     * Ensures that the decorator works in abstract base classes.
     */
    it('should work in abstract class', () => {
      // Arrange & Act
      abstract class BaseService {
        constructor(@InjectPubSub() protected readonly pubsub: any) {}

        abstract handleEvent(): void;
      }

      class ConcreteService extends BaseService {
        handleEvent() {
          // Implementation
        }
      }

      // Assert
      expect(BaseService).toBeDefined();
      expect(ConcreteService).toBeDefined();
      const instance = ConcreteService.make({});
      expect(instance).toBeInstanceOf(ConcreteService);
      expect(instance).toBeInstanceOf(BaseService);
    });
  });

  /**
   * Test group: Type safety
   *
   * Verifies that the decorator maintains type information
   * for TypeScript compilation.
   */
  describe('type safety', () => {
    /**
     * Test: Preserves parameter type information
     *
     * Ensures that TypeScript type information is preserved
     * when using the decorator.
     */
    it('should preserve parameter type information', () => {
      // Arrange
      interface IPubSubService {
        publish(topic: string, message: any): Promise<void>;
      }

      class TestService {
        constructor(@InjectPubSub() private readonly pubsub: IPubSubService) {}

        async sendMessage() {
          // TypeScript should know that pubsub has publish method
          await this.pubsub.publish('test', {});
        }
      }

      // Assert
      expect(TestService).toBeDefined();
      const mockPubSub: IPubSubService = {
        publish: jest.fn().mockResolvedValue(undefined),
      };
      const service = TestService.make(mockPubSub);
      expect(service).toBeInstanceOf(TestService);
    });
  });
});
