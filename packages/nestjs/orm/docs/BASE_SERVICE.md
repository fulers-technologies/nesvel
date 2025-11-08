# BaseService - Full Implementation

## Overview

The `BaseService` class provides a comprehensive service layer that delegates all CRUD operations to the repository while providing a convenient, unified API for business logic.

## Features

### ✅ Complete CRUD Operations (30+ methods)

All data operations are delegated to `BaseRepository` for consistency and maintainability.

### ✅ Transaction Management

Built-in transaction support for complex, multi-step operations.

### ✅ No Lifecycle Hooks

Lifecycle management is handled by MikroORM subscribers, keeping the service clean.

### ✅ Extensible

Easy to override methods or add custom business logic in subclasses.

## Method Categories

### 1. Core Service Methods (2 methods)

- `getRepository()` - Access underlying repository
- `transaction()` - Execute operations in transaction

### 2. Read Operations (9 methods)

- `findAll()` - Find all entities
- `findById()` - Find by primary key
- `findByIdOrFail()` - Find by ID or throw
- `findOne()` - Find single by criteria
- `findOneOrFail()` - Find one or throw
- `find()` - Find many by criteria
- `findByIds()` - Find by multiple IDs
- `first()` - Get first entity
- `all()` - Get all (alias for findAll)

### 3. Count & Existence (2 methods)

- `count()` - Count entities
- `exists()` - Check existence

### 4. Create Operations (2 methods)

- `create()` - Create single entity
- `createMany()` - Create multiple entities

### 5. Update Operations (3 methods)

- `update()` - Update by ID
- `updateMany()` - Update by criteria
- `upsert()` - Insert or update

### 6. Delete Operations (2 methods)

- `delete()` - Delete by ID
- `deleteMany()` - Delete by criteria

### 7. Aggregations (4 methods)

- `sum()` - Sum numeric field
- `avg()` - Average of field
- `min()` - Minimum value
- `max()` - Maximum value

### 8. Pagination (2 methods)

- `paginateSimple()` - Simple pagination
- `paginate()` - Advanced pagination with nestjs-paginate

### 9. Utility Methods (4 methods)

- `fresh()` - Get fresh copy from DB
- `refresh()` - Refresh in place
- `chunk()` - Process in chunks
- `flush()` - Flush pending changes

## Total: 30+ Methods

## Usage Examples

### Basic CRUD Operations

```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) userRepository: BaseRepository<User>) {
    super(userRepository);
  }
}

// In controller or other service
const user = await userService.findById(1);
const users = await userService.findAll();
const newUser = await userService.create({ name: 'John', email: 'john@example.com' });
await userService.update(1, { name: 'Jane' });
await userService.delete(1);
```

### Transaction Example

```typescript
@Injectable()
export class OrderService extends BaseService<Order> {
  async processOrder(userId: number, items: CartItem[]): Promise<Order> {
    return this.transaction(async (em) => {
      // Find user
      const user = await em.findOne(User, userId);

      // Check balance
      if (user.balance < totalPrice) {
        throw BadRequestException.make('Insufficient balance');
      }

      // Deduct balance
      user.balance -= totalPrice;

      // Create order
      const order = em.create(Order, {
        userId,
        items,
        total: totalPrice,
        status: 'pending',
      });

      await em.flush();

      return order;
    });
  }
}
```

### Custom Business Logic

