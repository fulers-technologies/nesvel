import { EntityManager } from '@mikro-orm/core';
import { BaseSeeder } from '@nesvel/nestjs-orm';

import { OrderFactory } from '@order/factories/order.factory';

/**
 * OrderSeeder
 *
 * Seeds Order data into the database.
 *
 * @see https://mikro-orm.io/docs/seeding#seeders
 *
 * @example
 * ```bash
 * # Run this specific seeder
 * bun mikro-orm seeder:run --class=OrderSeeder
 *
 * # Run all seeders
 * bun mikro-orm seeder:run
 * ```
 */
export class OrderSeeder extends BaseSeeder {
  /**
   * Run the database seeder
   *
   * @param em - MikroORM EntityManager for database operations
   * @returns Promise that resolves when seeding is complete
   */
  async run(em: EntityManager): Promise<void> {
    const orderFactory = OrderFactory.make(em);
    const orders = orderFactory.make(50);

    await em.persist(orders).flush();
  }
}
