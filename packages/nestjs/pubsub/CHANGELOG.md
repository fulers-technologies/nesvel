# Changelog

All notable changes to the NestJS PubSub package are documented in this file.

---

## [2.0.0] - 2025-10-24

### Added

#### Configuration Module

- **Created `src/config/` directory** with NestJS ConfigService integration
- **Added `pubsub.config.ts`** - Centralized configuration using `registerAs()`
  from @nestjs/config
- **Environment variable support** with sensible defaults for all drivers
- **Configuration validation** with `validatePubSubConfig()` helper function
- **Type-safe config getter** with `getPubSubConfig()` helper
- **Created `.env.example`** with comprehensive documentation of all environment
  variables

#### Reorganized Constants and Enums

- **Split `pubsub.constants.ts`** into separate directories:
  - `src/enums/` - Contains all enum definitions
  - `src/constants/` - Contains all constant values and injection tokens

#### Enums (One file per enum)

- **`pubsub-driver-type.enum.ts`** - PubSubDriverType enum with detailed
  documentation

#### Constants (One file per constant)

- **`pubsub-module-options.constant.ts`** - PUBSUB_MODULE_OPTIONS injection
  token
- **`pubsub-driver.constant.ts`** - PUBSUB_DRIVER injection token
- **`pubsub-service.constant.ts`** - PUBSUB_SERVICE injection token
- **`pubsub-subscribe-metadata.constant.ts`** - PUBSUB_SUBSCRIBE_METADATA
  metadata key
- **`default-pubsub-config.constant.ts`** - DEFAULT_PUBSUB_CONFIG default values

#### Interface Reorganization

- **Split `pubsub-options.interface.ts`** into three separate files:
  - `pubsub-options.interface.ts` - IPubSubOptions only
  - `pubsub-options-factory.interface.ts` - IPubSubOptionsFactory only
  - `pubsub-async-options.interface.ts` - IPubSubAsyncOptions only
- Each interface now has its own file following the pattern: one export per file

#### Path Aliases

- **Updated `tsconfig.json`** with comprehensive path aliases:
  - `@config/*` - Configuration files
  - `@constants` and `@constants/*` - Constants
  - `@decorators` and `@decorators/*` - Decorators
  - `@drivers` and `@drivers/*` - Driver implementations
  - `@enums` and `@enums/*` - Enums
  - `@exceptions` and `@exceptions/*` - Exceptions
  - `@interfaces` and `@interfaces/*` - Interfaces
  - `@services` and `@services/*` - Services
  - `@types` and `@types/*` - Type definitions
  - `@utils` and `@utils/*` - Utility functions

#### Examples

- **Created `__examples__/config-example/main.ts`** - Demonstrates ConfigService
  integration

### Changed

#### Import Statements

- **Updated all imports** to use path aliases instead of relative paths (../,
  ../../, etc.)
- **13 files updated** with new import paths:
  - `src/config/pubsub.config.ts`
  - `src/decorators/inject-pubsub.decorator.ts`
  - `src/decorators/subscribe.decorator.ts`
  - `src/drivers/google-pubsub/google-pubsub.driver.ts`
  - `src/drivers/kafka/kafka-pubsub.driver.ts`
  - `src/drivers/redis/redis-pubsub.driver.ts`
  - `src/interfaces/pubsub-driver.interface.ts`
  - `src/interfaces/pubsub-options.interface.ts`
  - `src/interfaces/subscription-metadata.interface.ts`
  - `src/services/pubsub-factory.service.ts`
  - `src/services/pubsub.service.ts`
  - `src/types/message-handler.type.ts`
  - `src/utils/message-serializer.util.ts`
  - `src/pubsub.module.ts`

#### Package Dependencies

- **Added `@nestjs/config`** to peerDependencies (^3.0.0)
- **Added `@nestjs/config`** to devDependencies (^3.0.0)

#### File Structure

