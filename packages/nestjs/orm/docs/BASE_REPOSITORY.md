# BaseRepository Implementation

## Overview

The `BaseRepository` class provides an enterprise-grade, Laravel Eloquent-inspired repository implementation for NestJS applications using MikroORM. It combines the power of MikroORM's advanced ORM features with an intuitive, fluent API for database operations.

## Features

### ✅ Implemented (42 Methods)

#### 1. Basic Retrieval Methods (5 methods)

- `all()` - Get all records
- `first()` - Get first record
- `findById(id)` - Find by primary key
- `findByIdOrFail(id)` - Find by ID or throw
- Inherited: `find()`, `findOne()`, `findOneOrFail()` from EntityRepository

#### 2. Fluent Query Building (6 methods)

- `where(conditions)` - Add WHERE conditions (chainable)
- `orderBy(orderBy)` - Add ORDER BY clause (chainable)
- `limit(limit)` - Limit results (chainable)
- `offset(offset)` - Skip results (chainable)
- `with(relations)` - Eager load relations (chainable)
- `get()` - Execute query and get results

#### 3. Create & Update Methods (5 methods)

- `createAndFlush(data)` - Create and persist entity
- `update(id, data)` - Update existing entity
- `delete(id)` - Delete entity by ID
- `save(entity)` - Save/persist entity
- Inherited: `create(data)` - Synchronous entity creation from EntityRepository

#### 4. Batch Operations (6 methods)

- `createMany(data[])` - Create multiple entities
- `insertMany(data[])` - Native batch insert (high performance)
- `updateMany(where, data)` - Update multiple entities
- `deleteMany(where)` - Delete multiple entities
- `upsert(data)` - Insert or update single entity
- `upsertMany(data[])` - Batch upsert

#### 5. Aggregate Functions (5 methods)

- `count(where?)` - Count entities
- `sum(field, where?)` - Sum numeric field
- `avg(field, where?)` - Average of numeric field
- `min(field, where?)` - Minimum value
- `max(field, where?)` - Maximum value

#### 6. Pagination (2 methods)

- `paginate(query, config)` - Advanced pagination with nestjs-paginate
- `paginateSimple(page, perPage)` - Simple pagination helper

#### 7. Transaction Support (2 methods)

- `transaction(callback)` - Execute operations in transaction
- `getEntityManager()` - Get underlying EntityManager

#### 8. Utility Methods (5 methods)

- `exists(where)` - Check if entity exists
- `chunk(size, callback)` - Process large datasets in chunks
- `fresh(entity)` - Get fresh copy from database
- `refresh(entity)` - Refresh entity in-place
- `truncate()` - Truncate table (⚠️ DANGER)

## Usage Examples

### Basic Retrieval

```typescript
// Get all users
const users = await userRepository.all();

// Get first user
const firstUser = await userRepository.first();

// Find by ID
const user = await userRepository.findById(1);

// Find with criteria
const activeUsers = await userRepository.find({ isActive: true });
```

### Fluent Query Building

```typescript
// Chain multiple conditions
const results = await userRepository
  .where({ isActive: true })
  .where({ emailVerified: true })
  .orderBy({ createdAt: 'DESC' })
  .limit(10)
  .offset(0)
  .get();

// With relations
const usersWithPosts = await userRepository
  .with(['posts', 'profile'])
  .where({ isActive: true })
  .get();
```

### Create & Update

```typescript
// Create single entity
const user = await userRepository.createAndFlush({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
});

// Update entity
const updated = await userRepository.update(userId, {
  age: 31,
});

// Delete entity
await userRepository.delete(userId);
```

### Batch Operations

```typescript
// Create many
const users = await userRepository.createMany([
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]);

// Update many
const affected = await userRepository.updateMany({ emailVerified: false }, { isActive: false });

// Delete many
const deleted = await userRepository.deleteMany({
  createdAt: { $lt: new Date('2023-01-01') },
});
```

### Aggregates

```typescript
// Count
const total = await userRepository.count();
const activeCount = await userRepository.count({ isActive: true });

// Sum
const totalRevenue = await orderRepository.sum('total');

// Average
const avgAge = await userRepository.avg('age');

// Min/Max
const minPrice = await productRepository.min('price');
const maxPrice = await productRepository.max('price');
```

