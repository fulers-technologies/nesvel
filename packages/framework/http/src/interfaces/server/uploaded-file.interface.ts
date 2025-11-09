/**
 * Uploaded file information.
 *
 * Represents a file uploaded via multipart/form-data.
 */
export interface UploadedFile {
  /**
   * Field name from the form.
   */
  fieldname: string;

  /**
   * Original filename.
   */
  originalname: string;

  /**
   * Encoding type.
   */
  encoding: string;

  /**
   * MIME type.
   */
  mimetype: string;

  /**
   * File size in bytes.
   */
  size: number;

  /**
   * Temporary file path.
   */
  path: string;

  /**
   * File buffer (if stored in memory).
   */
  buffer?: Buffer;
}
