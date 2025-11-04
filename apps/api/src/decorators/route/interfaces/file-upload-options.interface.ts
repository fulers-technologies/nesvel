/**
 * Configuration options for file upload endpoints.
 *
 * Defines settings for handling file uploads including field names,
 * file count limits, file type filtering, and size restrictions.
 *
 * @example
 * ```typescript
 * const uploadOptions: FileUploadOptions = {
 *   fieldName: 'avatar',
 *   maxCount: 1,
 *   fileFilter: ['image/jpeg', 'image/png'],
 *   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
 * };
 * ```
 */
export interface FileUploadOptions {
  /**
   * Name of the form field containing the file(s).
   *
   * This corresponds to the field name in the multipart/form-data request.
   * Defaults to 'file' for single uploads or 'files' for multiple uploads.
   *
   * @default 'file' | 'files'
   */
  fieldName?: string;

  /**
   * Maximum number of files allowed in a single upload.
   *
   * Only applicable when using the 'files' option for multiple file uploads.
   * Prevents clients from uploading excessive numbers of files.
   *
   * @default undefined (no limit)
   */
  maxCount?: number;

  /**
   * Array of allowed MIME types for uploaded files.
   *
   * Files not matching these types will be rejected.
   * Use standard MIME type strings (e.g., 'image/jpeg', 'application/pdf').
   *
   * @example ['image/jpeg', 'image/png', 'image/gif']
   * @default undefined (all types allowed)
   */
  fileFilter?: string[];

  /**
   * Size and count limits for file uploads.
   *
   * Provides granular control over upload restrictions to prevent
   * abuse and ensure system stability.
   */
  limits?: {
    /**
     * Maximum file size in bytes.
     *
     * Individual files exceeding this size will be rejected.
     * Consider server memory and storage capacity when setting this value.
     *
     * @example 5242880 // 5MB in bytes
     * @default undefined (no limit)
     */
    fileSize?: number;

    /**
     * Maximum number of files per request.
     *
     * Alternative to maxCount, provides the same functionality.
     * Useful for enforcing strict upload policies.
     *
     * @default undefined (no limit)
     */
    files?: number;
  };
}
