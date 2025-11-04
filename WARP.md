# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this
repository.

## Repository Overview

Nesvel is a **Turborepo monorepo** combining Next.js/React Router and NestJS
with custom packages. It uses **Bun** as the package manager and runtime.

### Core Technologies

- **Build System**: Turborepo with Bun (v1.3.1)
- **Backend**: NestJS with custom ORM (MikroORM-based)
- **Frontend**: React 19 + React Router 7
- **Language**: TypeScript 5.9+ throughout
- **Testing**: Jest for packages, framework-specific for apps
- **Linting/Formatting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged + Commitlint

## Project Structure

```
nesvel/
├── apps/
│   ├── api/              # NestJS REST API
│   └── web-router/       # React Router 7 app with DI
├── packages/
│   ├── nestjs-orm/       # Laravel-inspired ORM (MikroORM wrapper)
│   ├── nestjs-swagger/   # Swagger/OpenAPI module
│   ├── nestjs-i18n/      # Internationalization module
│   ├── nestjs-console/   # CLI prompts library (Laravel-style)
│   ├── nestjs-pubsub/    # PubSub integration
│   ├── reactjs-di/       # React DI with Inversiland + routing
│   ├── shared/           # Shared utilities
│   ├── ui/               # Radix UI components
│   └── *-config/         # Shared configs (TypeScript, ESLint, Jest, tsup)
```

## Common Commands

### Development

```bash
# Start all apps in dev mode
bun dev

# Start specific app
bun dev --filter=api
bun dev --filter=web-router

# Watch mode for package development
bun build:watch --filter=@nesvel/nestjs-orm
```

### Building

```bash
# Build all packages and apps
bun build

# Build specific package
bun build --filter=@nesvel/nestjs-orm
```

### Testing

```bash
# Run all tests
bun test

# Run tests for specific package
bun test --filter=@nesvel/nestjs-orm

# Run with coverage
bun test:cov

# Run E2E tests
bun test:e2e

# Watch mode
bun test:watch
```

### Linting & Formatting

```bash
# Lint all code
bun lint

# Fix linting issues
bun lint:fix

# Format code (Prettier)
bun format

# Check formatting
bun format:check

# Type checking
bun typecheck
```

### API-Specific Commands

```bash
# From root or apps/api directory:

# Start NestJS dev server with watch mode
bun dev --filter=api

# Start in debug mode
bun start:debug --filter=api

# Production build and start
bun build --filter=api
bun start:prod --filter=api

# ORM CLI (from apps/api/)
bun orm <command>
# Example: bun orm migration:create add_users_table
```

### Cleaning

```bash
# Clean build artifacts
bun clean

# Clean all dist directories
bun clean:dist

# Clean Turbo cache
bun clean:cache

# Nuclear clean (removes node_modules, lock files, etc.)
bun cleanup
```

### Git Workflow

```bash
# Use Commitizen for conventional commits
bun commit

# Husky automatically runs on:
# - pre-commit: lint-staged (formats staged files)
# - commit-msg: commitlint (validates commit message)
```

## Architecture & Patterns

### Monorepo Catalog System

This repo uses Turborepo's **catalog feature** for dependency management.
Catalogs are defined in root `package.json` under `catalogs.*` key:

```json
{
  "catalogs": {
    "nestjs": { "@nestjs/common": "^11.1.7" },
    "react": { "react": "^19.2.0" }
  }
}
```

Reference catalog versions in packages: `"@nestjs/common": "catalog:nestjs"`

### NestJS API Architecture (`apps/api`)

- **Entry**: `main.ts` bootstraps NestJS, sets up Swagger docs
- **Module System**: Standard NestJS modules (AppModule, feature modules)
- **Custom Route Decorator**: `@Route()` decorator in `decorators/route/`
  provides:
  - Fluent API for HTTP methods, auth, caching, rate limiting, circuit breakers
  - Automatic Swagger documentation
  - Built-in validation, throttling, CORS, telemetry
  - Example:
    `@Route({ method: HttpMethod.POST, auth: { bearer: true }, cache: { ttl: 300 } })`
- **Configuration**: All configs in `src/config/` (CORS, i18n, Swagger, rate
  limiting)
- **Dependency Injection**: Standard NestJS DI (Controllers inject Services)

**Important**: Always add detailed docblocks and comments to all methods in
NestJS/TypeScript files, similar to the example in the Route decorator examples.

### React Router App (`apps/web-router`)

- **Framework**: React Router 7 with SSR support
- **DI System**: Uses `@nesvel/reactjs-di` with decorators (`@injectable`,
  `@Route`, `@RouteModule`)
- **Styling**: Tailwind CSS v4

### Custom Packages

#### `@nesvel/nestjs-orm`

Laravel Eloquent-inspired ORM built on MikroORM:

- **Mixins**: `timestamps`, `softDeletes`, `userStamps`, `uuid`
- **Fluent Migrations**: Blueprint-based schema builder (like Laravel)
- **CLI**: `nesvel-orm` or `bun orm` for migrations, seeders, factories
- **PubSub**: Integrated event hooks
- **Pagination**: Built-in via `nestjs-paginate`

#### `@nesvel/nestjs-swagger`

Production-ready Swagger/OpenAPI setup with TypeScript support. Auto-configured
via `SwaggerModule.forRoot(swaggerConfig)`.

