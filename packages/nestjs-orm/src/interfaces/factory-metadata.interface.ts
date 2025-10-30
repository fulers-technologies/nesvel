import { BaseEntity } from '@/entities/base.entity';
import type { IFactoryConfig } from '@/interfaces';

/**
 * Factory Metadata Interface
 *
 * Defines the metadata structure stored for factory classes.
 */
export interface FactoryMetadata {
  /**
   * The entity class this factory creates
   */
  entity: new () => BaseEntity;

  /**
   * Factory configuration options
   */
  config?: IFactoryConfig;

  /**
   * Factory name for identification and debugging
   */
  name?: string;
}
