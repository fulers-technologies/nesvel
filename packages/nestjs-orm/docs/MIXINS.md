# Entity Mixins (Traits)

The NestJS ORM package provides a powerful mixin system inspired by Laravel's
traits, allowing you to compose entities with different combinations of
functionality. This modular approach gives you fine-grained control over what
features each entity has.

## Available Mixins

### 1. HasTimestamps

Adds `createdAt` and `updatedAt` timestamp functionality.

**Properties Added:**

- `createdAt: Date` - When the entity was created
- `updatedAt: Date` - When the entity was last updated

**Methods Added:**

- `touch()` - Updates the updatedAt timestamp
- `wasCreatedRecently(minutes?: number)` - Check if created within X minutes
- `wasUpdatedRecently(minutes?: number)` - Check if updated within X minutes

**Usage:**

```typescript
import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from '@nesvel/nestjs-orm';
import { HasTimestamps } from '@nesvel/nestjs-orm';

@Entity()
export class Post extends HasTimestamps(BaseEntity) {
  @Property()
  title!: string;

  @Property()
  content!: string;
}
```

### 2. HasSoftDeletes

Adds soft delete functionality with `deletedAt` timestamp.

**Properties Added:**

- `deletedAt?: Date` - When the entity was soft deleted
- `isDeleted: boolean` (getter) - Whether entity is deleted
- `isTrashed: boolean` (getter) - Alias for isDeleted

**Methods Added:**

- `softDelete(timestamp?: Date)` - Soft delete the entity
- `delete(timestamp?: Date)` - Alias for softDelete
- `restore()` - Restore a soft deleted entity
- `wasDeletedRecently(minutes?: number)` - Check if deleted recently
- `getDeletedAt()` - Get deletion timestamp
- `isNotDeleted()` - Check if not deleted
- `setDeletedAt(timestamp: Date)` - Set deletion timestamp
- `clearDeletedAt()` - Clear deletion timestamp

**Usage:**

```typescript
@Entity()
@Filter({
  name: 'softDelete',
  cond: { deletedAt: { $eq: null } },
  default: true,
})
export class User extends HasSoftDeletes(HasTimestamps(BaseEntity)) {
  @Property()
  email!: string;
}

// Usage in service
const user = await userRepository.findOne(1);
user.softDelete(); // Sets deletedAt to current time
user.restore(); // Clears deletedAt
```

### 3. HasUserStamps

Tracks which user created and updated the entity.

**Properties Added:**

- `createdById?: number | string` - ID of creator
- `updatedById?: number | string` - ID of last updater
- `createdBy?: User` - Creator relationship (if UserEntity provided)
- `updatedBy?: User` - Last updater relationship (if UserEntity provided)

**Methods Added:**

- `setCreatedBy(user: User | number | string)` - Set creator
- `setUpdatedBy(user: User | number | string)` - Set updater
- `wasCreatedBy(user: User | number | string)` - Check creator
- `wasUpdatedBy(user: User | number | string)` - Check updater
- `getCreatedById()` - Get creator ID
- `getUpdatedById()` - Get updater ID
- `hasCreator()` - Check if has creator
- `hasUpdater()` - Check if has updater
- `clearCreator()` - Clear creator info
- `clearUpdater()` - Clear updater info

**Usage:**

```typescript
@Entity()
export class Document extends HasUserStamps(
  HasSoftDeletes(HasTimestamps(BaseEntity)),
  User, // User entity class for relationships
) {
  @Property()
  filename!: string;
}

// Usage in service
const doc = new Document();
doc.filename = 'report.pdf';
doc.setCreatedBy(currentUser);
```

### 4. HasUuid

Replaces numeric ID with UUID primary key.

**Properties Added:**

- `id: string` - UUID primary key (instead of number)

**Methods Added:**

- `getUuidVersion()` - Get UUID version
- `hasValidUuid()` - Validate current UUID
- `generateNewId(version?: 1 | 4)` - Generate new UUID
- `setId(uuid: string)` - Set custom UUID
- `getIdAsBuffer()` - Get as Buffer
- `hasId(uuid: string)` - Check if matches UUID
- `getShortId()` - Get first 8 characters
- `getCompactId()` - Get without dashes
- `getBase64Id()` - Get as base64

**Static Methods:**

- `generateUuid()` - Generate new UUID
- `isValidUuid(uuid: string)` - Validate UUID
- `uuidToBuffer(uuid: string)` - Convert to Buffer
- `bufferToUuid(buffer: Buffer)` - Convert from Buffer

**Usage:**

```typescript
@Entity()
export class Session extends HasUuid(HasTimestamps(BaseEntity)) {
  @Property()
  data!: string;
}

// Usage
const session = new Session();
console.log(session.id); // "550e8400-e29b-41d4-a716-446655440000"
console.log(session.getShortId()); // "550e8400"
```

## Combining Mixins

You can combine mixins by nesting them:

```typescript
// Combine timestamps + soft deletes + user stamps
@Entity()
export class Article extends HasUserStamps(HasSoftDeletes(HasTimestamps(BaseEntity)), User) {
  @Property()
  title!: string;
}

// UUID + all features
@Entity()
export class File extends HasUserStamps(HasSoftDeletes(HasTimestamps(HasUuid(BaseEntity))), User) {
  @Property()
  filename!: string;
}
```

## MixinFactory (Convenience API)

For common combinations, use the MixinFactory:

