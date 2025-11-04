# Pagination Utilities

Fluent builder API for configuring pagination in NestJS applications using nestjs-paginate.

## Features

- ✅ **Fluent Builder Pattern** - Chain configuration methods for clean, readable code
- ✅ **Type-Safe** - Full TypeScript support with entity property inference
- ✅ **Flexible Configuration** - Configure sortables, searchables, limits, and default sorting
- ✅ **Compatible** - Works seamlessly with nestjs-paginate and MikroORM
- ✅ **Clean API** - Reduces boilerplate in controllers and services

## Installation

Already included in `@nesvel/nestjs-orm` package.

## Basic Usage

### Using the Builder Pattern

```typescript
import { paginate, PaginateQuery, Paginated } from '@nesvel/nestjs-orm';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
    return await paginate(this.userService.getRepository(), query)
      .withSortables(['id', 'name', 'email', 'createdAt'])
      .withSearchables(['name', 'email'])
      .withDefaultLimit(20)
      .withMaxLimit(100)
      .execute();
  }
}
```

### Using Traditional Config Object

```typescript
@Get()
async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<User>> {
  return await this.userService.getRepository().paginate(query, {
    sortables: ['id', 'name', 'email', 'createdAt'],
    searchables: ['name', 'email'],
    defaultLimit: 20,
    maxLimit: 100,
  });
}
```

## API Reference

### `paginate(repository, query)`

Creates a new `PaginationBuilder` instance.

**Parameters:**

- `repository: IRepository<T>` - The repository to paginate
- `query: PaginateQuery` - The pagination query from `@Paginate()` decorator

**Returns:** `PaginationBuilder<T>` - A builder instance for chaining

### Builder Methods

#### `.withSortables(fields)`

Configure which fields can be used for sorting.

```typescript
.withSortables(['id', 'name', 'createdAt', 'updatedAt'])
```

#### `.withSearchables(fields)`

Configure which fields can be searched.

```typescript
.withSearchables(['name', 'email', 'description'])
```

#### `.withDefaultSort(field, direction)`

Set the default sort order.

```typescript
import { SortDirection } from '@nesvel/nestjs-orm';

.withDefaultSort('createdAt', SortDirection.DESC)
```

#### `.withDefaultSorts(sortBy)`

Set multiple default sort orders.

```typescript
.withDefaultSorts([
  ['priority', SortDirection.DESC],
  ['createdAt', SortDirection.ASC]
])
```

#### `.withMaxLimit(limit)`

Set the maximum items per page.

```typescript
.withMaxLimit(100)
```

#### `.withDefaultLimit(limit)`

Set the default items per page.

```typescript
.withDefaultLimit(20)
```

#### `.execute()`

Execute the pagination query and return results.

```typescript
const result = await builder.execute();
```

#### `.getConfig()`

Get the current builder configuration (useful for debugging).

```typescript
const config = builder.getConfig();
console.log(config);
```

## Examples

### Basic Pagination

```typescript
const result = await paginate(orderRepository, query)
  .withSortables(['id', 'total', 'status'])
  .withSearchables(['customerName', 'orderNumber'])
  .withDefaultLimit(20)
  .execute();
```

### With Default Sorting

```typescript
const result = await paginate(postRepository, query)
  .withSortables(['id', 'title', 'publishedAt', 'views'])
  .withSearchables(['title', 'content'])
  .withDefaultSort('publishedAt', SortDirection.DESC)
  .withMaxLimit(50)
  .execute();
```

### Multiple Sort Criteria

```typescript
const result = await paginate(taskRepository, query)
  .withSortables(['id', 'priority', 'dueDate', 'status'])
  .withSearchables(['title', 'description'])
  .withDefaultSorts([
    ['priority', SortDirection.DESC],
    ['dueDate', SortDirection.ASC],
  ])
  .withDefaultLimit(25)
  .execute();
```

### In Services

```typescript
@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(query: PaginateQuery): Promise<Paginated<Product>> {
    return await paginate(this.productRepository, query)
      .withSortables(['id', 'name', 'price', 'stock', 'createdAt'])
      .withSearchables(['name', 'description', 'sku'])
      .withDefaultSort('createdAt', SortDirection.DESC)
      .withDefaultLimit(30)
      .withMaxLimit(100)
      .execute();
  }

  async findByCategory(categoryId: number, query: PaginateQuery): Promise<Paginated<Product>> {
    // Custom filtering with pagination
    const builder = paginate(this.productRepository, query)
      .withSortables(['price', 'name', 'stock'])
      .withSearchables(['name', 'description'])
      .withDefaultLimit(20);

    // You can still use repository methods with builder
    return await builder.execute();
  }
}
```

## Response Structure

The paginated response includes:

```typescript
{
  data: Order[],           // Array of entities
  meta: {
    itemsPerPage: 20,      // Current page size
    totalItems: 150,       // Total items in database
    currentPage: 1,        // Current page number
    totalPages: 8,         // Total number of pages
    sortBy: [['createdAt', 'DESC']],
    search: 'keyword',
    filter: { ... }
  },
  links: {
    first: '?page=1&limit=20',
    previous: null,
    current: '?page=1&limit=20',
    next: '?page=2&limit=20',
    last: '?page=8&limit=20'
  }
}
```

## Query Parameters

Clients can use the following query parameters:

- `?page=1` - Page number (1-indexed)
- `?limit=20` - Items per page
- `?sortBy=field:ASC` or `?sortBy=field:DESC` - Sort by field
- `?search=keyword` - Search across searchable fields
- `?filter.field=$eq:value` - Filter by field value

### Example Requests

```
GET /orders?page=1&limit=20
GET /orders?page=2&limit=50&sortBy=createdAt:DESC
GET /orders?search=customer&sortBy=total:DESC
GET /orders?filter.status=$eq:pending&sortBy=createdAt:ASC
```

## Best Practices

1. **Always set `maxLimit`** to prevent excessive data requests
2. **Choose reasonable `defaultLimit`** values (typically 20-50)
3. **Only expose sortable fields** that have database indexes
4. **Limit searchable fields** to string/text columns
5. **Use default sorting** for consistent ordering
6. **Cache results** when appropriate using the `@Route` decorator cache option

## Performance Tips

- Index all sortable columns in the database
- Keep searchable fields to a minimum
- Use full-text search for large text fields
- Consider caching frequently accessed pages
- Monitor query performance with telemetry

## See Also

- [nestjs-paginate Documentation](https://www.npmjs.com/package/nestjs-paginate)
- [BaseRepository API](../repositories/base.repository.ts)
- [Route Decorator Caching](../../apps/api/src/decorators/route/README.md)
