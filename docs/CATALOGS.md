# 📚 Catalogs Reference

This document provides a comprehensive reference for all available catalogs in
the Nesvel monorepo. Use these catalogs to ensure consistent dependency versions
across all apps and packages.

## 🎯 Usage

In your `package.json`, reference catalog versions like this:

```json
{
  "dependencies": {
    "react": "catalog:react",
    "@nestjs/common": "catalog:nestjs"
  },
  "devDependencies": {
    "typescript": "catalog:typescript"
  }
}
```

---

## 📦 Core Catalogs

### `typescript`

TypeScript compiler.

```json
"typescript": "catalog:typescript"
```

**Packages:**

- `typescript` - v5.9.3

---

### `types`

TypeScript type definitions for common packages.

```json
"@types/node": "catalog:types"
```

**Packages:**

- `@types/node` - v24.9.1
- `@types/react` - v19.1.0
- `@types/react-dom` - v19.1.1
- `@types/express` - v5.0.0
- `@types/jest` - v30.0.0
- `@types/supertest` - v6.0.3
- `@types/bcrypt` - v5.0.2
- `@types/passport-jwt` - v4.0.1
- `@types/passport-local` - v1.0.38
- `@types/cookie-parser` - v1.4.7

---

## ⚛️ Frontend Catalogs

### `react`

React core libraries and utilities.

```json
"react": "catalog:react"
```

**Packages:**

- `react` - v19.2.0
- `react-dom` - v19.1.0
- `react-hook-form` - v7.54.2

---

### `nextjs`

Next.js framework.

```json
"next": "catalog:nextjs"
```

**Packages:**

- `next` - v16.0.0

---

### `ui`

shadcn/ui and Radix UI components for building modern UIs.

```json
"@radix-ui/react-dialog": "catalog:ui",
"lucide-react": "catalog:ui"
```

**Packages (Radix UI):**

- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

**Utilities:**

- `class-variance-authority` - CVA for variant styles
- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes
- `lucide-react` - Icon library
- `cmdk` - Command menu component
- `vaul` - Drawer component
- `embla-carousel-react` - Carousel component
- `react-day-picker` - Date picker
- `date-fns` - Date utility library
- `recharts` - Chart library
- `sonner` - Toast notifications

---

### `uiStyles`

Tailwind CSS and styling utilities.

```json
"tailwindcss": "catalog:uiStyles"
```

**Packages:**

- `tailwindcss` - v3.4.17
- `tailwindcss-animate` - v1.0.7
- `autoprefixer` - v10.4.20
- `postcss` - v8.4.49
- `@tailwindcss/typography` - Typography plugin
- `@tailwindcss/forms` - Forms plugin
- `@tailwindcss/container-queries` - Container queries plugin

---

### `stateManagement`

State management libraries for React.

```json
"zustand": "catalog:stateManagement"
```

**Packages:**

- `zustand` - v5.0.3
- `jotai` - v2.10.6
- `immer` - v10.1.1

---

### `dataFetching`

Data fetching and HTTP client libraries.

```json
"@tanstack/react-query": "catalog:dataFetching"
```

**Packages:**

- `@tanstack/react-query` - v5.64.2
- `axios` - v1.7.9
- `ky` - v1.7.3
- `swr` - v2.3.1

---

## 🐦 Backend Catalogs

### `nestjs`

Core NestJS packages.

```json
"@nestjs/common": "catalog:nestjs"
```

**Packages:**

- `@nestjs/common` - v11.1.7
- `@nestjs/core` - v11.1.7
- `@nestjs/platform-express` - v11.1.7
- `reflect-metadata` - v0.2.2
- `rxjs` - v7.8.2

---

### `nestjsCli`

NestJS CLI and development tools.

```json
"@nestjs/cli": "catalog:nestjsCli"
```

**Packages:**

- `@nestjs/cli` - v11.0.10
- `@nestjs/schematics` - v11.0.9
- `@nestjs/testing` - v11.1.7

---

### `nestjsModules`

Additional NestJS modules for features like caching, swagger, throttling, etc.

```json
"@nestjs/config": "catalog:nestjsModules"
```

**Packages:**

- `@nestjs/config` - v4.0.2
- `@nestjs/cache-manager` - v3.0.0
- `@nesvel/nestjs-swagger` - v8.0.7
- `@nestjs/mapped-types` - v2.0.5
- `@nestjs/throttler` - v6.2.1
- `@nestjs/schedule` - v4.1.1
- `@nestjs/event-emitter` - v2.1.0
- `@nestjs/serve-static` - v4.0.2
- `cache-manager` - v7.0.4

---

### `nestjsAuth`

Authentication packages for NestJS (JWT, Passport, bcrypt).

```json
"@nestjs/jwt": "catalog:nestjsAuth"
```

**Packages:**

- `@nestjs/jwt` - v10.2.0
- `@nestjs/passport` - v10.0.3
- `passport` - v0.7.0
- `passport-jwt` - v4.0.1
- `passport-local` - v1.0.0
- `bcrypt` - v5.1.1
- `cookie-parser` - v1.4.7

---

### `nestjsDatabase`

Database packages for NestJS (TypeORM, drivers).

```json
"@nestjs/typeorm": "catalog:nestjsDatabase"
```

