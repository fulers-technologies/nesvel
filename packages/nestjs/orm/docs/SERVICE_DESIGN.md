# BaseService Design - Enterprise Service Layer

## Recommendation: Comprehensive Service Methods

Based on analysis of Laravel (Eloquent), Magento 2 (Service Contracts), NestJS best practices, and MikroORM patterns, here's my recommendation for a production-ready service layer:

## Philosophy: **Lean Service, Rich Repository**

### Key Principle

The service layer should focus on **business logic**, **validation**, **transaction orchestration**, and **cross-entity operations**. The repository handles data access.

### Recommended Approach

**Keep these in Service:**

1. Business logic methods (e.g., `activateUser()`, `processOrder()`)
2. Cross-entity operations (e.g., `transferUserData()`)
3. Complex validation before persistence
4. Transaction orchestration for multi-step operations
5. Event dispatching / side effects
6. DTO transformation

**Delegate to Repository:**

1. All CRUD operations (`findAll`, `findById`, `create`, `update`, `delete`)
2. Query building (`where`, `orderBy`, `limit`)
3. Aggregations (`count`, `sum`, `avg`)
4. Pagination
5. Bulk operations

## Recommended Service Structure

```typescript
export abstract class BaseService<T extends BaseEntity> {
  // Core service responsibilities:

  // 1. Repository access
  getRepository(): BaseRepository<T>;

  // 2. Transaction orchestration (not in repository)
  transaction<R>(callback): Promise<R>;

  // 3. Validation layer
  validate(data): Promise<ValidationResult>;

  // 4. Event hooks (before/after operations)
  beforeCreate(data): Promise<void>;
  afterCreate(entity): Promise<void>;
  beforeUpdate(entity, data): Promise<void>;
  afterUpdate(entity): Promise<void>;
  beforeDelete(entity): Promise<void>;
  afterDelete(id): Promise<void>;

  // 5. DTO transformation
  toDto(entity): DTO;
  fromDto(dto): EntityData;

  // 6. Business logic helpers
  // Custom methods per service implementation
}
```

## What NOT to Include in Service

❌ **Don't duplicate repository methods** like:

- `findAll()` - Use `service.getRepository().findAll()`
- `findById()` - Use `service.getRepository().findById()`
- `create()` - Use `service.getRepository().create()`
- `count()` - Use `service.getRepository().count()`

This creates:

- Code duplication
- Maintenance burden
- Confusion about which layer to use
- Unnecessary abstraction

## Real-World Comparison

### Laravel (Eloquent + Service)

Laravel uses Eloquent models that ARE repositories. Services are for business logic only:

```php
// UserService.php
class UserService {
    public function registerUser(array $data): User {
        // Business logic
        DB::transaction(function () use ($data) {
            $user = User::create($data);  // Model/Repository
            $user->sendWelcomeEmail();    // Business logic
            event(new UserRegistered($user));
            return $user;
        });
    }
}

// Controller uses Model directly for simple CRUD
User::find($id);
User::where('email', $email)->first();
```

### Magento 2 (Service Contracts)

Magento has service interfaces for business operations, repositories for data:

```php
// UserRepositoryInterface - Data access
interface UserRepositoryInterface {
    public function getById($id);
    public function save(UserInterface $user);
    public function delete(UserInterface $user);
}

// UserManagementInterface - Business logic
interface UserManagementInterface {
    public function createAccount(UserInterface $user);
    public function validateUserData(UserInterface $user);
    public function changePassword($userId, $newPassword);
}
```

### NestJS Best Practices

Controllers → Services (business logic) → Repositories (data access)

```typescript
// user.repository.ts - Data access
@Injectable()
class UserRepository {
  findAll() {}
  findById() {}
  create() {}
}

// user.service.ts - Business logic
@Injectable()
class UserService {
  constructor(private repo: UserRepository) {}

  async registerUser(dto: CreateUserDto) {
    // Validation
    await this.validateEmail(dto.email);

    // Business logic
    const user = await this.repo.create(dto);
    await this.emailService.sendWelcome(user);

    return user;
  }
}
```

## Recommended Implementation

### Option 1: Minimal Service (RECOMMENDED)

