import 'reflect-metadata';
import { BaseRepository } from '@/repositories/base.repository';
import { BaseEntity } from '@/entities/base.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/core';

// Test entity for repository testing
@Entity()
class TestUser extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  email!: string;
}

class TestUserRepository extends BaseRepository<TestUser> {
  constructor() {
    // Create proper mocks
    const mockEM = {
      persist: jest.fn(),
      flush: jest.fn(),
      persistAndFlush: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      nativeUpdate: jest.fn(),
      nativeDelete: jest.fn(),
      transactional: jest.fn(),
    } as any as EntityManager;

    const mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findAndCount: jest.fn(),
      getEntityName: jest.fn(() => 'TestUser'),
    } as any as EntityRepository<TestUser>;

    super(mockEM, mockRepo);
  }

  // Add missing methods expected by tests
  async findByEmail(email: string): Promise<TestUser | null> {
    // Mock implementation
    return null;
  }

  async findActiveUsers(): Promise<TestUser[]> {
    return [];
  }

  scopeActive() {
    return this;
  }

  // Add createQueryBuilder mock
  createQueryBuilder(alias: string) {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getResult: jest.fn().mockResolvedValue([]),
      getSingleResult: jest.fn().mockResolvedValue(null),
      getCount: jest.fn().mockResolvedValue(0),
    };
  }
}

class MockUserRepository extends BaseRepository<any> {
  constructor() {
    // Create proper mocks
    const mockEM = {
      persist: jest.fn(),
      flush: jest.fn(),
      persistAndFlush: jest.fn(),
      remove: jest.fn(),
      removeAndFlush: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      nativeUpdate: jest.fn(),
      nativeDelete: jest.fn(),
      transactional: jest.fn(),
    } as any as EntityManager;

    const mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findAndCount: jest.fn(),
      getEntityName: jest.fn(() => 'TestUser'),
    } as any as EntityRepository<any>;

    super(mockEM, mockRepo);
  }

  async findActiveUsers() {
    return this.createQueryBuilder('user').where({ status: 'active' }).getResult();
  }

  scopeActive(query: any) {
    return query.where({ status: 'active' });
  }

  // Add createQueryBuilder mock
  createQueryBuilder(alias: string) {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getResult: jest.fn().mockResolvedValue([]),
      getSingleResult: jest.fn().mockResolvedValue(null),
      getCount: jest.fn().mockResolvedValue(0),
    };
  }
}

describe('Repository', () => {
  let repository: MockUserRepository;

  beforeEach(() => {
    repository = MockUserRepository.make();
  });

  describe('basic repository functionality', () => {
    it('should create repository instance', () => {
      expect(repository).toBeDefined();
      expect(repository).toBeInstanceOf(BaseRepository);
    });

    it('should have custom query methods', () => {
      expect(repository.findActiveUsers).toBeDefined();
      expect(typeof repository.findActiveUsers).toBe('function');
    });

    it('should have scope methods', () => {
      expect(repository.scopeActive).toBeDefined();
      expect(typeof repository.scopeActive).toBe('function');
    });
  });

  describe('query building', () => {
    it('should build basic queries', () => {
      const query = repository.createQueryBuilder('user');
      expect(query).toBeDefined();
    });
  });
});
