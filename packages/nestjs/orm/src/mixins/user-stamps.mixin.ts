import { Property } from '@mikro-orm/core';

import { IHasUserstamps } from '@/interfaces/has-user-stamps.interface';

/**
 * User Stamps Mixin
 *
 * Adds user tracking functionality to entities by storing user IDs.
 * Tracks which user created and last updated the entity using their ID.
 *
 * This mixin stores only user IDs (number or string) without entity relationships.
 * Use ManyToOne decorators in your entity if you need full user object relationships.
 *
 * @template TBase - The base class constructor type
 *
 * @param Base - The base class to extend
 * @returns Extended class with user stamp functionality (createdBy and updatedBy as user IDs)
 *
 * @example
 * ```typescript
 * // Basic usage with user IDs only
 * @Entity()
 * export class Post extends HasUserstamps(BaseEntity) {
 *   @Property()
 *   title!: string;
 *
 *   @Property()
 *   content!: string;
 * }
 *
 * // Usage in code
 * const post = new Post();
 * post.setCreatedBy(currentUserId);
 * post.setUpdatedBy(currentUserId);
 * ```
 *
 * @example
 * ```typescript
 * // If you need user relationships, add them explicitly
 * @Entity()
 * export class Post extends HasUserstamps(BaseEntity) {
 *   @ManyToOne(() => User, { nullable: true })
 *   creator?: User;
 *
 *   @ManyToOne(() => User, { nullable: true })
 *   updater?: User;
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export function HasUserstamps<TBase extends new (...args: any[]) => object>(Base: TBase) {
  abstract class UserstampsMixin extends Base implements IHasUserstamps {
    /**
     * ID of the user who created this entity
     *
     * Stores the unique identifier of the user who originally created this record.
     * Can be a number (auto-increment ID) or string (UUID).
     */
    @Property({ nullable: true })
    createdBy?: number | string;

    /**
     * ID of the user who last updated this entity
     *
     * Stores the unique identifier of the user who most recently updated this record.
     * Can be a number (auto-increment ID) or string (UUID).
     */
    @Property({ nullable: true })
    updatedBy?: number | string;

    /**
     * ID of the user who deleted this entity
     *
     * Stores the unique identifier of the user who soft-deleted this record.
     * Can be a number (auto-increment ID) or string (UUID).
     * Only relevant when used with HasSoftDeletes mixin.
     */
    @Property({ nullable: true })
    deletedBy?: number | string;

    /**
     * Set the user ID who is creating this entity
     *
     * @param userId - The user ID (number or string)
     *
     * @example
     * ```typescript
     * const post = new Post();
     * post.setCreatedBy(123); // numeric ID
     * post.setCreatedBy('550e8400-e29b-41d4-a716-446655440000'); // UUID
     * ```
     */
    setCreatedBy(userId: number | string): void {
      this.createdBy = userId;
    }

    /**
     * Set the user ID who is updating this entity
     *
     * @param userId - The user ID (number or string)
     *
     * @example
     * ```typescript
     * post.setUpdatedBy(456);
     * ```
     */
    setUpdatedBy(userId: number | string): void {
      this.updatedBy = userId;
    }

    /**
     * Set the user ID who is deleting this entity
     *
     * @param userId - The user ID (number or string)
     *
     * @example
     * ```typescript
     * post.setDeletedBy(789);
     * ```
     */
    setDeletedBy(userId: number | string): void {
      this.deletedBy = userId;
    }

    /**
     * Check if the entity was created by a specific user
     *
     * @param userId - The user ID to check against
     * @returns True if the entity was created by the specified user
     *
     * @example
     * ```typescript
     * if (post.wasCreatedBy(currentUserId)) {
     *   console.log('You created this post');
     * }
     * ```
     */
    wasCreatedBy(userId: number | string): boolean {
      return this.createdBy === userId;
    }

    /**
     * Check if the entity was last updated by a specific user
     *
     * @param userId - The user ID to check against
     * @returns True if the entity was last updated by the specified user
     *
     * @example
     * ```typescript
     * if (post.wasUpdatedBy(currentUserId)) {
     *   console.log('You last updated this post');
     * }
     * ```
     */
    wasUpdatedBy(userId: number | string): boolean {
      return this.updatedBy === userId;
    }

    /**
     * Check if the entity was deleted by a specific user
     *
     * @param userId - The user ID to check against
     * @returns True if the entity was deleted by the specified user
     *
     * @example
     * ```typescript
     * if (post.wasDeletedBy(currentUserId)) {
     *   console.log('You deleted this post');
     * }
     * ```
     */
    wasDeletedBy(userId: number | string): boolean {
      return this.deletedBy === userId;
    }

    /**
     * Get the creator user ID
     *
     * @returns The ID of the user who created this entity, or undefined if not set
     *
     * @example
     * ```typescript
     * const creatorId = post.getCreatedBy();
     * if (creatorId) {
     *   const creator = await userRepository.findOne(creatorId);
     * }
     * ```
     */
    getCreatedBy(): number | string | undefined {
      return this.createdBy;
    }

    /**
     * Get the updater user ID
     *
     * @returns The ID of the user who last updated this entity, or undefined if not set
     *
     * @example
     * ```typescript
     * const updaterId = post.getUpdatedBy();
     * ```
     */
    getUpdatedBy(): number | string | undefined {
      return this.updatedBy;
    }

    /**
     * Get the deleter user ID
     *
     * @returns The ID of the user who deleted this entity, or undefined if not set
     *
     * @example
     * ```typescript
     * const deleterId = post.getDeletedBy();
     * if (deleterId) {
     *   const deleter = await userRepository.findOne(deleterId);
     * }
     * ```
     */
    getDeletedBy(): number | string | undefined {
      return this.deletedBy;
    }

    /**
     * Check if the entity has creator information
     *
     * @returns True if createdBy is set
     *
     * @example
     * ```typescript
     * if (post.hasCreator()) {
     *   console.log(`Created by user ${post.getCreatedBy()}`);
     * }
     * ```
     */
    hasCreator(): boolean {
      return this.createdBy !== undefined && this.createdBy !== null;
    }

    /**
     * Check if the entity has updater information
     *
     * @returns True if updatedBy is set
     *
     * @example
     * ```typescript
     * if (post.hasUpdater()) {
     *   console.log(`Last updated by user ${post.getUpdatedBy()}`);
     * }
     * ```
     */
    hasUpdater(): boolean {
      return this.updatedBy !== undefined && this.updatedBy !== null;
    }

    /**
     * Check if the entity has deleter information
     *
     * @returns True if deletedBy is set
     *
     * @example
     * ```typescript
     * if (post.hasDeleter()) {
     *   console.log(`Deleted by user ${post.getDeletedBy()}`);
     * }
     * ```
     */
    hasDeleter(): boolean {
      return this.deletedBy !== undefined && this.deletedBy !== null;
    }

    /**
     * Clear the creator information
     *
     * Removes the createdBy user ID from the entity.
     *
     * @example
     * ```typescript
     * post.clearCreator();
     * ```
     */
    clearCreator(): void {
      delete (this as any).createdBy;
    }

    /**
     * Clear the updater information
     *
     * Removes the updatedBy user ID from the entity.
     *
     * @example
     * ```typescript
     * post.clearUpdater();
     * ```
     */
    clearUpdater(): void {
      delete (this as any).updatedBy;
    }

    /**
     * Clear the deleter information
     *
     * Removes the deletedBy user ID from the entity.
     *
     * @example
     * ```typescript
     * post.clearDeleter();
     * ```
     */
    clearDeleter(): void {
      delete (this as any).deletedBy;
    }
  }

  return UserstampsMixin;
}

/**
 * Type helper for entities with user stamps
 */
export type WithUserstamps<T> = T & IHasUserstamps;
