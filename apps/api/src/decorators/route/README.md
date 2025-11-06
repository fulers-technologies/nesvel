# Route Decorator

A comprehensive, enterprise-ready decorator for NestJS REST API endpoints that
combines all necessary decorators into one.

## Features

- ✅ **Smart Defaults** - Common configurations applied automatically
- ✅ **Presets** - Pre-configured templates for CRUD operations
- ✅ **Type Safety** - Full TypeScript support with generics
- ✅ **All HTTP Methods** - GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD, ALL
- ✅ **Complete Swagger Integration** - Full OpenAPI documentation
- ✅ **Authentication** - Bearer, API Key, Cookie, Basic, OAuth2
- ✅ **Caching** - Integrated with @nestjs/cache-manager
- ✅ **Security** - CORS, CSP, IP whitelisting, HTTPS enforcement
- ✅ **Enterprise** - Telemetry, circuit breakers, retry logic, feature flags
- ✅ **File Uploads** - Single and multiple file support

## Default Values

The decorator automatically applies these defaults (can be overridden):

```typescript
{
  consumes: [
    'application/json',
    'application/x-www-form-urlencoded',
  ],
  produces: ['application/json'],
  responseHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  responses: {
    ok: { description: 'Request successful' },
    created: { description: 'Resource created successfully' },
    accepted: { description: 'Request accepted for processing' },
    noContent: { description: 'Request successful with no content to return' },
    badRequest: 'Invalid request data',
    unauthorized: 'Authentication required',
    forbidden: 'Insufficient permissions to access this resource',
    notFound: 'Resource not found',
    conflict: 'Resource conflict or duplicate entry',
    unprocessableEntity: 'Validation failed for the provided data',
    tooManyRequests: 'Rate limit exceeded, please try again later',
    internalError: 'Internal server error occurred',
    // ... and more
  }
}
```

## Basic Usage

### Minimal Example

```typescript
@Route({
  method: 'GET',
  operation: { summary: 'Get users' },
})
findAll() { }
// All defaults are automatically applied:
// - Content types (JSON, form-urlencoded)
// - Security headers
// - Standard HTTP responses (200, 400, 401, 403, 404, 500, etc.)
```

### With Path Parameter

```typescript
@Route(':id', {
  method: 'GET',
  operation: { summary: 'Get user by ID' },
})
findOne(@Param('id') id: string) { }
```

### Using Presets

```typescript
@Route({
  preset: 'crud.list', // Auto-applies method, status, responses
  queries: [
    { name: 'page', type: Number, required: false },
    { name: 'limit', type: Number, required: false },
  ],
})
findAll() { }
```

## Available Presets

- `crud.list` - GET with pagination
- `crud.read` - GET by ID
- `crud.create` - POST with 201 status
- `crud.update` - PUT with validation
- `crud.delete` - DELETE operation
- `crud.patch` - PATCH for partial updates
- `health` - Health check endpoint
- `upload` - File upload endpoint
- `download` - File download endpoint

## Override Defaults

```typescript
@Route({
  method: 'POST',
  operation: { summary: 'Upload file' },
  consumes: ['multipart/form-data'], // Override default
  produces: ['application/json'], // Keep default
})
```

## Disable All Defaults

```typescript
@Route({
  method: 'GET',
  disableDefaults: true, // No defaults applied
  operation: { summary: 'Custom endpoint' },
  consumes: ['application/xml'], // Must specify everything
  produces: ['application/xml'],
})
```

## Caching

Uses `@nestjs/cache-manager` decorators:

```typescript
@Route({
  method: 'GET',
  cache: {
    enabled: true, // Applies CacheInterceptor
    key: 'users-list', // Custom cache key
    ttl: 60, // Time-to-live in seconds
  },
})
```

## Security Features

```typescript
@Route({
  method: 'POST',
  operation: { summary: 'Admin action' },
  roles: ['admin'], // RBAC
  auth: {
    bearer: true,
    apiKey: true,
  },
  security: {
    requireHttps: true,
    ipWhitelist: ['192.168.1.0/24'],
    csp: {
      'default-src': ["'self'"],
    },
  },
  cors: {
    origin: ['https://app.example.com'],
    credentials: true,
  },
})
```

## Enterprise Features

```typescript
@Route({
  method: 'PUT',
  operation: { summary: 'Update resource' },
  telemetry: {
    trace: true,
    metrics: true,
    spanName: 'update-user',
  },
  circuitBreaker: {
    threshold: 5,
    timeout: 3000,
  },
  retry: {
    attempts: 3,
    delay: 1000,
  },
  featureFlag: 'new-user-flow',
  throttle: {
    limit: 100,
    ttl: 60,
  },
})
```

## File Upload

```typescript
@Route({
  method: 'POST',
  operation: { summary: 'Upload avatar' },
  file: {
    fieldName: 'avatar',
    maxCount: 1,
    fileFilter: ['.jpg', '.png'],
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  },
})
uploadAvatar(@UploadedFile() file: Express.Multer.File) { }
```

## All Response Types

```typescript
@Route({
  method: 'POST',
  responses: {
    ok: { description: 'Success' },
    created: { description: 'Created' },
    accepted: { description: 'Accepted' },
    noContent: { description: 'No content' },
    badRequest: 'Invalid input',
    unauthorized: 'Not authenticated',
    forbidden: 'No permission',
    notFound: 'Not found',
    conflict: 'Already exists',
    unprocessableEntity: 'Validation failed',
    tooManyRequests: 'Rate limit exceeded',
    internalError: 'Server error',
    badGateway: 'Upstream error',
    serviceUnavailable: 'Service down',
    gatewayTimeout: 'Upstream timeout',
    custom: {
      418: { description: "I'm a teapot" },
    },
  },
})
```

## Complete Example

See `example.controller.ts` for a comprehensive example with every possible
option.

## Benefits

### Before

```typescript
@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get user' })
@ApiOkResponse({ description: 'User found' })
@ApiNotFoundResponse({ description: 'Not found' })
@ApiParam({ name: 'id', type: 'string' })
@UseInterceptors(CacheInterceptor)
@CacheKey('user-{{id}}')
@CacheTTL(300)
@SetMetadata('roles', ['user', 'admin'])
@ApiBearerAuth()
findOne(@Param('id') id: string) { }
```

### After

```typescript
@Route(':id', {
  preset: 'crud.read',
  cache: { key: 'user-{{id}}', ttl: 300 },
  roles: ['user', 'admin'],
  auth: { bearer: true },
})
findOne(@Param('id') id: string) { }
```

**Result: 50-70% less code, more readable, easier to maintain!**

## License

MIT
