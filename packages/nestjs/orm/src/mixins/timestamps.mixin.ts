import { Constructor } from '@nesvel/shared';
import { Property, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';

import { IHasTimestamps } from '@/interfaces/has-timestamps.interface';

/**
 * Timestamps mixin function
 *
 * @param Base - The base class to extend
 * @returns Extended class with timestamps functionality
 */
export function HasTimestamps<TBase extends Constructor<object>>(Base: TBase) {
  /**
   * Timestamps Mixin
   *
   * Adds createdAt and updatedAt timestamp functionality to entities.
   * Similar to Laravel's timestamps() method in migrations.
   *
   * @example
   * ```typescript
   * @Entity()
   * export class User extends HasTimestamps(BaseEntity) {
   *   // User-specific properties
   * }
   * ```
   */
  abstract class TimestampsMixin extends Base implements IHasTimestamps {
    /**
     * The date and time when the entity was created
     */
    @Property({ onCreate: () => new Date() })
    createdAt: Date = new Date();

    /**
     * The date and time when the entity was last updated
     */
    @Property({ onUpdate: () => new Date(), onCreate: () => new Date() })
    updatedAt: Date = new Date();

    /**
     * Before create hook - set timestamps
     */
    @BeforeCreate()
    setCreatedAt() {
      const now = new Date();
      this.createdAt = now;
      this.updatedAt = now;
    }

    /**
     * Before update hook - update timestamp
     */
    @BeforeUpdate()
    setUpdatedAt() {
      this.updatedAt = new Date();
    }

    /**
     * Touch the entity to update its timestamp
     */
    touch(): void {
      this.updatedAt = new Date();
    }

    /**
     * Check if the entity was created recently
     *
     * @param minutes - Number of minutes to consider as "recent" (default: 5)
     * @returns True if created within the specified minutes
     */
    wasCreatedRecently(minutes: number = 5): boolean {
      const now = new Date();
      const diffInMs = now.getTime() - this.createdAt.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      return diffInMinutes <= minutes;
    }

    /**
     * Check if the entity was updated recently
     *
     * @param minutes - Number of minutes to consider as "recent" (default: 5)
     * @returns True if updated within the specified minutes
     */
    wasUpdatedRecently(minutes: number = 5): boolean {
      const now = new Date();
      const diffInMs = now.getTime() - this.updatedAt.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      return diffInMinutes <= minutes;
    }
  }

  return TimestampsMixin;
}

/**
 * Type helper for entities with timestamps
 */
export type WithTimestamps<T> = T & IHasTimestamps;
