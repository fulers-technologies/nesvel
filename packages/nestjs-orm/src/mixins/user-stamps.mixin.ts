import { Property, ManyToOne, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import { Constructor } from '@nesvel/shared';
import { IHasUserStamps } from '@/interfaces/has-user-stamps.interface';
import { UserStampContext } from '@/interfaces/user-stamp-context.interface';

/**
 * User Stamps Mixin
 *
 * Adds user tracking functionality to entities (who created/updated).
 * Tracks the user who created and last updated the entity.
 *
 * @example
 * ```typescript
 * @Entity()
 * export class Post extends HasUserStamps(BaseEntity, User) {
 *   // Post-specific properties
 * }
 * ```
 */

/**
 * User stamps mixin function
 *
 * @param Base - The base class to extend
 * @param UserEntity - The user entity class for relationships
 * @returns Extended class with user stamps functionality
 */
export function HasUserStamps<TBase extends new (...args: any[]) => object, TUser = any>(
  Base: TBase,
  UserEntity?: Constructor<TUser>,
) {
  abstract class UserStampsMixin extends Base implements IHasUserStamps<TUser> {
    /**
     * ID of the user who created this entity
     */
    @Property({ nullable: true })
    createdById?: number | string;

    /**
     * ID of the user who last updated this entity
     */
    @Property({ nullable: true })
    updatedById?: number | string;

    /**
     * The user who created this entity (if UserEntity is provided)
     */
    createdBy?: TUser;

    /**
     * The user who last updated this entity (if UserEntity is provided)
     */
    updatedBy?: TUser;

    constructor(...args: any[]) {
      super(...args);

      // Set up relationships if UserEntity is provided
      if (UserEntity) {
        // Use ManyToOne decorator for relationships
        ManyToOne(() => UserEntity, { nullable: true })(this, 'createdBy');
        ManyToOne(() => UserEntity, { nullable: true })(this, 'updatedBy');
      }
    }

    /**
     * Set the user who is creating this entity
     *
     * @param user - The user entity or user ID
     */
    setCreatedBy(user: TUser | number | string): void {
      if (typeof user === 'object' && user !== null) {
        this.createdBy = user;
        // Extract ID if it's an object with an id property
        if ('id' in user) {
          this.createdById = (user as any).id;
        }
      } else {
        this.createdById = user as number | string;
      }
    }

    /**
     * Set the user who is updating this entity
     *
     * @param user - The user entity or user ID
     */
    setUpdatedBy(user: TUser | number | string): void {
      if (typeof user === 'object' && user !== null) {
        this.updatedBy = user;
        // Extract ID if it's an object with an id property
        if ('id' in user) {
          this.updatedById = (user as any).id;
        }
      } else {
        this.updatedById = user as number | string;
      }
    }

    /**
     * Check if the entity was created by a specific user
     *
     * @param user - The user entity or user ID to check
     * @returns True if created by the specified user
     */
    wasCreatedBy(user: TUser | number | string): boolean {
      const userId =
        typeof user === 'object' && user !== null && 'id' in user ? (user as any).id : user;
      return this.createdById === userId;
    }

    /**
     * Check if the entity was last updated by a specific user
     *
     * @param user - The user entity or user ID to check
     * @returns True if last updated by the specified user
     */
    wasUpdatedBy(user: TUser | number | string): boolean {
      const userId =
        typeof user === 'object' && user !== null && 'id' in user ? (user as any).id : user;
      return this.updatedById === userId;
    }

    /**
     * Get the creator user ID
     *
     * @returns The ID of the user who created this entity
     */
    getCreatedById(): number | string | undefined {
      return this.createdById;
    }

    /**
     * Get the updater user ID
     *
     * @returns The ID of the user who last updated this entity
     */
    getUpdatedById(): number | string | undefined {
      return this.updatedById;
    }

    /**
     * Check if the entity has creator information
     *
     * @returns True if creator ID is set
     */
    hasCreator(): boolean {
      return this.createdById !== undefined && this.createdById !== null;
    }

    /**
     * Check if the entity has updater information
     *
     * @returns True if updater ID is set
     */
    hasUpdater(): boolean {
      return this.updatedById !== undefined && this.updatedById !== null;
    }

    /**
     * Clear the creator information
     */
    clearCreator(): void {
      delete (this as any).createdById;
      delete (this as any).createdBy;
    }

    /**
     * Clear the updater information
     */
    clearUpdater(): void {
      delete (this as any).updatedById;
      delete (this as any).updatedBy;
    }
  }

  return UserStampsMixin;
}


/**
 * User stamp service for automatic stamping
 */
export class UserStampService<TUser = any> {
  private static instance: UserStampService;
  private context?: UserStampContext<TUser>;

  static getInstance<TUser = any>(): UserStampService<TUser> {
    if (!UserStampService.instance) {
      UserStampService.instance = new UserStampService<TUser>();
    }
    return UserStampService.instance;
  }

  /**
   * Set the current user context for automatic stamping
   *
   * @param context - The user context
   */
  setContext(context: UserStampContext<TUser>): void {
    this.context = context;
  }

  /**
   * Get the current user context
   *
   * @returns The current user context
   */
  getContext(): UserStampContext<TUser> | undefined {
    return this.context;
  }

  /**
   * Clear the current user context
   */
  clearContext(): void {
    delete this.context;
  }

  /**
   * Auto-stamp an entity on creation
   *
   * @param entity - The entity to stamp
   */
  stampCreate(entity: IHasUserStamps<TUser>): void {
    if (this.context?.currentUser && 'setCreatedBy' in entity) {
      (entity as any).setCreatedBy(this.context.currentUser);
    } else if (this.context?.userId) {
      entity.createdById = this.context.userId;
    }
  }

  /**
   * Auto-stamp an entity on update
   *
   * @param entity - The entity to stamp
   */
  stampUpdate(entity: IHasUserStamps<TUser>): void {
    if (this.context?.currentUser && 'setUpdatedBy' in entity) {
      (entity as any).setUpdatedBy(this.context.currentUser);
    } else if (this.context?.userId) {
      entity.updatedById = this.context.userId;
    }
  }
}

/**
 * Type helper for entities with soft deletes
 */
export type WithUserStamps<T> = T & IHasUserStamps;
