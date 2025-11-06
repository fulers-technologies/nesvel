# Rate Limiting Usage Guide

## Overview

Rate limiting has been implemented using `@nestjs/throttler` with global
protection and per-route customization support.

## Global Configuration

Rate limiting is **automatically applied to all routes** via the
`ThrottlerGuard` in `app.module.ts`.

Default limits (production):

- **Short**: 10 requests per second (burst protection)
- **Medium**: 100 requests per 10 seconds
- **Long**: 1000 requests per minute

## Skip Rate Limiting

### Skip Entire Controller

```typescript
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('public')
export class PublicController {
  // All routes in this controller skip rate limiting
}
```

### Skip Specific Route

```typescript
@SkipThrottle()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

## Custom Rate Limits per Route

### Using Route Decorator

```typescript
import { Route, HttpMethod } from './decorators/route';

@Route({
  method: HttpMethod.POST,
  path: 'login',
  throttle: {
    limit: 5,        // 5 requests
    ttl: 60,         // per 60 seconds
  },
  responses: {
    ok: { description: 'Login successful' },
    tooManyRequests: 'Too many login attempts'
  }
})
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

### Using Direct Throttle Decorator

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 5, ttl: 60000 } }) // ttl in milliseconds
@Post('sensitive')
sensit iveOperation() {
  // Limited to 5 requests per 60 seconds
}
```

## Pre-configured Rate Limit Tiers

Use predefined tiers from `rate-limit.config.ts`:

```typescript
import { rateLimitConfig } from './config/rate-limit.config';

// Authentication endpoint (very strict)
@Route({
  method: HttpMethod.POST,
  path: 'register',
  throttle: rateLimitConfig.tiers.auth,  // 5 req/min in production
})
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}

// Mutation endpoint (moderate)
@Route({
  method: HttpMethod.POST,
  path: 'users',
  throttle: rateLimitConfig.tiers.mutation,  // 60 req/min in production
})
async createUser(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}

// Query endpoint (relaxed)
@Route({
  method: HttpMethod.GET,
  path: 'users',
  throttle: rateLimitConfig.tiers.query,  // 300 req/min in production
})
async listUsers() {
  return this.userService.findAll();
}

// File upload endpoint (strict)
@Route({
  method: HttpMethod.POST,
  path: 'upload',
  throttle: rateLimitConfig.tiers.upload,  // 10 req/min in production
  consumes: ['multipart/form-data'],
})
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return this.fileService.upload(file);
}
```

## Available Rate Limit Tiers

| Tier       | Production Limit | Development Limit | Use Case                            |
| ---------- | ---------------- | ----------------- | ----------------------------------- |
| `auth`     | 5/min            | 50/min            | Login, register, password reset     |
| `mutation` | 60/min           | 600/min           | POST, PUT, PATCH, DELETE operations |
| `query`    | 300/min          | 3000/min          | GET operations                      |
| `public`   | 100/min          | 1000/min          | Public endpoints                    |
| `upload`   | 10/min           | 100/min           | File uploads                        |

## Response Headers

When rate limited, the response includes these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1609459200
Retry-After: 60
```

## Error Response

When limit is exceeded:

```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later."
}
```

## Testing Rate Limits

In **development** mode, all limits are 10x-100x higher for easier testing.

To test rate limits:

```bash
# Send multiple requests quickly
for i in {1..15}; do
  curl http://localhost:3000/api/users
done
```

## Advanced: Redis Storage (Multi-Instance)

For production with multiple instances, use Redis storage:

```typescript
// In rate-limit.config.ts
import { ThrottlerStorageRedisService } from '@nestjs/throttler-storage-redis';
import Redis from 'ioredis';

export const rateLimitConfig: ThrottlerModuleOptions = {
  throttlers: [
    /* ... */
  ],
  storage: new ThrottlerStorageRedisService(
    new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    })
  ),
};
```

## Monitoring

Add logging to track rate limit hits:

```typescript
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    console.warn(`Rate limit exceeded: ${request.ip} ${request.url}`);

    // You can also send to monitoring service here

    return ctx.getResponse().status(429).json({
      statusCode: 429,
      message: exception.message,
    });
  }
}
```

## Best Practices

1. **Authentication endpoints**: Always use `auth` tier (very strict)
2. **Write operations**: Use `mutation` tier
3. **Read operations**: Use `query` tier
4. **Public APIs**: Use `public` tier with caution
5. **File uploads**: Use `upload` tier (resource intensive)
6. **Health checks**: Always skip rate limiting
7. **Monitoring**: Set up alerts for frequent 429 responses
8. **Testing**: Use development mode for testing, production for staging/prod

## Troubleshooting

### Issue: Getting 429 errors in development

**Solution**: Check `NODE_ENV` is set to `development`. Limits are much higher
in dev mode.

### Issue: Rate limiting not working

**Solution**: Verify `ThrottlerGuard` is registered as `APP_GUARD` in
`app.module.ts`.

### Issue: Need per-user rate limiting instead of per-IP

**Solution**: Create custom throttler guard extending `ThrottlerGuard`:

```typescript
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip; // Use user ID if authenticated
  }
}
```

---

For more information, see:

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- Configuration: `src/config/rate-limit.config.ts`
- Implementation: `src/app.module.ts`
