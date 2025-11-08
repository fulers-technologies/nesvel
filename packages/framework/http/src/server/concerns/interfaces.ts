/**
 * Concern Interfaces
 *
 * TypeScript interfaces for all Request/Response mixins.
 * These interfaces ensure proper type checking and autocomplete support
 * when mixins are applied to classes.
 */

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

/**
 * Interface for InteractsWithContentTypes mixin.
 *
 * Provides methods for content type negotiation and detection.
 */
export interface InteractsWithContentTypesInterface {
  /**
   * Determine if the request is sending JSON.
   *
   * @returns True if Content-Type indicates JSON
   */
  isJson(): boolean;

  /**
   * Determine if the current request probably expects a JSON response.
   *
   * @returns True if request expects JSON
   */
  expectsJson(): boolean;

  /**
   * Determine if the current request is asking for JSON.
   *
   * @returns True if Accept header indicates JSON
   */
  wantsJson(): boolean;

  /**
   * Determines whether the current requests accepts a given content type.
   *
   * @param contentTypes - Content type(s) to check
   * @returns True if any content type is acceptable
   */
  accepts(contentTypes: string | string[]): boolean;

  /**
   * Return the most suitable content type from the given array based on content negotiation.
   *
   * @param contentTypes - Content types to choose from
   * @returns The preferred content type or null
   */
  prefers(contentTypes: string | string[]): string | null;

  /**
   * Determine if the current request accepts any content type.
   *
   * @returns True if accepts any content type
   */
  acceptsAnyContentType(): boolean;

  /**
   * Determines whether a request accepts JSON.
   *
   * @returns True if accepts JSON
   */
  acceptsJson(): boolean;

  /**
   * Determines whether a request accepts HTML.
   *
   * @returns True if accepts HTML
   */
  acceptsHtml(): boolean;

  /**
   * Determine if the given content types match.
   *
   * @param actual - The actual content type
   * @param type - The type to match against
   * @returns True if types match
   */
  matchesType(actual: string, type: string): boolean;

  /**
   * Get the data format expected in the response.
   *
   * @param defaultFormat - Default format if none specified
   * @returns The expected format
   */
  format(defaultFormat?: string): string;
}

/**
 * Interface for InteractsWithFiles mixin.
 *
 * Provides methods for handling uploaded files.
 */
export interface InteractsWithFilesInterface {
  /**
   * Retrieve all uploaded files.
   *
   * @returns Array of uploaded files
   */
  allFiles(): any[];

  /**
   * Determine if the request contains a file.
   *
   * @param key - The file input name
   * @returns True if file exists
   */
  hasFile(key: string): boolean;

  /**
   * Retrieve an uploaded file.
   *
   * @param key - The file input name
   * @param defaultValue - Default value if not found
   * @returns The uploaded file or default
   */
  file(key?: string, defaultValue?: any): any;
}

/**
 * Interface for CanBePrecognitive mixin.
 *
 * Provides methods for Laravel Precognition support.
 */
export interface CanBePrecognitiveInterface {
  /**
   * Filter the given array of rules into an array of rules that are included in precognitive headers.
   *
   * @param rules - Validation rules object
   * @returns Filtered rules for precognition
   */
  filterPrecognitiveRules(rules: Record<string, any>): Record<string, any>;

  /**
   * Determine if the request is attempting to be precognitive.
   *
   * @returns True if Precognition header is present
   */
  isAttemptingPrecognition(): boolean;

  /**
   * Determine if the request is precognitive.
   *
   * @returns True if request is marked as precognitive
   */
  isPrecognitive(): boolean;
}

/**
 * Interface for InteractsWithFlashData mixin.
 *
 * Provides methods for session flash data handling.
 */
export interface InteractsWithFlashDataInterface {
  /**
   * Retrieve an old input item from flash data.
   *
   * @param key - The input key
   * @param defaultValue - Default value if not found
   * @returns The old input value or default
   */
  old(key?: string, defaultValue?: any): any;

  /**
   * Flash the input for the current request to the session.
   */
  flash(): void;

  /**
   * Flash only some of the input to the session.
   *
   * @param keys - Keys to flash
   */
  flashOnly(...keys: string[]): void;

  /**
   * Flash all input except some keys to the session.
   *
   * @param keys - Keys to exclude
   */
  flashExcept(...keys: string[]): void;

  /**
   * Flush all of the old input from the session.
   */
  flush(): void;
}
