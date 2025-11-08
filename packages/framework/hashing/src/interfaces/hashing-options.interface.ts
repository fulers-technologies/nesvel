import { IHashingConfig } from './hashing-config.interface';

/**
 * Hashing Module Options
 *
 * Options for registering the hashing module synchronously.
 *
 * @interface IHashingOptions
 */
export interface IHashingOptions extends IHashingConfig {
  /**
   * Register the module globally
   * @default false
   */
  global?: boolean;
}
