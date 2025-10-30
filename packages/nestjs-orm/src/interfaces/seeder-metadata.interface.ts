import type { ISeederConfig } from '@/interfaces';

/**
 * Seeder Metadata Interface
 *
 * Defines the metadata structure stored for seeder classes.
 */
export interface SeederMetadata extends ISeederConfig {
  /**
   * Seeder name for identification and debugging
   */
  name: string;
}