**Packages:**

- `@nestjs/typeorm` - v10.0.2
- `typeorm` - v0.3.20
- `pg` - v8.13.1 (PostgreSQL)
- `mysql2` - v3.11.5 (MySQL)
- `mongodb` - v6.12.0 (MongoDB)

---

### `validation`

Validation libraries for data validation.

```json
"class-validator": "catalog:validation"
```

**Packages:**

- `class-validator` - v0.14.1
- `class-transformer` - v0.5.1
- `zod` - v3.24.1

---

### `logging`

Logging libraries (Pino for NestJS).

```json
"nestjs-pino": "catalog:logging"
```

**Packages:**

- `nestjs-pino` - v4.4.1
- `pino` - v10.1.0
- `pino-http` - v11.0.0
- `pino-pretty` - v13.1.2

---

## 🧪 Testing Catalogs

### `testing`

Testing frameworks and utilities.

```json
"jest": "catalog:testing"
```

**Packages:**

- `jest` - v30.2.0
- `ts-jest` - v29.4.5
- `@types/jest` - v30.0.0
- `@testing-library/react` - v16.1.0
- `@testing-library/jest-dom` - v6.6.3
- `@testing-library/user-event` - v14.5.2
- `vitest` - v2.1.8

---

### `testingUtils`

Testing utilities for API testing.

```json
"supertest": "catalog:testingUtils"
```

**Packages:**

- `supertest` - v7.1.4
- `@types/supertest` - v6.0.3

---

## 🛠️ Build & Dev Tools Catalogs

### `tsBuild`

TypeScript build tools.

```json
"tsup": "catalog:tsBuild"
```

**Packages:**

- `tsup` - v8.3.5
- `ts-loader` - v9.5.4
- `ts-node` - v10.9.2
- `tsconfig-paths` - v4.2.0
- `source-map-support` - v0.5.21

---

### `lint`

Linting and formatting tools.

```json
"eslint": "catalog:lint"
```

**Packages:**

- `eslint` - v9.38.0
- `@eslint/js` - v9.38.0
- `@eslint/eslintrc` - v3.3.1
- `typescript-eslint` - v8.46.2
- `eslint-config-next` - v16.0.0
- `eslint-config-prettier` - v10.1.8
- `eslint-plugin-prettier` - v5.5.4
- `eslint-plugin-react-hooks` - v5.1.0
- `eslint-plugin-react` - v7.37.2
- `prettier` - v3.6.2
- `prettier-plugin-tailwindcss` - v0.6.9
- `globals` - v16.4.0

---

### `gitHooks`

Git hooks and commit tools.

```json
"husky": "catalog:gitHooks"
```

**Packages:**

- `husky` - v9.1.7
- `lint-staged` - v15.2.11
- `commitizen` - v4.3.1
- `@commitlint/cli` - v19.6.2
- `@commitlint/config-conventional` - v19.6.2
- `@commitlint/cz-commitlint` - v19.6.2
- `@commitlint/types` - v19.6.2

---

### `build`

Build tools for the monorepo.

```json
"turbo": "catalog:build"
```

**Packages:**

- `turbo` - v2.5.8
- `tsx` - v4.20.6

---

## 🔧 Utility Catalogs

### `utils`

General utility libraries.

```json
"lodash": "catalog:utils"
```

**Packages:**

- `dotenv` - v16.4.7
- `dayjs` - v1.11.13
- `lodash` - v4.17.21
- `@types/lodash` - v4.17.13
- `uuid` - v11.0.3
- `@types/uuid` - v10.0.0
- `nanoid` - v5.0.9

---

## 📝 Examples

### Next.js App with shadcn/ui

```json
{
  "dependencies": {
    "react": "catalog:react",
    "react-dom": "catalog:react",
    "next": "catalog:nextjs",
    "@radix-ui/react-dialog": "catalog:ui",
    "lucide-react": "catalog:ui",
    "zustand": "catalog:stateManagement",
    "@tanstack/react-query": "catalog:dataFetching"
  },
  "devDependencies": {
    "typescript": "catalog:typescript",
    "@types/react": "catalog:types",
    "tailwindcss": "catalog:uiStyles",
    "eslint": "catalog:lint"
  }
}
```

### NestJS API with Authentication

```json
{
  "dependencies": {
    "@nestjs/common": "catalog:nestjs",
    "@nestjs/core": "catalog:nestjs",
    "@nestjs/config": "catalog:nestjsModules",
    "@nestjs/jwt": "catalog:nestjsAuth",
    "passport": "catalog:nestjsAuth",
    "bcrypt": "catalog:nestjsAuth",
    "@nestjs/typeorm": "catalog:nestjsDatabase",
    "pg": "catalog:nestjsDatabase",
    "class-validator": "catalog:validation",
    "nestjs-pino": "catalog:logging"
  },
  "devDependencies": {
    "@nestjs/cli": "catalog:nestjsCli",
    "@nestjs/testing": "catalog:nestjsCli",
    "jest": "catalog:testing",
    "supertest": "catalog:testingUtils"
  }
}
```

---

## 🔄 Updating Catalogs

To update all dependencies to their latest versions:

```bash
bun update --latest
```

To update a specific catalog, edit the version in the root `package.json`
catalogs section.
