import 'reflect-metadata';
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@/entities/base.entity';
import { HasTimestamps } from '@/mixins/timestamps.mixin';
import { HasSoftDeletes } from '@/mixins/soft-deletes.mixin';

@Entity()
// Create a concrete test entity
class BaseTestEntity extends BaseEntity {
  // Make BaseEntity concrete for testing
}

class TestUser extends HasSoftDeletes(HasTimestamps(BaseTestEntity)) {
  @Property()
  name?: string;

  @Property()
  email!: string;

  getDisplayName(): string {
    return this.name || this.email?.split('@')[0] || 'Unknown';
  }

  activate(): void {
    // Business logic method
  }
}

describe('Entity Integration', () => {
  describe('entity with mixins', () => {
    it('should create entity with mixin features', () => {
      const user = new TestUser();
      user.name = 'Test User';
      user.email = 'test@example.com';

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.isDeleted).toBe(false);
      expect(user.getDisplayName()).toBeDefined();
    });

    it('should handle soft delete functionality', () => {
      const user = new TestUser();
      user.name = 'Delete Test';
      user.email = 'delete@example.com';

      user.softDelete();

      expect(user.isDeleted).toBe(true);
      expect(user.deletedAt).toBeDefined();
    });
  });

  describe('business logic methods', () => {
    it('should execute business logic methods', () => {
      const user = new TestUser();
      user.name = 'Business User';
      user.email = 'business@example.com';

      expect(() => user.activate()).not.toThrow();
    });
  });
});
