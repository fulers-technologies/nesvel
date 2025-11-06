import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@nesvel/nestjs-orm';

import { TestUser } from '@/entities/test-user.entity';

/**
 * Test User Repository
 *
 * Repository for managing test user entities.
 * Extends BaseRepository to inherit all CRUD, query, and utility methods.
 *
 * @remarks
 * This repository demonstrates how to extend BaseRepository for specific entities.
 * It inherits all 42 methods from BaseRepository without needing to reimplement them.
 */
@Injectable()
export class TestUserRepository extends BaseRepository<TestUser> {}
