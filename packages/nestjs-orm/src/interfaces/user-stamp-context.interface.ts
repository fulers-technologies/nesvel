/**
 * Context interface for user stamping
 */
export interface UserStampContext<TUser = any> {
  currentUser?: TUser;
  userId?: number | string;
}
