import type { InteractsWithInputInterface } from '@/interfaces';

/**
 * Mixin that provides methods for interacting with request input.
 *
 * Implements Laravel's InteractsWithInput trait functionality including
 * methods for retrieving query parameters, body data, headers, cookies,
 * and uploaded files.
 *
 * @param Base - The base class to extend
 * @returns Extended class with input interaction methods
 */
export class InteractsWithInput implements InteractsWithInputInterface {
  /**
   * Retrieve a server variable from the request.
   *
   * @param key - The server variable key
   * @param defaultValue - Default value if key doesn't exist
   * @returns The server variable value or default
   */
  server(key?: string, defaultValue?: any): any {
    if (!key) {
      return {
        ...process.env,
        ...(this as any).headers,
      };
    }

    // Check headers first (Express stores server vars in headers)
    const headerKey = key.toLowerCase().replace(/_/g, '-');
    if ((this as any).headers[headerKey] !== undefined) {
      return (this as any).headers[headerKey];
    }

    // Check process.env
    if (process.env[key] !== undefined) {
      return process.env[key];
    }

    return defaultValue;
  }

  /**
   * Determine if a header is set on the request.
   *
   * @param key - The header key to check
   * @returns True if header exists
   */
  hasHeader(key: string): boolean {
    return (this as any).get(key) !== undefined;
  }

  /**
   * Get the bearer token from the request headers.
   *
   * Extracts the token from the Authorization header (e.g., "Bearer token").
   *
   * @returns The bearer token or null if not present
   */
  bearerToken(): string | null {
    const header = (this as any).get('authorization') || '';

    if (typeof header !== 'string') {
      return null;
    }

    const position = header.toLowerCase().lastIndexOf('bearer ');

    if (position === -1) {
      return null;
    }

    let token = header.substring(position + 7);

    // Handle comma-separated tokens (take first one)
    const commaPos = token.indexOf(',');
    if (commaPos !== -1) {
      token = token.substring(0, commaPos);
    }

    return token.trim() || null;
  }

  /**
   * Get the keys for all of the input and files.
   *
   * @returns Array of all input and file keys
   */
  keys(): string[] {
    const inputKeys = Object.keys((this as any).all());
    const fileKeys = Object.keys((this as any).allFiles());
    return [...new Set([...inputKeys, ...fileKeys])];
  }

  /**
   * Get all of the input and files for the request.
   *
   * @param keys - Optional keys to retrieve
   * @returns Object containing all input and files, or subset if keys provided
   */
  all(keys?: string | string[]): Record<string, any> {
    const input = {
      ...(this as any).query,
      ...(this as any).body,
      ...(this as any).params,
    };

    if (!keys) {
      const files = (this as any).allFiles();
      return { ...input, ...files };
    }

    const keyArray = Array.isArray(keys) ? keys : [keys];
    const result: Record<string, any> = {};

    for (const key of keyArray) {
      if (input[key] !== undefined) {
        result[key] = input[key];
      }
    }

    return result;
  }

  /**
   * Retrieve input from the request as a plain object.
   *
   * @param key - Optional key or array of keys to retrieve
   * @returns Object containing the input data
   */
  fluent(key?: string | string[]): Record<string, any> {
    if (Array.isArray(key)) {
      return (this as any).all(key);
    }

    if (key) {
      const allInput = (this as any).all();
      const value = allInput[key];
      return value !== undefined ? { [key]: value } : {};
    }

    return (this as any).all();
  }

  /**
   * Retrieve a request payload item from the request body.
   *
   * @param key - The key to retrieve from body
   * @param defaultValue - Default value if key doesn't exist
   * @returns The body value or default
   */
  post(key?: string, defaultValue?: any): any {
    if (!key) {
      return (this as any).body || {};
    }

    return (this as any).body?.[key] ?? defaultValue;
  }

  /**
   * Determine if a cookie is set on the request.
   *
   * @param key - The cookie key to check
   * @returns True if cookie exists
   */
  hasCookie(key: string): boolean {
    return (this as any).cookie(key) !== undefined;
  }

  /**
   * Retrieve a cookie from the request.
   *
   * @param key - The cookie key to retrieve
   * @param defaultValue - Default value if cookie doesn't exist
   * @returns The cookie value or default
   */
  cookie(key?: string, defaultValue?: any): any {
    if (!key) {
      return (this as any).cookies || {};
    }

    return (this as any).cookies?.[key] ?? defaultValue;
  }

  /**
   * Get an array of all of the files on the request.
   *
   * @returns Array of uploaded files
   */
  allFiles(): any[] {
    if (!(this as any).files) {
      return [];
    }

    // Handle multer's file structure
    const files = (this as any).files;

    // If it's already an array, return it
    if (Array.isArray(files)) {
      return files.filter((file) => (this as any).isValidFile(file));
    }

    // If it's an object with field names, flatten to array
    if (typeof files === 'object') {
      return Object.values(files)
        .flat()
        .filter((file) => (this as any).isValidFile(file));
    }

    return [];
  }

  /**
   * Determine if the uploaded data contains a file.
   *
   * @param key - The file input key
   * @returns True if file exists and is valid
   */
  hasFile(key: string): boolean {
    const file = (this as any).file(key);

    if (!file) {
      return false;
    }

    const files = Array.isArray(file) ? file : [file];
    return files.some((f) => (this as any).isValidFile(f));
  }

  /**
   * Retrieve a file from the request.
   *
   * @param key - The file input key
   * @param defaultValue - Default value if file doesn't exist
   * @returns The uploaded file or default
   */
  file(key?: string, defaultValue?: any): any {
    if (!key) {
      return (this as any).allFiles();
    }

    // Check if files exist on request (multer attaches files)
    if (!(this as any).files) {
      return defaultValue;
    }

    // Handle multer's file structure
    const files: any = (this as any).files;
    return files[key] ?? defaultValue;
  }

  /**
   * Check that the given file is a valid file instance.
   *
   * @param file - The file to validate
   * @returns True if file is valid
   */
  protected isValidFile(file: any): boolean {
    if (!file) {
      return false;
    }

    // Check for multer file properties
    return file.path !== undefined && file.path !== '' && file.filename !== undefined;
  }
}