### Pagination

```typescript
// Advanced pagination
const result = await userRepository.paginate(
  { page: 1, limit: 20, sortBy: [['createdAt', 'DESC']], search: 'john' },
  {
    sortables: ['name', 'createdAt', 'email'],
    searchables: ['name', 'email'],
    defaultLimit: 20,
    maxLimit: 100,
  },
);

// Simple pagination
const simple = await userRepository.paginateSimple(1, 20);
```

### Transactions

```typescript
const result = await userRepository.transaction(async (em) => {
  const user = await em.findOne(User, userId);
  user.balance -= 100;

  const order = em.create(Order, { userId, total: 100 });
  await em.flush();

  return { user, order };
});
// Automatically commits on success, rolls back on error
```

### Utilities

```typescript
// Check existence
const exists = await userRepository.exists({ email: 'john@example.com' });

// Process in chunks
await userRepository.chunk(1000, async (users) => {
  for (const user of users) {
    await emailService.send(user.email, 'Newsletter');
  }
});

// Fresh copy
const freshUser = await userRepository.fresh(user);

// Refresh
await userRepository.refresh(user);
```

## Creating Custom Repositories

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@nesvel/nestjs-orm';
import { User } from '@/entities/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  /**
   * Custom method: Find active users
   */
  async findActiveUsers(): Promise<User[]> {
    return this.find({ isActive: true });
  }

  /**
   * Custom scope: Active users
   */
  scopeActive(): this {
    return this.where({ isActive: true });
  }

  /**
   * Custom scope: Verified users
   */
  scopeVerified(): this {
    return this.where({ emailVerified: true });
  }
}

// Usage with scopes
const users = await userRepository
  .scopeActive()
  .scopeVerified()
  .orderBy({ createdAt: 'DESC' })
  .limit(10)
  .get();
```

## Registering Repositories

### In Module

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
```

### In Service

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getActiveUsers() {
    return this.userRepository.scopeActive().get();
  }
}
```

## Implementation Notes

### TypeScript Compatibility

Due to the complex generic signatures in MikroORM's `EntityRepository`, we don't use `implements IRepository<T>` directly. However, the `BaseRepository` class provides all methods defined in the interface and works correctly at runtime.

Methods inherited from `EntityRepository` (like `find()`, `findOne()`, `findOneOrFail()`) have their original sophisticated type signatures preserved.

### Method Naming

- `createAndFlush()` - Async create + persist (our addition)
- `create()` - Synchronous create (inherited from EntityRepository)

Use `createAndFlush()` when you want immediate persistence, or use `create()` + `em.flush()` for manual control.

### Performance Considerations

- `createMany()` - Creates entities and triggers hooks
- `insertMany()` - Native SQL INSERT, faster but no hooks
- `updateMany()` - Native SQL UPDATE, no hooks
- `deleteMany()` - Native SQL DELETE, no hooks

For high-volume operations, use the native methods (`insertMany`, `updateMany`, `deleteMany`).

### Query State Management

The fluent query builder maintains internal state that is automatically reset after calling `get()`. This means each query chain is isolated:

```typescript
const query1 = await repo.where({ isActive: true }).get();
const query2 = await repo.where({ age: { $gte: 18 } }).get();
// query2 does NOT include the isActive condition
```

## Testing

A comprehensive test endpoint is available at `/test-repository` in the API app that tests all 18 major repository operations across 9 sections.

## Documentation

- Full JSDoc documentation on all methods
- Inline examples in docblocks
- Type-safe operations with full TypeScript support

## Related Files

- Interface: `/packages/nestjs-orm/src/interfaces/repository.interface.ts`
- Implementation: `/packages/nestjs-orm/src/repositories/base.repository.ts`
- Test Repository: `/apps/api/src/repositories/test-user.repository.ts`
- Test Endpoint: `/apps/api/src/controllers/app.controller.ts` (`/test-repository`)

## Future Enhancements

Potential additions for future versions:

- Soft delete support (via mixins)
- Custom query builder extensions
- Cache integration
- Event hooks
- Audit logging
- Multi-tenancy support
