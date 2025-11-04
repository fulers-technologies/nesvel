/**
 * Interface for entities with user stamps
 *
 * Defines the contract for entities that track which user created and updated them.
 * The user is identified by their ID (number or string), not by a full user object.
 *
 * @example
 * ```typescript
 * class Post implements IHasUserstamps {
 *   createdBy?: number | string;
 *   updatedBy?: number | string;
 * }
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface IHasUserstamps {
  /**
   * ID of the user who created this entity
   */
  createdBy?: number | string;

  /**
   * ID of the user who last updated this entity
   */
  updatedBy?: number | string;

  /**
   * ID of the user who deleted this entity
   * Only relevant when combined with HasSoftDeletes mixin
   */
  deletedBy?: number | string;
}
