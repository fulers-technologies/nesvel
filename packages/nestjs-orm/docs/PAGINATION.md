# Laravel-Style Pagination System

Complete implementation of Laravel's pagination system for Nesvel ORM with full TypeScript support.

## Overview

This pagination system provides three types of pagination:

1. **LengthAwarePaginator** - Full offset pagination with total count (like Laravel's `paginate()`)
2. **SimplePaginator** - Offset pagination without total count (like Laravel's `simplePaginate()`)
3. **CursorPaginator** - Cursor-based pagination for large datasets (like Laravel's `cursorPaginate()`)

## Features

✅ **Laravel-compatible API** - All methods match Laravel's pagination
✅ **TypeScript support** - Full type safety
✅ **URL generation** - Automatic link generation with query parameters
✅ **Fluent interface** - Chainable methods like `withPath()`, `appends()`, `fragment()`
✅ **Express integration** - Works seamlessly with Express request/response
✅ **Customizable** - Configure page names, paths, and query parameters
✅ **Transform support** - `through()` method for data transformation

## Installation

The pagination utilities are located in:

```
/packages/nestjs-orm/src/utils/pagination/
```

Import from:

```typescript
import {
  LengthAwarePaginator,
  SimplePaginator,
  CursorPaginator,
  Pagination,
} from '@nesvel/nestjs-orm/utils/pagination';
```

## Usage Examples

### 1. LengthAwarePaginator (Full Pagination)

**Basic Usage:**

```typescript
import { LengthAwarePaginator } from '@nesvel/nestjs-orm/utils/pagination';

// Manual creation
const users = [
  /* ... user data ... */
];
const total = 150;
const perPage = 15;
const currentPage = 1;

const paginator = new LengthAwarePaginator(users, total, perPage, currentPage, {
  path: '/api/users',
  pageName: 'page',
});

// Get JSON response
const response = paginator.toJSON();
/*
{
  data: [...users...],
  meta: {
    currentPage: 1,
    perPage: 15,
    from: 1,
    to: 15,
    lastPage: 10,
    total: 150
  },
  links: {
    first: '/api/users?page=1',
    last: '/api/users?page=10',
    prev: null,
    next: '/api/users?page=2',
    pages: [...]
  }
}
*/
```

**From Express Request:**

```typescript
import { Request, Response } from 'express';

@Get('/users')
async getUsers(@Req() request: Request, @Res() response: Response) {
  const [users, total] = await userRepository.findAndCount({}, {
    limit: 15,
    offset: (currentPage - 1) * 15,
  });

  const paginator = LengthAwarePaginator.fromRequest(
    users,
    total,
    15, // perPage
    request
  );

  return response.json(paginator.toJSON());
}
```

**Laravel-Style Methods:**

```typescript
const paginator = new LengthAwarePaginator(users, total, perPage, currentPage);

// Get information
paginator.count(); // Number of items on current page
paginator.currentPage(); // Current page number
paginator.firstItem(); // Index of first item (e.g., 16)
paginator.lastItem(); // Index of last item (e.g., 30)
paginator.total(); // Total items (150)
paginator.perPage(); // Items per page (15)
paginator.lastPage(); // Last page number (10)
paginator.hasPages(); // Has multiple pages?
paginator.hasMorePages(); // Has next page?
paginator.onFirstPage(); // On first page?
paginator.onLastPage(); // On last page?

// Get URLs
paginator.url(5); // URL for page 5
paginator.nextPageUrl(); // URL for next page
paginator.previousPageUrl(); // URL for previous page
paginator.getUrlRange(1, 5); // URLs for pages 1-5

// Customize URLs
paginator
  .withPath('/admin/users') // Change base path
  .appends({ sort: 'name', filter: 'active' }) // Add query params
  .fragment('results'); // Add URL fragment

// Transform items
const dtos = paginator.through((user, index) => ({
  id: user.id,
  name: user.name,
  email: user.email,
}));
```

### 2. SimplePaginator (Without Total Count)

More performant when you don't need total count:

```typescript
import { SimplePaginator } from '@nesvel/nestjs-orm/utils/pagination';

// Fetch perPage + 1 to check if there are more pages
const users = await userRepository.find({}, { limit: 16 }); // +1

const paginator = new SimplePaginator(
  users, // Will automatically slice to perPage
  15, // perPage
  1, // currentPage
  { path: '/api/users' },
);

const response = paginator.toJSON();
/*
{
  data: [...15 users...],
  meta: {
    currentPage: 1,
    perPage: 15,
    from: 1,
    to: 15,
    hasMorePages: true  // No total or lastPage
  },
  links: {
    first: '/api/users?page=1',
    prev: null,
    next: '/api/users?page=2'
    // No 'last' or 'pages' array
  }
}
*/

// Available methods (subset of LengthAwarePaginator)
paginator.count();
paginator.currentPage();
paginator.hasMorePages(); // Only knows if NEXT page exists
paginator.nextPageUrl();
paginator.previousPageUrl();
```

### 3. CursorPaginator (Cursor-Based)

Best for infinite scroll and large datasets:

```typescript
import { CursorPaginator } from '@nesvel/nestjs-orm/utils/pagination';

@Get('/posts')
async getPosts(@Query('cursor') cursor?: string) {
  const perPage = 20;

  // Decode cursor if provided
  const decodedCursor = cursor
    ? Pagination.decodeCursor(cursor)
    : null;

  // Build query with cursor
  const query: any = {};
  if (decodedCursor) {
    query.id = { $lt: decodedCursor.parameters.id };
  }

  // Fetch perPage + 1 to check for more pages
  const posts = await postRepository.find(query, {
    orderBy: { id: 'DESC' },
    limit: perPage + 1,
  });

  const paginator = new CursorPaginator(
    posts,
    perPage,
    decodedCursor,
    { path: '/api/posts' }
  );

  return paginator.toJSON();
}

// Response format
/*
{
  data: [...posts...],
  meta: {
    perPage: 20,
    nextCursor: "eyJpZCI6MTAwfQ==",  // Base64 encoded
    prevCursor: null,
    hasMorePages: true
  },
  links: {
    prev: null,
    next: '/api/posts?cursor=eyJpZCI6MTAwfQ=='
  }
}
*/

// Methods
paginator.getCursor();       // Current cursor
paginator.nextCursor();      // Next cursor object
paginator.previousCursor();  // Previous cursor object
paginator.hasMorePages();
paginator.getItems();
```

## Controller Examples

### Complete NestJS Controller

```typescript
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@mikro-orm/nestjs';
import { LengthAwarePaginator, SimplePaginator } from '@nesvel/nestjs-orm/utils/pagination';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private userRepository: BaseRepository<User>,
  ) {}

  // Full pagination with total count
  @Get()
  async index(@Req() request: Request) {
    const perPage = 15;
    const page = parseInt(request.query.page as string) || 1;
    const offset = (page - 1) * perPage;

    const [users, total] = await this.userRepository.findAndCount(
      { isActive: true },
      { limit: perPage, offset },
    );

    const paginator = LengthAwarePaginator.fromRequest(users, total, perPage, request);

    return paginator.appends({ filter: request.query.filter }).toJSON();
  }

  // Simple pagination without total
  @Get('simple')
  async simpleList(@Req() request: Request) {
    const perPage = 15;
    const page = parseInt(request.query.page as string) || 1;
    const offset = (page - 1) * perPage;

    // Fetch +1 to check if more pages exist
    const users = await this.userRepository.find(
      { isActive: true },
      { limit: perPage + 1, offset },
    );

    const paginator = SimplePaginator.fromRequest(users, perPage, request);

    return paginator.toJSON();
  }

  // Cursor-based pagination
  @Get('cursor')
  async cursorList(@Query('cursor') cursor?: string, @Req() request?: Request) {
    const perPage = 20;
    const decodedCursor = cursor ? Pagination.decodeCursor(cursor) : null;

    const query: any = { isActive: true };
    if (decodedCursor?.parameters.id) {
      query.id = { $lt: decodedCursor.parameters.id };
    }

    const users = await this.userRepository.find(query, {
      orderBy: { id: 'DESC' },
      limit: perPage + 1,
    });

    const paginator = new CursorPaginator(users, perPage, decodedCursor, {
      path: '/api/users/cursor',
    });

    return paginator.toJSON();
  }
}
```

## Helper Utilities

### Pagination

```typescript
import { Pagination } from '@nesvel/nestjs-orm/utils/pagination';

// Resolve current page from request
const page = Pagination.resolveCurrentPage(request, 'page');

// Resolve current path
const path = Pagination.resolveCurrentPath(request);

// Get query parameters (excluding pagination params)
const query = Pagination.getQueryParameters(request, ['page', 'cursor']);

// Build URL with query string
const url = Pagination.buildUrl('/api/users', { page: 2, sort: 'name' }, 'results');
// Result: /api/users?page=2&sort=name#results

// Cursor encoding/decoding
const encoded = Pagination.encodeCursor({ id: 123, createdAt: Date.now() });
const decoded = Pagination.decodeCursor(encoded);

// Calculate pagination metadata
const { from, to } = Pagination.calculateFromTo(2, 15, 15, 150);
// from: 16, to: 30

const lastPage = Pagination.calculateLastPage(150, 15);
// lastPage: 10

// Generate page range for UI
const pages = Pagination.getPageRange(5, 20, 3);
// [1, -1, 2, 3, 4, 5, 6, 7, 8, -1, 20]
// -1 represents ellipsis (...)
```

## Response Formats

### LengthAwarePaginator Response

```typescript
{
  data: T[],
  meta: {
    currentPage: number,
    perPage: number,
    from: number | null,
    to: number | null,
    lastPage: number,
    total: number
  },
  links: {
    first: string | null,
    last: string | null,
    prev: string | null,
    next: string | null,
    pages: Array<{
      url: string | null,
      label: string,
      active: boolean
    }>
  }
}
```

### SimplePaginator Response

```typescript
{
  data: T[],
  meta: {
    currentPage: number,
    perPage: number,
    from: number | null,
    to: number | null,
    hasMorePages: boolean
  },
  links: {
    first: string | null,
    prev: string | null,
    next: string | null
  }
}
```

### CursorPaginator Response

```typescript
{
  data: T[],
  meta: {
    perPage: number,
    nextCursor: string | null,
    prevCursor: string | null,
    hasMorePages: boolean
  },
  links: {
    prev: string | null,
    next: string | null
  }
}
```

## Best Practices

### When to Use Each Type

**LengthAwarePaginator** ✅

- Admin panels with page numbers
- Search results with total count
- When users need to know total results
- When users need to jump to specific pages

**SimplePaginator** ✅

- Better performance (no COUNT query)
- Large datasets where total count is expensive
- When users only need next/prev navigation
- Mobile apps with simple pagination

**CursorPaginator** ✅

- Infinite scroll implementations
- Real-time feeds (Twitter, Facebook style)
- Very large datasets (millions of records)
- When data changes frequently
- Best performance for large offsets

### Performance Tips

1. **Use SimplePaginator** when you don't need total count
2. **Use CursorPaginator** for datasets > 100K records
3. **Index cursor fields** (id, createdAt, etc.)
4. **Limit perPage** to reasonable values (10-100)
5. **Cache total counts** for LengthAwarePaginator if data doesn't change often

### Security Considerations

1. **Validate page numbers**: Always ensure page > 0
2. **Limit perPage**: Set maximum limit (e.g., 100)
3. **Validate cursors**: Use try-catch when decoding
4. **Sanitize query params**: Don't trust user input

## Testing

```typescript
describe('LengthAwarePaginator', () => {
  it('should paginate correctly', () => {
    const items = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));
    const paginator = new LengthAwarePaginator(items, 150, 15, 1, {
      path: '/users',
    });

    expect(paginator.count()).toBe(15);
    expect(paginator.total()).toBe(150);
    expect(paginator.lastPage()).toBe(10);
    expect(paginator.hasMorePages()).toBe(true);
    expect(paginator.nextPageUrl()).toBe('/users?page=2');
  });
});
```

## TypeScript Types

All pagination classes are fully typed:

```typescript
import type {
  LengthAwarePaginatorResponse,
  SimplePaginatorResponse,
  CursorPaginatorResponse,
  PaginationMeta,
  PaginationLinks,
  Cursor,
  PaginatorOptions,
} from '@nesvel/nestjs-orm/utils/pagination';
```

## Migration from nestjs-paginate

If you're using nestjs-paginate, you can gradually migrate:

```typescript
// Old (nestjs-paginate)
import { paginate } from 'nestjs-paginate';
const result = await paginate(query, repository, config);

// New (Nesvel pagination)
const [data, total] = await repository.findAndCount(where, options);
const paginator = LengthAwarePaginator.fromRequest(data, total, perPage, request);
const result = paginator.toJSON();
```

## Conclusion

This pagination system provides a complete Laravel-style pagination experience with full TypeScript support, Express integration, and performance optimizations for different use cases.
