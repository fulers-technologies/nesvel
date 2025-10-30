/**
 * Interface for entities with user stamps
 */
export interface IHasUserStamps<TUser = any> {
  createdById?: number | string;
  updatedById?: number | string;
  createdBy?: TUser;
  updatedBy?: TUser;
}
