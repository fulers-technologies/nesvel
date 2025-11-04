import { Factory } from '@mikro-orm/seeder';
import type { EntityManager } from '@mikro-orm/core';
import { faker, type Faker } from '@faker-js/faker';

import { BaseEntity } from '@/entities/base.entity';

/**
 * Abstract Base Factory
 *
 * Base class for entity factories extending MikroORM's Factory.
 * Factories are used to generate test data for entities.
 *
 * @template T - The entity type this factory creates
 *
 * @see https://mikro-orm.io/docs/seeding#using-entity-factories
 *
 * @example
 * ```typescript
 * import { BaseFactory } from '@nesvel/nestjs-orm';
 * import { User } from './entities/user.entity';
 *
 * export class UserFactory extends BaseFactory<User> {
 *   model = User;
 *
 *   protected definition(): EntityData<User> {
 *     return {
 *       name: this.faker.person.fullName(),
 *       email: this.faker.internet.email(),
 *       password: 'password',
 *     };
 *   }
 * }
 *
 * // Usage in seeders
 * const userFactory = new UserFactory(em);
 * // Or using static method:
 * const userFactory = UserFactory.make(em);
 *
 * // Make entities without persisting
 * const user = userFactory.makeOne();
 * const users = userFactory.make(10);
 *
 * // Create and persist entities
 * const persistedUser = await userFactory.createOne();
 * const persistedUsers = await userFactory.create(10);
 *
 * // Override attributes
 * const admin = userFactory.makeOne({ role: 'admin' });
 *
 * // Apply custom logic to each entity
 * const users = await userFactory.each((user) => {
 *   user.emailVerified = true;
 * }).create(5);
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseFactory<T extends BaseEntity = BaseEntity> extends Factory<T> {
  /**
   * Faker.js instance for generating fake data
   *
   * Provides access to all Faker.js methods for generating realistic
   * test data in factory definitions and state transformations.
   *
   * @protected
   * @readonly
   *
   * @example
   * ```typescript
   * protected definition(): Partial<User> {
   *   return {
   *     name: this.faker.person.fullName(),
   *     email: this.faker.internet.email(),
   *     password: this.faker.internet.password(),
   *   };
   * }
   * ```
   */
  protected readonly faker: Faker = faker;

  /**
   * Static factory method to create a factory instance
   *
   * Provides a convenient way to instantiate factories without using `new`.
   *
   * @param em - MikroORM EntityManager instance
   * @returns New factory instance
   *
   * @example
   * ```typescript
   * // Instead of: const factory = new UserFactory(em);
   * const factory = UserFactory.make(em);
   *
   * // Usage:
   * const user = factory.makeOne();
   * const users = await factory.create(10);
   * ```
   */
  static make<T extends BaseEntity>(
    this: new (em: EntityManager) => BaseFactory<T>,
    em: EntityManager,
  ): BaseFactory<T> {
    return new this(em);
  }
}
