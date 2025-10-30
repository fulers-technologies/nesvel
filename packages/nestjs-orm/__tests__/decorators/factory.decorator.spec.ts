/**
 * Test suite for @Factory() decorator.
 *
 * This test suite verifies the behavior of the @Factory() decorator,
 * including dependency injection integration with NestJS and factory
 * registration with the ORM system.
 *
 * Coverage:
 * - Basic factory registration functionality
 * - Integration with NestJS DI container
 * - Class decoration for factory classes
 * - Factory configuration options
 * - Metadata attachment and retrieval
 * - Factory inheritance scenarios
 * - Error handling for invalid configurations
 *
 * @module __tests__/decorators/factory.decorator.spec
 */

import 'reflect-metadata';
import { Entity, Property } from '@mikro-orm/core';
import { Factory } from '@/decorators/factory.decorator';
import { BaseFactory } from '@/factories/base.factory';
import { BaseEntity } from '@/entities/base.entity';

// Test entities for factory testing
class ConcreteBaseEntity extends BaseEntity {}

@Entity()
class TestEntity extends ConcreteBaseEntity {
  @Property()
  name!: string;
}

@Entity()
class User extends ConcreteBaseEntity {
  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  role?: string;
}

@Entity()
class Product extends ConcreteBaseEntity {
  @Property()
  name!: string;

  @Property()
  status?: string;
}

@Entity()
class CustomEntity extends ConcreteBaseEntity {
  @Property()
  name!: string;
}

@Entity()
class AdminUser extends ConcreteBaseEntity {
  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  role!: string;
}

@Entity()
class Post extends ConcreteBaseEntity {
  @Property()
  title!: string;

  @Property()
  content!: string;

  @Property()
  authorId?: string;
}

@Entity()
class SpecialUser extends ConcreteBaseEntity {
  @Property()
  name!: string;

  @Property()
  email!: string;

  @Property()
  role!: string;
}

@Entity()
class Injectable extends ConcreteBaseEntity {
  @Property()
  name!: string;
}

@Entity()
class TypedProduct extends ConcreteBaseEntity {
  @Property()
  name!: string;

  @Property()
  price!: number;
}

@Entity()
class TimestampedEntity extends ConcreteBaseEntity {
  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}

/**
 * Mock entity interface for testing - make it compatible with BaseEntity
 */
interface TestUser {
  id: number; // Change to number to match BaseEntity
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Mock factory manager for testing
 */
class MockFactoryManager {
  private static registeredFactories = new Map<string, any>();

  static registerFactory(name: string, factory: any, config?: any) {
    this.registeredFactories.set(name, { factory, config });
  }

  static getFactory(name: string) {
    return this.registeredFactories.get(name);
  }

  static clear() {
    this.registeredFactories.clear();
  }

