import { Entity, Property, PrimaryKey, EntityRepositoryType } from '@mikro-orm/core';
import { BaseEntity } from '@nesvel/nestjs-orm';
import { TestUserRepository } from '@/repositories/test-user.repository';

/**
 * TestUser Entity
 *
 * Used for testing BaseEntity methods and functionality.
 * This is a demonstration entity showcasing all available
 * BaseEntity features.
 */
@Entity({ tableName: 'test_users', repository: () => TestUserRepository })
export class TestUser extends BaseEntity {
  [EntityRepositoryType]?: TestUserRepository;

  @PrimaryKey()
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'integer', default: 0 })
  age!: number;

  @Property({ type: 'boolean', default: true })
  isActive?: boolean = true;

  @Property({ type: 'string', nullable: true })
  bio?: string;

  @Property({ onCreate: () => new Date() })
  createdAt?: Date = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt?: Date = new Date();
}
