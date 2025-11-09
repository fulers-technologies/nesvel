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
