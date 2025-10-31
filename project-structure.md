# Final Clean Architecture Structure

## Key Principles

### 1. **interfaces/ vs types/ Separation**

In the **presentation layer**, we now have TWO folders:

```bash
presentation/
├── interfaces/          ← For `interface` definitions
│   └── find-post-store-state.interface.ts
└── types/              ← For `type` definitions  
    └── get-posts-store-state.type.ts
```

**When to use which:**

- Use `interfaces/` when defining with `interface` keyword (extensible, can be implemented)
- Use `types/` when defining with `type` keyword (type aliases, unions, etc.)

### 2. **Complete Module Structure**

```bash
module-name/
├── {module-name}.module.ts
├── application/
│   ├── interfaces/
│   │   ├── search-{entity}-payload.interface.ts
│   │   ├── search-{entity}-response.interface.ts
│   │   ├── find-{entity}-payload.interface.ts
│   │   ├── find-{entity}-response.interface.ts
│   │   ├── get-{entity}-payload.interface.ts
│   │   ├── get-{entity}-response.interface.ts
│   │   ├── create-{entity}-payload.interface.ts
│   │   ├── create-{entity}-response.interface.ts
│   │   ├── update-{entity}-payload.interface.ts
│   │   ├── update-{entity}-response.interface.ts
│   │   ├── delete-{entity}-payload.interface.ts
│   │   └── delete-{entity}-response.interface.ts
│   └── use-cases/
│       ├── search-{entity}.use-case.ts
│       ├── find-{entity}.use-case.ts
│       ├── get-{entity}.use-case.ts
│       ├── create-{entity}.use-case.ts
│       ├── update-{entity}.use-case.ts
│       └── delete-{entity}.use-case.ts
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts
│   └── interfaces/
│       └── {entity}-repository.interface.ts
├── infrastructure/
│   ├── repositories/
│   │   └── {entity}.repository.ts
│   └── dtos/
│       ├── get-{entity}.dto.ts
│       └── {entity}.dto.ts
└── presentation/
    ├── components/
    │   ├── {entity}-item.component.tsx
    │   ├── {entity}-form.component.tsx
    │   └── {entity}-list.component.tsx
    ├── pages/
    │   ├── {entity}.page.tsx
    │   └── {entity}-detail.page.tsx
    ├── i18n/
    │   └── en.ts
    ├── stores/
    │   ├── search-{entity}-store/
    │   │   ├── search-{entity}.store.ts
    │   │   ├── search-{entity}-store.context.ts
    │   │   ├── search-{entity}-store.provider.tsx
    │   │   └── use-search-{entity}-store.ts
    │   ├── find-{entity}-store/
    │   ├── get-{entity}-store/
    │   ├── create-{entity}-store/
    │   ├── update-{entity}-store/
    │   └── delete-{entity}-store/
    ├── interfaces/           ← Store state INTERFACES
    │   ├── search-{entity}-store-state.interface.ts
    │   ├── find-{entity}-store-state.interface.ts
    │   ├── get-{entity}-store-state.interface.ts
    │   ├── create-{entity}-store-state.interface.ts
    │   ├── update-{entity}-store-state.interface.ts
    │   └── delete-{entity}-store-state.interface.ts
    └── types/                ← Store state TYPES
        ├── search-{entity}-store-state.type.ts
        ├── find-{entity}-store-state.type.ts
        ├── get-{entity}-store-state.type.ts
        ├── create-{entity}-store-state.type.ts
        ├── update-{entity}-store-state.type.ts
        └── delete-{entity}-store-state.type.ts
```

## Naming Conventions

### Files

- **Modules**: `{module-name}.module.ts`
- **Entities**: `{entity-name}.entity.ts`
- **Interfaces**: `{interface-name}.interface.ts`
- **Repositories**: `{repository-name}.repository.ts`
- **Use Cases**: `{action-name}.use-case.ts`
- **DTOs**: `{dto-name}.dto.ts`
- **Queries**: `{query-name}.query.ts`
- **Components**: `{component-name}.component.tsx`
- **Pages**: `{page-name}.page.tsx`
- **Stores**: `{store-name}.store.ts`
- **Store Contexts**: `{store-name}-store.context.ts`
- **Store Providers**: `{store-name}-store.provider.tsx`
- **Store Hooks**: `use-{store-name}-store.ts`
- **Type Definitions**: `{type-name}.type.ts`