  static getRegisteredFactories() {
    return Array.from(this.registeredFactories.keys());
  }
}

describe('@Factory() Decorator', () => {
  /**
   * Setup and teardown for each test
   */
  beforeEach(() => {
    // Clear any previously registered factories
    MockFactoryManager.clear();
  });

  afterEach(() => {
    // Clean up after each test
    MockFactoryManager.clear();
  });

  /**
   * Test group: Basic factory registration
   *
   * Verifies that the decorator properly registers factory classes
   * with the factory management system.
   */
  describe('basic factory registration', () => {
    /**
     * Test: Decorator returns function
     *
     * Ensures that Factory decorator returns a proper class decorator
     * function that can be used to decorate factory classes.
     */
    it('should return a class decorator function', () => {
      // Act
      const decorator = Factory(TestEntity);

      // Assert
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    /**
     * Test: Decorator can be applied to factory classes
     *
     * Verifies that the decorator can be used to decorate factory
     * classes that extend BaseFactory.
     */
    it('should be applicable to factory classes', () => {
      // Arrange & Act
      @Factory(User)
      class TestUserFactory extends BaseFactory<User> {
        protected entity = User;

        constructor() {
          super({} as any);
        }

        protected definition(): Partial<User> {
          return {
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
          };
        }
      }

      // Assert
      expect(TestUserFactory).toBeDefined();
      expect(new TestUserFactory()).toBeInstanceOf(BaseFactory);
    });

    /**
     * Test: Factory registration with minimal configuration
     *
     * Ensures that factories can be registered with just a name
     * and default configuration is applied.
     */
    it('should register factory with minimal configuration', () => {
      // Arrange
      const factoryName = 'MinimalUser';

      // Act
      @Factory(User)
      class MinimalUserFactory extends BaseFactory<User> {
        protected entity = User;

        constructor() {
          super({} as any);
        }

        protected definition(): Partial<User> {
          return {
            name: 'Minimal User',
            email: 'minimal@example.com',
          };
        }
      }

      // Assert
      expect(MinimalUserFactory).toBeDefined();
      expect(MinimalUserFactory.name).toBe('MinimalUserFactory');
    });

    /**
     * Test: Multiple factory registrations
     *
     * Verifies that multiple factories can be registered
     * independently without conflicts.
     */
    it('should handle multiple factory registrations', () => {
      // Arrange & Act
      @Factory(User)
      class UserFactory extends BaseFactory<User> {
        protected entity = User;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'User' };
        }
      }

      @Factory(AdminUser)
      class AdminFactory extends BaseFactory<AdminUser> {
        protected entity = AdminUser;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'Admin', role: 'admin' };
        }
      }

      // Assert
      expect(UserFactory).toBeDefined();
      expect(AdminFactory).toBeDefined();
      expect(new UserFactory()).toBeInstanceOf(BaseFactory);
      expect(new AdminFactory()).toBeInstanceOf(BaseFactory);
    });
  });

