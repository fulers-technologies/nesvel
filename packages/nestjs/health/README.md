# @nesvel/nestjs-health

<p align="center">
  <strong>Production-ready health check module for NestJS applications</strong>
</p>

## Features

- 🏥 **Comprehensive Health Checks**: Database, Memory, Disk, HTTP services
- 🔌 **Kubernetes Ready**: Built-in liveness, readiness, and startup probes
- 📊 **Multiple Indicators**: MikroORM, Memory (Heap & RSS), Disk Storage, HTTP endpoints
- 🎯 **Type-Safe**: Full TypeScript support with detailed interfaces
- 🔧 **Highly Configurable**: Flexible thresholds and custom checks
- 📝 **Swagger Integration**: Automatic API documentation
- 🧩 **Extensible**: Easy to create custom health indicators
- 🎨 **Production-Ready**: Battle-tested patterns from @nestjs/terminus

## Installation

```bash
bun add @nesvel/nestjs-health
```

Peer dependencies:

```bash
bun add @nestjs/common @nestjs/core @nestjs/terminus reflect-metadata rxjs
```

Optional dependencies (based on indicators used):

```bash
# For HTTP health checks
bun add @nestjs/axios axios

# For MikroORM database checks
bun add @mikro-orm/core @mikro-orm/nestjs

# For Redis health checks (custom indicator example)
bun add ioredis
```

## Quick Start

### 1. Basic Setup

```typescript
import { Module } from '@nestjs/common';
import { HealthModule } from '@nesvel/nestjs-health';

@Module({
  imports: [
    // Default configuration (database, memory, disk checks enabled)
    HealthModule.forRoot(),
  ],
})
export class AppModule {}
```

This creates the following endpoints:

- `GET /health` - Full health check
- `GET /health/liveness` - Liveness probe
- `GET /health/readiness` - Readiness probe
- `GET /health/startup` - Startup probe

### 2. Custom Configuration

```typescript
import { HealthModule } from '@nesvel/nestjs-health';
import { healthConfig } from './config/health.config';

@Module({
  imports: [HealthModule.forRoot(healthConfig)],
})
export class AppModule {}
```

Create `health.config.ts`:

```typescript
import type { HealthModuleConfig } from '@nesvel/nestjs-health';
import { MEMORY_THRESHOLDS, DISK_THRESHOLDS, HTTP_TIMEOUTS } from '@nesvel/nestjs-health';

export const healthConfig: HealthModuleConfig = {
  // Base path for health endpoints
  basePath: 'health',

  // Swagger API tag
  apiTag: 'Health',

  // Enable/disable specific probes
  probes: {
    liveness: true,
    readiness: true,
    startup: true,
  },

  // Enable/disable built-in indicators
  indicators: {
    database: true, // MikroORM database check
    memory: true, // Heap & RSS memory checks
    disk: true, // Disk storage check
    http: false, // External HTTP service checks (disabled by default)
  },

  // Memory thresholds (in bytes)
  memoryThresholds: {
    heap: MEMORY_THRESHOLDS.HEAP_DEFAULT, // 150 MB
    rss: MEMORY_THRESHOLDS.RSS_DEFAULT, // 300 MB
  },

  // Disk thresholds
  diskThresholds: {
    thresholdPercent: DISK_THRESHOLDS.DEFAULT_PERCENT, // 0.9 (90%)
    path: process.cwd(),
  },

  // HTTP timeout for external service checks
  httpTimeout: HTTP_TIMEOUTS.DEFAULT, // 3000ms
};
```

## Health Indicators

### Database Health (MikroORM)

Checks database connectivity using MikroORM's ping method.

```typescript
import { Injectable } from '@nestjs/common';
import { MikroOrmHealthIndicator } from '@nesvel/nestjs-health';

@Injectable()
export class CustomHealthService {
  constructor(private readonly db: MikroOrmHealthIndicator) {}

  async checkDatabase() {
    // Basic check
    const result = await this.db.check();

    // Check with timeout
    const resultWithTimeout = await this.db.check('database', 5000);

    // Boolean check
    const isHealthy = await this.db.isHealthy();

    // Detailed check with connection info
    const detailed = await this.db.checkWithDetails('database');
  }
}
```

