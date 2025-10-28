# 📁 Next.js Project Structure

Complete enterprise-level project structure following Next.js App Router conventions.

## 📂 Directory Structure

```
apps/web/
├── src/                                # Source directory (project root)
│   ├── app/                            # App Router directory
│   │   ├── (marketing)/                # Route group - marketing pages
│   │   │   ├── layout.tsx              # Marketing layout
│   │   │   └── page.tsx                # Marketing home page
│   │   │
│   │   ├── (dashboard)/                # Route group - dashboard pages
│   │   │   ├── layout.tsx              # Dashboard layout
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            # Dashboard home
│   │   │       └── loading.tsx         # Loading skeleton
│   │   │
│   │   ├── api/                        # API routes
│   │   │   └── health/
│   │   │       └── route.ts            # Health check endpoint
│   │   │
│   │   ├── _components/                # Private folder - not routable
│   │   │   └── Header.tsx              # Shared app components
│   │   │
│   │   ├── _lib/                       # Private folder - not routable
│   │   │   └── data.ts                 # Data fetching utilities
│   │   │
│   │   ├── __tests__/                  # App-level tests
│   │   ├── error.tsx                   # Global error boundary
│   │   ├── loading.tsx                 # Global loading state
│   │   ├── not-found.tsx               # Global 404 page
│   │   ├── layout.tsx                  # Root layout (will be created)
│   │   ├── robots.ts                   # Dynamic robots.txt
│   │   ├── sitemap.ts                  # Dynamic sitemap
│   │   └── manifest.ts                 # PWA manifest
│   │
│   ├── components/                     # React components
│   │   ├── ui/                         # UI components (buttons, inputs, etc.)
│   │   │   ├── Button.tsx
│   │   │   └── __tests__/
│   │   ├── layouts/                    # Layout components
│   │   ├── forms/                      # Form components
│   │   └── features/                   # Feature-specific components
│   │
│   ├── lib/                            # Utility libraries
│   │   ├── api/                        # API client
│   │   │   ├── client.ts               # HTTP client wrapper
│   │   │   └── __tests__/
│   │   ├── utils/                      # Helper utilities
│   │   │   ├── cn.ts                   # Class name merger
│   │   │   ├── date.ts                 # Date utilities
│   │   │   ├── string.ts               # String utilities
│   │   │   └── __tests__/
│   │   └── validations/                # Zod schemas
│   │
│   ├── hooks/                          # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── __tests__/
│   │
│   ├── types/                          # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── config/                         # Configuration files
│   │   ├── site.ts                     # Site configuration
│   │   └── constants.ts                # App constants
│   │
│   ├── styles/                         # Global styles
│   │   └── globals.css                 # Tailwind + custom styles
│   │
│   ├── env.ts                          # Environment validation (Zod)
│   └── middleware.ts                   # Next.js middleware
│
├── public/                             # Static assets
│   ├── icon-192.png
│   ├── icon-512.png
│   └── og.jpg
│
├── next.config.js                      # Next.js configuration
├── tsconfig.json                       # TypeScript configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── postcss.config.js                   # PostCSS configuration
├── package.json                        # Dependencies
├── .env.example                        # Environment variables template
├── .env.local                          # Local environment variables
├── Dockerfile                          # Docker configuration
├── .dockerignore                       # Docker ignore patterns
└── DEPLOYMENT.md                       # Deployment guide
```

## 📋 Key Concepts

### 1. **Route Groups** `(folder)`
Organize routes without affecting URL structure.

```
app/(marketing)/page.tsx       → /
app/(marketing)/about/page.tsx → /about
app/(dashboard)/page.tsx       → /
```

### 2. **Private Folders** `_folder`
Opt folders out of routing - for internal implementation.

```
app/_components/   → Not routable, safe for shared components
app/_lib/          → Not routable, safe for utilities
```

### 3. **Special Files**

| File | Purpose |
|------|---------|
| `layout.tsx` | Shared UI for route segments |
| `page.tsx` | Unique UI for a route |
| `loading.tsx` | Loading UI (Suspense boundary) |
| `error.tsx` | Error UI (Error boundary) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |

### 4. **Metadata Files**

| File | Purpose |
|------|---------|
| `robots.ts` | Dynamic robots.txt |
| `sitemap.ts` | Dynamic sitemap.xml |
| `manifest.ts` | PWA manifest |
| `icon.png` | App icon |
| `opengraph-image.jpg` | OG image |

## 🎯 Organization Strategies

### **1. Store Project Files Outside App** ✅ (Current)
All code in `src/` folders, `app/` purely for routing.

**Pros:**
- Clear separation of routing and logic
- Easy to find non-routing code
- Recommended for larger apps

### **2. Split by Feature**
Feature-specific code colocated with routes.

```
app/(dashboard)/
  ├── users/
  │   ├── _components/
  │   ├── _lib/
  │   └── page.tsx
```

**Use when:** Features are self-contained

### **3. Store Files in App**
All code inside `app/` directory.

```
app/
  ├── _components/
  ├── _lib/
  └── users/page.tsx
```

**Use when:** Small applications

## 🔍 Path Aliases

Configured in `tsconfig.json`:

```typescript
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { useDebounce } from '@/hooks/useDebounce';
import { env } from '@/env';
```

## 🧪 Testing Structure

Tests colocated with source code in `__tests__` folders:

```
src/
  ├── components/
  │   └── __tests__/
  ├── lib/
  │   └── __tests__/
  └── hooks/
      └── __tests__/
```

## 📝 Naming Conventions

- **Components:** PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Utilities:** camelCase (`formatDate.ts`, `apiClient.ts`)
- **Hooks:** camelCase with `use` prefix (`useDebounce.ts`)
- **Types:** PascalCase interfaces/types (`User`, `ApiResponse`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Route groups:** lowercase with parentheses (`(marketing)`)
- **Private folders:** underscore prefix (`_components`, `_lib`)

## 🚀 Next Steps

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Create root layout:**
   Update `src/app/layout.tsx` to import global styles

3. **Add more routes:**
   Create pages in route groups as needed

4. **Add components:**
   Build reusable UI components in `src/components/ui/`

5. **Set up validation:**
   Create Zod schemas in `src/lib/validations/`

6. **Write tests:**
   Add tests in `__tests__` folders

## 📚 Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Project Structure Guide](https://nextjs.org/docs/app/getting-started/project-structure)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Private Folders](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders)
