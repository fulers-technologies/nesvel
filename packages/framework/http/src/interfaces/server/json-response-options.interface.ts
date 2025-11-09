/**
 * Options for JSON responses.
 *
 * Controls JSON serialization and response formatting.
 */
export interface JsonResponseOptions {
  /**
   * HTTP status code.
   * Default: 200
   */
  status?: number;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * JSON stringify replacer function.
   */
  replacer?: (key: string, value: any) => any;

  /**
   * Number of spaces for indentation.
   */
  spaces?: number;
}
