# NestJS PubSub

<div align="center">

**A comprehensive, production-ready NestJS module for pub/sub messaging with
pluggable driver support**

[![npm version](https://img.shields.io/npm/v/@nestjs-pubsub/core.svg?style=flat-square)](https://www.npmjs.com/package/@nestjs-pubsub/core)
[![npm downloads](https://img.shields.io/npm/dm/@nestjs-pubsub/core.svg?style=flat-square)](https://www.npmjs.com/package/@nestjs-pubsub/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0+-E0234E.svg?style=flat-square&logo=nestjs)](https://nestjs.com/)

[![Build Status](https://img.shields.io/github/actions/workflow/status/fulers-technologies/nestjs-pubsub/ci.yml?branch=main&style=flat-square)](https://github.com/fulers-technologies/nestjs-pubsub/actions)
[![Coverage Status](https://img.shields.io/codecov/c/github/fulers-technologies/nestjs-pubsub?style=flat-square)](https://codecov.io/gh/fulers-technologies/nestjs-pubsub)
[![Code Quality](https://img.shields.io/codacy/grade/your-project-id?style=flat-square)](https://www.codacy.com/app/fulers-technologies/nestjs-pubsub)
[![Known Vulnerabilities](https://snyk.io/test/github/fulers-technologies/nestjs-pubsub/badge.svg?style=flat-square)](https://snyk.io/test/github/fulers-technologies/nestjs-pubsub)

[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat-square&logo=apache-kafka&logoColor=white)](https://kafka.apache.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)](https://cloud.google.com/pubsub)

[Features](#-features) • [Installation](#-installation) •
[Quick Start](#-quick-start) • [Documentation](#-documentation) •
[Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔌 **Multi-Driver Support**

- **Redis** - Fast, in-memory pub/sub
- **Kafka** - Distributed event streaming
- **Google Cloud Pub/Sub** - Scalable messaging
- Easy to extend with custom drivers

### 🎯 **Developer Experience**

- **Decorator-based** API for clean code
- **Type-safe** with full TypeScript support
- **Auto-completion** in modern IDEs
- Comprehensive error messages

</td>
<td width="50%">

### ⚡ **Production Ready**

- **Async configuration** with ConfigService
- **Lifecycle management** (connect/disconnect)
- **Error handling** with custom exceptions
- **Retry logic** and connection pooling

### 📦 **Enterprise Features**

- **Message filtering** at subscription level
- **Custom serialization** support
- **Driver-specific options** for fine-tuning
- **100% test coverage** with Jest

</td>
</tr>
</table>

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
  - [Redis Configuration](#redis-configuration)
  - [Kafka Configuration](#kafka-configuration)
  - [Google PubSub Configuration](#google-pubsub-configuration)
  - [Environment Variables](#environment-variables)
- [Usage](#-usage)
  - [Publishing Messages](#publishing-messages)
  - [Subscribing to Messages](#subscribing-to-messages)
  - [Advanced Subscriptions](#advanced-subscriptions)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Testing](#-testing)
- [Architecture](#-architecture)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📦 Installation

```bash
# Using npm
npm install @nestjs-pubsub/core

# Using yarn
yarn add @nestjs-pubsub/core

# Using pnpm
pnpm add @nestjs-pubsub/core
```

### Driver Dependencies

Install the driver(s) you plan to use:

```bash
# For Redis
npm install ioredis

# For Kafka
npm install kafkajs

# For Google Cloud Pub/Sub
npm install @google-cloud/pubsub
```

---

## 🚀 Quick Start

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { PubSubModule } from '@nestjs-pubsub/core';
import { PubSubDriverType } from '@nestjs-pubsub/core';

@Module({
  imports: [
    PubSubModule.register({
      driver: PubSubDriverType.REDIS,
      driverOptions: {
        host: 'localhost',
        port: 6379,
      },
      autoConnect: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Inject and Use the Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPubSub, PubSubService } from '@nestjs-pubsub/core';

@Injectable()
export class UserService {
  constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}

  async createUser(userData: any) {
    // Create user logic...

    // Publish event
    await this.pubsub.publish('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });
  }
}
```

### 3. Subscribe to Messages

```typescript
import { Injectable } from '@nestjs/common';
import { Subscribe } from '@nestjs-pubsub/core';

@Injectable()
export class NotificationService {
  @Subscribe('user.created')
  async handleUserCreated(message: any) {
    console.log('New user created:', message.data);

    // Send welcome email...
  }
}
```

---

## ⚙️ Configuration

### Synchronous Configuration

```typescript
PubSubModule.register({
  driver: PubSubDriverType.REDIS,
  driverOptions: {
    host: 'localhost',
    port: 6379,
  },
  autoConnect: true,
  global: true,
});
```

### Asynchronous Configuration

```typescript
PubSubModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    driver: config.get('PUBSUB_DRIVER'),
    driverOptions: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
    },
    autoConnect: true,
  }),
});
```

### Using Configuration Helper

```typescript
import { ConfigModule } from '@nestjs/config';
import { PubSubModule, getPubSubConfig } from '@nestjs-pubsub/core';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PubSubModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getPubSubConfig,
    }),
  ],
})
export class AppModule {}
```

---

## 🔧 Driver Configurations

### Redis Configuration

```typescript
{
  driver: PubSubDriverType.REDIS,
  driverOptions: {
    host: 'localhost',
    port: 6379,
    password: 'your-password',
    db: 0,
    keyPrefix: 'app:',
    retryStrategy: (times) => Math.min(times * 50, 2000),
  }
}
```

**Environment Variables:**

```env
PUBSUB_DRIVER=redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret
REDIS_DB=0
REDIS_KEY_PREFIX=app:
```

### Kafka Configuration

```typescript
{
  driver: PubSubDriverType.KAFKA,
  driverOptions: {
    clientId: 'my-app',
    brokers: ['localhost:9092'],
    groupId: 'my-consumer-group',
    ssl: true,
    sasl: {
      mechanism: 'plain',
      username: 'user',
      password: 'password',
    },
  }
}
```

**Environment Variables:**

```env
PUBSUB_DRIVER=kafka
KAFKA_CLIENT_ID=my-app
KAFKA_BROKERS=localhost:9092,localhost:9093
KAFKA_GROUP_ID=my-consumer-group
KAFKA_SSL_ENABLED=true
KAFKA_SASL_MECHANISM=plain
KAFKA_SASL_USERNAME=user
KAFKA_SASL_PASSWORD=password
```

### Google PubSub Configuration

```typescript
{
  driver: PubSubDriverType.GOOGLE_PUBSUB,
  driverOptions: {
    projectId: 'my-gcp-project',
    keyFilename: '/path/to/service-account.json',
    // Or use credentials directly
    credentials: {
      client_email: 'service@project.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\n...',
    },
  }
}
```

**Environment Variables:**

```env
PUBSUB_DRIVER=google-pubsub
GOOGLE_CLOUD_PROJECT_ID=my-gcp-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 💡 Usage

### Publishing Messages

#### Basic Publishing

```typescript
await this.pubsub.publish('order.placed', {
  orderId: '12345',
  amount: 99.99,
  currency: 'USD',
});
```

#### Publishing with Options

```typescript
await this.pubsub.publish(
  'payment.processed',
  { paymentId: 'pay_123', status: 'success' },
  {
    priority: 'high',
    ttl: 3600,
    headers: { 'x-correlation-id': 'abc-123' },
  },
);
```

### Subscribing to Messages

#### Basic Subscription

```typescript
@Injectable()
export class OrderService {
  @Subscribe('order.placed')
  async handleOrderPlaced(message: IPubSubMessage) {
    console.log('Order received:', message.data);

    // Process order...
  }
}
```

#### Subscription with Filter

```typescript
@Subscribe('payment.processed', {
  filter: (message) => message.data.amount > 100,
})
async handleLargePayment(message: IPubSubMessage) {
  console.log('Large payment detected:', message.data);
  // Send notification to admin...
}
```

#### Subscription with Error Handler

```typescript
@Subscribe('notification.send', {
  onError: (error, message) => {
    console.error('Failed to send notification:', error);

    // Log to error tracking service...
  },
})
async handleNotification(message: IPubSubMessage) {
  await this.sendEmail(message.data);
}
```

#### Subscription with Driver Options

```typescript
@Subscribe('analytics.event', {
  driverOptions: {
    ackDeadline: 60, // Google PubSub
    maxMessages: 10,
  },
})
async handleAnalytics(message: IPubSubMessage) {
  await this.processAnalytics(message.data);
}
```

### Advanced Subscriptions

#### Multiple Topics

```typescript
@Injectable()
export class AuditService {
  @Subscribe('user.created')
  async handleUserCreated(message: IPubSubMessage) {
    await this.logEvent('user_created', message.data);
  }

  @Subscribe('user.updated')
  async handleUserUpdated(message: IPubSubMessage) {
    await this.logEvent('user_updated', message.data);
  }

  @Subscribe('user.deleted')
  async handleUserDeleted(message: IPubSubMessage) {
    await this.logEvent('user_deleted', message.data);
  }
}
```

#### Programmatic Subscription

```typescript
@Injectable()
export class DynamicSubscriberService implements OnModuleInit {
  constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}

  async onModuleInit() {
    await this.pubsub.subscribe('dynamic.topic', async (message) => {
      console.log('Received:', message);
    });
  }
}
```

---

## 📚 API Reference

### PubSubService

#### Methods

| Method                                | Description                           | Parameters                                                      | Returns         |
| ------------------------------------- | ------------------------------------- | --------------------------------------------------------------- | --------------- |
| `connect()`                           | Connect to the messaging backend      | None                                                            | `Promise<void>` |
| `disconnect()`                        | Disconnect from the messaging backend | None                                                            | `Promise<void>` |
| `publish(topic, data, options?)`      | Publish a message to a topic          | `topic: string`<br>`data: any`<br>`options?: any`               | `Promise<void>` |
| `subscribe(topic, handler, options?)` | Subscribe to a topic                  | `topic: string`<br>`handler: MessageHandler`<br>`options?: any` | `Promise<void>` |
| `unsubscribe(topic)`                  | Unsubscribe from a topic              | `topic: string`                                                 | `Promise<void>` |
| `isConnected()`                       | Check connection status               | None                                                            | `boolean`       |

### Decorators

#### @Subscribe(topic, options?)

Marks a method as a message handler for a specific topic.

**Parameters:**

- `topic: string` - The topic to subscribe to
- `options?: SubscriptionOptions` - Optional configuration

**Options:**

```typescript
interface SubscriptionOptions {
  filter?: (message: IPubSubMessage) => boolean;
  onError?: (error: Error, message: IPubSubMessage) => void;
  driverOptions?: any;
}
```

#### @InjectPubSub()

Injects the PubSubService into a constructor parameter.

```typescript
constructor(@InjectPubSub() private readonly pubsub: PubSubService) {}
```

### Interfaces

#### IPubSubMessage

```typescript
interface IPubSubMessage<T = any> {
  id: string;
  topic: string;
  data: T;
  timestamp: Date;
  attributes?: Record<string, string>;
}
```

#### IPubSubOptions

```typescript
interface IPubSubOptions {
  driver: PubSubDriverType | string;
  driverOptions: any;
  global?: boolean;
  autoConnect?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}
```

---

## 📖 Examples

Explore complete working examples in the [`__examples__`](./__examples__)
directory:

- **[Redis Example](./__examples__/redis/main.ts)** - Complete Redis pub/sub
  implementation
- **[Kafka Example](./__examples__/kafka/main.ts)** - Kafka event streaming
  setup
- **[Google PubSub Example](./__examples__/google-pubsub/main.ts)** - Google
  Cloud integration
- **[Config Example](./__examples__/config-example/main.ts)** - Using
  ConfigService for dynamic configuration

### Running Examples

```bash
# Install dependencies
npm install

# Run Redis example
npm run example:redis

# Run Kafka example
npm run example:kafka

# Run Google PubSub example
npm run example:google-pubsub
```

---

## 🧪 Testing

The package includes comprehensive tests with 100% coverage.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run tests in debug mode
npm run test:debug
```

### Test Coverage

| Component  | Coverage |
| ---------- | -------- |
| Services   | 100%     |
| Drivers    | 100%     |
| Decorators | 100%     |
| Exceptions | 100%     |
| Utilities  | 100%     |

See [TESTING.md](./TESTING.md) for detailed testing documentation.

---

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │ Controllers  │  │   Modules    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    PubSub Module (Core)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PubSubService (Facade)                  │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────┴─────────────────────────────────┐   │
│  │           IPubSubDriver (Interface)                  │   │
│  └────┬──────────────────┬──────────────────┬──────────┘   │
│       │                  │                  │               │
│  ┌────┴────┐      ┌──────┴──────┐    ┌─────┴──────┐       │
│  │  Redis  │      │    Kafka    │    │   Google   │       │
│  │ Driver  │      │   Driver    │    │   PubSub   │       │
│  └────┬────┘      └──────┬──────┘    └─────┬──────┘       │
└───────┼──────────────────┼─────────────────┼──────────────┘
        │                  │                  │
┌───────┴──────────────────┴──────────────────┴──────────────┐
│              Messaging Infrastructure                        │
│  ┌──────────┐      ┌──────────┐      ┌──────────────┐      │
│  │  Redis   │      │  Kafka   │      │ Google Cloud │      │
│  │  Server  │      │ Cluster  │      │   Pub/Sub    │      │
│  └──────────┘      └──────────┘      └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Factory Pattern** - Driver instantiation
- **Strategy Pattern** - Pluggable drivers
- **Facade Pattern** - Unified service interface
- **Decorator Pattern** - Subscription registration
- **Dependency Injection** - NestJS integration

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for
details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/fulers-technologies/nestjs-pubsub.git
cd nestjs-pubsub

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE)
file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Redis](https://redis.io/) - In-memory data structure store
- [Apache Kafka](https://kafka.apache.org/) - Distributed event streaming
  platform
- [Google Cloud Pub/Sub](https://cloud.google.com/pubsub) - Messaging and
  ingestion service

---

## 📞 Support

- 📧 Email: support@nestjs-pubsub.dev
- 💬 Discord: [Join our community](https://discord.gg/nestjs-pubsub)
- 🐛 Issues: [GitHub Issues](https://github.com/fulers-technologies/nestjs-pubsub/issues)
- 📖 Documentation: [Full Documentation](https://nestjs-pubsub.dev/docs)

---

## 🗺️ Roadmap

- [ ] RabbitMQ driver support
- [ ] AWS SNS/SQS driver support
- [ ] Azure Service Bus driver support
- [ ] Message batching support
- [ ] Dead letter queue support
- [ ] Metrics and monitoring integration
- [ ] GraphQL subscriptions integration
- [ ] WebSocket gateway integration

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/fulers-technologies/nestjs-pubsub?style=social)
![GitHub forks](https://img.shields.io/github/forks/fulers-technologies/nestjs-pubsub?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/fulers-technologies/nestjs-pubsub?style=social)

---

<div align="center">

**Made with ❤️ by the NestJS community**

[⬆ Back to Top](#nestjs-pubsub)

</div>
