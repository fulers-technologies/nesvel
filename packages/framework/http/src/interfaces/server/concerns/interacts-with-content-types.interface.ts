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
