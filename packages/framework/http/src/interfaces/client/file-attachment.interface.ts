/**
 * File attachment for multipart uploads.
 *
 * Represents a file or blob to be uploaded in a multipart request.
 */
export interface FileAttachment {
  /**
   * Field name for the file input.
   */
  name: string;

  /**
   * File contents as Buffer, Stream, or string.
   */
  contents: Buffer | NodeJS.ReadableStream | string;

  /**
   * Optional filename for the uploaded file.
   * If not provided, will use the name field.
   */
  filename?: string;

  /**
   * Optional content type for the file.
   * Will be auto-detected if not provided.
   */
  contentType?: string;
}
