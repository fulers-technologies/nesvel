import type { InteractsWithFilesInterface } from '@/interfaces';

/**
 * Mixin that provides methods for handling uploaded files.
 *
 * Note: File handling methods are primarily implemented in InteractsWithInput.
 * This mixin exists for interface compatibility and can be extended with
 * additional file-specific functionality.
 *
 * @param Base - The base class to extend
 * @returns Extended class with file handling methods
 */
export class InteractsWithFiles implements InteractsWithFilesInterface {
  /**
   * Retrieve all uploaded files.
   *
   * @returns Array of uploaded files
   */
  allFiles(): any[] {
    if (!(this as any).files) {
      return [];
    }

    const files = (this as any).files;

    if (Array.isArray(files)) {
      return files;
    }

    if (typeof files === 'object') {
      return Object.values(files).flat();
    }

    return [];
  }

  /**
   * Determine if the request contains a file.
   *
   * @param key - The file input name
   * @returns True if file exists
   */
  hasFile(key: string): boolean {
    const file = (this as any).file(key);
    return !!file;
  }

  /**
   * Retrieve an uploaded file.
   *
   * @param key - The file input name
   * @param defaultValue - Default value if not found
   * @returns The uploaded file or default
   */
  file(key?: string, defaultValue?: any): any {
    if (!key) {
      return (this as any).allFiles();
    }

    const files: any = (this as any).files;
    if (!files) {
      return defaultValue;
    }

    return files[key] ?? defaultValue;
  }
}