```typescript
import { MixinFactory } from '@nesvel/nestjs-orm';

// Just timestamps
@Entity()
export class Category extends MixinFactory.withTimestamps(BaseEntity) {
  @Property()
  name!: string;
}

// Timestamps + soft deletes
@Entity()
export class Tag extends MixinFactory.withTimestampsAndSoftDeletes(BaseEntity) {
  @Property()
  name!: string;
}

// All features (timestamps + soft deletes + user stamps)
@Entity()
export class Post extends MixinFactory.withAllFeatures(BaseEntity, User) {
  @Property()
  title!: string;
}

// UUID + timestamps
@Entity()
export class Token extends MixinFactory.withUuidAndTimestamps(BaseEntity) {
  @Property()
  value!: string;
}

// UUID + all features
@Entity()
export class Upload extends MixinFactory.withUuidAndAllFeatures(BaseEntity, User) {
  @Property()
  filename!: string;
}
```

## User Stamp Service

For automatic user stamping, use the UserStampService:

```typescript
import { UserStampService } from '@nesvel/nestjs-orm';

// In a service or middleware
const userStampService = UserStampService.getInstance<User>();
userStampService.setContext({ currentUser: req.user });

// Entities will automatically be stamped when created/updated
const post = new Post();
userStampService.stampCreate(post); // Sets createdBy to current user
userStampService.stampUpdate(post); // Sets updatedBy to current user
```

## Migration Considerations

When using mixins, consider the database schema:

### Timestamps

```sql
ALTER TABLE posts ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE posts ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

### Soft Deletes

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
CREATE INDEX idx_users_deleted_at ON users (deleted_at);
```

### User Stamps

```sql
ALTER TABLE documents ADD COLUMN created_by_id INT REFERENCES users(id);
ALTER TABLE documents ADD COLUMN updated_by_id INT REFERENCES users(id);
CREATE INDEX idx_documents_created_by ON documents (created_by_id);
CREATE INDEX idx_documents_updated_by ON documents (updated_by_id);
```

### UUID Primary Keys

```sql
-- PostgreSQL
ALTER TABLE sessions ALTER COLUMN id TYPE UUID USING (uuid_generate_v4());
ALTER TABLE sessions ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- MySQL 8.0+
ALTER TABLE sessions MODIFY id CHAR(36) DEFAULT (UUID());
```

## Type Safety

The mixins maintain full TypeScript support:

```typescript
// Type inference works correctly
const post = new Post(); // Post extends HasUserStamps<User>

// All methods are properly typed
post.setCreatedBy(user); // ✅ Accepts User object
post.setCreatedBy(userId); // ✅ Accepts user ID
post.wasCreatedBy(user); // ✅ Returns boolean
post.wasCreatedRecently(5); // ✅ From timestamps mixin
post.softDelete(); // ✅ From soft deletes mixin

// Type helpers available
type PostWithAllFeatures = WithUserStamps<WithSoftDeletes<WithTimestamps<BaseEntity>>, User>;
```

## Best Practices

### 1. Choose Mixins Based on Requirements

```typescript
// Audit logs - permanent records (no soft deletes)
@Entity()
export class AuditLog extends HasUserStamps(HasTimestamps(BaseEntity), User) {
  @Property()
  action!: string;
}

// User data - needs soft deletes for recovery
@Entity()
export class Customer extends MixinFactory.withAllFeatures(BaseEntity, User) {
  @Property()
  email!: string;
}

// System settings - minimal (no timestamps needed)
@Entity()
export class Setting extends BaseEntity {
  @Property()
  key!: string;
}
```

### 2. Use UUID for Public-Facing Entities

```typescript
// Public APIs - use UUID to prevent enumeration
@Entity()
export class Order extends HasUuid(MixinFactory.withAllFeatures(BaseEntity, User)) {
  @Property()
  total!: number;
}

// Internal entities - numeric ID is fine
@Entity()
export class Category extends HasTimestamps(BaseEntity) {
  @Property()
  name!: string;
}
```

### 3. Repository Pattern with Mixins

```typescript
export class PostRepository extends BaseRepository<Post> {
  // Soft delete aware queries
  async findPublished(): Promise<Post[]> {
    return this.where({
      status: 'published',
      deletedAt: null, // Explicitly filter soft deleted
    });
  }

  // Include soft deleted
  async findWithTrashed(): Promise<Post[]> {
    return this.getRepository().find(
      {},
      {
        filters: { softDelete: false },
      },
    );
  }

  // Only soft deleted
  async findOnlyTrashed(): Promise<Post[]> {
    return this.where({ deletedAt: { $ne: null } });
  }
}
```

### 4. Service Layer Integration

```typescript
export class PostService {
  constructor(
    private postRepo: PostRepository,
    private userStampService: UserStampService<User>,
  ) {}

  async createPost(data: CreatePostDto, user: User): Promise<Post> {
    const post = new Post();
    Object.assign(post, data);

    // Auto-stamp with current user
    post.setCreatedBy(user);

    return this.postRepo.create(post);
  }

  async softDeletePost(id: number, user: User): Promise<void> {
    const post = await this.postRepo.findOrFail(id);
    post.setUpdatedBy(user);
    post.softDelete();

    await this.postRepo.getEntityManager().flush();
  }
}
```

This mixin system provides the flexibility of Laravel's traits while maintaining
TypeScript's type safety and MikroORM's powerful features.
