/**
 * Post Size Validation Options
 *
 * Configuration options for ValidatePostSizeMiddleware.
 */
export interface ValidatePostSizeOptions {
  /**
   * Maximum request body size in bytes.
   * Can be number or string with unit (e.g., '10mb', '1gb').
   */
  maxSize?: number | string;

  /**
   * Whether to include content-length header in size check.
   * If false, only checks after body is parsed.
   */
  checkContentLength?: boolean;

  /**
   * Custom error message.
   */
  errorMessage?: string;

  /**
   * HTTP status code for size exceeded error.
   */
  statusCode?: number;
}
