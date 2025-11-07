/**
 * Barrel export for all interfaces.
 *
 * This module re-exports all interface types used throughout the ORM package,
 * providing a single import point for consumers.
 *
 * @module interfaces
 */

export type { IRollbackable } from './rollbackable.interface';
export type { IService } from './service.interface';
export * from './database-operation-context.interface';

// Export mixin interfaces
export type { IHasUserstamps } from './has-user-stamps.interface';
export type { IHasSoftDeletes } from './has-soft-deletes.interface';
export type { IHasTimestamps } from './has-timestamps.interface';
export type { IHasUuid } from './has-uuid.interface';
export type { IHasSearchable } from './has-searchable.interface';
export type { SearchableConfig } from './searchable-config.interface';

// Export subscriber interfaces
export type { EntityEventPayload } from './entity-event-payload.interface';
export type { SubscriberOptions } from './subscriber-options.interface';

// Export decorator interfaces
export * from './entity-event-payload.interface';
export * from './has-soft-deletes.interface';
export * from './has-timestamps.interface';
export * from './has-user-stamps.interface';
export * from './has-uuid.interface';
export * from './has-searchable.interface';
export * from './searchable-config.interface';
export * from './rollbackable.interface';
export * from './service.interface';
export * from './subscriber-options.interface';

// Export pagination interfaces
export * from './pagination';

import type { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

/**
 * Database Configuration
 *
 * Alias for MikroOrmModuleOptions (OrmModuleOptions) to provide a more intuitive name
 * when used in application configuration contexts.
 *
 * @example
 * ```typescript
 * const config: DatabaseConfig = {
 *   entities: ['./dist/**//*.entity.js'],
 *   dbName: 'mydb',
 *   type: 'postgresql',
 * };
 * ```
 */
export interface DatabaseConfig extends MikroOrmModuleOptions {}
