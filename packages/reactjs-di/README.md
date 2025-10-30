# @nesvel/reactjs-di

[![npm version](https://img.shields.io/npm/v/@nesvel/reactjs-di.svg)](https://www.npmjs.com/package/@nesvel/reactjs-di)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2F19-61DAFB)](https://reactjs.org/)

> A powerful, type-safe dependency injection library for React applications powered by [Inversiland](https://github.com/inversiland/inversiland) with built-in route management.

## ✨ Features

- 🎯 **Type-Safe DI** - Full TypeScript support with strong typing
- ⚡ **React Hooks** - Easy service access with `useDI`, `useOptionalDI`, `useServices`
- 🎨 **Decorator-Based** - Clean, declarative syntax with `@injectable`, `@RouteModule`, `@Route`
- 📦 **Modular Architecture** - Organize code by feature modules
- 🛣️ **Route Management** - Built-in React Router integration
- 🔧 **Zero-Config** - Works out of the box with sensible defaults
- 🧪 **Testing Utilities** - Comprehensive mocking and testing support
- 📊 **Performance Monitoring** - Optional performance tracking
- 🏭 **Service Factories** - Dynamic service creation with caching
- 🔍 **Type Guards** - Runtime validation utilities

## 📦 Installation

```bash
npm install @nesvel/reactjs-di reflect-metadata

# or
yarn add @nesvel/reactjs-di reflect-metadata

# or
bun add @nesvel/reactjs-di reflect-metadata
```

### Peer Dependencies

```bash
npm install react@^18.0.0

# Optional (for route management)
npm install react-router@^7.0.0
```

### TypeScript Configuration

Enable decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 🚀 Quick Start

### 1. Define a Service

```tsx
import { injectable } from '@nesvel/reactjs-di';

export interface ILogger {
  info(message: string): void;
  error(message: string): void;
}

export const LOGGER_SERVICE = Symbol.for('LOGGER_SERVICE');

@injectable()
export class LoggerService implements ILogger {
  info(message: string) {
    console.log(`[INFO] ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] ${message}`);
  }
}
```

### 2. Create a Module

```tsx
import { module } from '@nesvel/reactjs-di';
import { LoggerService, LOGGER_SERVICE } from './logger.service';

@module({
  providers: [
    {
      provide: LOGGER_SERVICE,
      useClass: LoggerService,
    },
  ],
  exports: [LOGGER_SERVICE],
})
export class LoggerModule {}
```

### 3. Initialize Container

```tsx
import { initializeContainer } from '@nesvel/reactjs-di';
import { AppModule } from './app.module';

initializeContainer(AppModule);
```

### 4. Provide DI Context

```tsx
import { DIProvider } from '@nesvel/reactjs-di';

function App() {
  return (
    <DIProvider>
      <YourApp />
    </DIProvider>
  );
}
```

### 5. Use Services in Components

```tsx
import { useDI } from '@nesvel/reactjs-di';
import { LOGGER_SERVICE, type ILogger } from './logger.service';

function MyComponent() {
  const logger = useDI<ILogger>(LOGGER_SERVICE);

  const handleClick = () => {
    logger.info('Button clicked!');
  };

  return <button onClick={handleClick}>Click Me</button>;
}
```

## 📖 Core Concepts

### Modules

Modules organize related services and dependencies:

```tsx
import { module } from '@nesvel/reactjs-di';

@module({
  imports: [LoggerModule, ConfigModule],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class AppModule {}
```

### Services

Services are injectable classes:

```tsx
import { injectable, inject } from '@nesvel/reactjs-di';

@injectable()
export class UserService {
  constructor(
    @inject(LOGGER_SERVICE) private logger: ILogger,
    @inject(HTTP_CLIENT) private http: IHttpClient,
  ) {}

  async getUsers() {
    this.logger.info('Fetching users...');
    return this.http.get('/users');
  }
}
```

### React Hooks

Three hooks for accessing services:

```tsx
// Required service (throws if not found)
const logger = useDI<ILogger>(LOGGER_SERVICE);

// Optional service (returns null if not found)
const analytics = useOptionalDI<IAnalytics>(ANALYTICS_SERVICE);

// Multiple services at once
const [logger, config] = useServices([LOGGER_SERVICE, CONFIG_SERVICE]) as [ILogger, IConfigService];
```

## 🛣️ Route Management

### Define Routes with Decorators

```tsx
import { Route } from '@nesvel/reactjs-di';

@Route({
  path: '/users',
  meta: {
    title: 'Users',
    requiresAuth: true,
  },
})
export function UsersPage() {
  const users = useDI<IUserService>(USER_SERVICE);
  // ... component logic
}

@Route({ path: '/users/:id' })
export function UserDetailPage() {
  // ... component logic
}
```

### Register Routes in Module

```tsx
import { RouteModule } from '@nesvel/reactjs-di';

@RouteModule({
  providers: [{ provide: USER_SERVICE, useClass: UserService }],
  exports: [USER_SERVICE],
  routes: [UsersPage, UserDetailPage],
})
export class UserModule {}
```

### Build React Router Configuration

```tsx
import { buildRoutesFromModules } from '@nesvel/reactjs-di';
import { index, route } from '@react-router/dev/routes';

export default [index('routes/home.tsx'), ...buildRoutesFromModules()] satisfies RouteConfig;
```

## 🧪 Testing

### Mock Services

```tsx
import { createMockService, createTestContainer, module } from '@nesvel/reactjs-di';

describe('MyComponent', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const mockLogger = createMockService<ILogger>({
      info: jest.fn(),
      error: jest.fn(),
    });

    @module({
      providers: [{ provide: LOGGER_SERVICE, useValue: mockLogger }],
    })
    class TestModule {}

    cleanup = createTestContainer(TestModule);
  });

  afterEach(() => cleanup());

  it('should log info', () => {
    const logger = getService<ILogger>(LOGGER_SERVICE);
    logger.info('test');
    expect(logger.info).toHaveBeenCalledWith('test');
  });
});
```

### Stub Services

```tsx
import { createStubService } from '@nesvel/reactjs-di';

const stubConfig = createStubService<IConfigService>({
  get: () => 'test-value',
  has: () => true,
});
```

## 📊 Performance Monitoring

Track service resolution times in development:

```tsx
import { enablePerformanceMonitoring, generatePerformanceReport } from '@nesvel/reactjs-di';

if (import.meta.env.DEV) {
  enablePerformanceMonitoring();
}

// Later...
console.log(generatePerformanceReport());
```

## 🏭 Service Factories

Create services dynamically:

```tsx
import { createServiceFactory } from '@nesvel/reactjs-di';

const createLogger = createServiceFactory<ILogger, [string]>((name) => new LoggerService(name), {
  cache: true,
});

const userLogger = createLogger('UserService');
const authLogger = createLogger('AuthService');
```

## 🔍 Type Guards

Validate services at runtime:

```tsx
import { isServiceAvailable, validateService, assertServiceAvailable } from '@nesvel/reactjs-di';

// Check if service exists
if (isServiceAvailable(ANALYTICS_SERVICE)) {
  const analytics = getService(ANALYTICS_SERVICE);
}

// Validate service interface
if (validateService(logger, ['info', 'error', 'warn'])) {
  logger.info('Valid logger');
}

// Assert service exists (throws if not)
assertServiceAvailable(LOGGER_SERVICE, 'Logger is required');
```

## 🎯 Advanced Features

### Lazy Loading

```tsx
import { createLazyService } from '@nesvel/reactjs-di';

// Service only loaded when first accessed
const getAnalytics = createLazyService<IAnalytics>(ANALYTICS_SERVICE);

function trackEvent(name: string) {
  if (shouldTrack()) {
    const analytics = getAnalytics(); // Loaded here
    analytics.trackEvent(name);
  }
}
```

### Pooled Factories

```tsx
import { createPooledFactory } from '@nesvel/reactjs-di';

const createConnection = createPooledFactory(
  () => new DatabaseConnection(),
  5, // Pool size
);
```

### Disposable Factories

```tsx
import { createDisposableFactory } from '@nesvel/reactjs-di';

const [createService, disposeAll] = createDisposableFactory(() => new DisposableService());

const service1 = createService();
const service2 = createService();

// Clean up all instances
disposeAll((service) => service.dispose());
```

## 📚 API Reference

### Core Container

- `initializeContainer(module, options?)` - Initialize DI container
- `getContainer()` - Get container instance
- `isInitialized()` - Check if initialized
- `resetContainer()` - Reset container (testing)
- `getService<T>(token)` - Get service directly

### React Integration

- `DIProvider` - Provider component
- `DIContext` - React context
- `useDI<T>(token)` - Required service hook
- `useOptionalDI<T>(token)` - Optional service hook
- `useServices(tokens)` - Multiple services hook

### Decorators

- `@module(metadata)` - Define module
- `@injectable()` - Mark class as injectable
- `@inject(token)` - Inject dependency
- `@RouteModule(metadata)` - Module with routes
- `@Route(config)` - Mark component as route

### Testing Utilities

- `createMockService<T>(impl)` - Create mock
- `createStubService<T>(defaults)` - Create stub
- `createTestContainer(module)` - Test container
- `spyOnService<T>(service, method)` - Spy on method
- `createServiceSpy<T>()` - Create spy
- `waitForContainer(timeout?)` - Wait for init

See [full API documentation](./docs/API.md) for complete reference.

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT © Nesvel

## 🔗 Links

- [Documentation](./docs)
- [Changelog](./CHANGELOG.md)
- [Issues](https://github.com/nesvel/reactjs-di/issues)
- [Inversiland](https://github.com/inversiland/inversiland)
