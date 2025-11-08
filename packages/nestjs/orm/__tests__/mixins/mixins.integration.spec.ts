import 'reflect-metadata';
import { Entity, Property, BaseEntity as MikroBaseEntity, PrimaryKey } from '@mikro-orm/core';
import { BaseEntity } from '@/entities/base.entity';
import { HasTimestamps } from '@/mixins/timestamps.mixin';
import { HasSoftDeletes } from '@/mixins/soft-deletes.mixin';
import { HasUserstamps } from '@/mixins/user-stamps.mixin';
import { HasUuid } from '@/mixins/uuid.mixin';

/**
 * Base test entity without ID for UUID mixin compatibility
 */
class BaseTestEntityWithoutId extends MikroBaseEntity<any, any> {
  // No ID property - will be added by mixins
  constructor() {
    super();
  }
}

/**
 * Test entity with numeric ID for non-UUID mixins
 */
@Entity()
class BaseTestEntity extends BaseEntity {
  // Make BaseEntity concrete for testing
  constructor() {
    super();
    // Initialize ID for testing
    this.id = Math.floor(Math.random() * 1000000);
  }
}

class TimestampedEntity extends HasTimestamps(BaseTestEntity) {
  @Property()
  name!: string;
}

/**
 * Test entity with soft deletes only
 */
@Entity()
class SoftDeletableEntity extends HasSoftDeletes(BaseTestEntity) {
  @Property()
  name!: string;
}

/**
 * Test entity with UUID only
 */
@Entity()
class UuidEntity extends HasUuid(BaseTestEntityWithoutId) {
  @Property()
  name!: string;
}

/**
 * Test entity with all mixins combined (using number ID base)
 */
@Entity()
class FullFeaturedEntity extends HasUserstamps(HasSoftDeletes(HasTimestamps(BaseTestEntity))) {
  @Property()
  name!: string;
}

