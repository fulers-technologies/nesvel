import { Inject } from '@nestjs/common';

import { HASHING_SERVICE } from '@constants';

/**
 * Decorator to inject the HashingService into a class property or constructor parameter.
 *
 * This is a convenience decorator that wraps the @Inject() decorator with the
 * HASHING_SERVICE token, making it easier and more readable to inject the hashing service.
 *
 * @returns Property decorator
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     @InjectHashing()
 *     private readonly hashing: HashingService,
 *   ) {}
 * }
 * ```
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class AuthService {
 *   @InjectHashing()
 *   private readonly hashing!: HashingService;
 *
 *   async validatePassword(password: string, hash: string) {
 *     return this.hashing.check(password, hash);
 *   }
 * }
 * ```
 */
export const InjectHashing = (): ParameterDecorator & PropertyDecorator => {
  return Inject(HASHING_SERVICE);
};
