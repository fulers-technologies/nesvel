# Auto-Registration to Module Files

The ORM CLI automatically registers generated classes in the appropriate NestJS module file. This saves you from manually importing and adding providers, controllers, and other components to your module decorators.

## Overview

When you run any `make:*` command, the CLI will:

1. **Generate the requested file** (controller, service, repository, etc.)
2. **Find the nearest module file**:
   - If generating in `src/modules/{module-name}/{type}/`, it registers in `{module-name}.module.ts`
   - Otherwise, it falls back to `app.module.ts` in the `src/` directory
3. **Add the import statement** for the generated class
4. **Register the class** in the appropriate @Module decorator array

## Supported Types

### Auto-Registered Classes

The following types are automatically registered in module files:

| Type           | Command           | Registered In       | Exported |
| -------------- | ----------------- | ------------------- | -------- |
| **Controller** | `make:controller` | `controllers` array | ❌ No    |
| **Service**    | `make:service`    | `providers` array   | ✅ Yes   |
| **Repository** | `make:repository` | `providers` array   | ❌ No    |
| **Subscriber** | `make:subscriber` | `providers` array   | ❌ No    |
| **Middleware** | `make:middleware` | `providers` array   | ❌ No    |

### Skipped Types

These types are **not** registered in modules (they don't need to be):

- ✅ **DTOs** (`make:dto`) - Used as type definitions only
- ✅ **Enums** (`make:enum`) - Used as type definitions only
- ✅ **Factories** (`make:factory`) - Called directly in tests/seeders
- ✅ **Migrations** (`make:migration`) - Managed by MikroORM CLI
- ✅ **Scopes** (`make:scope`) - Applied to repositories/queries
- ✅ **Seeders** (`make:seeder`) - Run via seeder commands

## Examples

### Example 1: Feature Module Registration

```bash
# Generate a controller in the order module
cd apps/api
bun orm make:controller OrderItem --path=src/modules/order/controllers
```

**Before** (`src/modules/order/order.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';

@Module({
  controllers: [OrderController],
  providers: [],
})
export class OrderModule {}
```

**After** (`src/modules/order/order.module.ts`):

```typescript
import { Module } from '@nestjs/common';
import { OrderController } from './controllers/order.controller';
import { OrderItemController } from './controllers/order-item.controller';

@Module({
  controllers: [OrderController, OrderItemController],
  providers: [],
})
export class OrderModule {}
```

### Example 2: Service with Auto-Export

```bash
# Generate a service in the order module
bun orm make:service OrderItem --path=src/modules/order/services
```

**Result**: The service is added to both `providers` and `exports` arrays:

```typescript
import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderItemService } from './services/order-item.service';

@Module({
  providers: [OrderService, OrderItemService],
  exports: [OrderService, OrderItemService], // ✅ Services are auto-exported
})
export class OrderModule {}
```

### Example 3: Subscriber Registration

```bash
# Generate a subscriber
bun orm make:subscriber Order --path=src/modules/order/subscribers
```

**Result**: Subscriber added to `providers` (but not `exports`):

```typescript
import { Module } from '@nestjs/common';
import { OrderSubscriber } from './subscribers/order.subscriber';

@Module({
  providers: [OrderSubscriber], // ✅ Registered in providers
  // ❌ Not exported (subscribers don't need to be)
})
export class OrderModule {}
```

### Example 4: DTO Creation (No Registration)

```bash
# Generate a DTO
bun orm make:dto CreateOrder --path=src/modules/order/dtos
```

**Result**: File is created but **not** registered in the module:

```bash
✓ Created dto: src/modules/order/dtos/create-order.dto.ts
# ⚠️ No "Registered in..." message
```

DTOs are type definitions only and don't need to be registered as providers.

## Module File Discovery

The CLI searches for module files in this order:

### 1. Feature Module (Primary)

Searches up the directory tree from the generated file's location looking for any `*.module.ts` file.

**Example**:

- Generating: `src/modules/order/controllers/order-item.controller.ts`
- Searches: `src/modules/order/*.module.ts`
- Finds: `src/modules/order/order.module.ts` ✅

### 2. App Module (Fallback)

If no feature module is found, falls back to:

- `src/app.module.ts`

### 3. No Module Found

If neither is found, you'll see a warning:

```bash
⚠️  No module file found. Skipping auto-registration of OrderItemController.
   You'll need to manually add it to your module.
```

## Registration Logic

### Arrays in @Module Decorator

Classes are registered based on their type:

```typescript
@Module({
  imports: [...],

  // Controllers go here
  controllers: [UserController, ProductController],

  // Services, repositories, subscribers, middlewares go here
  providers: [
    UserService,        // Service
    UserRepository,     // Repository
    UserSubscriber,     // Subscriber
    LoggerMiddleware,   // Middleware
  ],

  // Only services are auto-exported
  exports: [UserService],
})
```

### Import Path Resolution

The CLI automatically calculates relative import paths:

```typescript
// From: src/modules/order/order.module.ts
// To:   src/modules/order/services/order-item.service.ts

import { OrderItemService } from './services/order-item.service';
```

## Edge Cases

### Duplicate Detection

If a class is already registered, it won't be added again:

```bash
# First time
bun orm make:service Order
# ✓ Registered OrderService in order.module.ts

# Second time (if file was deleted and regenerated)
bun orm make:service Order
# (Already registered, no duplicate added)
```

### Empty Arrays

If an array doesn't exist in the module, it will be created:

**Before**:

```typescript
@Module({
  imports: [OrmModule],
})
export class OrderModule {}
```

**After** (making a controller):

```typescript
@Module({
  imports: [OrmModule],
  controllers: [OrderController], // ✅ Array created automatically
})
export class OrderModule {}
```

### Multi-line Arrays

The CLI handles both single-line and multi-line arrays:

**Single-line**:

```typescript
providers: [OrderService, UserService];
// Becomes: providers: [OrderService, UserService, OrderItemService]
```

**Multi-line**:

```typescript
providers: [OrderService, UserService];
// Becomes:
providers: [
  OrderService,
  UserService,
  OrderItemService, // ✅ Added with proper indentation
];
```

## Benefits

✅ **Saves Time**: No manual imports or registrations needed  
✅ **Reduces Errors**: Eliminates typos and forgotten registrations  
✅ **Consistent Structure**: All modules follow the same pattern  
✅ **Smart Detection**: Only registers applicable types  
✅ **Proper Exports**: Services are automatically exported for use in other modules

## Disabling Auto-Registration

Currently, auto-registration is always enabled for supported types. If you need to skip registration:

1. Generate the file
2. Manually remove it from the module
3. Place it wherever needed

Future versions may include a `--no-register` flag to disable this behavior.

## Troubleshooting

### Warning: No module file found

**Cause**: You're generating files outside a recognizable module structure.

**Solution**:

- Ensure you have a `*.module.ts` file in the parent directory
- Or create `src/app.module.ts` as a fallback

### Import path is incorrect

**Cause**: The relative path calculation may fail in unusual directory structures.

**Solution**: Manually adjust the import path in the module file.

### Class already exists error

**Cause**: Trying to generate a file that already exists.

**Solution**: Delete the existing file first, or rename your new file.

## Related Documentation

- [Make Commands](./MAKE_COMMANDS.md) - Overview of all make commands
- [Module System](./MODULES.md) - NestJS module architecture
- [CLI Usage](./CLI.md) - General CLI usage guide