```typescript
@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly repository: BaseRepository<T>;
  protected readonly em: EntityManager;
  protected readonly entityName: string;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
    this.em = repository.getEntityManager();
    this.entityName = repository.getEntityName();
  }

  /**
   * Get repository for direct data access
   */
  getRepository(): BaseRepository<T> {
    return this.repository;
  }

  /**
   * Execute operations in a transaction
   */
  async transaction<R>(callback: (em: EntityManager) => Promise<R>): Promise<R> {
    return this.em.transactional(callback);
  }

  /**
   * Lifecycle hook: Before entity creation
   * Override in subclasses for custom validation/logic
   */
  protected async beforeCreate(data: Partial<T>): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: After entity creation
   */
  protected async afterCreate(entity: T): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: Before entity update
   */
  protected async beforeUpdate(entity: T, data: Partial<T>): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: After entity update
   */
  protected async afterUpdate(entity: T): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: Before entity deletion
   */
  protected async beforeDelete(entity: T): Promise<void> {
    // Override in subclass
  }

  /**
   * Lifecycle hook: After entity deletion
   */
  protected async afterDelete(id: any): Promise<void> {
    // Override in subclass
  }
}
```

### Option 2: Convenience Wrapper (If you prefer convenience)

If you want convenience methods without duplication, use delegation:

```typescript
export abstract class BaseService<T extends BaseEntity> {
  // ... core methods from Option 1 ...

  // Convenience delegations (clearly documented as proxies)

  /**
   * Convenience method - delegates to repository.findAll()
   * @see BaseRepository.findAll
   */
  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  /**
   * Convenience method - delegates to repository.findById()
   * @see BaseRepository.findById
   */
  async findById(id: Primary<T>): Promise<T | null> {
    return this.repository.findById(id);
  }

  // etc...
}
```

## My Final Recommendation

### For Nesvel, Use: **Option 1 - Minimal Service**

**Reasons:**

1. ✅ **Clear separation**: Repository = data, Service = business logic
2. ✅ **No duplication**: Single source of truth for data operations
3. ✅ **Flexibility**: Consumers can choose repository OR service
4. ✅ **Maintainability**: One place to update data access methods
5. ✅ **Type safety**: Direct repository access maintains all type information
6. ✅ **Discovery**: IDE autocomplete shows all repository methods
7. ✅ **Testing**: Easy to mock either repository or service

**Usage Pattern:**

```typescript
// Simple CRUD - use repository directly
const user = await userService.getRepository().findById(1);
const users = await userService
  .getRepository()
  .where({ age: { $gte: 18 } })
  .get();

// Business logic - use service
await userService.registerNewUser(dto);
await userService.promoteToAdmin(userId);
```

### Methods to Include in Service

✅ **Core Service Methods:**

- `getRepository()` - Access to repository
- `transaction()` - Transaction management
- Lifecycle hooks (`beforeCreate`, `afterCreate`, etc.)

✅ **Add if Needed:**

- `validate()` - Validation layer
- `toDto()` / `fromDto()` - DTO transformation
- Domain-specific business logic methods

❌ **Don't Include:**

- Any method that just calls `this.repository.method()` with no logic
- CRUD operations without business rules
- Query building methods

## Migration Path

For your current commented methods:

```typescript
// ❌ Remove these (use repository instead)
// findAll() → service.getRepository().findAll()
// findOne() → service.getRepository().findById()
// count() → service.getRepository().count()
// create() → service.getRepository().create()
// update() → service.getRepository().update()
// delete() → service.getRepository().delete()

// ✅ Keep these (business logic)
// transaction() - Orchestration
// beforeCreate/afterCreate - Lifecycle hooks
// Custom business methods per service
```

## Examples of Good Service Methods

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

  // ✅ Good - Business logic with multiple operations
  async registerUser(dto: RegisterDto): Promise<User> {
    return this.transaction(async (em) => {
      // Validate
      await this.validateUniqueEmail(dto.email);

      // Create user
      const user = this.repository.create({
        ...dto,
        emailVerified: false,
        registeredAt: new Date(),
      });
      await em.flush();

      // Business logic / side effects
      await this.emailService.sendVerification(user);
      this.eventBus.emit('user.registered', user);

      this.logger.log(`User registered: ${user.email}`);
      return user;
    });
  }

  // ✅ Good - Domain-specific validation
  async validateUniqueEmail(email: string): Promise<void> {
    const exists = await this.repository.exists({ email });
    if (exists) {
      throw ConflictException.make('Email already registered');
    }
  }

  // ✅ Good - Complex business operation
  async promoteToAdmin(userId: number): Promise<User> {
    const user = await this.repository.findByIdOrFail(userId);

    // Business rules
    if (user.emailVerified === false) {
      throw BadRequestException.make('Email must be verified');
    }

    await this.beforeUpdate(user, { role: 'admin' });
    user.role = 'admin';
    await this.repository.save(user);
    await this.afterUpdate(user);

    return user;
  }

  // ❌ Bad - Just delegates without logic
  async findById(id: number): Promise<User> {
    return this.repository.findById(id); // Unnecessary
  }
}
```

## Conclusion

**Remove all commented methods from the interface that duplicate repository functionality.**

Keep the service layer lean and focused on business logic. Let the rich repository handle all data access.
