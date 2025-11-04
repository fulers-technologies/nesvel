# Seeding & Factories

Complete guide for database seeding and factory usage with MikroORM in Nesvel.

## Table of Contents

- [Overview](#overview)
- [Factories](#factories)
- [Seeders](#seeders)
- [CLI Commands](#cli-commands)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

Nesvel's ORM package provides Laravel-inspired seeding and factory patterns that work seamlessly with MikroORM's native seeding system.

### Architecture

- **BaseFactory** - Extends MikroORM's `Factory` class with Faker.js integration
- **BaseSeeder** - Extends MikroORM's `Seeder` class with utility methods
- **Faker.js** - Available in both factories and seeders for realistic data generation

---

## Factories

### Creating a Factory

Generate a factory using the CLI:

```bash
bun orm make:factory User --path=src/modules/user/factories
```

### Basic Factory Structure

```typescript
import { BaseFactory } from '@nesvel/nestjs-orm';
import { User } from '@/entities/user.entity';

export class UserFactory extends BaseFactory<User> {
  /**
   * The entity class this factory creates
   */
  protected model = User;

  /**
   * Define the default state for the entity
   */
  protected definition(): Partial<User> {
    return {
      name: this.faker.person.fullName(),
      email: this.faker.internet.email(),
      password: this.faker.internet.password(),
      isActive: true,
      createdAt: new Date(),
    };
  }
}
```

### Using Factories

#### In Seeders (Recommended)

```typescript
import { EntityManager } from '@mikro-orm/core';
import { BaseSeeder } from '@nesvel/nestjs-orm';
import { User } from '@/entities/user.entity';
import { UserFactory } from '@/factories/user.factory';

export class UserSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // Instantiate factory (two ways)
    const userFactory = new UserFactory(em);
    // or using static method:
    const userFactory2 = UserFactory.make(em);

    // Create single user
    const user = userFactory.makeOne();
    await em.persist(user).flush();

    // Create multiple users
    const users = userFactory.make(10);
    await em.persist(users).flush();

    // Create with custom attributes
    const admin = userFactory.makeOne({
      email: 'admin@example.com',
      role: 'admin',
    });
    await em.persist(admin).flush();
  }
}
```

#### Programmatic Usage

```typescript
import { EntityManager } from '@mikro-orm/core';
import { UserFactory } from './factories/user.factory';

// In a service or test
const factory = new UserFactory(em);

// Make without persisting
const user = factory.makeOne({ email: 'test@example.com' });

// Create and persist
const persistedUser = await factory.createOne({ email: 'test@example.com' });

// Create multiple
const users = await factory.create(10);
```

### Factory Methods

| Method                  | Description                          | Persists? |
| ----------------------- | ------------------------------------ | --------- |
| `makeOne(attrs?)`       | Create single entity                 | No        |
| `make(count, attrs?)`   | Create multiple entities             | No        |
| `createOne(attrs?)`     | Create and persist single entity     | Yes       |
| `create(count, attrs?)` | Create and persist multiple entities | Yes       |
| `each(callback)`        | Apply callback to each entity        | Depends   |

### Advanced Factory Features

#### Using Sequences

```typescript
protected definition(): Partial<User> {
  return {
    email: this.faker.internet.email(),
    name: this.faker.person.fullName(),
    // Use sequence for unique values
    username: `user_${this.faker.number.int({ min: 1000, max: 9999 })}`,
  };
}
```

#### Relationships

```typescript
// In UserFactory
async run(em: EntityManager): Promise<void> {
  // Create user with posts
  const postFactory = new PostFactory(em);
  const user = new UserFactory(em).makeOne();
  const posts = postFactory.make(3, { author: user });

  await em.persist([user, ...posts]).flush();
}
```

---

## Seeders

### Creating a Seeder

Generate a seeder using the CLI:

```bash
bun orm make:seeder User --path=src/seeders
```

### Basic Seeder Structure

```typescript
import { EntityManager } from '@mikro-orm/core';
import { BaseSeeder } from '@nesvel/nestjs-orm';
import { User } from '@/entities/user.entity';

export class UserSeeder extends BaseSeeder {
  /**
   * Run the database seeder
   */
  async run(em: EntityManager): Promise<void> {
    // Check if data already exists (idempotent)
    if (await this.exists(em, User)) {
      return;
    }

    // Create seed data
    const admin = em.create(User, {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    });

    await em.persist(admin).flush();
  }
}
```

### Seeder Utility Methods

#### `exists(em, EntityClass, criteria?)`

Check if records exist (for idempotent seeding):

```typescript
if (await this.exists(em, User)) {
  return; // Skip if users already exist
}

// With criteria
if (await this.exists(em, User, { email: 'admin@example.com' })) {
  return;
}
```

#### `createIfNotExists(em, EntityClass, criteria, attributes)`

Create entity only if it doesn't exist:

```typescript
const admin = await this.createIfNotExists(
  em,
  User,
  { email: 'admin@example.com' },
  { email: 'admin@example.com', name: 'Admin', role: 'admin' },
);
```

#### `truncate(em, EntityClass)`

Delete all records (use with caution):

```typescript
await this.truncate(em, User); // Deletes ALL users
```

#### `call(em, [Seeder1, Seeder2])`

Run other seeders (composition):

```typescript
async run(em: EntityManager): Promise<void> {
  // Run dependencies first
  await this.call(em, [RoleSeeder, PermissionSeeder]);

  // Now create users
  // ...
}
```

#### `faker`

Access Faker.js for generating data:

```typescript
const user = em.create(User, {
  name: this.faker.person.fullName(),
  email: this.faker.internet.email(),
  bio: this.faker.lorem.paragraph(),
});
```

#### `getEnvironment()` / `isProduction()`

Check current environment:

```typescript
if (this.isProduction()) {
  return; // Skip in production
}

if (this.getEnvironment() === 'testing') {
  // Create test-specific data
}
```

---

## CLI Commands

### Factory Commands

```bash
# Generate factory
bun orm make:factory User
bun orm make:factory Product --path=src/modules/product/factories

# Generate factory with custom name
bun orm make:factory UserFactory
```

### Seeder Commands

```bash
# Generate seeder
bun orm make:seeder User
bun orm make:seeder DatabaseSeeder

# Run all seeders
bun orm db:seed

# Run specific seeder class
bun orm db:seed --class=UserSeeder

# List available seeders
bun orm db:seed:list

# Rollback seeders (if implemented)
bun orm db:seed:rollback

# Refresh (rollback + reseed)
bun orm db:seed:refresh
```

---

## Best Practices

### 1. Idempotent Seeders

Always check if data exists before creating:

```typescript
async run(em: EntityManager): Promise<void> {
  if (await this.exists(em, User)) {
    return; // Already seeded
  }
  // Create data...
}
```

### 2. Use Factories in Seeders

Combine factories with seeders for realistic data:

```typescript
async run(em: EntityManager): Promise<void> {
  const userFactory = new UserFactory(em);
  const users = userFactory.make(50);
  await em.persist(users).flush();
}
```

### 3. Seeder Ordering

Use the `call()` method for dependencies:

```typescript
export class DatabaseSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [
      RoleSeeder,
      PermissionSeeder,
      UserSeeder, // Depends on roles
      PostSeeder, // Depends on users
    ]);
  }
}
```

### 4. Environment-Specific Seeding

```typescript
async run(em: EntityManager): Promise<void> {
  // Production-safe data
  await this.createIfNotExists(em, Role, { name: 'admin' }, { name: 'admin' });

  // Only in development/testing
  if (!this.isProduction()) {
    const userFactory = new UserFactory(em);
    await em.persist(userFactory.make(100)).flush();
  }
}
```

### 5. Transaction Support

Seeders run in transactions by default (via MikroORM). Flush after batches for performance:

```typescript
async run(em: EntityManager): Promise<void> {
  const batchSize = 100;
  const total = 1000;

  for (let i = 0; i < total; i += batchSize) {
    const users = new UserFactory(em).make(batchSize);
    await em.persist(users).flush();
    em.clear(); // Clear identity map for memory efficiency
  }
}
```

---

## Examples

### Complete User Seeding Example

```typescript
import { EntityManager } from '@mikro-orm/core';
import { BaseSeeder } from '@nesvel/nestjs-orm';
import { User } from '@/entities/user.entity';
import { UserFactory } from '@/factories/user.factory';

export class UserSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // Skip if users already exist
    if (await this.exists(em, User)) {
      return;
    }

    // Create admin user (always)
    const admin = await this.createIfNotExists(
      em,
      User,
      { email: 'admin@example.com' },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        password: 'hashed_password',
      },
    );

    // Create test users (only in dev/test)
    if (!this.isProduction()) {
      const userFactory = new UserFactory(em);

      // Create 10 regular users
      const users = userFactory.make(10, { role: 'user' });
      await em.persist(users).flush();

      // Create 5 moderators
      const moderators = userFactory.make(5, { role: 'moderator' });
      await em.persist(moderators).flush();
    }
  }
}
```

### Multi-Entity Seeding with Relationships

```typescript
export class BlogSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // Seed dependencies first
    await this.call(em, [UserSeeder, CategorySeeder]);

    // Get users for post authors
    const users = await em.find(User, {});
    const categories = await em.find(Category, {});

    // Create posts with relationships
    const postFactory = new PostFactory(em);

    for (const user of users) {
      const posts = postFactory.make(5, {
        author: user,
        category: this.faker.helpers.arrayElement(categories),
      });
      await em.persist(posts).flush();
    }
  }
}
```

### Database Seeder (Master Seeder)

```typescript
export class DatabaseSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // Run all seeders in order
    await this.call(em, [
      // Foundation data (always run)
      RoleSeeder,
      PermissionSeeder,

      // Core data
      UserSeeder,
      CategorySeeder,

      // Content (depends on users and categories)
      PostSeeder,
      CommentSeeder,

      // Analytics (only in non-production)
      ...(this.isProduction() ? [] : [AnalyticsSeeder]),
    ]);
  }
}
```

---

## MikroORM Compatibility

This implementation fully extends MikroORM's native seeding system:

- **BaseFactory** extends `@mikro-orm/seeder/Factory`
- **BaseSeeder** extends `@mikro-orm/seeder/Seeder`
- Compatible with all MikroORM seeder commands
- Works with MikroORM's transaction management
- Integrates with MikroORM's CLI

---

## Additional Resources

- [MikroORM Seeding Documentation](https://mikro-orm.io/docs/seeding)
- [MikroORM Factory Documentation](https://mikro-orm.io/docs/seeding#using-entity-factories)
- [Faker.js Documentation](https://fakerjs.dev/)
