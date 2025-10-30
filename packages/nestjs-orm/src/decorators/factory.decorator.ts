import { Injectable, SetMetadata } from '@nestjs/common';
import { BaseEntity } from '@/entities/base.entity';
import type { IFactoryConfig } from '@/interfaces';
import { FactoryMetadata } from '@/interfaces/factory-metadata.interface';

/**
 * Factory Metadata Key
 *
 * Used to store factory metadata in the class metadata system.
 */
export const FACTORY_METADATA_KEY = 'factory:metadata';

/**
 * Factory Class Decorator
 *
 * Registers a factory class in the NestJS dependency injection system
 * and stores metadata about the entity it creates and its configuration.
 *
 * This decorator automatically applies `@Injectable()` and stores factory
 * metadata for use by the factory manager and other services.
 *
 * @param entity - The entity class this factory creates
 * @param config - Optional factory configuration
 * @param name - Optional factory name for identification
 * @returns Class decorator function
 *
 * @example
 * ```typescript
 * import { Factory } from '@nesvel/nestjs-orm';
 * import { User } from '@/entities/user.entity';
 *
 * @Factory(User, {
 *   autoPersist: true,
 *   useTransactions: false,
 *   batchSize: 50
 * })
 * export class UserFactory extends BaseFactory<User> {
 *   protected entity = User;
 *
 *   protected definition(): Partial<User> {
 *     return {
 *       name: faker.person.fullName(),
 *       email: faker.internet.email(),
 *       password: faker.internet.password(),
 *       isActive: true,
 *     };
 *   }
 *
 *   protected states(): Record<string, IFactoryState<User>> {
 *     return {
 *       admin: {
 *         name: 'admin',
 *         apply: (attributes) => ({
 *           ...attributes,
 *           role: 'admin',
 *           permissions: ['*']
 *         })
 *       }
 *     };
 *   }
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function Factory<T extends BaseEntity>(
  entity: new () => T,
  config?: IFactoryConfig,
  name?: string,
): ClassDecorator {
  return (target: any) => {
    // Apply Injectable decorator for NestJS DI
    Injectable()(target);

    // Store factory metadata
    const metadata: FactoryMetadata = {
      entity,
      ...(config && { config }),
      name: name || target.name,
    };

    SetMetadata(FACTORY_METADATA_KEY, metadata)(target);

    return target;
  };
}

/**
 * Get Factory Metadata
 *
 * Utility function to retrieve factory metadata from a factory class.
 * Used internally by the factory manager and other services.
 *
 * @param factoryClass - The factory class to get metadata from
 * @returns Factory metadata or undefined if not found
 *
 * @example
 * ```typescript
 * const metadata = getFactoryMetadata(UserFactory);
 * console.log(metadata.entity); // User
 * console.log(metadata.name);   // 'UserFactory'
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function getFactoryMetadata(factoryClass: any): FactoryMetadata | undefined {
  return Reflect.getMetadata(FACTORY_METADATA_KEY, factoryClass);
}

/**
 * Has Factory Metadata
 *
 * Check if a class has factory metadata (i.e., is decorated with @Factory).
 *
 * @param factoryClass - The class to check
 * @returns True if the class has factory metadata
 *
 * @example
 * ```typescript
 * if (hasFactoryMetadata(UserFactory)) {
 *   console.log('UserFactory is a valid factory class');
 * }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function hasFactoryMetadata(factoryClass: any): boolean {
  return Reflect.hasMetadata(FACTORY_METADATA_KEY, factoryClass);
}

/**
 * Factory Token Generator
 *
 * Generates dependency injection tokens for factory classes.
 * Used by the factory manager to register factories in the NestJS container.
 *
 * @param entityClass - The entity class
 * @returns DI token string
 *
 * @example
 * ```typescript
 * const token = generateFactoryToken(User);
 * console.log(token); // 'FACTORY_User'
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function generateFactoryToken(entityClass: new () => BaseEntity): string {
  return `FACTORY_${entityClass.name}`;
}

/**
 * Factory Provider Generator
 *
 * Generates NestJS provider configuration for factory classes.
 * Used by the factory module to automatically register factories.
 *
 * @param factoryClass - The factory class
 * @returns NestJS provider configuration
 *
 * @example
 * ```typescript
 * const provider = generateFactoryProvider(UserFactory);
 * // Returns:
 * // {
 * //   provide: 'FACTORY_User',
 * //   useClass: UserFactory
 * // }
 * ```
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export function generateFactoryProvider(factoryClass: any): {
  provide: string;
  useClass: any;
} {
  const metadata = getFactoryMetadata(factoryClass);

  if (!metadata) {
    throw new Error(
      `Class ${factoryClass.name} is not decorated with @Factory. ` +
        'Please add @Factory(EntityClass) decorator to your factory class.',
    );
  }

  const token = generateFactoryToken(metadata.entity);

  return {
    provide: token,
    useClass: factoryClass,
  };
}