**Response Example:**

```json
{
  "database": {
    "status": "up",
    "message": "Database connection is healthy"
  }
}
```

### Memory Health

Monitors heap and RSS memory usage against configurable thresholds.

```typescript
import { Injectable } from '@nestjs/common';
import { MemoryHealthIndicator } from '@nesvel/nestjs-health';

@Injectable()
export class CustomHealthService {
  constructor(private readonly memory: MemoryHealthIndicator) {}

  async checkMemory() {
    // Check heap memory (default: 150 MB threshold)
    const heapCheck = await this.memory.checkHeap();

    // Check heap with custom threshold (200 MB)
    const customHeap = await this.memory.checkHeap('heap', 200 * 1024 * 1024);

    // Check RSS memory (default: 300 MB threshold)
    const rssCheck = await this.memory.checkRSS();

    // Check RSS with custom threshold (400 MB)
    const customRss = await this.memory.checkRSS('rss', 400 * 1024 * 1024);

    // Get current memory usage
    const usage = this.memory.getMemoryUsage();
  }
}
```

**Response Example:**

```json
{
  "memory_heap": {
    "status": "up",
    "used": 120000000,
    "threshold": 150000000
  },
  "memory_rss": {
    "status": "up",
    "used": 250000000,
    "threshold": 300000000
  }
}
```

### Disk Health

Monitors disk storage usage against configurable thresholds.

```typescript
import { Injectable } from '@nestjs/common';
import { DiskHealthIndicator } from '@nesvel/nestjs-health';

@Injectable()
export class CustomHealthService {
  constructor(private readonly disk: DiskHealthIndicator) {}

  async checkDisk() {
    // Check disk at current directory (90% threshold)
    const diskCheck = await this.disk.check();

    // Check specific path with custom threshold
    const customCheck = await this.disk.check(
      'disk',
      '/var/data',
      0.8, // 80% threshold
    );

    // Get disk storage info
    const storage = await this.disk.getStorageInfo('/var/data');
  }
}
```

**Response Example:**

```json
{
  "disk": {
    "status": "up",
    "path": "/app",
    "thresholdPercent": 0.9,
    "used": 45000000000,
    "total": 100000000000
  }
}
```

### HTTP Health

Checks external HTTP service availability.

```typescript
import { Injectable } from '@nestjs/common';
import { HttpHealthIndicator } from '@nesvel/nestjs-health';

@Injectable()
export class CustomHealthService {
  constructor(private readonly http: HttpHealthIndicator) {}

  async checkExternalServices() {
    // Check single service
    const apiCheck = await this.http.check('external-api', 'https://api.example.com/health');

    // Check with custom timeout
    const customTimeout = await this.http.check(
      'slow-api',
      'https://slow-api.example.com/health',
      10000, // 10 seconds
    );

    // Check multiple services
    const multiCheck = await this.http.checkMultiple([
      { key: 'api-1', url: 'https://api1.example.com/health' },
      { key: 'api-2', url: 'https://api2.example.com/health', timeout: 5000 },
    ]);

    // Check with response validation
    const validated = await this.http.checkWithValidation('api', 'https://api.example.com/health');
  }
}
```

**Response Example:**

```json
{
  "external-api": {
    "status": "up"
  }
}
```

## Custom Health Indicators

### Using BaseHealthIndicator

Create custom indicators by extending `BaseHealthIndicator`:

```typescript
import { Injectable } from '@nestjs/common';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { HealthIndicatorService } from '@nestjs/terminus';
import { BaseHealthIndicator } from '@nesvel/nestjs-health';
import { RedisService } from './redis.service';

/**
 * Redis Health Indicator
 *
 * Checks Redis connection health.
 */
@Injectable()
export class RedisHealthIndicator extends BaseHealthIndicator {
  constructor(
    healthIndicatorService: HealthIndicatorService,
    private readonly redis: RedisService,
  ) {
    super(healthIndicatorService);
  }

  /**
   * Check Redis Health
   *
   * @param key - Health check key
   * @returns Health indicator result
   */
  async check(key: string = 'redis'): Promise<HealthIndicatorResult> {
    // Option 1: Use safeExecute for automatic error handling
    return this.safeExecute(
      key,
      async () => {
        const pong = await this.redis.ping();
        return pong === 'PONG';
      },
      'Redis connection failed',
    );

    // Option 2: Use getResult for manual control
    // const isHealthy = await this.redis.ping() === 'PONG';
    // return this.getResult(key, isHealthy, {
    //   message: isHealthy ? 'Redis is healthy' : 'Redis is not responding',
    // });
  }
}
```

