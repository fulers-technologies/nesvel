import { Module, DynamicModule, Provider } from '@nestjs/common';
import { HashingService } from '@services/hashing.service';
import { HashingFactoryService } from '@services/hashing-factory.service';
import { IHashingOptions, IHashingAsyncOptions } from '@interfaces';
import { HASHING_DRIVER, HASHING_SERVICE, HASHING_MODULE_OPTIONS } from '@constants';

/**
 * Hashing Module
 *
 * Laravel-inspired hashing module for NestJS.
 *
 * @module HashingModule
 */
@Module({})
export class HashingModule {
  /**
   * Register module synchronously
   *
   * @param options - Hashing options
   * @returns Dynamic module
   */
  static forRoot(options: IHashingOptions = {}): DynamicModule {
    const driverProvider: Provider = {
      provide: HASHING_DRIVER,
      useFactory: (factory: HashingFactoryService) => {
        return factory.createDriver(options);
      },
      inject: [HashingFactoryService],
    };

    return {
      module: HashingModule,
      global: options.global || false,
      providers: [
        HashingFactoryService,
        driverProvider,
        HashingService,
        {
          provide: HASHING_SERVICE,
          useExisting: HashingService,
        },
      ],
      exports: [HashingService, HASHING_SERVICE],
    };
  }

  /**
   * Register module asynchronously
   *
   * @param options - Async hashing options
   * @returns Dynamic module
   */
  static forRootAsync(options: IHashingAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    const driverProvider: Provider = {
      provide: HASHING_DRIVER,
      useFactory: (factory: HashingFactoryService, config: any) => {
        return factory.createDriver(config);
      },
      inject: [HashingFactoryService, HASHING_MODULE_OPTIONS],
    };

    return {
      module: HashingModule,
      global: options.global || false,
      imports: options.imports || [],
      providers: [
        ...asyncProviders,
        HashingFactoryService,
        driverProvider,
        HashingService,
        {
          provide: HASHING_SERVICE,
          useExisting: HashingService,
        },
      ],
      exports: [HashingService, HASHING_SERVICE],
    };
  }

  private static createAsyncProviders(options: IHashingAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: HASHING_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    return [];
  }
}