#### `@nesvel/nestjs-i18n`

Internationalization with multiple language resolvers. Configure in
`i18n.config.ts`, use via `I18nService`.

#### `@nesvel/nestjs-console`

CLI prompts library (Laravel-style) for building interactive CLIs:

- Prompts: `text`, `password`, `select`, `multiselect`, `confirm`, `number`,
  `search`, `form`
- Utilities: colored messages, spinners, tables, themes

#### `@nesvel/reactjs-di`

Type-safe DI for React powered by Inversiland:

- **Decorators**: `@injectable()`, `@module()`, `@inject()`
- **Hooks**: `useDI()`, `useOptionalDI()`, `useServices()`
- **Route Management**: `@RouteModule()`, `@Route()` for React Router
  integration
- **Provider**: Wrap app with `<DIProvider>`

### Path Aliases

Packages use path aliases in `tsconfig.json`:

- `@/*` - general imports
- `@repositories/*`, `@services/*`, `@entities/*`, `@controllers/*`, etc.

## Code Conventions

### Commit Messages

Follow **Conventional Commits** format: `<type>(<scope>): <subject>`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`

**Scopes**: Package names (`nestjs-orm`, `api`, `reactjs-di`) or `monorepo`,
`deps`, `release`

**Example**: `feat(nestjs-orm): add soft delete functionality`

### Code Style

- **Prettier**: 100 char line width, single quotes, 2-space tabs, trailing
  commas (ES5)
- **ESLint**: TypeScript-ESLint with Next.js and Prettier configs
- **Docblocks**: Required on all public methods and classes (especially in
  NestJS/TypeScript)

### Testing

- Unit tests: `*.spec.ts` files alongside source
- E2E tests: `test/` directory (NestJS) or framework-specific
- Run single test file: `bun test <path-to-file>`

## Development Workflow

1. **Start development**: `bun dev` (or `bun dev --filter=<package>`)
2. **Make changes**: Edit code with auto-reload
3. **Test changes**: `bun test --filter=<package>`
4. **Type check**: `bun typecheck`
5. **Lint/format**: Automatic via lint-staged on commit, or run manually
6. **Commit**: `bun commit` (uses Commitizen) or standard `git commit`
   (Commitlint validates)

### Adding New Packages

1. Create package in `packages/` or app in `apps/`
2. Add to root `package.json` workspaces (auto-detected via `apps/*`,
   `packages/*`)
3. Use workspace dependencies: `"@nesvel/package-name": "workspace:*"`
4. Reference catalog versions for common deps
5. Add to `commitlint.config.ts` scope enum

### Working with ORM

```bash
# From apps/api directory:

# Create migration
bun orm migration:create migration_name

# Run migrations
bun orm migration:up

# Rollback
bun orm migration:down

# Create seeder
bun orm seed:create SeederName

# Run seeders
bun orm seed:run
```

#### ORM Make Commands with Auto-Registration

The ORM CLI automatically registers generated classes in the nearest module
file:

```bash
# Generate controller (auto-registers in controllers array)
bun orm make:controller OrderItem --path=src/modules/order/controllers
# ✓ Registered OrderItemController in order.module.ts

# Generate service (auto-registers in providers + exports arrays)
bun orm make:service OrderItem --path=src/modules/order/services
# ✓ Registered OrderItemService in order.module.ts

# Generate repository (auto-registers in providers array)
bun orm make:repository OrderItem --path=src/modules/order/repositories
# ✓ Registered OrderItemRepository in order.module.ts

# Generate subscriber (auto-registers in providers array)
bun orm make:subscriber Order --path=src/modules/order/subscribers
# ✓ Registered OrderSubscriber in order.module.ts
```

**Auto-Registration Rules:**

- Searches for `*.module.ts` in parent directories
- Falls back to `src/app.module.ts` if no module found
- **Controllers** → `controllers` array
- **Services** → `providers` + `exports` arrays (auto-exported for inter-module
  use)
- **Repositories** → `providers` array only
- **Subscribers** → `providers` array only
- **Middlewares** → `providers` array only
- **DTOs, Enums, Factories, Migrations, Scopes, Seeders** → Not registered (not
  needed)

See `packages/nestjs-orm/docs/AUTO_REGISTRATION.md` for full documentation.

## Important Notes

- **Bun Runtime**: This project uses Bun for package management and runtime.
  Some npm-specific commands may not work.
- **Node Version**: Minimum Node 20, npm 10 (if not using Bun)
- **Experimental Features**: React 19 and React Router 7 are cutting-edge
  versions
- **Turbo Caching**: Leverages Turborepo's caching for faster builds; can be
  linked to Vercel Remote Cache
- **Environment Variables**: Defined in `turbo.json` globalEnv; manage locally
  via `.env` files (not committed)

## Troubleshooting

### Build Failures

- Clear Turbo cache: `bun clean:cache` or `rm -rf .turbo`
- Rebuild dependencies: `bun install --force`

### Type Errors

- Check for missing build step: Internal packages must be built before use
- Run: `bun build --filter=<dependency-package>`

### Test Failures

- Ensure dependencies are built: `bun build`
- Check for missing peer dependencies in specific package

### ORM Issues

- Verify MikroORM configuration in `mikro-orm.config.ts`
- Check database connection (PostgreSQL/MySQL/MongoDB drivers)
- Ensure migrations are up to date: `bun orm migration:up`
