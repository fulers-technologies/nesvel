# @nesvel/nestjs-http

Laravel-inspired HTTP client and server module for NestJS with fluent APIs.

## Features

- 🚀 **Fluent HTTP Client** - Laravel-style HTTP client with method chaining
- 🎯 **Enhanced Request/Response** - Extended Express req/res with helper
  methods
- 🔄 **Automatic Retries** - Built-in retry logic with exponential backoff
- 🧪 **Testing Support** - Fake responses and request assertions
- 📝 **TypeScript First** - Full type safety and IntelliSense support
- 🎨 **Consistent API** - Familiar Laravel patterns in TypeScript/NestJS
- 📦 **All-in-One** - Re-exports Express and @nestjs/axios for convenience

## Installation

```bash
# Using Bun (recommended for Nesvel monorepo)
bun add @nesvel/nestjs-http

# Using npm
npm install @nesvel/nestjs-http

# Using yarn
yarn add @nesvel/nestjs-http
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
bun add @nestjs/common @nestjs/core @nestjs/axios express reflect-metadata rxjs
```

## Table of Contents

- [HTTP Client](#http-client)
  - [Basic Usage](#basic-usage)
  - [Request Configuration](#request-configuration)
  - [Retry Logic](#retry-logic)
  - [Testing & Faking](#testing--faking)
  - [Concurrent Requests](#concurrent-requests)
- [HTTP Server](#http-server)
  - [Enhanced Request](#enhanced-request)
  - [Response Builders](#response-builders)
- [Middleware](#middleware)
- [TypeScript Types](#typescript-types)
- [API Reference](#api-reference)

## HTTP Client

### Basic Usage

The HTTP client provides a fluent, Laravel-style API for making HTTP requests:

```typescript
import { HttpClient } from '@nesvel/nestjs-http';

// Simple GET request
const response = await HttpClient.get('https://api.example.com/users');
console.log(response.data);

// POST request with data
const user = await HttpClient.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// Fluent API
const response = await HttpClient.withHeaders({
  'X-Custom-Header': 'value',
})
  .withToken('your-api-token')
  .timeout(30)
  .retry(3, 100)
  .post('https://api.example.com/users', userData);
```

### Request Configuration

Chain methods to configure your requests:

```typescript
import { HttpClient } from '@nesvel/nestjs-http';

const client = HttpClient
  // Base URL
  .baseUrl('https://api.example.com')

  // Headers
  .withHeaders({
    'Content-Type': 'application/json',
    'X-Api-Version': 'v1',
  })
  .accept('application/json')

  // Authentication
  .withToken('your-token', 'Bearer')
  .withBasicAuth('username', 'password')

  // Timeouts
  .timeout(30) // 30 seconds
  .connectTimeout(10) // 10 seconds to connect

  // Body format
  .asJson() // JSON body
  .asForm() // Form-encoded
  .asMultipart() // Multipart/form-data

  // File uploads
  .attach('avatar', fileBuffer, 'avatar.jpg');

// Make the request
const response = await client.post('/users', userData);
```

### Retry Logic

Automatically retry failed requests with exponential backoff:

```typescript
import { HttpClient } from '@nesvel/nestjs-http';

// Retry up to 3 times with 100ms delay
const response = await HttpClient.retry(3, 100).get(
  'https://api.example.com/users'
);

// Custom retry with exponential backoff
const response = await HttpClient.retry(5, (retryCount) => {
  return Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s, 8s, 16s
}).get('https://api.example.com/users');

// Conditional retry
const response = await HttpClient.retry(3, 100, (error, retryCount) => {
  // Only retry on network errors or 5xx responses
  return error.isNetworkError() || error.isServerError();
}).get('https://api.example.com/users');
```

### Testing & Faking

Fake HTTP responses for testing:

```typescript
import { HttpClient, RequestException } from '@nesvel/nestjs-http';

// Fake all requests
HttpClient.fake();

// Fake specific URLs
HttpClient.fake({
  'example.com/*': { data: { success: true }, status: 200 },
  'example.com/users': { data: [], status: 200 },
  'example.com/error': RequestException.make(/* ... */),
});

// Use sequences for multiple responses
HttpClient.fakeSequence('example.com/*')
  .push({ data: { id: 1 }, status: 200 })
  .push({ data: { id: 2 }, status: 200 })
  .push({ data: { id: 3 }, status: 200 });

// Make requests (they'll be faked)
await HttpClient.get('https://example.com/users');

// Assert requests were made
HttpClient.assertSent((request, response) => {
  return request.url?.includes('example.com');
});

HttpClient.assertSentCount(1);
HttpClient.assertNotSent((request) => request.url?.includes('other.com'));
```

### Concurrent Requests

Execute multiple requests concurrently:

```typescript
import { HttpClient } from '@nesvel/nestjs-http';

const results = await HttpClient.pool((pool) => [
  pool.get('https://api.example.com/users'),
  pool.get('https://api.example.com/posts'),
  pool.get('https://api.example.com/comments'),
]);

// Handle results
results.forEach((result, index) => {
  if (result.response) {
    console.log(`Request ${index} succeeded:`, result.response.data);
  } else {
    console.error(`Request ${index} failed:`, result.error);
  }
});
```

## HTTP Server

### Enhanced Request

Access request data with Laravel-style helper methods:

```typescript
import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from '@nesvel/nestjs-http';

@Controller('users')
export class UsersController {
  @Post()
  create(@Req() request: Request) {
    // Get input from body, query, or params
    const name = request.input('name');
    const email = request.input('email', 'default@example.com');

    // Get all input
    const allData = request.all();

    // Get only specific fields
    const data = request.only('name', 'email', 'age');

    // Get all except specific fields
    const dataExcept = request.except('password', 'token');

    // Check if input exists
    if (request.has('email')) {
      console.log('Email provided');
    }

    // Check if filled (not empty)
    if (request.filled('name')) {
      console.log('Name is not empty');
    }

    // Conditional execution
    request.whenFilled('bio', (bio) => {
      console.log('User provided bio:', bio);
    });

    return { data };
  }

  @Get()
  index(@Req() request: Request) {
    // Check request type
    if (request.expectsJson()) {
      return { format: 'json' };
    }

    // Get bearer token
    const token = request.bearerToken();

    // Check AJAX
    if (request.isAjax()) {
      return { ajax: true };
    }

    // Get full URL
    const url = request.fullUrl();
    const urlWithQuery = request.fullUrlWithQuery({ page: 2 });

    return { url, urlWithQuery };
  }
}
```

### Response Builders

Build responses with fluent APIs:

```typescript
import { Controller, Post, Res } from '@nestjs/common';
import { Response } from '@nesvel/nestjs-http';

@Controller('users')
export class UsersController {
  // JSON responses
  @Post()
  create(@Res() response: Response) {
    return response.json({ id: 1, name: 'John' }, 201);
  }

  // Created response
  @Post()
  store(@Res() response: Response) {
    return response.created({ id: 1 }, '/users/1');
  }

  // No content
  @Delete(':id')
  destroy(@Res() response: Response) {
    return response.noContent();
  }

  // Redirects
  @Get('old-path')
  redirect(@Res() response: Response) {
    return response.redirect('/new-path');
  }

  // Redirect with flash data
  @Post()
  submit(@Res() response: Response) {
    return response
      .redirect('/success')
      .with('message', 'Form submitted!')
      .withInput()
      .withErrors({ email: 'Invalid email' });
  }

  // File downloads
  @Get('download')
  download(@Res() response: Response) {
    return response.download('/path/to/file.pdf', 'document.pdf');
  }

  // Custom headers and cookies
  @Get()
  custom(@Res() response: Response) {
    return response
      .json({ data: [] })
      .header('X-Custom-Header', 'value')
      .cookie('session', 'abc123', { httpOnly: true })
      .cache(3600); // Cache for 1 hour
  }
}
```

## Middleware

Common HTTP middleware for NestJS applications:

```typescript
// TODO: Implement middleware examples
```

## TypeScript Types

The package provides comprehensive TypeScript types:

```typescript
import type {
  // Client types
  HttpMethod,
  HttpRequestConfig,
  RetryOptions,
  HttpMiddleware,
  ResponseMiddleware,
  StubCallback,
  RecordedRequest,
  FakeOptions,
  PoolRequest,
  PoolResult,
  FileAttachment,
  AssertionCallback,

  // Server types
  EnhancedRequest,
  CookieOptions,
  JsonResponseOptions,
  RedirectOptions,
  DownloadOptions,
  StreamOptions,
  CacheOptions,
  UploadedFile,
  ResponseBuilder,
} from '@nesvel/nestjs-http';
```

## Exception Handling

The package includes detailed exception classes:

```typescript
import {
  RequestException,
  ConnectionException,
  TimeoutException,
} from '@nesvel/nestjs-http';

try {
  await HttpClient.get('https://api.example.com/users');
} catch (error: Error | any) {
  if (error instanceof RequestException) {
    console.log('HTTP Error:', error.status());
    console.log('Body:', error.json());
  }

  if (error instanceof ConnectionException) {
    console.log('Connection failed:', error.getErrorCode());
  }

  if (error instanceof TimeoutException) {
    console.log('Timeout:', error.getTimeoutDuration());
  }
}
```

## Re-exported Dependencies

For convenience, this package re-exports Express and @nestjs/axios:

```typescript
// You can import Express types directly
import { Request, Response, NextFunction } from '@nesvel/nestjs-http';

// And NestJS Axios module
import { HttpModule, HttpService } from '@nesvel/nestjs-http';

@Module({
  imports: [HttpModule],
})
export class AppModule {}
```

## API Reference

### HttpClient

- `get(url, config?)` - Make GET request
- `post(url, data?, config?)` - Make POST request
- `put(url, data?, config?)` - Make PUT request
- `patch(url, data?, config?)` - Make PATCH request
- `delete(url, config?)` - Make DELETE request
- `head(url, config?)` - Make HEAD request
- `options(url, config?)` - Make OPTIONS request

### Request Configuration Methods

- `baseUrl(url)` - Set base URL
- `withHeaders(headers)` - Add headers
- `withToken(token, type?)` - Add auth token
- `withBasicAuth(user, pass)` - Add basic auth
- `withDigestAuth(user, pass)` - Add digest auth
- `accept(contentType)` - Set Accept header
- `contentType(type)` - Set Content-Type
- `asJson()` - Send as JSON
- `asForm()` - Send as form data
- `asMultipart()` - Send as multipart
- `timeout(seconds)` - Set timeout
- `connectTimeout(seconds)` - Set connection timeout
- `retry(times, delay?, when?)` - Configure retries
- `withMiddleware(fn)` - Add middleware
- `attach(name, contents, filename?)` - Attach file

### Response Methods

- `body()` - Get response body as string
- `json(key?, default?)` - Get JSON data
- `status()` - Get status code
- `successful()` - Check if 2xx
- `failed()` - Check if 4xx/5xx
- `clientError()` - Check if 4xx
- `serverError()` - Check if 5xx
- `header(name)` - Get header
- `headers()` - Get all headers

### Testing Methods

- `fake(callback?)` - Fake responses
- `fakeSequence(url?)` - Create sequence
- `recorded()` - Get recorded requests
- `assertSent(callback)` - Assert request sent
- `assertNotSent(callback)` - Assert not sent
- `assertSentCount(count)` - Assert count

## Contributing

Contributions are welcome! Please see the main Nesvel repository for
contribution guidelines.

## License

MIT © Nesvel Team

## Links

- [GitHub Repository](https://github.com/nesvel/nesvel)
- [Documentation](https://github.com/nesvel/nesvel/tree/main/packages/framework/http)
- [Issue Tracker](https://github.com/nesvel/nesvel/issues)