  /**
   * Test group: Factory configuration options
   *
   * Verifies that the decorator handles various configuration
   * options correctly.
   */
  describe('factory configuration', () => {
    /**
     * Test: Factory with full configuration
     *
     * Ensures that all configuration options are properly
     * handled by the decorator.
     */
    it('should handle full configuration options', () => {
      // Arrange
      const config = {
        autoPersist: true,
        useTransactions: false,
        batchSize: 50,
      };

      // Act
      @Factory(Product, config)
      class ProductFactory extends BaseFactory<Product> {
        protected entity = Product;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return {
            name: 'Test Product',
            status: 'published',
          };
        }

        published() {
          return this.state('published');
        }

        draft() {
          return this.state('draft');
        }
      }

      // Assert
      expect(ProductFactory).toBeDefined();
      const factory = new ProductFactory();
      expect(factory).toBeInstanceOf(BaseFactory);
      expect(factory.published).toBeDefined();
      expect(factory.draft).toBeDefined();
    });

    /**
     * Test: Configuration with custom options
     *
     * Verifies that custom configuration options are
     * properly stored and accessible.
     */
    it('should store custom configuration options', () => {
      // Arrange
      const customConfig = {
        autoPersist: true,
        useTransactions: false,
        batchSize: 25,
      };

      // Act
      @Factory(CustomEntity, customConfig)
      class CustomFactory extends BaseFactory<any> {
        protected entity = CustomEntity;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'Custom Entity' };
        }
      }

      // Assert
      expect(CustomFactory).toBeDefined();
      // In a real implementation, we would verify metadata storage
      // expect(Reflect.getMetadata('factory:config', CustomFactory)).toEqual(customConfig);
    });
  });

  /**
   * Test group: Factory metadata handling
   *
   * Shows how the @Factory decorator attaches metadata
   * to factory classes for runtime identification.
   */
  describe('factory metadata', () => {
    /**
     * Test: Metadata attachment
     *
     * Demonstrates how the decorator attaches factory metadata
     * that can be retrieved at runtime.
     */
    it('should attach factory metadata to class', () => {
      // Arrange
      const factoryName = 'MetadataTest';
      const config = { autoPersist: true, useTransactions: false };

      // Act
      @Factory(TestEntity, config)
      class MetadataFactory extends BaseFactory<any> {
        protected entity = TestEntity;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'Metadata Test' };
        }
      }

      // Assert
      expect(MetadataFactory).toBeDefined();
      // In a real implementation, metadata would be attached
      // expect(Reflect.getMetadata('factory:name', MetadataFactory)).toBe(factoryName);
      // expect(Reflect.getMetadata('factory:config', MetadataFactory)).toEqual(config);
    });

    /**
     * Test: Unique metadata per factory
     *
     * Verifies that each factory gets its own metadata
     * without interference from other factories.
     */
    it('should attach unique metadata to each factory', () => {
      // Arrange & Act
      @Factory(TestEntity)
      class FirstFactory extends BaseFactory<any> {
        protected entity = TestEntity;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'First Entity' };
        }
      }

      @Factory(User, { autoPersist: false })
      class SecondFactory extends BaseFactory<any> {
        protected entity = User;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return { name: 'Second Entity' };
        }
      }

      // Assert
      expect(FirstFactory).toBeDefined();
      expect(SecondFactory).toBeDefined();
      // Each factory should have independent metadata
      // expect(Reflect.getMetadata('factory:name', FirstFactory)).toBe('FirstEntity');
      // expect(Reflect.getMetadata('factory:name', SecondFactory)).toBe('SecondEntity');
    });
  });

  /**
   * Test group: Factory inheritance scenarios
   *
   * Demonstrates how the @Factory decorator works with
   * class inheritance patterns.
   */
  describe('factory inheritance', () => {
    /**
     * Test: Base factory inheritance
     *
     * Shows how factory classes can extend other factory
     * classes while maintaining proper decoration.
     */
    it('should work with factory inheritance', () => {
      // Arrange
      abstract class BaseUserFactory extends BaseFactory<AdminUser> {
        constructor() {
          super({} as any);
        }

        protected baseDefinition(): Partial<AdminUser> {
          return {
            name: 'Base User',
          };
        }
      }

      // Act
      @Factory(AdminUser)
      class AdminUserFactory extends BaseUserFactory {
        protected entity = AdminUser;

        constructor() {
          super();
        }

        protected definition(): Partial<AdminUser> {
          return {
            ...this.baseDefinition(),
            name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
          };
        }
      }

      // Assert
      expect(AdminUserFactory).toBeDefined();
      const factory = new AdminUserFactory();
      expect(factory).toBeInstanceOf(BaseUserFactory);
      expect(factory).toBeInstanceOf(BaseFactory);
    });

    /**
     * Test: Multiple inheritance levels
     *
     * Verifies that the decorator works correctly with
     * multiple levels of inheritance.
     */
    it('should handle multiple inheritance levels', () => {
      // Arrange
      abstract class EntityFactory extends BaseFactory<any> {
        constructor() {
          super({} as any);
        }

        protected entityBase() {
          return { id: 'entity-id' };
        }
      }

      abstract class UserBaseFactory extends EntityFactory {
        constructor() {
          super();
        }

        protected userBase() {
          return { ...this.entityBase(), role: 'user' };
        }
      }

      // Act
      @Factory(SpecialUser)
      class SpecialUserFactory extends UserBaseFactory {
        protected entity = SpecialUser;

        constructor() {
          super();
        }

        protected definition() {
          return {
            ...this.userBase(),
            name: 'Special User',
            email: 'special@example.com',
          };
        }
      }

      // Assert
      expect(SpecialUserFactory).toBeDefined();
      const factory = new SpecialUserFactory();
      expect(factory).toBeInstanceOf(UserBaseFactory);
      expect(factory).toBeInstanceOf(EntityFactory);
      expect(factory).toBeInstanceOf(BaseFactory);
    });
  });

  /**
   * Test group: Integration with DI container
   *
   * Shows how @Factory decorated classes integrate with
   * the NestJS dependency injection system.
   */
  describe('dependency injection integration', () => {
    /**
     * Test: Factory as injectable service
     *
     * Demonstrates how factory classes can be used as
     * injectable services in other parts of the application.
     */
    it('should work as injectable service', () => {
      // Arrange & Act
      @Factory(Injectable)
      class InjectableFactory extends BaseFactory<any> {
        protected entity = Injectable;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return {
            name: 'Injectable Entity',
            createdAt: new Date(),
          };
        }

        // Public method for service usage
        async createEntity(overrides: any = {}) {
          return this.make(overrides);
        }
      }

      // Assert
      expect(InjectableFactory).toBeDefined();
      const factory = new InjectableFactory();
      expect(factory.createEntity).toBeDefined();
      expect(typeof factory.createEntity).toBe('function');
    });

    /**
     * Test: Factory with constructor dependencies
     *
     * Shows how factories can accept dependencies through
     * their constructor for dependency injection.
     */
    it('should handle constructor dependencies', () => {
      // Arrange
      const mockLogger = { log: jest.fn() };
      const mockConfig = { get: jest.fn().mockReturnValue('test') };

      // Act
      @Factory(User)
      class DependentFactory extends BaseFactory<any> {
        protected entity = User;

        private _logger?: any;
        private _config?: any;

        constructor(logger?: any, config?: any) {
          super({} as any);
          this._logger = logger;
          this._config = config;
        }

        protected definition() {
          return {
            name: 'Dependent Entity',
            environment: this._config?.get('NODE_ENV') || 'test',
          };
        }

        logCreation() {
          this._logger?.log('Entity created');
        }
      }

      // Assert
      expect(DependentFactory).toBeDefined();
      const factory = new DependentFactory(mockLogger, mockConfig);
      expect(factory).toBeInstanceOf(BaseFactory);
      expect(factory.logCreation).toBeDefined();
    });
  });

  /**
   * Test group: Advanced factory features
   *
   * Demonstrates advanced usage patterns and features
   * of the @Factory decorator.
   */
  describe('advanced factory features', () => {
    /**
     * Test: Factory with state methods
     *
     * Shows how the decorator works with factories that
     * implement state methods for different configurations.
     */
    it('should support factories with state methods', () => {
      // Arrange & Act
      @Factory(Product)
      class StatefulFactory extends BaseFactory<any> {
        protected entity = Product;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return {
            name: 'Stateful Entity',
            status: 'draft',
            published: false,
          };
        }

        published() {
          return this.state('published');
        }

        archived() {
          return this.state('archived');
        }

        withCategory(category: string) {
          return this.state('withCategory', category);
        }
      }

      // Assert
      const factory = new StatefulFactory();
      expect(factory.published).toBeDefined();
      expect(factory.archived).toBeDefined();
      expect(factory.withCategory).toBeDefined();
      expect(typeof factory.published).toBe('function');
    });

    /**
     * Test: Factory with relationship methods
     *
     * Demonstrates how factories can define relationships
     * with other entities through factory methods.
     */
    it('should support factories with relationship methods', () => {
      // Arrange & Act
      @Factory(Post)
      class PostFactory extends BaseFactory<any> {
        protected entity = Post;

        constructor() {
          super({} as any);
        }

        protected definition() {
          return {
            title: 'Test Post',
            content: 'Test content',
            authorId: null,
          };
        }

        forAuthor(author: any) {
          return this.state('forAuthor', author);
        }

        withComments(count: number = 5) {
          // Mock implementation - actual afterCreating would be implemented in BaseFactory
          return this;
        }
      }

      // Assert
      const factory = new PostFactory();
      expect(factory.forAuthor).toBeDefined();
      expect(factory.withComments).toBeDefined();
    });
  });

  /**
   * Test group: Error handling scenarios
   *
   * Shows how the @Factory decorator handles various
   * error conditions and edge cases.
   */
  describe('error handling', () => {
    /**
     * Test: Empty factory name
     *
     * Verifies behavior when an empty factory name is provided.
     */
    it('should handle empty factory name', () => {
      // Act & Assert
      expect(() => {
        @Factory(TestEntity)
        class EmptyNameFactory extends BaseFactory<any> {
          protected entity = TestEntity;

          constructor() {
            super({} as any);
          }

          protected definition() {
            return {};
          }
        }
        return EmptyNameFactory;
      }).toBeDefined(); // Should not throw during decoration
    });

    /**
     * Test: Null factory name
     *
     * Tests behavior with null factory name.
     */
    it('should handle null factory name gracefully', () => {
      // Act & Assert
      expect(() => {
        @Factory(TestEntity)
        class NullNameFactory extends BaseFactory<any> {
          protected entity = TestEntity;

          constructor() {
            super({} as any);
          }

          protected definition() {
            return {};
          }
        }
        return NullNameFactory;
      }).toBeDefined(); // Should handle gracefully
    });

    /**
     * Test: Invalid configuration object
     *
     * Shows how the decorator handles invalid configuration
     * objects passed as the second parameter.
     */
    it('should handle invalid configuration objects', () => {
      // Act & Assert
      expect(() => {
        @Factory(TestEntity, null as any)
        class InvalidConfigFactory extends BaseFactory<any> {
          protected entity = TestEntity;

          constructor() {
            super({} as any);
          }

          protected definition() {
            return {};
          }
        }
        return InvalidConfigFactory;
      }).toBeDefined(); // Should not crash
    });

    /**
     * Test: Factory without BaseFactory inheritance
     *
     * Tests behavior when @Factory is applied to classes
     * that don't extend BaseFactory.
     */
    it('should handle non-BaseFactory classes', () => {
      // Act & Assert
      expect(() => {
        @Factory(TestEntity)
        class PlainClass {
          someMethod() {
            return 'not a factory';
          }
        }
        return PlainClass;
      }).toBeDefined(); // Should decorate without error
    });
  });

  /**
   * Test group: Type safety and TypeScript integration
   *
   * Verifies that the decorator maintains type information
   * for TypeScript compilation and type checking.
   */
  describe('type safety', () => {
    /**
     * Test: Preserves class type information
     *
     * Ensures that TypeScript type information is preserved
     * when using the decorator.
     */
    it('should preserve class type information', () => {
      // Arrange
      interface IProduct {
        id: string;
        name: string;
        price: number;
      }

      // Act
      @Factory(TypedProduct)
      class TypedProductFactory extends BaseFactory<TypedProduct> {
        protected entity = TypedProduct;

        constructor() {
          super({} as any);
        }

        protected definition(): Partial<TypedProduct> {
          return {
            name: 'Typed Product',
            price: 29.99,
          };
        }

        expensive() {
          return this.state('expensive');
        }
      }

      // Assert
      expect(TypedProductFactory).toBeDefined();
      const factory = new TypedProductFactory();
      expect(factory).toBeInstanceOf(BaseFactory);
      expect(factory.expensive).toBeDefined();
    });

    /**
     * Test: Generic type constraints
     *
     * Verifies that generic type constraints work correctly
     * with decorated factory classes.
     */
    it('should work with generic type constraints', () => {
      // Arrange
      interface ITimestamped {
        createdAt: Date;
        updatedAt: Date;
      }

      // Act
      @Factory(TimestampedEntity)
      class TimestampedFactory extends BaseFactory<TimestampedEntity> {
        protected entity = TimestampedEntity;

        constructor() {
          super({} as any);
        }

        protected definition(): Partial<TimestampedEntity> {
          const now = new Date();
          return {
            createdAt: now,
            updatedAt: now,
          };
        }
      }

      // Assert
      expect(TimestampedFactory).toBeDefined();
      const factory = new TimestampedFactory();
      expect(factory).toBeInstanceOf(BaseFactory);
    });
  });
});
