/**
 * Interface for entities with soft deletes
 */
export interface IHasSoftDeletes {
  deletedAt?: Date;
  isDeleted: boolean;
  isTrashed: boolean;
}
