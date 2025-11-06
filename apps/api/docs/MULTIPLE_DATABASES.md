# Multiple Database Connections

This guide explains how to configure and use multiple database connections in
the NestJS API with MikroORM.

## Table of Contents

- [Configuration](#configuration)
- [Register Multiple Connections](#register-multiple-connections)
- [Usage in Services](#usage-in-services)
- [Repository Pattern](#repository-pattern)
- [Entity Manager Injection](#entity-manager-injection)
- [Migrations](#migrations)
- [Environment Variables](#environment-variables)

---

## Configuration

### 1. Primary Database (Default)

Located in: `src/config/database.config.ts`

- Context name: `'default'`
- Used for main application data

### 2. Secondary Database

Located in: `src/config/database-secondary.config.ts`

- Context name: `'secondary'`
- Example use cases: analytics, legacy systems, read replicas

**Key Configuration:**

```typescript
export const databaseSecondaryConfig: MikroOrmModuleOptions = {
  contextName: 'secondary', // Must be unique!
  // ... other config
};
```

---

## Register Multiple Connections

### In `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { databaseConfig } from './config/database.config';
import { databaseSecondaryConfig } from './config/database-secondary.config';

@Module({
  imports: [
    // Primary database connection
    MikroOrmModule.forRoot(databaseConfig),

    // Secondary database connection
    MikroOrmModule.forRoot(databaseSecondaryConfig),

    // ... other imports
  ],
})
export class AppModule {}
```

---

## Usage in Services

### Method 1: Inject EntityManager with Context Name

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';

@Injectable()
export class MyService {
  constructor(
    // Primary database (default)
    @InjectEntityManager()
    private readonly em: EntityManager,

    // Secondary database
    @InjectEntityManager('secondary')
    private readonly emSecondary: EntityManager
  ) {}

  async createUser() {
    // Use primary database
    const user = this.em.create(User, { name: 'John' });
    await this.em.persistAndFlush(user);
    return user;
  }

  async logAnalytics() {
    // Use secondary database
    const log = this.emSecondary.create(AnalyticsLog, {
      event: 'user_created',
    });
    await this.emSecondary.persistAndFlush(log);
    return log;
  }
}
```

### Method 2: Inject MikroORM Instance

```typescript
import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { InjectMikroORM } from '@mikro-orm/nestjs';

@Injectable()
export class MyService {
  constructor(
    @InjectMikroORM()
    private readonly orm: MikroORM,

    @InjectMikroORM('secondary')
    private readonly ormSecondary: MikroORM
  ) {}

  async getData() {
    const primaryEM = this.orm.em.fork();
    const secondaryEM = this.ormSecondary.em.fork();

    // Use both connections
    const users = await primaryEM.find(User, {});
    const logs = await secondaryEM.find(AnalyticsLog, {});

    return { users, logs };
  }
}
```

---

## Repository Pattern

### Define Repositories for Each Connection

```typescript
import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { AnalyticsLog } from './entities/secondary/analytics-log.entity';

@Injectable()
export class MyService {
  constructor(
    // Primary database repository
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,

    // Secondary database repository
    @InjectRepository(AnalyticsLog, 'secondary')
    private readonly analyticsRepo: EntityRepository<AnalyticsLog>
  ) {}

  async findUsers() {
    return this.userRepo.findAll();
  }

  async findLogs() {
    return this.analyticsRepo.findAll();
  }
}
```

### Register Repositories in Modules

```typescript
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { AnalyticsLog } from './entities/secondary/analytics-log.entity';

@Module({
  imports: [
    // Primary database entities
    MikroOrmModule.forFeature([User]),

    // Secondary database entities
    MikroOrmModule.forFeature([AnalyticsLog], 'secondary'),
  ],
  providers: [MyService],
})
export class MyModule {}
```

---

## Entity Manager Injection

### Get EntityManager from Request Context

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class MyService {
  // Using primary database
  async doSomething() {
    const em = EntityManager.getContext(); // Gets primary EM
    // ... use em
  }

  // Using secondary database
  async doSomethingSecondary() {
    const em = EntityManager.getContext('secondary');
    // ... use em
  }
}
```

---

## Migrations

### Running Migrations for Specific Connection

Since the CLI uses `mikro-orm.config.ts` by default, you need separate config
files:

#### Create `mikro-orm-secondary.config.ts`

```typescript
import { Options } from '@mikro-orm/core';
import { databaseSecondaryConfig } from './src/config/database-secondary.config';

const { autoLoadEntities, registerRequestContext, ...cliConfig } =
  databaseSecondaryConfig;

export default cliConfig as Options;
```

#### Run migrations

```bash
# Primary database migrations
bun orm migrate

# Secondary database migrations
bun orm migrate --config=./mikro-orm-secondary.config.ts
```

---

## Environment Variables

### Update `.env` file

```bash
# Primary Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nesvel_api
DB_USER=postgres
DB_PASSWORD=postgres

# Secondary Database
DB_SECONDARY_HOST=localhost
DB_SECONDARY_PORT=5433
DB_SECONDARY_NAME=nesvel_secondary
DB_SECONDARY_USER=postgres
DB_SECONDARY_PASSWORD=postgres
```

---

## Complete Example: Multi-Database Service

```typescript
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { InjectEntityManager } from '@mikro-orm/nestjs';
import { User } from '@/entities/user.entity';
import { AnalyticsLog } from '@/entities/secondary/analytics-log.entity';

@Injectable()
export class UserAnalyticsService {
  constructor(
    @InjectEntityManager()
    private readonly em: EntityManager,

    @InjectEntityManager('secondary')
    private readonly analyticsEm: EntityManager
  ) {}

  /**
   * Create user in primary DB and log to analytics DB
   */
  async createUserWithAnalytics(userData: Partial<User>) {
    // Create user in primary database
    const user = this.em.create(User, userData);
    await this.em.persistAndFlush(user);

    // Log to analytics database (fire and forget)
    try {
      const log = this.analyticsEm.create(AnalyticsLog, {
        userId: user.id,
        event: 'user_created',
        timestamp: new Date(),
      });
      await this.analyticsEm.persistAndFlush(log);
    } catch (error: Error | any) {
      console.error('Failed to log analytics:', error);
    }

    return user;
  }

  /**
   * Get user with analytics data from both databases
   */
  async getUserWithAnalytics(userId: string) {
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      return null;
    }

    const logs = await this.analyticsEm.find(AnalyticsLog, { userId });

    return {
      ...user,
      analytics: logs,
    };
  }
}
```

---

## Best Practices

1. **Context Names**: Always use unique `contextName` for each connection
2. **Request Context**: Only register request context for the primary database
3. **Entity Organization**: Keep entities in separate directories (e.g.,
   `entities/` and `entities/secondary/`)
4. **Migration Separation**: Use separate migration directories for each
   database
5. **Error Handling**: Handle connection failures independently
6. **Connection Pooling**: Configure appropriate pool sizes for each connection
7. **Transactions**: Don't mix entities from different databases in the same
   transaction

---

## Troubleshooting

### Issue: "Cannot get context"

- Ensure `registerRequestContext: true` is set for the primary database
- Set `registerRequestContext: false` for secondary databases

### Issue: "Entity not found in context"

- Check that entities are registered with the correct context name
- Verify entity paths in configuration

### Issue: Migrations run on wrong database

- Use `--config` flag to specify the config file
- Check connection settings in CLI config

---

## Additional Resources

- [MikroORM Multiple Configurations](https://mikro-orm.io/docs/usage-with-nestjs#multiple-configurations)
- [Entity Manager Context](https://mikro-orm.io/docs/entity-manager#working-with-the-entity-manager)
- [Migrations Guide](https://mikro-orm.io/docs/migrations)
