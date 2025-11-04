# Enterprise Middlewares

Complete set of production-ready middlewares for NestJS applications.

## ✅ Implemented Middlewares

### 🔒 Security (6/6 Complete)

1. ✅ **Helmet Middleware** - Security headers (XSS, clickjacking, etc.)
2. ✅ **CORS Middleware** - Cross-origin resource sharing
3. ✅ **Remove Powered-By Middleware** - Hides technology stack
4. ✅ **CSP Middleware** - Content security policy
5. ✅ **Request Sanitizer Middleware** - Input sanitization (NoSQL/SQL
   injection, XSS)
6. ✅ **IP Filter Middleware** - IP whitelist/blacklist

### 📊 Request Tracking & Monitoring (6/6 Complete)

7. ✅ **Request ID Middleware** - Unique request IDs
8. ✅ **Correlation ID Middleware** - Distributed tracing IDs
9. ✅ **Trace ID Middleware** - APM integration (Datadog, New Relic)
10. ✅ **Request Logger Middleware** - Comprehensive request/response logging
11. ✅ **Response Time Middleware** - X-Response-Time header
12. ✅ **User Agent Parser Middleware** - Parse device/browser info

### 🔐 Authentication & Context (3/3 Complete)

13. ✅ **Auth Context Middleware** - Extract JWT/tokens, set user context
14. ✅ **Tenant Context Middleware** - Multi-tenancy support
15. ✅ **User Context Middleware** - Set user info in async context

### 🌐 API Features & Headers (5/5 Complete)

16. ✅ **API Version Middleware** - API versioning
17. ✅ **Custom Headers Middleware** - X-API-Version, X-Server-ID
18. ✅ **Accept-Language Middleware** - Language negotiation
19. ✅ **ETag Middleware** - Entity tags for caching
20. ✅ **Cache Control Middleware** - Cache headers

### 🔍 Request Processing (3/3 Complete)

21. ✅ **Compression Middleware** - Gzip/Brotli compression
22. ✅ **Request Size Limit Middleware** - Prevent oversized payloads
23. ✅ **Timeout Middleware** - Request timeout management

### 🛡️ Reliability & Performance (2/2 Complete)

24. ✅ **Health Check Middleware** - /health, /ready, /live endpoints
25. ✅ **Maintenance Mode Middleware** - Graceful maintenance mode

### 🐛 Error Handling & Debugging (3/3 Complete)

26. ✅ **Error Context Middleware** - Enrich errors with request metadata
27. ✅ **Error Logger Middleware** - Structured error logging
28. ✅ **Debug Headers Middleware** - Debug info in non-production

### 📈 Metrics & Analytics (2/2 Complete)

29. ✅ **Metrics Collector Middleware** - API metrics collection
30. ✅ **Audit Log Middleware** - Compliance audit logging

## 🎉 All Middlewares Complete (30/30)

## Usage

### Applying Middlewares

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import {
  HelmetMiddleware,
  CorsMiddleware,
  RemovePoweredByMiddleware,
  RequestIdMiddleware,
  CorrelationIdMiddleware,
  TraceIdMiddleware,
  RequestLoggerMiddleware,
  ResponseTimeMiddleware,
  RequestSanitizerMiddleware,
} from '@/middlewares';

@Module({
  // ... module configuration
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middlewares first
    consumer
      .apply(
        RemovePoweredByMiddleware,
        HelmetMiddleware,
        CorsMiddleware,
        CspMiddleware,
        RequestSanitizerMiddleware
      )
      .forRoutes('*');

    // Apply tracking middlewares
    consumer
      .apply(
        RequestIdMiddleware,
        CorrelationIdMiddleware,
        TraceIdMiddleware,
        ResponseTimeMiddleware,
        RequestLoggerMiddleware
      )
      .forRoutes('*');

    // Apply IP filter to admin routes only
    consumer.apply(IpFilterMiddleware).forRoutes('/admin/*');
  }
}
```

### Environment Variables

```env
# CORS Configuration
CORS_ORIGIN=https://app.example.com,https://admin.example.com

# IP Filter
IP_WHITELIST=127.0.0.1,192.168.1.0/24
IP_BLACKLIST=203.0.113.0

# Logging
LOG_REQUESTS=true
```

## Middleware Order

The order of middleware execution matters:

1. **Security** (Helmet, CORS, Remove Powered-By, CSP, Sanitizer)
2. **Tracking** (Request ID, Correlation ID, Trace ID, Response Time)
3. **Context** (Auth Context, Tenant Context, User Context)
4. **Headers** (API Version, Custom Headers, Accept-Language)
5. **Processing** (Compression, Size Limit, Body Parser, Timeout)
6. **Logging** (Request Logger)
7. **Application Logic** (Controllers, Services)
8. **Error Handling** (Error Context, Error Logger)

## Best Practices

1. **Apply security middlewares first** - Protect before processing
2. **Generate IDs early** - Request/Correlation IDs for logging
3. **Log after response** - Avoid blocking request processing
4. **Handle errors gracefully** - Never expose internal errors
5. **Monitor performance** - Track response times and metrics
6. **Use environment variables** - Configure per environment
7. **Test middleware order** - Verify proper execution sequence

## Implementation Guide

To implement remaining middlewares, follow the pattern established:

1. Create middleware file in appropriate category folder
2. Add detailed docblock with description, features, examples
3. Implement `NestMiddleware` interface
4. Add inline comments explaining logic
5. Export from category index.ts
6. Export from main middlewares/index.ts
7. Update this README with checkmark

## Architecture

```
src/middlewares/
├── security/           # Security middlewares
├── tracking/           # Request tracking & monitoring
├── context/            # Authentication & context
├── headers/            # API features & headers
├── processing/         # Request processing
├── reliability/        # Reliability & performance
├── errors/             # Error handling & debugging
├── metrics/            # Metrics & analytics
├── index.ts            # Main export
└── README.md           # This file
```

## Contributing

When adding new middlewares:

- Follow existing patterns and conventions
- Add comprehensive docblocks
- Include usage examples
- Add environment variable documentation
- Update README checklist
- Test middleware in isolation and with others
