/**
 * Options for redirect responses.
 *
 * Controls redirect behavior and status codes.
 */
export interface RedirectOptions {
  /**
   * HTTP status code for redirect.
   * Default: 302
   */
  status?: number;

  /**
   * Flash data to include in session.
   */
  with?: Record<string, any>;

  /**
   * Input data to flash to session.
   */
  withInput?: Record<string, any>;

  /**
   * Errors to flash to session.
   */
  withErrors?: Record<string, any> | string[];

  /**
   * Fragment identifier to append to URL.
   */
  fragment?: string;
}
