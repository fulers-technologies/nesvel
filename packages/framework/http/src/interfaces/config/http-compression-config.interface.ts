/**
 * Compression Configuration
 *
 * Settings for response compression (gzip, deflate, brotli).
 */
export interface HttpCompressionConfig {
  /**
   * Enable compression
   *
   * @env HTTP_COMPRESSION_ENABLED
   * @default true
   */
  enabled?: boolean;

  /**
   * Compression level (0-9)
   *
   * @env HTTP_COMPRESSION_LEVEL
   * @default 6
   */
  level?: number;

  /**
   * Minimum response size to compress (in bytes)
   *
   * @env HTTP_COMPRESSION_THRESHOLD
   * @default 1024 (1KB)
   */
  threshold?: number;

  /**
   * Filter function to determine if response should be compressed
   */
  filter?: (req: any, res: any) => boolean;
}
