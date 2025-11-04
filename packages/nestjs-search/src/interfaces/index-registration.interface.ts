import { IndexRegistrationOptions } from './index-registration-options.interface';

/**
 * Index Registry
 *
 * Internal registry that stores all registered indices.
 *
 * @internal
 */
export interface IndexRegistry {
  /**
   * Registered indices
   *
   * Map of index name to configuration.
   */
  indices: Map<string, IndexRegistrationOptions>;

  /**
   * Index aliases
   *
   * Map of alias to index name.
   */
  aliases: Map<string, string>;
}
