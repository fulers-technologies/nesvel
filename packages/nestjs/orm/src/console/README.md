# Console Commands

Laravel-style make commands for `@nesvel/nestjs-orm` to quickly generate
boilerplate code.

## Available Commands

### Core ORM Commands

#### `make:model <name>`

Generate a new entity/model with MikroORM decorators.

```bash
npm run console make:model User
npm run console make:model Product
```

**Generates:** `src/entities/user.ts`

#### `make:repository <name>`

Generate a new repository extending BaseRepository.

```bash
npm run console make:repository User
npm run console make:repository Product
```

**Generates:** `src/repositories/user.repository.ts`

#### `make:service <name>`

Generate a new service extending BaseService.

```bash
npm run console make:service User
npm run console make:service Product
```

**Generates:** `src/services/user.service.ts`

#### `make:subscriber <name>`

Generate a new event subscriber for entity lifecycle events.

```bash
npm run console make:subscriber User
npm run console make:subscriber Product
```

**Generates:** `src/subscribers/user.subscriber.ts`

---

### Testing & Seeding Commands

#### `make:factory <name>`

Generate a new factory for test data generation.

```bash
npm run console make:factory User
npm run console make:factory Product
```

**Generates:** `src/factories/user.factory.ts`

#### `make:seeder <name>`

Generate a new database seeder.

```bash
npm run console make:seeder User
npm run console make:seeder Product
```

**Generates:** `src/seeders/user.seeder.ts`

---

### Database Migration Commands

#### `make:migration <name>`

Generate a new database migration file.

```bash
npm run console make:migration CreateUsersTable
npm run console make:migration AddEmailToUsers
```

**Generates:** `src/migrations/create-users-table.ts`

---

### NestJS Component Commands

#### `make:controller <name>`

Generate a new REST API controller with CRUD endpoints.

```bash
npm run console make:controller User
npm run console make:controller Product
```

**Generates:** `src/controllers/user.controller.ts`

#### `make:module <name>`

Generate a new NestJS module.

```bash
npm run console make:module User
npm run console make:module Product
```

**Generates:** `src/modules/user.module.ts`

#### `make:dto <name>`

Generate a new Data Transfer Object with validation decorators.

```bash
npm run console make:dto CreateUser
npm run console make:dto UpdateProduct
```

**Generates:** `src/dtos/create-user.dto.ts`

---

### Convenience Commands

#### `make:resource <name>`

Generate all related files for a complete CRUD resource at once:

- Entity/Model
- Repository
- Service
- Controller
- Module
- Create DTO
- Update DTO

```bash
npm run console make:resource User
npm run console make:resource Product
```

**Generates:**

- `src/entities/user.ts`
- `src/repositories/user.repository.ts`
- `src/services/user.service.ts`
- `src/controllers/user.controller.ts`
- `src/modules/user.module.ts`
- `src/dtos/create-user.dto.ts`
- `src/dtos/update-user.dto.ts`

---

## Naming Conventions

The commands automatically handle naming conventions:

- **Input:** `User` or `user` or `user-profile`
- **Class Names:** `UserProfile` (PascalCase)
- **File Names:** `user-profile.ts` (kebab-case)
- **Variable Names:** `userProfile` (camelCase)

## Stub Templates

All generated files are based on EJS templates located in `src/console/stubs/`:

- `model.stub.ejs`
- `repository.stub.ejs`
- `service.stub.ejs`
- `subscriber.stub.ejs`
- `factory.stub.ejs`
- `seeder.stub.ejs`
- `migration.stub.ejs`
- `controller.stub.ejs`
- `module.stub.ejs`
- `dto.stub.ejs`

You can customize these templates to match your project's conventions.

## Features

- ✅ Laravel-style command syntax
- ✅ Automatic naming convention handling
- ✅ Professional docblocks and comments
- ✅ Example code in generated files
- ✅ Interactive feedback with spinners
- ✅ Duplicate file detection
- ✅ Imports from `@nesvel/nestjs-orm` (no direct MikroORM imports needed)

## Example Workflow

Generate a complete User resource:

```bash
# Option 1: Generate everything at once
npm run console make:resource User

# Option 2: Generate files individually
npm run console make:model User
npm run console make:repository User
npm run console make:service User
npm run console make:controller User
npm run console make:module User
npm run console make:dto CreateUser
npm run console make:dto UpdateUser
```

Both approaches create the same files, but `make:resource` is faster for new
features.
