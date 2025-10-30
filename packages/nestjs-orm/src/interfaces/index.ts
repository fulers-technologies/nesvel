/**
 * Barrel export for all interfaces.
 *
 * This module re-exports all interface types used throughout the ORM package,
 * providing a single import point for consumers.
 *
 * @module interfaces
 */

export type { IFactory } from './factory.interface';
export type { IFactoryConfig } from './factory-config.interface';
export type { IFactoryRelationship } from './factory-relationship.interface';
export type { IFactoryState } from './factory-state.interface';
export type { ISeeder } from './seeder.interface';
export type { ISeederConfig } from './seeder-config.interface';
export type { ISeederContext } from './seeder-context.interface';
export type { ISeederResult } from './seeder-result.interface';
export type { IMigrationContext } from './migration-context.interface';
export type { IMigrationResult } from './migration-result.interface';
export type { IRollbackable } from './rollbackable.interface';
export type { IRepository } from './repository.interface';
export type { IRepositoryQueryBuilder } from './repository-query-builder.interface';
export type { IService } from './service.interface';
export type { IColumnDefinition } from './column-definition.interface';
export type { IIndexDefinition } from './index-definition.interface';

// Export mixin interfaces
export type { IHasUserStamps } from '@/interfaces/has-user-stamps.interface';
export type { UserStampContext } from '@/interfaces/user-stamp-context.interface';
export type { IHasSoftDeletes } from '@/interfaces/has-soft-deletes.interface';
export type { IHasTimestamps } from '@/interfaces/has-timestamps.interface';
export type { IHasUuid } from '@/interfaces/has-uuid.interface';

// Export subscriber interfaces
export type { EntityEventPayload } from '@/interfaces/entity-event-payload.interface';
export type { SubscriberOptions } from '@/interfaces/subscriber-options.interface';

// Export decorator interfaces
export type { FactoryMetadata } from '@/interfaces/factory-metadata.interface';
export type { SeederMetadata } from '@/interfaces/seeder-metadata.interface';
export * from './column-definition.interface';
export * from './entity-event-payload.interface';
export * from './factory-config.interface';
export * from './factory-metadata.interface';
export * from './factory-relationship.interface';
export * from './factory-state.interface';
export * from './factory.interface';
export * from './has-soft-deletes.interface';
export * from './has-timestamps.interface';
export * from './has-user-stamps.interface';
export * from './has-uuid.interface';
export * from './index-definition.interface';
export * from './migration-context.interface';
export * from './migration-result.interface';
export * from './repository.interface';
export * from './rollbackable.interface';
export * from './seeder-config.interface';
export * from './seeder-context.interface';
export * from './seeder-metadata.interface';
export * from './seeder-result.interface';
export * from './seeder.interface';
export * from './service.interface';
export * from './subscriber-options.interface';
export * from './user-stamp-context.interface';