### Folders

- All lowercase **kebab-case**
- Descriptive names: `use-cases/`, `interfaces/`, `repositories/`, `dtos/`, `types/`

## Layer Responsibilities

### Domain Layer

- **Pure business logic** - no dependencies
- **entities/**: Core business objects
- **interfaces/**: Repository contracts (dependency inversion)

### Application Layer

- **Use cases** - orchestration of domain logic
- **interfaces/**: API contract interfaces (payload/response)
- Depends only on domain

### Infrastructure Layer

- **External concerns** - DB, APIs, frameworks
- **repositories/**: Concrete implementations of domain interfaces
- **dtos/**: Data transfer objects for persistence
- Depends on domain (implements interfaces)

### Presentation Layer

- **UI components** - React components, pages
- **interfaces/**: Store state interfaces (using `interface` keyword)
- **types/**: Store state types (using `type` keyword)
- **stores/**: MobX state management
- Depends on application + infrastructure

## Key Improvements

1. ✅ **kebab-case everywhere** (consistent naming)
2. ✅ **Descriptive suffixes** (`.entity.ts`, `.interface.ts`, `.use-case.ts`, etc.)
3. ✅ **Clear folder names** (`interfaces/`, `repositories/`, `dtos/`, `use-cases/`)
4. ✅ **Separation of concerns** (`presentation/interfaces/` vs `presentation/types/`)
5. ✅ **Complete CRUD** operations (search, find, get, create, update, delete)
6. ✅ **Store per use-case** (better isolation)
7. ✅ **No Hungarian notation** (no `I` prefix)

## Example: Post Module (Refactored)

```bash
post/
├── post.module.ts
├── application/
│   ├── interfaces/
│   │   ├── search-post-payload.interface.ts
│   │   ├── search-post-response.interface.ts
│   │   ├── find-post-payload.interface.ts
│   │   ├── find-post-response.interface.ts
│   │   ├── get-post-payload.interface.ts
│   │   ├── get-post-response.interface.ts
│   │   ├── get-posts-payload.interface.ts
│   │   ├── get-posts-response.interface.ts
│   │   ├── create-post-payload.interface.ts
│   │   ├── create-post-response.interface.ts
│   │   ├── update-post-payload.interface.ts
│   │   ├── update-post-response.interface.ts
│   │   ├── delete-post-payload.interface.ts
│   │   └── delete-post-response.interface.ts
│   └── use-cases/
│       ├── search-post.use-case.ts
│       ├── find-post.use-case.ts
│       ├── get-post.use-case.ts
│       ├── get-posts.use-case.ts
│       ├── create-post.use-case.ts
│       ├── update-post.use-case.ts
│       └── delete-post.use-case.ts
├── domain/
│   ├── entities/
│   │   └── post.entity.ts
│   └── interfaces/
│       └── post-repository.interface.ts
├── infrastructure/
│   ├── repositories/
│   │   └── post.repository.ts
│   └── dtos/
│       ├── get-posts.query.ts
│       └── post.dto.ts
└── presentation/
    ├── components/
    │   └── post-item.component.tsx
    ├── i18n/
    │   └── en.ts
    ├── interfaces/
    │   └── find-post-store-state.interface.ts
    ├── pages/
    │   ├── post.page.tsx
    │   └── posts.page.tsx
    ├── stores/
    │   ├── find-post-store/
    │   │   ├── find-post.store.ts
    │   │   ├── find-post-store.context.ts
    │   │   ├── find-post-store.provider.tsx
    │   │   └── use-find-post-store.ts
    │   └── get-posts-store/
    │       ├── get-posts.store.ts
    │       ├── get-posts-store.context.ts
    │       ├── get-posts-store.provider.tsx
    │       └── use-get-posts-store.ts
    └── types/
        └── get-posts-store-state.type.ts
```

## Benefits

- 🎯 **Clarity**: File purpose is immediately obvious from name
- 🔍 **Searchability**: Easy to find files with descriptive names
- 📦 **Scalability**: Consistent structure across all modules
- 🧪 **Testability**: Clear boundaries between layers
- 🔄 **Maintainability**: Easy to understand and modify
- 💪 **Type Safety**: Proper separation of interfaces and types
