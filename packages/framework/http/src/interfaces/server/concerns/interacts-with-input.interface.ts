/**
 * Interface for InteractsWithInput mixin.
 *
 * Provides methods for retrieving data from query parameters,
 * request body, cookies, headers, and uploaded files.
 */
export interface InteractsWithInputInterface {
  /**
   * Retrieve a server variable from the request.
   *
   * @param key - The server variable key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The server variable value or default
   */
  server(key?: string, defaultValue?: any): any;

  /**
   * Determine if a header is set on the request.
   *
   * @param key - The header key to check
   * @returns True if header exists
   */
  hasHeader(key: string): boolean;

  /**
   * Get the bearer token from the request headers.
   *
   * @returns The bearer token or null if not present
   */
  bearerToken(): string | null;

  /**
   * Get the keys for all of the input and files.
   *
   * @returns Array of all input and file keys
   */
  keys(): string[];

  /**
   * Get all of the input and files for the request.
   *
   * @param keys - Optional keys to retrieve
   * @returns Object containing all input and files, or subset if keys provided
   */
  all(keys?: string | string[]): Record<string, any>;

  /**
   * Retrieve input from the request as a plain object.
   *
   * @param key - Optional key or array of keys to retrieve
   * @returns Object containing the input data
   */
  fluent(key?: string | string[]): Record<string, any>;

  /**
   * Retrieve a request payload item from the request body.
   *
   * @param key - The key to retrieve from body
   * @param defaultValue - Default value if key doesn't exist
   * @returns The body value or default
   */
  post(key?: string, defaultValue?: any): any;

  /**
   * Determine if a cookie is set on the request.
   *
   * @param key - The cookie key to check
   * @returns True if cookie exists
   */
  hasCookie(key: string): boolean;

  /**
   * Retrieve a cookie from the request.
   *
   * @param key - The cookie key to retrieve
   * @param defaultValue - Default value if cookie doesn't exist
   * @returns The cookie value or default
   */
  cookie(key?: string, defaultValue?: any): any;

  /**
   * Get an array of all of the files on the request.
   *
   * @returns Array of uploaded files
   */
  allFiles(): any[];

  /**
   * Determine if the uploaded data contains a file.
   *
   * @param key - The file input key
   * @returns True if file exists and is valid
   */
  hasFile(key: string): boolean;

  /**
   * Retrieve a file from the request.
   *
   * @param key - The file input key
   * @param defaultValue - Default value if file doesn't exist
   * @returns The uploaded file or default
   */
  file(key?: string, defaultValue?: any): any;
}
