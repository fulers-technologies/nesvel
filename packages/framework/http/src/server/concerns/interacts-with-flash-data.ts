import type { InteractsWithFlashDataInterface } from './interfaces';

/**
 * Mixin that provides methods for session flash data handling.
 *
 * Flash data is session data that is only available for the next request.
 * This is commonly used for storing form input after validation errors
 * or success messages after redirects.
 *
 * @param Base - The base class to extend
 * @returns Extended class with flash data methods
 */
export class InteractsWithFlashData implements InteractsWithFlashDataInterface {
  /**
   * Retrieve an old input item from flash data.
   *
   * Old input is typically set after a validation error redirect,
   * allowing forms to be repopulated with the user's previous input.
   *
   * @param key - The input key
   * @param defaultValue - Default value if not found
   * @returns The old input value or default
   */
  old(key?: string, defaultValue?: any): any {
    // Check if session exists (express-session)
    const session = (this as any).session;

    if (!session) {
      return defaultValue;
    }

    // Get old input from session
    const oldInput = session._oldInput || {};

    if (!key) {
      return oldInput;
    }

    return oldInput[key] ?? defaultValue;
  }

  /**
   * Flash the input for the current request to the session.
   *
   * Stores all input (query, body, params) in the session for
   * the next request.
   */
  flash(): void {
    const session = (this as any).session;

    if (!session) {
      return;
    }

    // Combine all input sources
    const input = {
      ...(this as any).query,
      ...(this as any).body,
      ...(this as any).params,
    };

    // Store in session as _oldInput
    session._oldInput = input;
  }

  /**
   * Flash only some of the input to the session.
   *
   * @param keys - Keys to flash
   */
  flashOnly(...keys: string[]): void {
    const session = (this as any).session;

    if (!session) {
      return;
    }

    const input = {
      ...(this as any).query,
      ...(this as any).body,
      ...(this as any).params,
    };

    // Pick only specified keys
    const filtered: Record<string, any> = {};
    for (const key of keys) {
      if (input[key] !== undefined) {
        filtered[key] = input[key];
      }
    }

    session._oldInput = filtered;
  }

  /**
   * Flash all input except some keys to the session.
   *
   * @param keys - Keys to exclude
   */
  flashExcept(...keys: string[]): void {
    const session = (this as any).session;

    if (!session) {
      return;
    }

    const input = {
      ...(this as any).query,
      ...(this as any).body,
      ...(this as any).params,
    };

    // Exclude specified keys
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (!keys.includes(key)) {
        filtered[key] = value;
      }
    }

    session._oldInput = filtered;
  }

  /**
   * Flush all of the old input from the session.
   *
   * Clears any flashed input data.
   */
  flush(): void {
    const session = (this as any).session;

    if (!session) {
      return;
    }

    session._oldInput = {};
  }
}
