/**
 * Decorator to mark a class property for automatic encryption/decryption.
 *
 * @remarks
 * This decorator is a metadata marker that can be used by ORM integrations
 * or serializers to automatically encrypt/decrypt property values.
 *
 * Note: This decorator only marks the property with metadata. The actual
 * encryption/decryption logic must be implemented by the consuming library
 * (e.g., an ORM integration package).
 *
 * @example
 * ```typescript
 * export class User {
 *   @Encrypted()
 *   password: string;
 *
 *   @Encrypted()
 *   ssn: string;
 *
 *   // Non-encrypted field
 *   email: string;
 * }
 * ```
 *
 * @example
 * With ORM integration:
 * ```typescript
 * @Entity()
 * export class UserEntity {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 *
 *   @Column()
 *   @Encrypted()
 *   creditCard: string; // Automatically encrypted when saved
 *
 *   @Column()
 *   email: string; // Not encrypted
 * }
 * ```
 */
export function Encrypted(): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    // Store metadata about encrypted properties
    const existingEncryptedProperties: string[] =
      Reflect.getMetadata('encryption:properties', target) || [];

    existingEncryptedProperties.push(propertyKey.toString());

    Reflect.defineMetadata('encryption:properties', existingEncryptedProperties, target);

    // Mark the specific property as encrypted
    Reflect.defineMetadata('encryption:encrypted', true, target, propertyKey);
  };
}

/**
 * Helper function to get all encrypted properties from a class instance or prototype.
 *
 * @param target - The class instance or prototype
 * @returns Array of property names that are marked as encrypted
 *
 * @example
 * ```typescript
 * const user = new User();
 * const encryptedProps = getEncryptedProperties(user);
 * console.log(encryptedProps); // ['password', 'ssn']
 * ```
 */
export function getEncryptedProperties(target: object): string[] {
  return Reflect.getMetadata('encryption:properties', target) || [];
}

/**
 * Helper function to check if a specific property is marked as encrypted.
 *
 * @param target - The class instance or prototype
 * @param propertyKey - The property name to check
 * @returns True if the property is encrypted, false otherwise
 *
 * @example
 * ```typescript
 * const user = new User();
 * const isEncrypted = isPropertyEncrypted(user, 'password');
 * console.log(isEncrypted); // true
 * ```
 */
export function isPropertyEncrypted(target: object, propertyKey: string | symbol): boolean {
  return Reflect.getMetadata('encryption:encrypted', target, propertyKey) === true;
}
