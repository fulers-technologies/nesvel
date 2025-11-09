/**
 * Options for file download responses.
 *
 * Controls file download behavior and headers.
 */
export interface DownloadOptions {
  /**
   * Filename to use for download.
   * If not provided, uses the original filename.
   */
  filename?: string;

  /**
   * Content type for the file.
   * Will be auto-detected if not provided.
   */
  contentType?: string;

  /**
   * Whether to force download (Content-Disposition: attachment).
   * Default: true
   */
  attachment?: boolean;

  /**
   * Additional headers to send.
   */
  headers?: Record<string, string | string[]>;

  /**
   * Whether to inline the file instead of downloading.
   * Default: false
   */
  inline?: boolean;
}
