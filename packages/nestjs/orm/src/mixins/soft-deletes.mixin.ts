import { Property } from '@mikro-orm/core';
import { Constructor } from '@nesvel/shared';
import { IHasSoftDeletes } from '@/interfaces/has-soft-deletes.interface';

/**
 * Soft deletes mixin function
 *
 * @param Base - The base class to extend
 * @returns Extended class with soft deletes functionality
 */
export function HasSoftDeletes<TBase extends Constructor<object>>(Base: TBase) {
  /**
   * Soft Deletes Mixin
   *
   * Adds soft delete functionality to entities.
   * Similar to Laravel's SoftDeletes trait.
   *
   * @example
   * ```typescript
   * @Entity()
   * @Filter({
   *   name: 'softDelete',
   *   cond: { deletedAt: { $eq: null } },
   *   default: true
   * })
   * export class User extends HasSoftDeletes(BaseEntity) {
   *   // User-specific properties
   * }
   * ```
   */
  abstract class SoftDeletesMixin extends Base implements IHasSoftDeletes {
    /**
     * The date and time when the entity was soft deleted
     */
    @Property({ nullable: true, hidden: true })
    deletedAt?: Date;

    /**
     * Check if the entity is soft deleted
     */
    get isDeleted(): boolean {
      return !!this.deletedAt;
    }

    /**
     * Alias for isDeleted (Laravel compatibility)
     */
    get isTrashed(): boolean {
      return this.isDeleted;
    }

    /**
     * Soft delete the entity
     *
     * @param timestamp - Optional custom deletion timestamp
     */
    softDelete(timestamp?: Date): void {
      this.deletedAt = timestamp || new Date();
    }

    /**
     * Alias for softDelete (Laravel compatibility)
     */
    delete(timestamp?: Date): void {
      this.softDelete(timestamp);
    }

    /**
     * Restore the soft deleted entity
     */
    restore(): void {
      delete this.deletedAt;
    }

    /**
     * Force delete (permanently delete) the entity
     * This should be handled by the repository
     */
    forceDelete(): never {
      throw new Error('Force delete must be handled by the repository layer');
    }

    /**
     * Check if the entity was deleted recently
     *
     * @param minutes - Number of minutes to consider as "recent" (default: 5)
     * @returns True if deleted within the specified minutes
     */
    wasDeletedRecently(minutes: number = 5): boolean {
      if (!this.deletedAt) {
        return false;
      }

      const now = new Date();
      const diffInMs = now.getTime() - this.deletedAt.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      return diffInMinutes <= minutes;
    }

    /**
     * Get the date when the entity was deleted
     *
     * @returns The deletion date or null if not deleted
     */
    getDeletedAt(): Date | null {
      return this.deletedAt || null;
    }

    /**
     * Check if the entity is not deleted
     *
     * @returns True if the entity is not soft deleted
     */
    isNotDeleted(): boolean {
      return !this.isDeleted;
    }

    /**
     * Set a custom deleted timestamp without triggering hooks
     *
     * @param timestamp - The deletion timestamp
     */
    setDeletedAt(timestamp: Date): void {
      this.deletedAt = timestamp;
    }

    /**
     * Clear the deletion timestamp without triggering hooks
     */
    clearDeletedAt(): void {
      delete this.deletedAt;
    }
  }

  return SoftDeletesMixin;
}

/**
 * Type helper for entities with soft deletes
 */
export type WithSoftDeletes<T> = T & IHasSoftDeletes;
