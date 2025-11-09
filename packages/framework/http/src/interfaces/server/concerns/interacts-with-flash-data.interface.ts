/**
 * Interface for InteractsWithFlashData mixin.
 *
 * Provides methods for session flash data handling.
 */
export interface InteractsWithFlashDataInterface {
  /**
   * Retrieve an old input item from flash data.
   *
   * @param key - The input key
   * @param defaultValue - Default value if not found
   * @returns The old input value or default
   */
  old(key?: string, defaultValue?: any): any;

  /**
   * Flash the input for the current request to the session.
   */
  flash(): void;

  /**
   * Flash only some of the input to the session.
   *
   * @param keys - Keys to flash
   */
  flashOnly(...keys: string[]): void;

  /**
   * Flash all input except some keys to the session.
   *
   * @param keys - Keys to exclude
   */
  flashExcept(...keys: string[]): void;

  /**
   * Flush all of the old input from the session.
   */
  flush(): void;
}
