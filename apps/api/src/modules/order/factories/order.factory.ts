import { EntityData } from '@mikro-orm/core';
import { BaseFactory } from '@nesvel/nestjs-orm';

import { Order } from '@order/entities/order.entity';

/**
 * OrderFactory
 *
 * Factory for generating Order test data.
 *
 * @see https://mikro-orm.io/docs/seeding#using-entity-factories
 *
 * @example
 * ```typescript
 * // In a seeder
 * const factory = new OrderFactory(em);
 *
 * // Make entities without persisting
 * const order = factory.makeOne();
 * const orders = factory.make(10);
 *
 * // Create and persist entities
 * const persistedOrder = await factory.createOne();
 * const persistedOrders = await factory.create(10);
 *
 * // Override attributes
 * const customOrder = factory.makeOne({
 *   name: 'Custom Name',
 * });
 *
 * // Apply logic to each entity
 * const orders = await factory.each((order) => {
 *   order.verified = true;
 * }).create(5);
 * ```
 */
export class OrderFactory extends BaseFactory<Order> {
  /**
   * The entity class this factory creates
   */
  public readonly model = Order;

  /**
   * Define the default attributes for the entity
   *
   * This method returns the default data used to create entity instances.
   * Use this.faker to generate realistic test data.
   *
   * @returns Entity data with default values
   */
  protected definition(): EntityData<Order> {
    return {
      name: this.faker.person.fullName(),
    };
  }
}
