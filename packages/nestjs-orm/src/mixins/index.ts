/**
 * Entity Mixins
 *
 * Laravel Eloquent-inspired mixins for NestJS ORM entities.
 * These mixins provide modular functionality that can be mixed and matched
 * based on your entity requirements.
 *
 * @example
 * ```typescript
 * import { BaseEntity } from '@/entities/base.entity';
 * import { HasTimestamps, HasSoftDeletes, HasUserstamps } from '@/mixins';
 *
 * // Entity with all features
 * @Entity()
 * export class User extends HasUserstamps(
 *   HasSoftDeletes(
 *     HasTimestamps(BaseEntity)
 *   ),
 *   UserEntity
 * ) {
 *   @Property()
 *   email: string;
 * }
 *
 * // Simple entity with just timestamps
 * @Entity()
 * export class Post extends HasTimestamps(BaseEntity) {
 *   @Property()
 *   title: string;
 * }
 *
 * // Entity with UUID primary key
 * @Entity()
 * export class Session extends HasUuid(BaseEntity) {
 *   @Property()
 *   data: string;
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */

export * from './uuid.mixin';
export * from './timestamps.mixin';
export * from './user-stamps.mixin';
export * from './soft-deletes.mixin';
export * from './searchable.mixin';
