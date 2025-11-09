# @nesvel/nestjs-logger

A comprehensive NestJS module for structured logging with pluggable driver
support. Built on top of [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
with an intuitive driver-based configuration pattern.

## Features

- 🚀 **Driver-Based Configuration** - Simple presets for common use cases
- 📝 **Multiple Outputs** - Console, File, or Combined (both)
- 🎨 **Pretty Console Logging** - Colorized, human-readable output for
  development
- 📊 **Structured JSON Logging** - Production-ready file output
- ⚡ **High Performance** - Powered by Pino, one of the fastest Node.js loggers
- 🔧 **Flexible Configuration** - Async configuration with ConfigService support
- 🌐 **Global Module** - Optional global registration
- 💪 **TypeScript First** - Full type safety and IntelliSense support

## Installation

```bash
bun add @nesvel/nestjs-logger
```

## Quick Start

### Console Driver (Development)

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule, LoggerDriverType } from '@nesvel/nestjs-logger';

@Module({
  imports: [
    LoggerModule.register({
      driver: LoggerDriverType.CONSOLE,
      console: {
        level: 'debug',
        colorize: true,
      },
      global: true,
    }),
  ],
})
export class AppModule {}
```

### File Driver (Production)

```typescript
LoggerModule.register({
  driver: LoggerDriverType.FILE,
  file: {
    level: 'info',
    destination: './logs/app.log',
  },
  global: true,
});
```

### Combined Driver (Development with Persistence)

```typescript
LoggerModule.register({
  driver: LoggerDriverType.COMBINED,
  combined: {
    console: {
      level: 'debug',
      colorize: true,
    },
    file: {
      level: 'info',
      destination: './logs/dev.log',
    },
  },
});
```

## Usage in Services

### Using PinoLogger (Recommended)

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@nesvel/nestjs-logger';

@Injectable()
export class UserService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(UserService.name);
  }

  async createUser(data: CreateUserDto) {
    this.logger.info({ data }, 'Creating new user');

    try {
      const user = await this.userRepository.create(data);
      this.logger.info({ userId: user.id }, 'User created successfully');
      return user;
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create user');
      throw error;
    }
  }
}
```

### Using Logger (NestJS Compatible)

```typescript
import { Injectable } from '@nestjs/common';
import { Logger } from '@nesvel/nestjs-logger';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  async processOrder(orderId: string) {
    this.logger.log(`Processing order ${orderId}`);
    this.logger.debug({ orderId }, 'Order details');
    this.logger.warn('Stock running low');
    this.logger.error('Payment failed', error.stack);
  }
}
```

## Configuration

### Driver Types

#### Console Driver

Pretty-printed, colorized output for development:

```typescript
{
  driver: LoggerDriverType.CONSOLE,
  console: {
    level: 'debug',              // Log level
    colorize: true,              // Enable colors
    translateTime: 'SYS:HH:MM:ss', // Time format
    ignore: 'pid,hostname',      // Omit fields
    singleLine: false,           // Multi-line objects
    messageKey: 'msg',           // Message property name
    errorKey: 'err'              // Error property name
  }
}
```

#### File Driver

Structured JSON output to file:

```typescript
{
  driver: LoggerDriverType.FILE,
  file: {
    level: 'info',
    destination: './logs/app.log', // File path
    mkdir: true,                   // Create directory
    append: true,                  // Append vs truncate
    sync: false                    // Synchronous writes
  }
}
```

#### Combined Driver

Output to both console and file:

```typescript
{
  driver: LoggerDriverType.COMBINED,
  combined: {
    console: {
      level: 'debug',
      colorize: true
    },
    file: {
      level: 'info',
      destination: './logs/app.log'
    }
  }
}
```

#### Custom Driver

Full control over nestjs-pino configuration:

```typescript
{
  driver: LoggerDriverType.CUSTOM,
  custom: {
    pinoHttp: {
      level: 'trace',
      transport: {
        targets: [
          {
            target: 'pino-roll',
            options: {
              file: 'logs/app.log',
              frequency: 'daily',
              size: '10m'
            }
          }
        ]
      },
      customProps: (req, res) => ({
        requestId: req.headers['x-request-id']
      })
    }
  }
}
```

### Async Configuration

#### With ConfigService

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule, LoggerDriverType } from '@nesvel/nestjs-logger';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        driver:
          config.get('NODE_ENV') === 'production'
            ? LoggerDriverType.FILE
            : LoggerDriverType.COMBINED,
        file: {
          level: config.get('LOG_LEVEL', 'info'),
          destination: config.get('LOG_FILE', './logs/app.log'),
        },
        combined: {
          console: {
            level: 'debug',
            colorize: true,
          },
          file: {
            level: 'info',
            destination: './logs/dev.log',
          },
        },
        global: true,
      }),
    }),
  ],
})
export class AppModule {}
```

#### With useClass

```typescript
import { Injectable } from '@nestjs/common';
import {
  LoggerModule,
  ILoggerOptionsFactory,
  ILoggerOptions,
  LoggerDriverType,
} from '@nesvel/nestjs-logger';

