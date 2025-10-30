/**
 * Config Module
 *
 * Self-contained module for configuration management.
 */

import { module, injectable } from '@nesvel/reactjs-di';

// Token
export const CONFIG_SERVICE = Symbol.for('ConfigService');

// Interface
export interface IConfigService {
  get<T = string>(key: string, defaultValue?: T): T;
  getRequired<T = string>(key: string): T;
  has(key: string): boolean;
}

// Service
@injectable()
class ConfigService implements IConfigService {
  private cache: Map<string, any> = new Map();

  get<T = string>(key: string, defaultValue?: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const value = import.meta.env[key] as T | undefined;
    const result = value !== undefined ? value : defaultValue;

    if (result !== undefined) {
      this.cache.set(key, result);
    }

    return result as T;
  }

  getRequired<T = string>(key: string): T {
    const value = this.get<T>(key);

    if (value === undefined) {
      throw new Error(`Required environment variable "${key}" is not set`);
    }

    return value;
  }

  has(key: string): boolean {
    return import.meta.env[key] !== undefined;
  }
}

// Module
@module({
  providers: [
    {
      provide: CONFIG_SERVICE,
      useClass: ConfigService,
    },
  ],
  exports: [CONFIG_SERVICE],
})
export class ConfigModule {}
