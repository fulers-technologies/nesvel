import { BaseEntity as MikroBaseEntity, PrimaryKey } from '@mikro-orm/core';

/**
 * Clean Base Entity
 *
 * Provides only essential functionality. Use mixins for additional features:
 * - HasTimestamps: for createdAt/updatedAt
 * - HasSoftDeletes: for deletedAt functionality
 * - HasUserStamps: for user tracking
 * - HasUuid: for UUID primary keys
 *
 * @example
 * ```typescript
 * // Entity with all features
 * @Entity()
 * export class User extends HasUserStamps(
 *   HasSoftDeletes(
 *     HasTimestamps(BaseEntity)
 *   ),
 *   UserEntity
 * ) {
 *   @Property()
 *   email: string;
 * }
 *
 * // Simple entity with just timestamps
 * @Entity()
 * export class Post extends HasTimestamps(BaseEntity) {
 *   @Property()
 *   title: string;
 * }
 * ```
 */
export abstract class BaseEntity extends MikroBaseEntity<BaseEntity, 'id'> {
  @PrimaryKey()
  id!: number;

  /**
   * Fill entity with data
   */
  fill(data: Partial<this>): this {
    Object.assign(this, data);
    return this;
  }

  /**
   * Get entity attributes as array
   */
  getAttributes(): string[] {
    const helper = (this as any).__helper;
    return helper ? Object.keys(helper.getMetadata().properties) : [];
  }

  /**
   * Get dirty attributes (changed since last sync)
   */
  getDirty(): string[] {
    const helper = (this as any).__helper;
    return helper && helper.isDirty() ? Object.keys(helper.getPayload()) : [];
  }

  /**
   * Check if entity has changes
   */
  isDirty(attribute?: string): boolean {
    if (attribute) {
      return this.getDirty().includes(attribute);
    }
    const helper = (this as any).__helper;
    return helper ? helper.isDirty() : false;
  }

  /**
   * Get original value of an attribute
   */
  getOriginal<K extends keyof this>(attribute: K): this[K] | undefined {
    const helper = (this as any).__helper;
    const snapshot = helper ? helper.getOriginSnapshot() : null;
    return snapshot ? snapshot[attribute as string] : undefined;
  }

  /**
   * Check if attribute was changed
   */
  wasChanged(attribute?: keyof this): boolean {
    if (attribute) {
      return this.getDirty().includes(attribute as string);
    }
    const helper = (this as any).__helper;
    return helper ? helper.isDirty() : false;
  }

  /**
   * Refresh entity from database
   */
  async refresh(): Promise<this> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.refresh();
    }
    return this;
  }

  /**
   * Save the entity
   */
  async save(): Promise<this> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.persistAndFlush();
    }
    return this;
  }

  /**
   * Delete the entity (hard delete)
   */
  async delete(): Promise<void> {
    const helper = (this as any).__helper;
    if (helper) {
      await helper.remove();
    }
  }
}
