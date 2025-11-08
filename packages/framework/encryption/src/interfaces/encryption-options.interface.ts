import { EncryptionConfig } from './encryption-config.interface';

/**
 * Options for configuring the EncryptionModule.
 *
 * @remarks
 * These options are passed to EncryptionModule.forRoot() or forRootAsync()
 * to configure the encryption service.
 */
export interface EncryptionModuleOptions extends EncryptionConfig {
  /**
   * Whether the module should be registered as a global module.
   * When true, the encryption service will be available throughout the application
   * without needing to import the module in each feature module.
   *
   * @default false
   */
  isGlobal?: boolean;
}
