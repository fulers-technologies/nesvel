/**
 * Email attachment
 *
 * @interface Attachment
 */
export interface Attachment {
  /**
   * Attachment filename
   */
  filename: string;

  /**
   * Attachment content (Buffer or string)
   */
  content?: Buffer | string;

  /**
   * Path to file
   */
  path?: string;

  /**
   * Content type
   */
  contentType?: string;

  /**
   * Content disposition (attachment or inline)
   */
  contentDisposition?: 'attachment' | 'inline';

  /**
   * Content ID for inline images
   */
  cid?: string;
}
