/**
 * Email address with optional name
 *
 * @interface Address
 */
export interface Address {
  /**
   * Email address
   */
  address: string;

  /**
   * Display name
   */
  name?: string;
}
