/**
 * Nesvel NestJS ORM Package
 *
 * A comprehensive Laravel Eloquent-inspired ORM package for NestJS applications.
 * Built on top of MikroORM with additional features including pagination,
 * PubSub integration, comprehensive exception handling, and fluent migration API.
 *
 * Features:
 * - Laravel Eloquent-inspired API patterns
 * - Comprehensive pagination with nestjs-paginate
 * - PubSub integration for entity lifecycle events
 * - Detailed exception handling and logging
 * - Fluent migration API using Knex.js
 * - Full TypeScript support with proper typing
 *
 * @author Nesvel
 * @since 1.0.0
 */

// Core Entities and Base Classes
export * from './entities';

// Repository Pattern
export * from './repositories';

// Service Layer
export * from './services';

// Interface Definitions
export * from './interfaces';

// Enums
export * from './enums';

// Exception Handling
export * from './exceptions';

// Type Definitions
export * from './types';

// Event Subscribers
export * from './subscribers';

// Migration System
export * from './migrations';

// Entity Mixins (Traits)
export * from './mixins';

// Factory System for Test Data Generation
export * from './factories';

// Seeder System for Database Seeding
export * from './seeders';

// Console Commands (Laravel-style make commands)
export * from './console';

// Re-export MikroORM core types and classes
export type {
  FilterQuery,
  Loaded,
  QueryOrderMap,
  FindOptions,
  CountOptions,
  DeleteOptions,
  UpdateOptions,
  EntityData,
  EntityDTO,
  Populate,
  ConnectionType,
  IDatabaseDriver,
  Configuration,
  EventSubscriber,
} from '@mikro-orm/core';

export {
  EntityManager,
  EntityRepository,
  wrap,
  Reference,
  Collection,
  QueryOrder,
  UnderscoreNamingStrategy,
  LoadStrategy,
} from '@mikro-orm/core';

// Re-export MikroORM decorators
export {
  Entity,
  Property,
  PrimaryKey,
  ManyToOne,
  OneToMany,
  OneToOne,
  ManyToMany,
  Embedded,
  Enum,
  Formula,
  Index,
  Unique,
  Check,
  BeforeCreate,
  AfterCreate,
  BeforeUpdate,
  AfterUpdate,
  BeforeDelete,
  AfterDelete,
  OnInit,
  OnLoad,
  Cascade,
} from '@mikro-orm/core';

// Re-export NestJS integration
export {
  MikroOrmModule as OrmModule,
  InjectRepository,
  type MikroOrmModuleOptions,
  type MikroOrmModuleOptions as OrmModuleOptions,
} from '@mikro-orm/nestjs';

// Re-export pagination utilities from nestjs-paginate (excluding paginate function)
export {
  // Core types and classes
  Paginated,
  PaginationType,
  PaginationLimit,
  type PaginateConfig,
  type PaginateQuery,

  // Decorators
  Paginate,
  ApiOkPaginatedResponse,
  ApiPaginationQuery,
  PaginatedSwaggerDocs,

  // Global config
  updateGlobalConfig,
  type NestjsPaginateGlobalConfig,

  // Filter operators
  FilterOperator,
  FilterSuffix,
} from 'nestjs-paginate';

// Utility functions and helpers
export * from './utils';
