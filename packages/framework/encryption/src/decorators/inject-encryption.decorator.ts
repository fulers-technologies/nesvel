import { Inject } from '@nestjs/common';
import { EncryptionService } from '@services';

/**
 * Decorator to inject the EncryptionService into a class property or constructor parameter.
 *
 * @remarks
 * This decorator provides a convenient way to inject the EncryptionService
 * without needing to reference the service class directly. It's useful for
 * creating cleaner, more maintainable code.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   constructor(
 *     @InjectEncryption() private readonly encryption: EncryptionService
 *   ) {}
 *
 *   async encryptUserData(data: string) {
 *     return this.encryption.encrypt(data);
 *   }
 * }
 * ```
 *
 * @example
 * Property injection:
 * ```typescript
 * @Injectable()
 * export class UserService {
 *   @InjectEncryption()
 *   private readonly encryption!: EncryptionService;
 *
 *   async encryptUserData(data: string) {
 *     return this.encryption.encrypt(data);
 *   }
 * }
 * ```
 */
export const InjectEncryption = () => Inject(EncryptionService);
