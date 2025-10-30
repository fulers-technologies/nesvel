# Changelog

All notable changes to `@nesvel/reactjs-di` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Async service initialization support
- Scoped services (Request/Transient scopes)
- Service lifecycle hooks
- Advanced error boundaries integration

## [1.0.0] - 2024-10-29

### Added

- Initial release of @nesvel/reactjs-di
- Core dependency injection with Inversiland integration
- React hooks: `useDI`, `useOptionalDI`, `useServices`
- Container utilities: `initializeContainer`, `getContainer`, `getService`
- React integration: `DIProvider`, `DIContext`
- Module system with `@module` decorator
- Service decorators: `@injectable`, `@inject`
- Route management system with `@RouteModule` and `@Route` decorators
- Route builder utilities for React Router integration
- Comprehensive testing utilities:
  - `createMockService` - Create service mocks
  - `createStubService` - Create service stubs
  - `createTestContainer` - Isolated test containers
  - `spyOnService` - Spy on service methods
  - `createServiceSpy` - Service spy with call tracking
  - `waitForContainer` - Async container initialization
- Service factory utilities:
  - `createServiceFactory` - Dynamic service creation
  - `createServiceFactoryWithDI` - Factory with DI injection
  - `createPooledFactory` - Resource pooling
  - `createDisposableFactory` - Cleanup support
- Lazy initialization:
  - `createLazyService` - Lazy service loading
  - `createLazyServices` - Multiple lazy services
  - `lazyInject` - Lazy injection decorator
  - `canLoadService` - Service availability check
- Type guards and validation:
  - `isServiceAvailable` - Check service availability
  - `validateService` - Validate service methods
  - `assertServiceAvailable` - Assert service exists
  - `areServicesAvailable` - Check multiple services
  - `getAvailableServices` - Filter available services
  - `isServiceToken` - Type guard for tokens
  - `validateServiceInterface` - Interface validation
  - `createServiceGuard` - Custom type guards
- Performance monitoring:
  - `enablePerformanceMonitoring` - Enable tracking
  - `getServiceWithMetrics` - Service with metrics
  - `getPerformanceMetrics` - All metrics
  - `getServiceMetrics` - Specific service metrics
  - `clearPerformanceMetrics` - Reset metrics
  - `getSlowestServices` - Performance analysis
  - `getMostUsedServices` - Usage statistics
  - `generatePerformanceReport` - Formatted report
- Full TypeScript support with 77 exports
- Comprehensive documentation and examples
- MIT License

### Features

- 🎯 Type-safe dependency injection with full TypeScript support
- ⚡ React hooks for easy service access
- 🎨 Decorator-based declarative syntax
- 📦 Modular architecture by feature
- 🛣️ Built-in React Router v7 integration
- 🔧 Zero-config defaults
- 🧪 Complete testing toolkit
- 📊 Optional performance monitoring
- 🏭 Flexible service factories
- 🔍 Runtime type validation

## [0.1.0-beta] - 2024-10-25

### Added

- Beta release for internal testing
- Core DI functionality
- Basic React integration
- Initial route management prototype

---

## Migration Guides

### From 0.x to 1.0

No breaking changes - 1.0 is the first stable release.

## Support

For issues, questions, or contributions:

- GitHub Issues: [https://github.com/nesvel/reactjs-di/issues](https://github.com/nesvel/reactjs-di/issues)
- Documentation: [https://github.com/nesvel/reactjs-di/docs](https://github.com/nesvel/reactjs-di/docs)
