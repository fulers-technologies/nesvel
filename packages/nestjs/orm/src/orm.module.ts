import { DynamicModule, Module } from '@nestjs/common';
import { TerminusMikroOrmHealthIndicator } from '@nesvel/nestjs-health';
import { MikroOrmModule, type MikroOrmModuleOptions } from '@mikro-orm/nestjs';

import { DatabaseHealthIndicator } from './indicators';

/**
 * Configuration options for the ORM module.
 *
 * @interface IOrmModuleOptions
 * @since 1.0.0
 *
 * @property {boolean} [isGlobal] - Whether to register the module as global
 * @property {MikroOrmModuleOptions} [mikroOrm] - MikroORM configuration options
 *
 * @example
 * ```typescript
 * const options: IOrmModuleOptions = {
 *   isGlobal: true,
 *   mikroOrm: {
 *     entities: ['./dist/entities'],
 *     dbName: 'my-db',
 *     type: 'postgresql',
 *   },
 * };
 * ```
 */
export interface IOrmModuleOptions {
  /**
   * Whether to register the module as global.
   * If true, the ORM module will be available throughout the entire application
   * without needing to import it in each feature module.
   *
   * @default false
   */
  isGlobal?: boolean;

  /**
   * MikroORM configuration options.
   * These options are passed directly to MikroOrmModule.forRoot().
   * See MikroORM documentation for available options.
   */
  mikroOrm?: MikroOrmModuleOptions;
}

/**
 * Nesvel ORM Module
 *
 * A wrapper around MikroOrmModule that provides additional functionality including
 * automatic health indicator registration and simplified configuration.
 *
 * This module extends the standard MikroORM NestJS integration with Nesvel-specific
 * features while maintaining full compatibility with MikroORM's API.
 *
 * Features:
 * - Automatic health indicator registration for @nestjs/terminus
 * - Global module support for easier dependency management
 * - Simplified configuration interface
 * - Full MikroORM feature support
 *
 * @class OrmModule
 * @since 1.0.0
 *
 * @example Basic usage
 * ```typescript
 * @Module({
 *   imports: [
 *     OrmModule.forRoot({
 *       isGlobal: true,
 *       mikroOrm: {
 *         entities: ['./dist/entities'],
 *         dbName: 'my-db',
 *         type: 'postgresql',
 *         host: 'localhost',
 *         port: 5432,
 *       },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 *
 * @example Using health indicator in health controller
 * ```typescript
 * @Controller('health')
 * export class HealthController {
 *   constructor(
 *     private readonly health: HealthCheckService,
 *     private readonly db: MikroOrmHealthIndicator,
 *   ) {}
 *
 *   @Get()
 *   @HealthCheck()
 *   check() {
 *     return this.health.check([
 *       () => this.db.isHealthy('database'),
 *     ]);
 *   }
 * }
 * ```
 */
@Module({})
export class OrmModule {
  /**
   * Configures the ORM module with the given options.
   *
   * This method wraps MikroOrmModule.forRoot() and adds support for:
   * - Global module registration
   * - Automatic health indicator registration
   * - Simplified configuration
   *
   * The health indicator is automatically registered and can be used with
   * @nestjs/terminus for database health checks.
   *
   * @static
   * @param {IOrmModuleOptions} [options={}] - Configuration options for the ORM module
   * @returns {DynamicModule} A configured dynamic module
   *
   * @example Global module with health indicator
   * ```typescript
   * OrmModule.forRoot({
   *   isGlobal: true,
   *   mikroOrm: {
   *     entities: [User, Post, Comment],
   *     dbName: 'blog',
   *     type: 'postgresql',
   *     host: process.env.DB_HOST,
   *     port: parseInt(process.env.DB_PORT),
   *     user: process.env.DB_USER,
   *     password: process.env.DB_PASSWORD,
   *   },
   * });
   * ```
   *
   * @example With custom options
   * ```typescript
   * OrmModule.forRoot({
   *   isGlobal: true,
   *   mikroOrm: {
   *     entities: ['./dist/entities'],
   *     entitiesTs: ['./src/entities'],
   *     dbName: 'my-db',
   *     type: 'postgresql',
   *     debug: true,
   *     migrations: {
   *       path: './dist/migrations',
   *       pathTs: './src/migrations',
   *     },
   *   },
   * });
   * ```
   */
  static forRoot(options: IOrmModuleOptions = {}): DynamicModule {
    const { isGlobal = false, mikroOrm = {} } = options;

    return {
      module: OrmModule,
      global: isGlobal,
      imports: [MikroOrmModule.forRoot(mikroOrm)],
      providers: [TerminusMikroOrmHealthIndicator, DatabaseHealthIndicator],
      exports: [DatabaseHealthIndicator],
    };
  }

  /**
   * Configures the ORM module for specific entities.
   *
   * This method wraps MikroOrmModule.forFeature() to register entity repositories
   * for dependency injection in feature modules. Use this when you need to inject
   * repositories for specific entities in a module.
   *
   * Note: This method does not register the health indicator. If you need the health
   * indicator in a feature module, import the root OrmModule or inject it directly.
   *
   * @static
   * @param {any[]} entities - Array of entity classes to register
   * @returns {DynamicModule} A configured dynamic module with entity repositories
   *
   * @example Register repositories in feature module
   * ```typescript
   * @Module({
   *   imports: [
   *     OrmModule.forFeature([User, Post, Comment]),
   *   ],
   *   controllers: [UserController],
   *   providers: [UserService],
   * })
   * export class UserModule {}
   * ```
   *
   * @example Using registered repositories
   * ```typescript
   * @Injectable()
   * export class UserService {
   *   constructor(
   *     @InjectRepository(User)
   *     private readonly userRepository: EntityRepository<User>,
   *   ) {}
   *
   *   async findAll(): Promise<User[]> {
   *     return this.userRepository.findAll();
   *   }
   * }
   * ```
   */
  static forFeature(entities: any[]): DynamicModule {
    return MikroOrmModule.forFeature(entities);
  }

  /**
   * Registers entity repositories for dependency injection in feature modules.
   *
   * This is an alias for `forFeature()` that follows the Nesvel naming convention
   * of using `registerX()` methods (similar to `SearchModule.registerIndex()`).
   *
   * This method wraps MikroOrmModule.forFeature() to register entity repositories
   * for dependency injection. Use this when you need to inject repositories for
   * specific entities in a module.
   *
   * @static
   * @param {any[]} entities - Array of entity classes to register
   * @returns {DynamicModule} A configured dynamic module with entity repositories
   *
   * @example Register entities in feature module
   * ```typescript
   * @Module({
   *   imports: [
   *     OrmModule.registerEntity([User, Post, Comment]),
   *   ],
   *   controllers: [UserController],
   *   providers: [UserService],
   * })
   * export class UserModule {}
   * ```
   *
   * @example Using registered repositories
   * ```typescript
   * @Injectable()
   * export class UserService {
   *   constructor(
   *     @InjectRepository(User)
   *     private readonly userRepository: EntityRepository<User>,
   *   ) {}
   *
   *   async findAll(): Promise<User[]> {
   *     return this.userRepository.findAll();
   *   }
   * }
   * ```
   */
  static registerEntity(entities: any[]): DynamicModule {
    return MikroOrmModule.forFeature(entities);
  }
}
