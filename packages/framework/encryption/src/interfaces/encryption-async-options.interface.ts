import { ModuleMetadata, Type } from '@nestjs/common';

import { EncryptionModuleOptions } from './encryption-options.interface';

/**
 * Factory function for creating encryption module options asynchronously.
 */
export interface EncryptionOptionsFactory {
  /**
   * Creates encryption module options.
   *
   * @returns The encryption module options or a promise that resolves to them
   */
  createEncryptionOptions(): Promise<EncryptionModuleOptions> | EncryptionModuleOptions;
}

/**
 * Options for configuring the EncryptionModule asynchronously.
 *
 * @remarks
 * These options are used with EncryptionModule.forRootAsync() to configure
 * the encryption service with async configuration (e.g., from a config service).
 */
export interface EncryptionModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Whether the module should be registered as a global module.
   * @default false
   */
  isGlobal?: boolean;

  /**
   * Factory function that returns encryption options.
   */
  useFactory?: (...args: any[]) => Promise<EncryptionModuleOptions> | EncryptionModuleOptions;

  /**
   * Dependencies to inject into the factory function.
   */
  inject?: any[];

  /**
   * Class to use for creating encryption options.
   */
  useClass?: Type<EncryptionOptionsFactory>;

  /**
   * Existing instance to use for creating encryption options.
   */
  useExisting?: Type<EncryptionOptionsFactory>;
}
