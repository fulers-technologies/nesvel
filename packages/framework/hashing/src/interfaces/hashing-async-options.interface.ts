import { ModuleMetadata, Type } from '@nestjs/common';
import { IHashingConfig } from './hashing-config.interface';

/**
 * Hashing Options Factory
 *
 * Factory interface for creating hashing configuration.
 *
 * @interface IHashingOptionsFactory
 */
export interface IHashingOptionsFactory {
  createHashingOptions(): Promise<IHashingConfig> | IHashingConfig;
}

/**
 * Hashing Async Module Options
 *
 * Options for registering the hashing module asynchronously.
 *
 * @interface IHashingAsyncOptions
 */
export interface IHashingAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Register the module globally
   * @default false
   */
  global?: boolean;

  /**
   * Factory function to create configuration
   */
  useFactory?: (...args: any[]) => Promise<IHashingConfig> | IHashingConfig;

  /**
   * Class to use for creating configuration
   */
  useClass?: Type<IHashingOptionsFactory>;

  /**
   * Existing provider to use for creating configuration
   */
  useExisting?: Type<IHashingOptionsFactory>;

  /**
   * Dependencies to inject into factory function
   */
  inject?: any[];
}
