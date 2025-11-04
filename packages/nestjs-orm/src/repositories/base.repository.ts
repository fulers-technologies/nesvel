import {
  wrap,
  Loaded,
  AnyEntity,
  FilterQuery,
  QueryOrderMap,
  EntityRepository,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';

import { BaseEntity } from '@/entities/base.entity';
import { SortDirection } from '@/enums/sort-direction.enum';
import type { IRepository } from '@/interfaces/repository.interface';

/**
 * Abstract Base Repository Class
 *
 * Provides a comprehensive Laravel Eloquent-inspired repository pattern implementation
 * for NestJS applications using MikroORM. This class acts as a thin layer on top of
 * EntityRepository, providing convenient methods while maintaining full access to
 * MikroORM's native functionality.
 *
 * Following MikroORM best practices, this repository:
 * - Extends functionality of EntityRepository without hiding it
 * - Uses native MikroORM methods for optimal performance
 * - Provides Laravel-like convenience methods for familiar API
 * - Supports both simple and complex query patterns
 *
 * Key Features:
 * - Full CRUD operations with Laravel-like method names
 * - Direct access to EntityRepository and EntityManager
 * - Built-in pagination support
 * - Soft delete support for entities that implement it
 * - Type-safe operations with full TypeScript support
 * - Method chaining for fluent queries
 *
 * @template Entity - The entity type this repository manages, must extend BaseEntity
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserRepository extends BaseRepository<User> {
 *   constructor(
 *     @InjectRepository(User) repository: EntityRepository<User>,
 *     em: EntityManager
 *   ) {
 *     super(em, repository);
 *   }
 *
 *   // Custom repository methods
 *   async findByEmail(email: string): Promise<User | null> {
 *     return this.findOne({ email });
 *   }
 * }
 * ```
 *
 * @see https://mikro-orm.io/docs/repositories
 * @author Nesvel Team
 * @since 1.0.0
 */
export abstract class BaseRepository<T extends BaseEntity>
  extends EntityRepository<T>
  implements IRepository<T>
{
  persist(entity: AnyEntity | AnyEntity[]): EntityManager {
    return this.em.persist(entity);
  }

  async persistAndFlush(entity: AnyEntity | AnyEntity[]): Promise<void> {
    await this.em.persistAndFlush(entity);
  }

  remove(entity: AnyEntity): EntityManager {
    return this.em.remove(entity);
  }

  async removeAndFlush(entity: AnyEntity): Promise<void> {
    await this.em.removeAndFlush(entity);
  }

  async flush(): Promise<void> {
    return this.em.flush();
  }
}
