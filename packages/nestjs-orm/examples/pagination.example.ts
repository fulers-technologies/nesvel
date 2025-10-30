/**
 * Example: Using nestjs-paginate with BaseRepository
 *
 * This example demonstrates how to use the integrated nestjs-paginate
 * functionality with the BaseRepository for MikroORM entities.
 */

import { Controller, Get, Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { BaseRepository } from '../src/repositories/base.repository';
import { BaseEntity } from '../src/entities/base.entity';

// ============================================================================
// Example Entity
// ============================================================================

/**
 * Example User entity extending BaseEntity
 */
class User extends BaseEntity {
  name!: string;
  email!: string;
  isActive!: boolean;
  role!: string;
  createdAt!: Date;
}

// ============================================================================
// Example Repository
// ============================================================================

/**
 * Example User repository extending BaseRepository
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectRepository(User) repository: EntityRepository<User>, em: EntityManager) {
    super(em, repository);
  }
}

// ============================================================================
// Example Controller
// ============================================================================

/**
 * Example controller demonstrating pagination usage
 */
@Controller('users')
export class UsersController {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Basic pagination with all features enabled
   *
   * Supports:
   * - Pagination: ?page=1&limit=20
   * - Sorting: ?sortBy=createdAt:DESC&sortBy=name:ASC
   * - Search: ?search=john (searches in configured searchable columns)
   * - Filtering: ?filter.role=admin&filter.isActive=true
   */
  @Get()
  async getUsers(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository.paginate(query, {
      // Columns that can be sorted
      sortables: ['id', 'name', 'email', 'createdAt', 'role'],

      // Columns that will be searched when ?search= is used
      searchables: ['name', 'email'],

      // Default sort if none specified in query
      sortBy: [['createdAt', 'DESC']],

      // Maximum limit to prevent excessive data fetching
      maxLimit: 100,

      // Default limit if none specified
      defaultLimit: 20,
    });
  }

  /**
   * Pagination with minimal configuration (defaults only)
   *
   * Uses sensible defaults for limit and no sorting/searching
   */
  @Get('minimal')
  async getUsersMinimal(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository.paginate(query);
  }

  /**
   * Pagination with custom default sorting
   *
   * Always sorts by name ascending unless overridden in query
   */
  @Get('sorted')
  async getUsersSorted(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository.paginate(query, {
      sortables: ['name', 'email', 'createdAt'],
      sortBy: [['name', 'ASC']],
    });
  }

  /**
   * Pagination with query builder chaining
   *
   * Pre-filter results using query builder before pagination
   */
  @Get('active')
  async getActiveUsers(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository.where({ isActive: true }).paginate(query, {
      sortables: ['name', 'createdAt'],
      searchables: ['name', 'email'],
      sortBy: [['createdAt', 'DESC']],
      maxLimit: 50,
    });
  }

  /**
   * Pagination with eager loading relationships
   *
   * Load related entities to prevent N+1 queries
   */
  @Get('with-relations')
  async getUsersWithRelations(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository
      .with(['profile', 'posts']) // Eager load relations
      .paginate(query, {
        sortables: ['id', 'name', 'createdAt'],
        sortBy: [['createdAt', 'DESC']],
      });
  }
}

// ============================================================================
// Example Service Usage
// ============================================================================

/**
 * Example service demonstrating repository pagination usage
 */
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Get paginated users programmatically
   */
  async getPaginatedUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
  ): Promise<Paginated<User>> {
    // Build PaginateQuery object manually
    const query: PaginateQuery = {
      page,
      limit,
      search,
      sortBy: [['createdAt', 'DESC']],
      filter: {},
    };

    return this.userRepository.paginate(query, {
      sortables: ['name', 'email', 'createdAt'],
      searchables: ['name', 'email'],
      maxLimit: 100,
      defaultLimit: 20,
    });
  }

  /**
   * Get active admin users with pagination
   */
  async getActiveAdmins(query: PaginateQuery): Promise<Paginated<User>> {
    return this.userRepository
      .where({ isActive: true, role: 'admin' })
      .orderBy('createdAt', 'DESC')
      .paginate(query, {
        sortables: ['name', 'createdAt'],
        maxLimit: 50,
      });
  }
}

// ============================================================================
// Example Response Structure
// ============================================================================

/**
 * The paginate() method returns a Paginated<T> object with this structure:
 *
 * {
 *   data: [
 *     { id: 1, name: 'John Doe', email: 'john@example.com', ... },
 *     { id: 2, name: 'Jane Smith', email: 'jane@example.com', ... },
 *     ...
 *   ],
 *   meta: {
 *     itemsPerPage: 20,
 *     totalItems: 150,
 *     currentPage: 1,
 *     totalPages: 8,
 *     sortBy: [['createdAt', 'desc']],
 *     search: 'john',
 *     filter: { role: 'admin' }
 *   },
 *   links: {
 *     first: '?page=1&limit=20',
 *     previous: undefined,
 *     current: '?page=1&limit=20',
 *     next: '?page=2&limit=20',
 *     last: '?page=8&limit=20'
 *   }
 * }
 */

// ============================================================================
// Query Examples
// ============================================================================

/**
 * URL Query Examples:
 *
 * Basic pagination:
 * GET /users?page=1&limit=20
 *
 * With sorting (single):
 * GET /users?page=1&limit=20&sortBy=name:ASC
 *
 * With sorting (multiple):
 * GET /users?page=1&limit=20&sortBy=createdAt:DESC&sortBy=name:ASC
 *
 * With search:
 * GET /users?page=1&limit=20&search=john
 *
 * With filters:
 * GET /users?page=1&limit=20&filter.role=admin&filter.isActive=true
 *
 * Combined:
 * GET /users?page=2&limit=50&sortBy=createdAt:DESC&search=doe&filter.role=admin
 */