- **Removed** `src/pubsub.constants.ts` (split into enums/ and constants/)
- **Added** 2 new directories: `src/config/`, `src/enums/`
- **Added** 8 new files for split constants and enums
- **Added** 3 new interface files from split
- **Total files**: 44 → 52 TypeScript files

### Improved

#### Code Organization

- **Better separation of concerns** with dedicated directories for enums and
  constants
- **Improved maintainability** with one export per file pattern
- **Cleaner imports** using path aliases instead of relative paths
- **Enhanced discoverability** with clear directory structure

#### Documentation

- **Comprehensive JSDoc comments** on all new constants and enums
- **Usage examples** in every constant file
- **Environment variable documentation** in .env.example
- **Configuration guide** in pubsub.config.ts

#### Developer Experience

- **Type-safe configuration** with ConfigService integration
- **Easier imports** with path aliases (no more counting ../../../)
- **Better IDE support** with absolute imports
- **Clearer error messages** with validation helpers

---

## [1.0.0] - 2025-10-24

### Initial Release

#### Core Features

- Multi-driver support (Redis, Kafka, Google Cloud Pub/Sub)
- Decorator-based subscriptions with @Subscribe()
- Type-safe message handling with TypeScript generics
- Synchronous and asynchronous module configuration
- Global or scoped module registration
- Automatic connection management
- Custom serialization support
- Comprehensive error handling

#### Components

- PubSubModule - Main NestJS module
- PubSubService - Primary service for pub/sub operations
- PubSubFactoryService - Driver factory
- Three driver implementations (Redis, Kafka, Google PubSub)
- Custom decorators (@Subscribe, @InjectPubSub)
- Custom exceptions (PubSubException, DriverNotFoundException,
  PublishFailedException)
- Utility functions for serialization

#### Documentation

- Comprehensive README.md
- Detailed DOCUMENTATION.md (13,000+ words)
- PROJECT_SUMMARY.md with architecture details
- Working examples for each driver
- MIT License

---

## File Structure Comparison

### Version 1.0.0

```
src/
├── decorators/
├── drivers/
├── exceptions/
├── interfaces/
├── services/
├── types/
├── utils/
├── index.ts
├── pubsub.constants.ts
└── pubsub.module.ts
```

### Version 2.0.0

```
src/
├── config/              [NEW]
├── constants/           [NEW - split from pubsub.constants.ts]
├── decorators/
├── drivers/
├── enums/              [NEW - split from pubsub.constants.ts]
├── exceptions/
├── interfaces/         [EXPANDED - split interfaces]
├── services/
├── types/
├── utils/
├── index.ts
└── pubsub.module.ts
```

---

## Migration Guide (1.0.0 → 2.0.0)

### Import Changes

If you were importing from the old constants file:

**Before:**

```typescript
import { PubSubDriverType, PUBSUB_SERVICE } from '@nestjs-pubsub/core';
```

**After:**

```typescript
// No changes needed - re-exports are maintained in index.ts
import { PubSubDriverType, PUBSUB_SERVICE } from '@nestjs-pubsub/core';
```

### Internal Development

If you're developing or extending the package:

**Before:**

```typescript
import { PubSubDriverType } from '../pubsub.constants';
import { IPubSubOptions } from '../../interfaces/pubsub-options.interface';
```

**After:**

```typescript
import { PubSubDriverType } from '@enums';
import { IPubSubOptions } from '@interfaces/pubsub-options.interface';
```

### Configuration

**New Feature - ConfigService Integration:**

```typescript
import { ConfigModule } from '@nestjs/config';
import { PubSubModule, pubsubConfig } from '@nestjs-pubsub/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [pubsubConfig],
    }),
    PubSubModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('pubsub'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## Breaking Changes

### None

All changes are backward compatible. The public API remains unchanged, and all
exports are maintained through the main index.ts file.

---

## Contributors

- **Manus AI** - Initial development and v2.0.0 refactoring

---

## License

This project is licensed under the MIT License.
