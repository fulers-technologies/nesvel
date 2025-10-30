import { Injectable, SetMetadata } from '@nestjs/common';
import type { ISeederConfig } from '@/interfaces';
import { SeederMetadata } from '@/interfaces/seeder-metadata.interface';

/**
 * Seeder Metadata Key
 *
 * Used to store seeder metadata in the class metadata system.
 */
export const SEEDER_METADATA_KEY = 'seeder:metadata';

/**
 * Seeder Class Decorator
 *
 * Registers a seeder class in the NestJS dependency injection system
 * and stores metadata about its configuration and execution requirements.
 *
 * This decorator automatically applies `@Injectable()` and stores seeder
 * metadata for use by the seeder manager and other services.
 *
 * @param config - Seeder configuration options
 * @returns Class decorator function
 *
 * @example
 * ```typescript
 * import { Seeder } from '@nesvel/nestjs-orm';
 * import { BaseSeeder } from '@nesvel/nestjs-orm';
 *
 * @Seeder({
 *   priority: 1,
 *   environments: ['development', 'testing'],
 *   dependencies: [RoleSeeder],
 *   description: 'Creates initial user accounts',
 *   useTransactions: true
 * })
 * export class UserSeeder extends BaseSeeder {
 *   async run(): Promise<void> {
 *     this.info('Seeding users...');
 *
 *     // Check if users already exist
 *     const existingUsers = await this.entityManager.count(User);
 *     if (existingUsers > 0) {
 *       this.info('Users already exist, skipping seeding');
 *       return;
 *     }
 *
 *     // Create admin user
 *     const admin = await this.factoryManager
 *       .get(User)
 *       .state('admin')
 *       .create({ email: 'admin@example.com' });
 *
 *     // Create regular users
 *     const users = await this.factoryManager.createMany(User, 50);
 *
 *     this.success(`Created ${users.length + 1} users successfully`);
 *   }
 *
 *   async rollback(): Promise<void> {
 *     this.info('Rolling back users...');
 *     await this.entityManager.nativeDelete(User, {
 *       email: { $like: '%@example.com' }
 *     });
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function Seeder(config: ISeederConfig = {}): ClassDecorator {
  return (target: any) => {
    // Apply Injectable decorator for NestJS DI
    Injectable()(target);

    // Store seeder metadata
    const metadata: SeederMetadata = {
      name: target.name,
      ...config,
    };

    SetMetadata(SEEDER_METADATA_KEY, metadata)(target);

    return target;
  };
}

/**
 * Get Seeder Metadata
 *
 * Utility function to retrieve seeder metadata from a seeder class.
 * Used internally by the seeder manager and other services.
 *
 * @param seederClass - The seeder class to get metadata from
 * @returns Seeder metadata or undefined if not found
 *
 * @example
 * ```typescript
 * const metadata = getSeederMetadata(UserSeeder);
 * console.log(metadata.priority);     // 1
 * console.log(metadata.description);  // 'Creates initial user accounts'
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function getSeederMetadata(seederClass: any): SeederMetadata | undefined {
  return Reflect.getMetadata(SEEDER_METADATA_KEY, seederClass);
}

/**
 * Has Seeder Metadata
 *
 * Check if a class has seeder metadata (i.e., is decorated with @Seeder).
 *
 * @param seederClass - The class to check
 * @returns True if the class has seeder metadata
 *
 * @example
 * ```typescript
 * if (hasSeederMetadata(UserSeeder)) {
 *   console.log('UserSeeder is a valid seeder class');
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function hasSeederMetadata(seederClass: any): boolean {
  return Reflect.hasMetadata(SEEDER_METADATA_KEY, seederClass);
}

/**
 * Seeder Token Generator
 *
 * Generates dependency injection tokens for seeder classes.
 * Used by the seeder manager to register seeders in the NestJS container.
 *
 * @param seederClass - The seeder class
 * @returns DI token string
 *
 * @example
 * ```typescript
 * const token = generateSeederToken(UserSeeder);
 * console.log(token); // 'SEEDER_UserSeeder'
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function generateSeederToken(seederClass: any): string {
  return `SEEDER_${seederClass.name}`;
}

/**
 * Seeder Provider Generator
 *
 * Generates NestJS provider configuration for seeder classes.
 * Used by the seeder module to automatically register seeders.
 *
 * @param seederClass - The seeder class
 * @returns NestJS provider configuration
 *
 * @example
 * ```typescript
 * const provider = generateSeederProvider(UserSeeder);
 * // Returns:
 * // {
 * //   provide: 'SEEDER_UserSeeder',
 * //   useClass: UserSeeder
 * // }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function generateSeederProvider(seederClass: any): {
  provide: string;
  useClass: any;
} {
  if (!hasSeederMetadata(seederClass)) {
    throw new Error(
      `Class ${seederClass.name} is not decorated with @Seeder. ` +
        'Please add @Seeder() decorator to your seeder class.',
    );
  }

  const token = generateSeederToken(seederClass);

  return {
    provide: token,
    useClass: seederClass,
  };
}
