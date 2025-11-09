# Enterprise Resilience Features

This document covers the production-ready resilience features including retry
strategies, circuit breakers, and rate limiting.

## Table of Contents

- [Client-Side Resilience](#client-side-resilience)
  - [Retry Strategies](#retry-strategies)
  - [Circuit Breakers](#circuit-breakers)
- [Server-Side Protection](#server-side-protection)
  - [Rate Limiting](#rate-limiting)
  - [Rate Limit Response](#rate-limit-response)

---

## Client-Side Resilience

### Retry Strategies

Retry strategies determine when and how failed requests should be retried, with
support for exponential backoff and jitter to prevent thundering herd problems.

#### Exponential Backoff Strategy

```typescript
import {
  ExponentialBackoffStrategy,
  PendingRequest,
} from '@nesvel/nestjs-http';

// Create strategy with full jitter (AWS recommendation)
const strategy = ExponentialBackoffStrategy.make({
  maxAttempts: 5,
  baseDelayMs: 1000, // Start with 1 second
  maxDelayMs: 30000, // Cap at 30 seconds
  multiplier: 2, // Double delay each time
  jitter: 'full', // Randomize delays
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryOnNetworkError: true,
});

// Use with HTTP client
const request = new PendingRequest();
// ... configure request with strategy
```

#### Jitter Types

- **`none`**: No randomization, use exact calculated delay
- **`full`**: Random delay between 0 and calculated delay (recommended)
- **`equal`**: Half delay + random half
- **`decorrelated`**: AWS-style decorrelated jitter

#### Retry-After Header Support

The strategy automatically respects `Retry-After` headers from server responses
(429, 503):

```typescript
// Server returns: Retry-After: 60
// Strategy will wait 60 seconds instead of using backoff calculation
```

#### Custom Retry Logic

```typescript
const strategy = ExponentialBackoffStrategy.make({
  maxAttempts: 5,
  shouldRetryPredicate: (context) => {
    // Custom logic: only retry on specific errors
    return context.statusCode === 503 || context.error?.code === 'ECONNRESET';
  },
});
```

#### Network Error Detection

Automatically retries on network errors:

- `ECONNREFUSED` - Connection refused
- `ECONNRESET` - Connection reset
- `ETIMEDOUT` - Request timeout
- `ENOTFOUND` - DNS resolution failed
- `ENETUNREACH` - Network unreachable
- `EAI_AGAIN` - DNS temporary failure
- `ECONNABORTED` - Connection aborted

---

### Circuit Breakers

Circuit breakers prevent cascading failures by blocking requests to failing
services and allowing them time to recover.

#### States

1. **CLOSED**: Normal operation, requests allowed
2. **OPEN**: Failures exceeded threshold, requests blocked
3. **HALF_OPEN**: Testing recovery, limited requests allowed

#### Basic Usage

```typescript
import { CircuitBreaker } from '@nesvel/nestjs-http';

const breaker = CircuitBreaker.make({
  failureThreshold: 5, // Open after 5 failures
  successThreshold: 2, // Close after 2 successes in half-open
  failureWindowMs: 60000, // Count failures in 1 minute window
  openTimeoutMs: 30000, // Stay open for 30 seconds
  resetTimeoutMs: 60000, // Reset counts after 1 minute
  failureStatusCodes: [500, 502, 503, 504],
  failOnNetworkError: true,
});

// Execute with circuit breaker
try {
  const result = await breaker.execute(async () => {
    return await httpClient.get('https://api.example.com/data');
  }, 'api.example.com');
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    console.log('Circuit is open. Retry at:', error.resetAt);
  }
}
```

#### Per-Host Circuit Breakers

Manage multiple circuit breakers, one per service:

```typescript
import { CircuitBreakerManager } from '@nesvel/nestjs-http';

const manager = CircuitBreakerManager.make({
  failureThreshold: 5,
  openTimeoutMs: 30000,
});

// Automatic per-host breaker management
await manager.execute('api.example.com', async () => {
  return await fetch('https://api.example.com/users');
});

await manager.execute('payment.service.com', async () => {
  return await fetch('https://payment.service.com/charge');
});

// Monitor all circuits
const metrics = manager.getAllMetrics();
const openCircuits = manager.getOpenCircuits();
console.log('Open circuits:', openCircuits);
```

#### Monitoring & Metrics

```typescript
const metrics = breaker.getMetrics();
console.log({
  state: metrics.state, // CLOSED, OPEN, HALF_OPEN
  failures: metrics.failures, // Failure count
  successes: metrics.successes, // Success count
  totalRequests: metrics.totalRequests, // Total requests
  lastFailureTime: metrics.lastFailureTime,
  circuitOpenedAt: metrics.circuitOpenedAt,
});
```

#### State Change Callbacks

```typescript
const breaker = CircuitBreaker.make({
  failureThreshold: 5,
  onStateChange: (from, to, reason) => {
    console.log(`Circuit ${from} -> ${to}: ${reason}`);
    // Send to monitoring system
    metrics.recordCircuitStateChange(from, to, reason);
  },
});
```

---

## Server-Side Protection

### Rate Limiting

Production-ready rate limiters with multiple algorithms and storage backends.

#### Token Bucket Algorithm

Smooth rate limiting with burst capacity. Ideal for APIs that allow traffic
bursts.

```typescript
import { TokenBucketLimiter, MemoryStore } from '@nesvel/nestjs-http';

const limiter = TokenBucketLimiter.make({
  capacity: 100, // Max 100 tokens
  refillRate: 10, // Add 10 tokens per second
  refillIntervalSeconds: 1,
  store: MemoryStore.make(),
});

// Check rate limit
const result = await limiter.attempt('user:123');
if (!result.allowed) {
  console.log(`Rate limited. Retry after ${result.retryAfter}s`);
}

// Variable cost per request
await limiter.attempt('user:123', 5); // Consume 5 tokens
```

#### Fixed Window Algorithm

Simple time-based windows. Memory-efficient but allows boundary bursts.

```typescript
import { FixedWindowLimiter, MemoryStore } from '@nesvel/nestjs-http';

const limiter = FixedWindowLimiter.make({
  limit: 100, // 100 requests
  windowSeconds: 60, // Per minute
  store: MemoryStore.make(),
});

const result = await limiter.attempt('user:123');
console.log(`${result.remaining}/${result.limit} requests remaining`);
```

#### Storage Backends

##### In-Memory Store

For single-instance applications or development:

```typescript
import { MemoryStore } from '@nesvel/nestjs-http';

const store = MemoryStore.make({
  cleanupIntervalMs: 60000, // Clean expired entries every minute
});
```

##### Redis Store (Custom Implementation)

For distributed production systems, implement the `RateLimitStore` interface:

```typescript
import { RateLimitStore } from '@nesvel/nestjs-http';
import { Redis } from 'ioredis';

export class RedisStore implements RateLimitStore {
  constructor(private redis: Redis) {}

  async increment(
    key: string,
    ttlSeconds: number,
    amount = 1
  ): Promise<number> {
    const result = await this.redis
      .multi()
      .incr(key, amount)
      .expire(key, ttlSeconds)
      .exec();
    return result[0][1];
  }

  async get(key: string): Promise<number> {
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  async set(key: string, value: number, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, value);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async ttl(key: string): Promise<number> {
    return await this.redis.ttl(key);
  }
}
```

#### NestJS Middleware Example

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import {
  Request,
  Response,
  TokenBucketLimiter,
  MemoryStore,
  RateLimitResponse,
} from '@nesvel/nestjs-http';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private limiter = TokenBucketLimiter.make({
    capacity: 100,
    refillRate: 10,
    store: MemoryStore.make(),
  });

  async use(req: Request, res: Response, next: () => void) {
    const key = req.ip || 'unknown';
    const result = await this.limiter.attempt(key);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.allowed) {
      return RateLimitResponse.fromResult(result).send(res);
    }

    next();
  }
}
```

---

### Rate Limit Response

Specialized HTTP response for rate limit exceeded (429 Too Many Requests).

#### Basic Usage

```typescript
import { RateLimitResponse } from '@nesvel/nestjs-http';

// Simple rate limit response
return RateLimitResponse.make(
  60, // retryAfter in seconds
  100, // limit
  'API rate limit exceeded'
);
```

#### From Rate Limiter Result

```typescript
const result = await limiter.attempt('user:123');
if (!result.allowed) {
  return RateLimitResponse.fromResult(result);
}
```

#### Response Headers

Automatically sets RFC-compliant headers:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699564800
Content-Type: application/json

{
  "message": "Too many requests. Please try again later.",
  "statusCode": 429,
  "error": "Too Many Requests",
  "limit": 100,
  "retryAfter": 60,
  "resetAt": 1699564800
}
```

---

## Complete Production Example

Combining all resilience features:

```typescript
import {
  HttpClient,
  ExponentialBackoffStrategy,
  CircuitBreakerManager,
  TokenBucketLimiter,
  MemoryStore,
  RateLimitResponse,
} from '@nesvel/nestjs-http';
import { Injectable, NestMiddleware } from '@nestjs/common';

// ============================================================================
// Client-Side: Resilient HTTP Client
// ============================================================================

@Injectable()
export class ResilientApiClient {
  private circuitBreakers = CircuitBreakerManager.make({
    failureThreshold: 5,
    openTimeoutMs: 30000,
    onStateChange: (from, to, reason) => {
      console.log(`Circuit ${from} -> ${to}: ${reason}`);
    },
  });

  private retryStrategy = ExponentialBackoffStrategy.make({
    maxAttempts: 5,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    jitter: 'full',
    retryOnNetworkError: true,
  });

  async callExternalApi(url: string, data: any) {
    const host = new URL(url).hostname;

    return this.circuitBreakers.execute(host, async () => {
      return HttpClient.asJson()
        .timeout(30)
        .retry(5, (attempt) => Math.pow(2, attempt) * 1000)
        .post(url, data);
    });
  }
}

// ============================================================================
// Server-Side: Rate Limiting Middleware
// ============================================================================

@Injectable()
export class ApiRateLimitMiddleware implements NestMiddleware {
  private limiter = TokenBucketLimiter.make({
    capacity: 1000, // 1000 requests burst
    refillRate: 100, // 100 requests per second sustained
    store: MemoryStore.make(),
  });

  async use(req: Request, res: Response, next: () => void) {
    // Use API key or IP for identification
    const key = req.header('X-API-Key') || req.ip || 'unknown';

    const result = await this.limiter.attempt(key);

    // Always set rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.allowed) {
      return RateLimitResponse.fromResult(
        result,
        'API rate limit exceeded. Please slow down.'
      ).send(res);
    }

    next();
  }
}
```

---

## Best Practices

### Client-Side

1. **Use full jitter** for retry delays to prevent thundering herd
2. **Set reasonable max attempts** (3-5 for most cases)
3. **Implement circuit breakers per host** to isolate failures
4. **Monitor circuit breaker states** and send alerts
5. **Respect Retry-After headers** from servers
6. **Use shorter timeouts** with more retries rather than one long timeout

### Server-Side

1. **Choose the right algorithm**:
   - Token bucket for smooth rate limiting with bursts
   - Fixed window for simplicity and low memory
   - Sliding window (implement custom) for precision
2. **Use Redis for distributed systems**
3. **Set appropriate limits** based on your infrastructure
4. **Always return proper 429 responses** with Retry-After
5. **Monitor rate limit hits** to detect abuse or adjust limits
6. **Consider different limits** for authenticated vs anonymous users

---

## Performance Considerations

- **Memory Store**: ~1KB per active key, suitable for <10K concurrent users
- **Circuit Breakers**: Minimal overhead, ~100 bytes per host
- **Retry Strategies**: No state storage, pure calculation
- **Rate Limiters**: 2-3 Redis/Memory operations per request

---

## Monitoring & Observability

```typescript
// Circuit breaker metrics
const metrics = circuitBreakerManager.getAllMetrics();
metrics.forEach((m) => {
  prometheus.gauge('circuit_breaker_state', m.state === 'OPEN' ? 1 : 0, {
    host: m.host,
  });
  prometheus.counter('circuit_breaker_failures', m.failures, { host: m.host });
});

// Rate limiter status
const status = await rateLimiter.status('user:123');
prometheus.gauge('rate_limit_remaining', status.remaining, {
  user: 'user:123',
});
```

---

## Further Reading

- [AWS Architecture Blog - Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [RFC 6585 - Additional HTTP Status Codes (429)](https://tools.ietf.org/html/rfc6585)
- [Martin Fowler - Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [IETF Draft - RateLimit Header Fields](https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers)