### Registering Custom Indicators

```typescript
import { HealthModule } from '@nesvel/nestjs-health';
import { RedisHealthIndicator } from './indicators/redis-health.indicator';
import { KafkaHealthIndicator } from './indicators/kafka-health.indicator';

@Module({
  imports: [
    HealthModule.forRoot({
      customIndicators: [RedisHealthIndicator, KafkaHealthIndicator],
      customChecks: [
        async () => {
          // Custom check logic
          return { customCheck: { status: 'up' } };
        },
      ],
    }),
  ],
})
export class AppModule {}
```

## Kubernetes Integration

### Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nestjs-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: nestjs-app:latest
          ports:
            - containerPort: 3000
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health/startup
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 30
```

### Probe Descriptions

#### Liveness Probe

Determines if the container should be restarted. Checks lightweight internal resources only (memory).

**Use case**: Restart pod if application deadlocks or enters unrecoverable state.

#### Readiness Probe

Determines if the container can receive traffic. Checks all dependencies (database, cache, etc.).

**Use case**: Remove pod from load balancer if dependencies are unavailable.

#### Startup Probe

Determines if the application has finished starting up. Runs once at startup.

**Use case**: Give slow-starting applications time to initialize before liveness checks begin.

## Advanced Configuration

### Probe-Specific Checks

```typescript
import { HealthModule } from '@nesvel/nestjs-health';

@Module({
  imports: [
    HealthModule.forRoot({
      // Liveness checks (lightweight, internal only)
      livenessChecks: [async () => ({ app: { status: 'up' } })],

      // Readiness checks (includes dependencies)
      readinessChecks: [
        async () => {
          // Check cache connectivity
          return { cache: { status: 'up' } };
        },
      ],

      // Startup checks (initialization validation)
      startupChecks: [
        async () => {
          // Check migrations are complete
          return { migrations: { status: 'up' } };
        },
      ],

      // Full health check (all indicators)
      customChecks: [async () => ({ version: { value: '1.0.0' } })],
    }),
  ],
})
export class AppModule {}
```

### Custom Paths and API Tags

```typescript
import { HealthModule } from '@nesvel/nestjs-health';

@Module({
  imports: [
    HealthModule.forRoot({
      basePath: 'status', // /status instead of /health
      apiTag: 'System Status', // Swagger tag
      livenessPath: 'alive', // /status/alive
      readinessPath: 'ready', // /status/ready
      startupPath: 'started', // /status/started
    }),
  ],
})
export class AppModule {}
```

### Disable Specific Probes

```typescript
import { HealthModule } from '@nesvel/nestjs-health';

@Module({
  imports: [
    HealthModule.forRoot({
      probes: {
        liveness: true,
        readiness: true,
        startup: false, // Disable startup probe
      },
    }),
  ],
})
export class AppModule {}
```

## Constants

The module exports useful constants for configuration:

```typescript
import {
  HEALTH_CHECK_KEYS,
  MEMORY_THRESHOLDS,
  DISK_THRESHOLDS,
  HTTP_TIMEOUTS,
} from '@nesvel/nestjs-health';

// Health check keys
HEALTH_CHECK_KEYS.DATABASE; // 'database'
HEALTH_CHECK_KEYS.MEMORY_HEAP; // 'memory_heap'
HEALTH_CHECK_KEYS.MEMORY_RSS; // 'memory_rss'
HEALTH_CHECK_KEYS.DISK; // 'disk'
HEALTH_CHECK_KEYS.HTTP_EXTERNAL; // 'http_external'

// Memory thresholds (in bytes)
MEMORY_THRESHOLDS.HEAP_DEFAULT; // 150 MB
MEMORY_THRESHOLDS.RSS_DEFAULT; // 300 MB
MEMORY_THRESHOLDS.HEAP_WARNING; // 100 MB
MEMORY_THRESHOLDS.RSS_WARNING; // 200 MB