describe('ORM Mixins Integration', () => {
  /**
   * Test group: HasTimestamps mixin
   *
   * Verifies timestamp functionality including automatic
   * creation/update tracking and utility methods.
   */
  describe('HasTimestamps mixin', () => {
    /**
     * Test: Timestamp properties existence
     *
     * Ensures that timestamp properties are properly added
     * to entities using the HasTimestamps mixin.
     */
    it('should add timestamp properties to entity', () => {
      // Act
      const entity = new TimestampedEntity();
      entity.name = 'Test Entity';

      // Assert
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
    });

    /**
     * Test: Touch method functionality
     *
     * Verifies that the touch method updates the updatedAt
     * timestamp correctly.
     */
    it('should update timestamp when touched', async () => {
      // Arrange
      const entity = new TimestampedEntity();
      entity.name = 'Touchable Entity';
      const originalUpdateTime = entity.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act
      entity.touch();

      // Assert
      expect(entity.updatedAt.getTime()).toBeGreaterThan(originalUpdateTime.getTime());
    });

    /**
     * Test: Recently created/updated methods
     *
     * Tests the utility methods for checking if an entity
     * was recently created or updated.
     */
    it('should correctly identify recently created/updated entities', () => {
      // Arrange
      const entity = new TimestampedEntity();
      entity.name = 'Recent Entity';

      // Act & Assert
      expect(entity.wasCreatedRecently(5)).toBe(true);
      expect(entity.wasUpdatedRecently(5)).toBe(true);
      expect(entity.wasCreatedRecently(-1)).toBe(false); // Negative threshold should return false
    });
  });

  /**
   * Test group: HasSoftDeletes mixin
   *
   * Verifies soft delete functionality including deletion,
   * restoration, and query filtering.
   */
  describe('HasSoftDeletes mixin', () => {
    /**
     * Test: Soft delete functionality
     *
     * Ensures that entities can be soft deleted and
     * the deletion is properly tracked.
     */
    it('should soft delete entities correctly', () => {
      // Arrange
      const entity = new SoftDeletableEntity();
      entity.name = 'Deletable Entity';

      // Act
      entity.softDelete();

      // Assert
      expect(entity.deletedAt).toBeDefined();
      expect(entity.deletedAt).toBeInstanceOf(Date);
      expect(entity.isDeleted).toBe(true);
      expect(entity.isTrashed).toBe(true);
    });

    /**
     * Test: Restore functionality
     *
     * Verifies that soft deleted entities can be restored
     * and the deletion timestamp is cleared.
     */
    it('should restore soft deleted entities', () => {
      // Arrange
      const entity = new SoftDeletableEntity();
      entity.name = 'Restorable Entity';
      entity.softDelete();
      expect(entity.isDeleted).toBe(true);

      // Act
      entity.restore();

      // Assert
      expect(entity.deletedAt).toBeUndefined();
      expect(entity.isDeleted).toBe(false);
      expect(entity.isTrashed).toBe(false);
    });

    /**
     * Test: Custom deletion timestamp
     *
     * Tests the ability to set custom deletion timestamps
     * when soft deleting entities.
     */
    it('should allow custom deletion timestamps', () => {
      // Arrange
      const entity = new SoftDeletableEntity();
      entity.name = 'Custom Delete Entity';
      const customDate = new Date('2024-01-01');

      // Act
      entity.softDelete(customDate);

      // Assert
      expect(entity.deletedAt).toEqual(customDate);
      expect(entity.isDeleted).toBe(true);
    });

    /**
     * Test: Recently deleted functionality
     *
     * Verifies the utility method for checking if an entity
     * was recently deleted.
     */
    it('should identify recently deleted entities', () => {
      // Arrange
      const entity = new SoftDeletableEntity();
      entity.name = 'Recently Deleted Entity';

      // Act
      entity.softDelete();

      // Assert
      expect(entity.wasDeletedRecently(5)).toBe(true);
      expect(entity.wasDeletedRecently(-1)).toBe(false); // Negative threshold should return false
    });
  });

  /**
   * Test group: HasUuid mixin
   *
   * Verifies UUID functionality including generation,
   * validation, and utility methods.
   */
  describe('HasUuid mixin', () => {
    /**
     * Test: UUID generation
     *
     * Ensures that UUIDs are automatically generated
     * for entities using the HasUuid mixin.
     */
    it('should generate UUID for entities', () => {
      // Act
      const entity = new UuidEntity();
      entity.name = 'UUID Entity';

      // Assert
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('string');
      // Updated to match the mock UUID format (more flexible pattern)
      expect(entity.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    /**
     * Test: UUID validation
     *
     * Tests the UUID validation functionality provided
     * by the mixin.
     */
    it('should validate UUIDs correctly', () => {
      // Arrange
      const entity = new UuidEntity();
      entity.name = 'Validated UUID Entity';

      // Act & Assert
      expect(entity.hasValidUuid()).toBe(true);
      expect(entity.isValidUuid(entity.id)).toBe(true);
      expect(entity.isValidUuid('invalid-uuid')).toBe(false);
    });

    /**
     * Test: UUID utility methods
     *
     * Verifies the various utility methods provided
     * for working with UUIDs.
     */
    it('should provide UUID utility methods', () => {
      // Arrange
      const entity = new UuidEntity();
      entity.name = 'UUID Utilities Entity';

      // Act & Assert
      expect(entity.getShortId()).toBe((entity.id as string).substring(0, 8));
      expect(entity.getCompactId()).toBe((entity.id as string).replace(/-/g, ''));
      expect(entity.getBase64Id()).toBeDefined();
      expect(typeof entity.getBase64Id()).toBe('string');
    });

    /**
     * Test: Custom UUID setting
     *
     * Tests the ability to set custom UUIDs while
     * maintaining validation.
     */
    it('should allow setting custom valid UUIDs', () => {
      // Arrange
      const entity = new UuidEntity();
      const customUuid = '123e4567-e89b-42d3-a456-426614174000'; // Valid UUID v4 format

      // Act
      entity.setId(customUuid);

      // Assert
      expect(entity.id).toBe(customUuid);
      expect(entity.hasValidUuid()).toBe(true);
    });
  });

  /**
   * Test group: HasUserstamps mixin
   *
   * Verifies user stamping functionality for tracking
   * who created and updated entities.
   */
  describe('HasUserstamps mixin', () => {
    /**
     * Test: User stamp properties
     *
     * Ensures that user stamp properties are properly
     * added to entities.
     */
    it('should add user stamp properties', () => {
      // Act
      const entity = new FullFeaturedEntity();
      entity.name = 'User Stamped Entity';

      // Assert
      expect(entity.createdById).toBeUndefined(); // Initially undefined
      expect(entity.updatedById).toBeUndefined();
      expect(entity.hasCreator()).toBe(false);
      expect(entity.hasUpdater()).toBe(false);
    });

    /**
     * Test: Setting creator and updater
     *
     * Tests the functionality for setting who created
     * and updated an entity.
     */
    it('should set creator and updater correctly', () => {
      // Arrange
      const entity = new FullFeaturedEntity();
      entity.name = 'Stamped Entity';
      const creator = { id: 'user-1', name: 'Creator' };
      const updater = { id: 'user-2', name: 'Updater' };

      // Act
      entity.setCreatedBy(creator);
      entity.setUpdatedBy(updater);

      // Assert
      expect(entity.createdById).toBe('user-1');
      expect(entity.updatedById).toBe('user-2');
      expect(entity.hasCreator()).toBe(true);
      expect(entity.hasUpdater()).toBe(true);
    });

    /**
     * Test: User comparison methods
     *
     * Verifies the methods for checking if a specific
     * user created or updated an entity.
     */
    it('should correctly identify creators and updaters', () => {
      // Arrange
      const entity = new FullFeaturedEntity();
      entity.name = 'User Compared Entity';
      const user1 = { id: 'user-1', name: 'User 1' };
      const user2 = { id: 'user-2', name: 'User 2' };

      entity.setCreatedBy(user1);
      entity.setUpdatedBy(user2);

      // Act & Assert
      expect(entity.wasCreatedBy(user1)).toBe(true);
      expect(entity.wasCreatedBy(user2)).toBe(false);
      expect(entity.wasUpdatedBy(user2)).toBe(true);
      expect(entity.wasUpdatedBy(user1)).toBe(false);
    });
  });

  /**
   * Test group: Mixin combinations
   *
   * Verifies that multiple mixins work correctly together
   * and don't interfere with each other.
   */
  describe('mixin combinations', () => {
    /**
     * Test: All mixins combined functionality
     *
     * Ensures that entities with all mixins combined
     * have access to all mixin features.
     */
    it('should provide all mixin features when combined', () => {
      // Act
      const entity = new FullFeaturedEntity();
      entity.name = 'Full Featured Entity';

      // Assert - ID features (numeric ID from BaseEntity)
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe('number');

      // Assert - Timestamp features
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
      expect(entity.wasCreatedRecently).toBeDefined();

      // Assert - Soft delete features
      expect(entity.isDeleted).toBe(false);
      expect(entity.softDelete).toBeDefined();
      expect(entity.restore).toBeDefined();

      // Assert - User stamps features
      expect(entity.hasCreator()).toBe(false);
      expect(entity.setCreatedBy).toBeDefined();
      expect(entity.setUpdatedBy).toBeDefined();
    });

    /**
     * Test: Mixin method interactions
     *
     * Tests how different mixin methods work together
     * and maintain consistency.
     */
    it('should handle mixin method interactions correctly', () => {
      // Arrange
      const entity = new FullFeaturedEntity();
      entity.name = 'Interactive Entity';
      const user = { id: 'user-1', name: 'Test User' };

      // Act - Set user stamps
      entity.setCreatedBy(user);
      entity.setUpdatedBy(user);

      // Act - Touch to update timestamp
      entity.touch();

      // Act - Soft delete
      entity.softDelete();

      // Assert - All features still work
      expect(entity.wasCreatedBy(user)).toBe(true);
      expect(entity.wasUpdatedBy(user)).toBe(true);
      expect(entity.isDeleted).toBe(true);
      expect(entity.wasDeletedRecently(5)).toBe(true);
      expect(typeof entity.id).toBe('number');
    });

    /**
     * Test: Selective mixin combinations
     *
     * Verifies that selective combinations of mixins
     * work correctly without unwanted features.
     */
    it('should support selective mixin combinations', () => {
      // Arrange - Entity with only timestamps and UUID
      @Entity()
      class SelectiveEntity extends HasTimestamps(HasUuid(BaseTestEntityWithoutId)) {
        @Property()
        name!: string;
      }

      // Act
      const entity = new SelectiveEntity();
      entity.name = 'Selective Entity';

      // Assert - Has UUID and timestamps
      expect(entity.id).toBeDefined();
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();

      // Assert - Doesn't have soft deletes or user stamps
      expect((entity as any).isDeleted).toBeUndefined();
      expect((entity as any).softDelete).toBeUndefined();
      expect((entity as any).hasCreator).toBeUndefined();
    });

    /**
     * Test: Mixin inheritance chain
     *
     * Tests that the mixin inheritance chain works
     * correctly and maintains all expected functionality.
     */
    it('should maintain proper inheritance chain', () => {
      // Arrange
      const entity = new FullFeaturedEntity();

      // Assert - Instance checks
      expect(entity).toBeInstanceOf(FullFeaturedEntity);
      expect(entity).toBeInstanceOf(BaseEntity);

      // Assert - All mixin features are available
      const mixinMethods = [
        'touch',
        'wasCreatedRecently',
        'wasUpdatedRecently', // Timestamps
        'softDelete',
        'restore',
        'isDeleted',
        'wasDeletedRecently', // Soft deletes
        'setCreatedBy',
        'setUpdatedBy',
        'hasCreator',
        'hasUpdater', // User stamps
      ];

      mixinMethods.forEach((method) => {
        const methodOrProperty = (entity as any)[method];
        expect(methodOrProperty).toBeDefined();
        // Some of these might be properties (like isDeleted), not methods
        if (typeof methodOrProperty === 'function') {
          expect(typeof methodOrProperty).toBe('function');
        } else {
          expect(methodOrProperty).toBeDefined();
        }
      });
    });
  });

  /**
   * Test group: Lifecycle integration
   *
   * Verifies that mixins integrate correctly with
   * entity lifecycle events and hooks.
   */
  describe('lifecycle integration', () => {
    /**
     * Test: BeforeCreate hook integration
     *
     * Tests that mixin hooks are properly called
     * during entity creation lifecycle.
     */
    it('should integrate with entity lifecycle hooks', () => {
      // Act
      const entity = new FullFeaturedEntity();
      entity.name = 'Lifecycle Entity';

      // Simulate beforeCreate hook
      entity.setCreatedAt?.();

      // Assert - Timestamps should be set
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });

    /**
     * Test: BeforeUpdate hook integration
     *
     * Verifies that update hooks from mixins
     * are properly integrated.
     */
    it('should update timestamps on entity updates', () => {
      // Arrange
      const entity = new FullFeaturedEntity();
      entity.name = 'Update Entity';
      const originalUpdateTime = entity.updatedAt;

      // Act - Simulate beforeUpdate hook
      entity.setUpdatedAt?.();

      // Assert
      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdateTime.getTime());
    });
  });

  /**
   * Test group: Error handling and edge cases
   *
   * Tests how mixins handle various error conditions
   * and edge cases.
   */
  describe('error handling and edge cases', () => {
    /**
     * Test: Invalid UUID handling
     *
     * Tests how the UUID mixin handles invalid
     * UUID values.
     */
    it('should handle invalid UUIDs gracefully', () => {
      // Arrange
      const entity = new UuidEntity();
      entity.name = 'Invalid UUID Entity';

      // Act & Assert
      expect(() => entity.setId('invalid-uuid')).toThrow();
      expect(entity.isValidUuid('not-a-uuid')).toBe(false);
    });

    /**
     * Test: Null/undefined user handling
     *
     * Tests how user stamps handle null or undefined
     * user objects.
     */
    it('should handle null/undefined users gracefully', () => {
      // Arrange
      const entity = new FullFeaturedEntity();
      entity.name = 'Null User Entity';

      // Act & Assert
      expect(() => entity.setCreatedBy(null)).not.toThrow();
      expect(() => entity.setUpdatedBy(undefined)).not.toThrow();
    });

    /**
     * Test: Multiple soft delete operations
     *
     * Verifies behavior when soft delete is called
     * multiple times on the same entity.
     */
    it('should handle multiple soft delete operations', () => {
      // Arrange
      const entity = new SoftDeletableEntity();
      entity.name = 'Multiple Delete Entity';

      // Act
      entity.softDelete();
      const firstDeleteTime = entity.deletedAt;
      entity.softDelete(); // Second delete

      // Assert - Should maintain original deletion time
      expect(entity.deletedAt).toEqual(firstDeleteTime);
      expect(entity.isDeleted).toBe(true);
    });
  });
});