```typescript
@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) userRepository: BaseRepository<User>,
    private emailService: EmailService,
    private eventBus: EventBus,
  ) {
    super(userRepository);
  }

  /**
   * Register new user with email verification
   */
  async registerUser(dto: RegisterUserDto): Promise<User> {
    // Business validation
    await this.validateUniqueEmail(dto.email);

    // Create user using service method
    const user = await this.create({
      ...dto,
      emailVerified: false,
      registeredAt: new Date(),
    });

    // Business logic / side effects
    await this.emailService.sendVerificationEmail(user);
    this.eventBus.emit('user.registered', user);

    this.logger.log(`User registered: ${user.email}`);
    return user;
  }

  /**
   * Domain-specific validation
   */
  private async validateUniqueEmail(email: string): Promise<void> {
    const exists = await this.exists({ email });
    if (exists) {
      throw ConflictException.make('Email already registered');
    }
  }

  /**
   * Promote user to admin with business rules
   */
  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.findByIdOrFail(userId);

    // Business rules
    if (!user.emailVerified) {
      throw BadRequestException.make('Email must be verified first');
    }

    if (user.accountAge < 30) {
      throw BadRequestException.make('Account must be at least 30 days old');
    }

    // Update
    return this.update(userId, { role: 'admin' });
  }

  /**
   * Get active users with complex criteria
   */
  async getActiveUsers(): Promise<User[]> {
    return this.find({
      isActive: true,
      emailVerified: true,
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
  }
}
```

### Pagination Example

```typescript
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async listUsers(@Paginate() query: PaginateQuery) {
    return this.userService.paginate(query, {
      sortables: ['name', 'createdAt', 'email'],
      searchables: ['name', 'email'],
      defaultLimit: 20,
      maxLimit: 100,
    });
  }
}
```

### Aggregation Example

```typescript
async getUserStatistics() {
  const total = await this.userService.count();
  const active = await this.userService.count({ isActive: true });
  const avgAge = await this.userService.avg('age');
  const oldest = await this.userService.max('age');
  const youngest = await this.userService.min('age');

  return { total, active, avgAge, oldest, youngest };
}
```

### Chunk Processing Example

```typescript
async sendNewsletterToAllUsers() {
  await this.userService.chunk(1000, async (users) => {
    for (const user of users) {
      await this.emailService.sendNewsletter(user);
    }
    this.logger.log(`Sent newsletter to ${users.length} users`);
  });
}
```

## Direct Repository Access

For operations not covered by service methods or when you need repository-specific functionality:

```typescript
// Access fluent query builder
const users = await userService
  .getRepository()
  .where({ isActive: true })
  .orderBy({ createdAt: 'DESC' })
  .limit(10)
  .get();

// Access MikroORM QueryBuilder for complex queries
const repo = userService.getRepository();
const qb = repo.createQueryBuilder('u');
qb.select('*')
  .where({ age: { $gte: 18 } })
  .andWhere({ emailVerified: true });
const users = await qb.getResult();
```

## Best Practices

### ✅ Do

1. Use service methods for standard CRUD operations
2. Add custom business logic methods in service subclasses
3. Use `transaction()` for multi-step operations
4. Use `getRepository()` for complex queries or fluent builder
5. Keep business logic in services, data access in repositories

### ❌ Don't

1. Don't override delegated methods without good reason
2. Don't add lifecycle hooks (use subscribers instead)
3. Don't duplicate repository methods
4. Don't put data access logic in controllers

## Testing

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: BaseRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            // ... mock other methods
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = service.getRepository();
  });

  it('should create a user', async () => {
    const dto = { name: 'John', email: 'john@example.com' };
    jest.spyOn(repository, 'createAndFlush').mockResolvedValue(dto as any);

    const result = await service.create(dto);

    expect(repository.createAndFlush).toHaveBeenCalledWith(dto);
    expect(result).toEqual(dto);
  });
});
```

## Architecture Benefits

1. **Separation of Concerns**: Data access in repository, business logic in service
2. **Consistency**: All services follow the same pattern
3. **Testability**: Easy to mock either repository or service
4. **Maintainability**: Single source of truth for data operations
5. **Extensibility**: Easy to add custom methods per domain
6. **Type Safety**: Full TypeScript support throughout
7. **Flexibility**: Can use service methods or direct repository access

## Migration from Old Code

If you have existing code using the old service pattern:

```typescript
// Old pattern - service with lifecycle hooks
await userService.beforeCreate(data);
const user = await userService.create(data);
await userService.afterCreate(user);

// New pattern - use subscribers for lifecycle management
// Just call the service method, subscribers handle the rest
const user = await userService.create(data);
```

Subscribers will automatically handle all lifecycle events without cluttering the service layer.
