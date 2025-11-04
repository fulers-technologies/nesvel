# Migration Guide: Updated Seeding System

This guide explains the changes made to align the seeding and factory system with MikroORM's official documentation.

## Summary of Changes

The seeding system has been refactored to follow MikroORM's official patterns more closely while maintaining backwards compatibility where possible.

---

## Key Changes

### 1. BaseFactory

**Before:**

```typescript
export class UserFactory extends BaseFactory<User> {
  protected entity = User; // ❌ Wrong property name

  protected definition(): Partial<User> {
    // ...
  }
}
```

**After:**

```typescript
export class UserFactory extends BaseFactory<User> {
  model = User; // ✅ Correct: public readonly property

  protected definition(): EntityData<User> {
    // ✅ Returns EntityData<User> instead of Partial<User>
  }
}
```

**Changes:**

- ✅ Property renamed from `entity` to `model`
- ✅ Visibility changed from `protected` to public (matches MikroORM)
- ✅ Return type changed to `EntityData<T>` for type safety
- ✅ Added `faker` property for data generation
- ✅ Removed custom state management (use MikroORM's `.each()` instead)

### 2. BaseSeeder

**Before:**

```typescript
export class UserSeeder extends BaseSeeder {
  constructor(
    entityManager: EntityManager,
    factoryManager: FactoryManager,
    context: ISeederContext,
  ) {
    super(entityManager, factoryManager, context);
  }

  async run(): Promise<void> {
    // Custom implementation
  }
}
```

**After:**

```typescript
export class UserSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // ✅ EntityManager passed as parameter (MikroORM standard)
  }
}
```

**Changes:**

- ✅ No constructor needed - extends MikroORM's `Seeder` directly
- ✅ `run()` method receives `EntityManager` as parameter
- ✅ Added utility methods: `exists()`, `createIfNotExists()`, `truncate()`, `call()`
- ✅ Added `faker` property for data generation
- ✅ Removed custom lifecycle hooks (use MikroORM's transaction support)

### 3. Factory Usage

**Before:**

```typescript
const users = await this.factoryManager.createMany(User, 10);
```

**After:**

```typescript
const userFactory = new UserFactory(em);
const users = await userFactory.create(10);
```

**Available Methods:**

- `makeOne(attrs?)` - Create single entity (not persisted)
- `make(count, attrs?)` - Create multiple entities (not persisted)
- `createOne(attrs?)` - Create and persist single entity
- `create(count, attrs?)` - Create and persist multiple entities
- `each(callback)` - Apply logic to each entity before creation

---

## Migration Steps

### Step 1: Update Existing Factories

1. Rename `entity` property to `model`:

```typescript
// Before
protected entity = User;

// After
model = User;
```

2. Update `definition()` return type:

```typescript
// Before
protected definition(): Partial<User> {

// After
protected definition(): EntityData<User> {
```

3. Remove `@Injectable()` decorator (not needed):

```typescript
// Before
@Injectable()
export class UserFactory extends BaseFactory<User> {

// After
export class UserFactory extends BaseFactory<User> {
```

### Step 2: Update Existing Seeders

1. Update `run()` method signature:

```typescript
// Before
async run(): Promise<void> {
  const users = await this.entityManager.find(User, {});
}

// After
async run(em: EntityManager): Promise<void> {
  const users = await em.find(User, {});
}
```

2. Update factory usage:

```typescript
// Before
const users = await this.factoryManager.createMany(User, 10);

// After
const userFactory = new UserFactory(em);
const users = await userFactory.create(10);
```

3. Use utility methods:

```typescript
// Check if data exists (idempotent seeding)
if (await this.exists(em, User)) {
  return;
}

// Create if not exists
const admin = await this.createIfNotExists(
  em,
  User,
  { email: 'admin@example.com' },
  { email: 'admin@example.com', role: 'admin' },
);

// Call other seeders
await this.call(em, [RoleSeeder, PermissionSeeder]);
```

### Step 3: Update CLI Commands

The CLI commands remain the same but now use MikroORM's native seeding:

```bash
# Generate factory
bun orm make:factory User

# Generate seeder
bun orm make:seeder User

# Run seeders
bun mikro-orm seeder:run

# Run specific seeder
bun mikro-orm seeder:run --class=UserSeeder
```

---

## Example: Complete Migration

### Before

**UserFactory (Old):**

```typescript
import { Injectable } from '@nestjs/common';
import { BaseFactory } from '@nesvel/nestjs-orm';
import { User } from './entities/user.entity';

@Injectable()
export class UserFactory extends BaseFactory<User> {
  protected entity = User;

  protected definition(): Partial<User> {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
    };
  }
}
```

**UserSeeder (Old):**

```typescript
import { BaseSeeder } from '@nesvel/nestjs-orm';
import { User } from './entities/user.entity';

export class UserSeeder extends BaseSeeder {
  async run(): Promise<void> {
    const users = await this.factoryManager.createMany(User, 10);
  }
}
```

### After

**UserFactory (New):**

```typescript
import { EntityData } from '@mikro-orm/core';
import { BaseFactory } from '@nesvel/nestjs-orm';
import { User } from './entities/user.entity';

export class UserFactory extends BaseFactory<User> {
  model = User;

  protected definition(): EntityData<User> {
    return {
      name: this.faker.person.fullName(),
      email: this.faker.internet.email(),
    };
  }
}
```

**UserSeeder (New):**

```typescript
import { EntityManager } from '@mikro-orm/core';
import { BaseSeeder } from '@nesvel/nestjs-orm';
import { User } from './entities/user.entity';
import { UserFactory } from './factories/user.factory';

export class UserSeeder extends BaseSeeder {
  async run(em: EntityManager): Promise<void> {
    // Idempotent seeding
    if (await this.exists(em, User)) {
      return;
    }

    // Use factory
    const userFactory = new UserFactory(em);
    const users = await userFactory.create(10);
  }
}
```

---

## Benefits of the Update

1. **Standards Compliance** - Now follows MikroORM's official patterns
2. **Better Type Safety** - Uses `EntityData<T>` for stricter typing
3. **Simpler API** - No custom decorators or managers needed
4. **Better Documentation** - Examples match official MikroORM docs
5. **Idempotent Seeders** - Built-in utility methods for safe re-running
6. **Faker Integration** - Available in both factories and seeders via `this.faker`

---

## Breaking Changes

### Removed Features

1. **Custom State Management** - Use MikroORM's `.each()` method instead:

```typescript
// Before (custom states)
const admin = await UserFactory.state('admin').create();

// After (use .each())
const admin = await new UserFactory(em)
  .each((user) => {
    user.role = 'admin';
  })
  .createOne();
```

2. **FactoryManager** - Instantiate factories directly:

```typescript
// Before
await this.factoryManager.create(User, attributes);

// After
await new UserFactory(em).createOne(attributes);
```

3. **Seeder Lifecycle Hooks** - Use MikroORM's transaction support:

```typescript
// MikroORM handles transactions automatically
async run(em: EntityManager): Promise<void> {
  // All operations in this method run in a transaction by default
}
```

---

## Support

For questions or issues with the migration:

- Review the [SEEDING.md](./SEEDING.md) documentation
- Check [MikroORM's official seeding docs](https://mikro-orm.io/docs/seeding)
- Refer to the examples in `apps/api/src/seeders/`
