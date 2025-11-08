import { DynamicModule, Module, Provider } from '@nestjs/common';

import {
  EncryptionModuleOptions,
  EncryptionOptionsFactory,
  EncryptionModuleAsyncOptions,
} from '@interfaces';
import { ENCRYPTION_MODULE_OPTIONS, ENCRYPTION_DRIVER, ENCRYPTION_SERVICE } from '@constants';
import { EncryptionService, EncryptionFactoryService } from '@services';

/**
 * NestJS module for encryption functionality.
 *
 * @remarks
 * This module provides encryption and decryption services using various
 * cipher algorithms (AES-CBC, AES-GCM, Sodium). It supports both synchronous
 * and asynchronous configuration and can be registered as a global module.
 *
 * @example
 * Synchronous configuration:
 * ```typescript
 * @Module({
 *   imports: [
 *     EncryptionModule.forRoot({
 *       key: process.env.APP_KEY,
 *       cipher: CipherAlgorithm.AES_256_GCM,
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 *
 * @example
 * Asynchronous configuration:
 * ```typescript
 * @Module({
 *   imports: [
 *     EncryptionModule.forRootAsync({
 *       imports: [ConfigModule],
 *       useFactory: (config: ConfigService) => ({
 *         key: config.get('APP_KEY'),
 *         cipher: config.get('ENCRYPTION_CIPHER'),
 *       }),
 *       inject: [ConfigService],
 *       isGlobal: true,
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class EncryptionModule {
  /**
   * Configures the encryption module with synchronous options.
   *
   * @param options - The encryption module configuration options
   * @returns A configured dynamic module
   *
   * @example
   * ```typescript
   * EncryptionModule.forRoot({
   *   key: 'base64-encoded-key',
   *   cipher: CipherAlgorithm.AES_256_GCM,
   *   previousKeys: ['old-key-1', 'old-key-2'], // For key rotation
   *   isGlobal: true,
   * })
   * ```
   */
  static forRoot(options: EncryptionModuleOptions): DynamicModule {
    const driverProvider: Provider = {
      provide: ENCRYPTION_DRIVER,
      useFactory: (factory: EncryptionFactoryService) => {
        return factory.createDriver(options);
      },
      inject: [EncryptionFactoryService],
    };

    return {
      module: EncryptionModule,
      global: options.isGlobal ?? false,
      providers: [
        EncryptionFactoryService,
        driverProvider,
        EncryptionService,
        {
          provide: ENCRYPTION_SERVICE,
          useExisting: EncryptionService,
        },
      ],
      exports: [EncryptionService, ENCRYPTION_SERVICE],
    };
  }

  /**
   * Configures the encryption module with asynchronous options.
   *
   * @param options - The asynchronous encryption module configuration options
   * @returns A configured dynamic module
   *
   * @remarks
   * This method allows you to configure the module asynchronously,
   * which is useful when encryption configuration depends on other services
   * like ConfigService.
   *
   * @example
   * Using factory function:
   * ```typescript
   * EncryptionModule.forRootAsync({
   *   imports: [ConfigModule],
   *   useFactory: (configService: ConfigService) => ({
   *     key: configService.get('APP_KEY'),
   *     cipher: CipherAlgorithm.AES_256_GCM,
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   *
   * @example
   * Using class:
   * ```typescript
   * @Injectable()
   * class EncryptionConfigService implements EncryptionOptionsFactory {
   *   createEncryptionOptions(): EncryptionModuleOptions {
   *     return {
   *       key: process.env.APP_KEY,
   *       cipher: CipherAlgorithm.AES_256_GCM,
   *     };
   *   }
   * }
   *
   * EncryptionModule.forRootAsync({
   *   useClass: EncryptionConfigService,
   * })
   * ```
   */
  static forRootAsync(options: EncryptionModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    const driverProvider: Provider = {
      provide: ENCRYPTION_DRIVER,
      useFactory: (factory: EncryptionFactoryService, config: any) => {
        return factory.createDriver(config);
      },
      inject: [EncryptionFactoryService, ENCRYPTION_MODULE_OPTIONS],
    };

    return {
      module: EncryptionModule,
      global: options.isGlobal ?? false,
      imports: options.imports || [],
      providers: [
        ...asyncProviders,
        EncryptionFactoryService,
        driverProvider,
        EncryptionService,
        {
          provide: ENCRYPTION_SERVICE,
          useExisting: EncryptionService,
        },
      ],
      exports: [EncryptionService, ENCRYPTION_SERVICE],
    };
  }

  /**
   * Creates providers for asynchronous configuration.
   *
   * @param options - The asynchronous configuration options
   * @returns Array of providers for the module
   */
  private static createAsyncProviders(options: EncryptionModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: ENCRYPTION_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: ENCRYPTION_MODULE_OPTIONS,
          useFactory: async (optionsFactory: EncryptionOptionsFactory) =>
            await optionsFactory.createEncryptionOptions(),
          inject: [options.useClass],
        },
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: ENCRYPTION_MODULE_OPTIONS,
          useFactory: async (optionsFactory: EncryptionOptionsFactory) =>
            await optionsFactory.createEncryptionOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    return [];
  }
}