// Disk thresholds
DISK_THRESHOLDS.DEFAULT_PERCENT; // 0.9 (90%)
DISK_THRESHOLDS.WARNING_PERCENT; // 0.8 (80%)

// HTTP timeouts (in milliseconds)
HTTP_TIMEOUTS.DEFAULT; // 3000
HTTP_TIMEOUTS.FAST; // 1000
HTTP_TIMEOUTS.SLOW; // 10000
```

## API Response Format

### Successful Health Check

```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "used": 120000000,
      "threshold": 150000000
    },
    "memory_rss": {
      "status": "up",
      "used": 250000000,
      "threshold": 300000000
    },
    "disk": {
      "status": "up",
      "path": "/app",
      "thresholdPercent": 0.9,
      "used": 45000000000,
      "total": 100000000000
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "used": 120000000,
      "threshold": 150000000
    },
    "memory_rss": {
      "status": "up",
      "used": 250000000,
      "threshold": 300000000
    },
    "disk": {
      "status": "up",
      "path": "/app",
      "thresholdPercent": 0.9,
      "used": 45000000000,
      "total": 100000000000
    }
  }
}
```

### Failed Health Check

```json
{
  "status": "error",
  "info": {
    "memory_heap": {
      "status": "up",
      "used": 120000000,
      "threshold": 150000000
    }
  },
  "error": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    }
  },
  "details": {
    "database": {
      "status": "down",
      "message": "Connection timeout"
    },
    "memory_heap": {
      "status": "up",
      "used": 120000000,
      "threshold": 150000000
    }
  }
}
```

## Testing

Mock health indicators in tests:

```typescript
import { Test } from '@nestjs/testing';
import { HealthCheckService } from '@nestjs/terminus';
import { MikroOrmHealthIndicator } from '@nesvel/nestjs-health';

const mockHealthIndicator = {
  check: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
  isHealthy: jest.fn().mockResolvedValue(true),
};

const module = await Test.createTestingModule({
  providers: [
    CustomHealthService,
    { provide: MikroOrmHealthIndicator, useValue: mockHealthIndicator },
  ],
}).compile();

const service = module.get(CustomHealthService);
const result = await service.checkDatabase();

expect(mockHealthIndicator.check).toHaveBeenCalled();
expect(result.database.status).toBe('up');
```

## Best Practices

### 1. Configure Appropriate Thresholds

Set thresholds based on your application's actual resource usage:

```typescript
// Development
memoryThresholds: {
  heap: 200 * 1024 * 1024,  // 200 MB
  rss: 400 * 1024 * 1024,   // 400 MB
}

// Production
memoryThresholds: {
  heap: 500 * 1024 * 1024,  // 500 MB
  rss: 1024 * 1024 * 1024,  // 1 GB
}
```

### 2. Keep Liveness Checks Lightweight

Liveness probes should only check internal application state:

```typescript
// ✅ Good: Lightweight internal check
livenessChecks: [async () => ({ app: { status: 'up' } })];

// ❌ Bad: Checks external dependencies
livenessChecks: [
  async () => await this.db.check(), // May cause false restarts
];
```

### 3. Use Readiness for Dependency Checks

Readiness probes should verify all critical dependencies:

```typescript
readinessChecks: [
  async () => await this.db.check(),
  async () => await this.redis.check(),
  async () => await this.cache.check(),
];
```

### 4. Configure Appropriate Timeouts

Set realistic timeouts for your environment:

```typescript
// Fast internal services
httpTimeout: 1000; // 1 second

// External APIs
httpTimeout: 5000; // 5 seconds

// Slow legacy systems
httpTimeout: 10000; // 10 seconds
```

### 5. Monitor Health Check Endpoints

Use observability tools to monitor health check response times and failures.

## Development

```bash
# Install dependencies
bun install

# Build
bun build

# Watch mode
bun build:watch

# Run tests
bun test

# Test coverage
bun test:cov

# Lint
bun lint

# Format
bun format
```

## License

MIT © Nesvel
