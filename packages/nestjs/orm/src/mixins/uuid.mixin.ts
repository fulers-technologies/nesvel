import * as uuid from 'uuid';
import { Constructor } from '@nesvel/shared';
import { PrimaryKey, BeforeCreate } from '@mikro-orm/core';

import { IHasUuid } from '@/interfaces/has-uuid.interface';

/**
 * UUID mixin function
 *
 * @param Base - The base class to extend
 * @returns Extended class with UUID functionality
 */
export function HasUuid<TBase extends Constructor<object>>(Base: TBase) {
  /**
   * UUID Mixin
   *
   * Adds UUID primary key functionality to entities.
   * Automatically generates UUIDs for new entities.
   *
   * @example
   * ```typescript
   * @Entity()
   * export class User extends HasUuid(BaseEntity) {
   *   // User-specific properties
   * }
   * ```
   */
  abstract class UuidMixin extends Base implements IHasUuid {
    /**
     * UUID primary key
     */
    @PrimaryKey()
    id: string = uuid.v4();

    /**
     * Before create hook - ensure UUID is set
     */
    @BeforeCreate()
    ensureId() {
      if (!this.id || !this.isValidUuid(this.id)) {
        this.id = uuid.v4();
      }
    }

    /**
     * Check if the provided string is a valid UUID
     *
     * @param uuidString - The string to validate
     * @returns True if valid UUID
     */
    isValidUuid(uuidString: string): boolean {
      return uuid.validate(uuidString);
    }

    /**
     * Get the UUID version
     *
     * @returns The UUID version number
     */
    getUuidVersion(): number {
      return uuid.version(this.id);
    }

    /**
     * Check if this entity has a valid UUID
     *
     * @returns True if the ID is a valid UUID
     */
    hasValidUuid(): boolean {
      return this.isValidUuid(this.id);
    }

    /**
     * Generate a new UUID for this entity
     *
     * @param version - UUID version to use (default: 4)
     * @returns The generated UUID
     */
    generateNewId(version: 1 | 4 = 4): string {
      switch (version) {
        case 1:
          // UUID v1 would require additional dependencies
          throw new Error('UUID v1 not supported. Use v4 instead.');
        case 4:
        default:
          this.id = uuid.v4();
          return this.id;
      }
    }

    /**
     * Set a custom UUID
     *
     * @param uuid - The UUID to set
     * @throws Error if UUID is invalid
     */
    setId(uuid: string): void {
      if (!this.isValidUuid(uuid)) {
        throw new Error(`Invalid UUID: ${uuid}`);
      }
      this.id = uuid;
    }

    /**
     * Get UUID as buffer (for optimization)
     *
     * @returns UUID as Buffer
     */
    getIdAsBuffer(): Buffer {
      return Buffer.from(this.id.replace(/-/g, ''), 'hex');
    }

    /**
     * Check if this entity's ID matches another UUID
     *
     * @param uuid - UUID to compare with
     * @returns True if UUIDs match
     */
    hasId(uuid: string): boolean {
      return this.id === uuid;
    }

    /**
     * Get a short version of the UUID (first 8 characters)
     * Useful for logging or display purposes
     *
     * @returns Short UUID
     */
    getShortId(): string {
      return this.id.substring(0, 8);
    }

    /**
     * Get UUID without dashes
     *
     * @returns UUID without dashes
     */
    getCompactId(): string {
      return this.id.replace(/-/g, '');
    }

    /**
     * Convert UUID to URL-safe base64
     *
     * @returns Base64 encoded UUID
     */
    getBase64Id(): string {
      const buffer = this.getIdAsBuffer();
      return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    /**
     * Static method to generate a new UUID
     *
     * @returns A new UUID v4
     */
    static generateUuid(): string {
      return uuid.v4();
    }

    /**
     * Static method to validate UUID
     *
     * @param uuid - UUID to validate
     * @returns True if valid
     */
    static isValidUuid(uuidString: string): boolean {
      return uuid.validate(uuidString);
    }

    /**
     * Static method to convert UUID string to buffer
     *
     * @param uuid - UUID string
     * @returns UUID as Buffer
     */
    static uuidToBuffer(uuidString: string): Buffer {
      if (!UuidMixin.isValidUuid(uuidString)) {
        throw new Error(`Invalid UUID: ${uuidString}`);
      }
      return Buffer.from(uuidString.replace(/-/g, ''), 'hex');
    }

    /**
     * Static method to convert buffer to UUID string
     *
     * @param buffer - UUID buffer
     * @returns UUID string
     */
    static bufferToUuid(buffer: Buffer): string {
      if (buffer.length !== 16) {
        throw new Error('Buffer must be 16 bytes for UUID conversion');
      }

      const hex = buffer.toString('hex');
      return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32),
      ].join('-');
    }
  }

  return UuidMixin;
}

/**
 * Type helper for entities with soft deletes
 */
export type WithUuid<T> = T & IHasUuid;