@Injectable()
export class LoggerConfigService implements ILoggerOptionsFactory {
  constructor(
    private readonly config: ConfigService,
    private readonly env: EnvironmentService
  ) {}

  createLoggerOptions(): ILoggerOptions {
    return {
      driver: this.env.isProduction()
        ? LoggerDriverType.FILE
        : LoggerDriverType.CONSOLE,
      file: {
        level: 'info',
        destination: this.config.get('LOG_FILE'),
      },
      console: {
        level: 'debug',
        colorize: true,
      },
    };
  }
}

@Module({
  imports: [
    LoggerModule.registerAsync({
      imports: [ConfigModule],
      useClass: LoggerConfigService,
    }),
  ],
})
export class AppModule {}
```

## HTTP Logging

`nestjs-pino` automatically logs HTTP requests and responses:

```typescript
// Logged automatically
[INFO] req: { method: 'GET', url: '/users/123', id: 1 }
[INFO] res: { statusCode: 200, responseTime: 42 }
```

Customize HTTP logging:

```typescript
{
  driver: LoggerDriverType.CUSTOM,
  custom: {
    pinoHttp: {
      customProps: (req, res) => ({
        userId: req.user?.id,
        correlationId: req.headers['x-correlation-id']
      }),
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            headers: req.headers,
            remoteAddress: req.socket.remoteAddress
          };
        }
      }
    }
  }
}
```

## Log Levels

- `trace` - Most verbose, detailed debugging
- `debug` - Debugging information
- `info` - General informational messages (default)
- `warn` - Warning messages
- `error` - Error messages
- `fatal` - Critical errors

```typescript
logger.trace('Very detailed debug info');
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred');
logger.fatal('Critical error');
```

## Best Practices

### 1. Use Structured Logging

```typescript
// ❌ Bad
logger.info(`User ${userId} created order ${orderId}`);

// ✅ Good
logger.info({ userId, orderId }, 'User created order');
```

### 2. Set Context

```typescript
// In constructor
this.logger.setContext(ServiceName.name);

// Or use class-based logger
private readonly logger = new Logger(ServiceName.name);
```

### 3. Log Appropriate Levels

```typescript
// Development/debugging
logger.debug({ query, params }, 'Executing database query');

// Production events
logger.info({ userId, action }, 'User action completed');

// Warnings
logger.warn({ threshold, current }, 'Approaching rate limit');

// Errors
logger.error({ error, context }, 'Operation failed');
```

### 4. Environment-Based Configuration

```typescript
{
  driver: process.env.NODE_ENV === 'production'
    ? LoggerDriverType.FILE
    : LoggerDriverType.COMBINED,
  file: {
    level: process.env.LOG_LEVEL || 'info',
    destination: process.env.LOG_FILE || './logs/app.log'
  }
}
```

## Testing

Mock the logger in tests:

```typescript
import { Test } from '@nestjs/testing';
import { PinoLogger } from '@nesvel/nestjs-logger';

describe('UserService', () => {
  let service: UserService;
  let logger: PinoLogger;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PinoLogger,
          useValue: {
            setContext: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    logger = module.get<PinoLogger>(PinoLogger);
  });

  it('should log user creation', async () => {
    await service.createUser(userData);
    expect(logger.info).toHaveBeenCalledWith(
      { data: userData },
      'Creating new user'
    );
  });
});
```

## Performance

Pino is one of the fastest Node.js loggers:

- **Asynchronous by default** - Non-blocking I/O
- **Minimal overhead** - Optimized for production
- **JSON output** - Fast parsing and indexing
- **Child loggers** - Efficient context binding

## Comparison with Other Loggers

| Feature            | @nesvel/nestjs-logger | Winston       | Bunyan      |
| ------------------ | --------------------- | ------------- | ----------- |
| Speed              | ⚡️ Fastest           | Moderate      | Fast        |
| JSON-first         | ✅                    | Via transport | ✅          |
| HTTP logging       | ✅ Built-in           | Manual        | Manual      |
| Configuration      | 🎯 Simple             | Complex       | Moderate    |
| NestJS integration | ✅ Native             | Via adapter   | Via adapter |

## License

MIT

## Credits

Built on top of:

- [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- [pino](https://github.com/pinojs/pino)
- [pino-pretty](https://github.com/pinojs/pino-pretty)

Part of the [Nesvel](https://github.com/nesvel/nesvel) framework.
