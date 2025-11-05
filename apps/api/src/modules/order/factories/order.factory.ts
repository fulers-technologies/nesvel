import { EntityData } from '@mikro-orm/core';
import { BaseFactory } from '@nesvel/nestjs-orm';

import { Order, OrderStatus, PaymentMethod } from '@order/entities/order.entity';

/**
 * OrderFactory
 *
 * Factory for generating realistic Order test data with all fields populated.
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
 *   orderNumber: 'ORD-12345',
 *   total: '999.99',
 * });
 *
 * // Apply logic to each entity
 * const orders = await factory.each((order) => {
 *   order.isPaid = true;
 *   order.isShipped = true;
 * }).create(5);
 *
 * // Create paid orders
 * const paidOrders = await factory.create(10, {
 *   isPaid: true,
 *   paidAt: new Date(),
 * });
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
    const subtotal = this.faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return {
      // String fields
      orderNumber: `ORD-${this.faker.string.alphanumeric(8).toUpperCase()}`,
      customerEmail: this.faker.internet.email(),
      notes: this.faker.helpers.maybe(() => this.faker.lorem.sentence(), { probability: 0.3 }),
      longDescription: this.faker.helpers.maybe(() => this.faker.lorem.paragraphs(3), {
        probability: 0.2,
      }),
      statusCode: this.faker.helpers.arrayElement(['PEN', 'PRO', 'SHP', 'DEL', 'CAN']),

      // Numeric fields
      quantity: this.faker.number.int({ min: 1, max: 10 }),
      trackingNumber: this.faker.helpers.maybe(() => this.faker.string.numeric(12), {
        probability: 0.5,
      }),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      discountPercentage: this.faker.helpers.maybe(
        () => this.faker.number.float({ min: 5, max: 30, fractionDigits: 2 }),
        { probability: 0.3 }
      ),
      priority: this.faker.number.int({ min: 0, max: 5 }),

      // Boolean fields
      isPaid: this.faker.datatype.boolean(),
      isShipped: this.faker.datatype.boolean(),
      isGift: this.faker.helpers.maybe(() => true, { probability: 0.2 }) ?? false,

      // Date & time fields
      orderDate: this.faker.date.recent({ days: 30 }),
      shippedAt: this.faker.helpers.maybe(() => this.faker.date.recent({ days: 10 })),
      paidAt: this.faker.helpers.maybe(() => this.faker.date.recent({ days: 20 })),
      cancelledAt: this.faker.helpers.maybe(() => this.faker.date.recent({ days: 15 }), {
        probability: 0.1,
      }),

      // Binary fields
      signatureData: this.faker.helpers.maybe(
        () => Buffer.from(this.faker.string.alphanumeric(100)),
        { probability: 0.2 }
      ),

      // JSON fields
      shippingAddress: {
        street: this.faker.location.streetAddress(),
        city: this.faker.location.city(),
        state: this.faker.location.state(),
        zipCode: this.faker.location.zipCode(),
        country: this.faker.location.country(),
      },
      billingAddress: this.faker.helpers.maybe(
        () => ({
          street: this.faker.location.streetAddress(),
          city: this.faker.location.city(),
          state: this.faker.location.state(),
          zipCode: this.faker.location.zipCode(),
          country: this.faker.location.country(),
        }),
        { probability: 0.8 }
      ),
      metadata: {
        source: this.faker.helpers.arrayElement(['web', 'mobile', 'api']),
        campaign: this.faker.helpers.maybe(() => this.faker.lorem.word()),
        notes: this.faker.helpers.maybe(() => this.faker.lorem.sentence()),
      },

      // UUID fields
      externalId: this.faker.string.uuid(),

      // Enum fields
      status: this.faker.helpers.arrayElement(Object.values(OrderStatus)),
      paymentMethod: this.faker.helpers.maybe(
        () => this.faker.helpers.arrayElement(Object.values(PaymentMethod)),
        { probability: 0.8 }
      ),

      // Foreign key fields
      userId: this.faker.helpers.maybe(
        () => this.faker.number.bigInt({ min: 1n, max: 1000n }).toString(),
        { probability: 0.9 }
      ),
      shippingMethodId: this.faker.helpers.maybe(
        () => this.faker.number.bigInt({ min: 1n, max: 10n }).toString(),
        { probability: 0.7 }
      ),

      // Network fields
      customerIp: this.faker.internet.ipv4(),

      // Polymorphic relation fields
      trackableType: this.faker.helpers.maybe(
        () => this.faker.helpers.arrayElement(['Shipment', 'Package', 'Delivery']),
        { probability: 0.5 }
      ),
      trackableId: this.faker.helpers.maybe(
        () => this.faker.number.bigInt({ min: 1n, max: 500n }).toString(),
        { probability: 0.5 }
      ),

      // Special fields
      rememberToken: this.faker.helpers.maybe(() => this.faker.string.alphanumeric(60), {
        probability: 0.3,
      }),
    };
  }
}
