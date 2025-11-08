# PubSub Enhancement Recommendations

## 🎯 Current Status: Production-Ready ✅

The PubSub module is fully functional and production-ready. The following are **optional** enhancements for future consideration.

---

## Priority 1: Critical for Production (Consider Now)

### 1. ⚠️ **Health Checks**

**Status:** Missing
**Priority:** HIGH
**Effort:** Low (2-3 hours)

Add health check endpoints for monitoring:

```typescript
@Injectable()
export class PubSubHealthIndicator extends HealthIndicator {
  constructor(private pubsub: PubSubService) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isConnected = this.pubsub.isConnected();
    const result = this.getStatus(key, isConnected);

    if (isConnected) {
      return result;
    }
    throw new HealthCheckError('PubSub health check failed', result);
  }
}
```

**Usage:**

```typescript
@Get('health')
@HealthCheck()
check() {
  return this.health.check([
    () => this.pubsub.isHealthy('pubsub'),
  ]);
}
```

---

### 2. 📊 **Message Acknowledgment (Kafka/Google PubSub)**

**Status:** Partial (auto-commit only)
**Priority:** HIGH
**Effort:** Medium (4-6 hours)

Add manual acknowledgment support:

```typescript
@Subscribe('order.created', { ack: 'manual' })
async handleOrder(message: IPubSubMessage<Order>) {
  try {
    await this.processOrder(message.data);
    await message.ack(); // Manual acknowledgment
  } catch (error: Error | any) {
    await message.nack(); // Negative acknowledgment - retry
  }
}
```

---

### 3. 🔄 **Graceful Shutdown**

**Status:** Partial (disconnect on destroy)
**Priority:** HIGH
**Effort:** Low (2-3 hours)

Add proper shutdown handling:

```typescript
@Injectable()
export class PubSubGracefulShutdown implements OnModuleDestroy {
  async onModuleDestroy() {
    // Wait for in-flight messages to complete
    await this.pubsub.drainAndDisconnect({
      timeout: 30000, // 30 seconds
      flushInterval: 1000,
    });
  }
}
```

---

## Priority 2: Enhanced Features (Future Consideration)

### 4. 🔐 **Schema Validation**

**Status:** Missing
**Priority:** MEDIUM
**Effort:** Medium (6-8 hours)

Add schema validation for messages:

```typescript
import { z } from 'zod';

const OrderSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
});

@Subscribe('order.created', {
  schema: OrderSchema,
  onValidationError: 'dlq', // Send to DLQ or 'throw' or 'log'
})
async handleOrder(message: IPubSubMessage<z.infer<typeof OrderSchema>>) {
  // message.data is validated and typed!
}
```

---

### 5. 🎭 **Message Transformers**

**Status:** Missing
**Priority:** MEDIUM
**Effort:** Low (2-3 hours)

Add message transformation pipeline:

```typescript
@Subscribe('order.created', {
  transformers: [
    DecryptTransformer, // Decrypt sensitive data
    DeserializeTransformer, // Custom deserialization
    EnrichTransformer, // Add metadata
  ],
})
async handleOrder(message: IPubSubMessage<Order>) {
  // message.data is transformed
}
```

---

### 6. 📈 **Built-in Metrics Dashboard**

**Status:** Metrics collected, no dashboard
**Priority:** MEDIUM
**Effort:** High (8-12 hours)

Add Prometheus/Grafana integration:

```typescript
PubSubModule.forRoot({
  driver: 'kafka',
  metrics: {
    enabled: true,
    exporters: ['prometheus'],
    port: 9090,
  },
});
```

**Metrics to expose:**

- Messages published/consumed per topic
- Processing time per handler
- Error rates
- Queue sizes (for consumers)
- Connection status

---

### 7. 🔁 **Retry Policies**

**Status:** Basic (driver-level only)
**Priority:** MEDIUM
**Effort:** Medium (4-6 hours)

Add configurable retry policies:

```typescript
@Subscribe('payment.process', {
  retry: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
      maxDelay: 30000,
    },
    retryableErrors: [TimeoutError, NetworkError],
  },
})
async handlePayment(message: IPubSubMessage<Payment>) {
  // Auto-retry on failure
}
```

---

### 8. ⏱️ **Message Scheduling**

**Status:** Missing
**Priority:** LOW
**Effort:** Medium (6-8 hours)

Add delayed/scheduled message publishing:

```typescript
await this.pubsub.schedule(
  'order.reminder',
  { orderId: '123' },
  {
    delay: '24h',
    // or: at: new Date('2024-12-25T00:00:00Z')
  },
);
```

---

### 9. 🧪 **Testing Utilities**

**Status:** Manual mocking
**Priority:** LOW
**Effort:** Low (3-4 hours)

Add testing helpers:

```typescript
import { PubSubTestingModule } from '@nesvel/nestjs-pubsub/testing';

describe('OrderService', () => {
  let pubsub: MockPubSubService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PubSubTestingModule.forTest()],
      providers: [OrderService],
    }).compile();

    pubsub = module.get(PubSubService);
  });

  it('should publish order event', async () => {
    await service.createOrder(data);

    expect(pubsub).toHavePublished('order.created', {
      orderId: expect.any(String),
    });
  });
});
```

---

### 10. 🔍 **Tracing Integration**

**Status:** Correlation IDs only
**Priority:** LOW
**Effort:** Medium (6-8 hours)

Add OpenTelemetry integration:

```typescript
PubSubModule.forRoot({
  driver: 'kafka',
  tracing: {
    enabled: true,
    exporter: 'jaeger',
    serviceName: 'my-service',
  },
});
```

---

## Priority 3: Advanced Features (Nice-to-Have)

### 11. 🌊 **Message Batching**

Add consumer-side batching:

```typescript
@Subscribe('logs', {
  batch: {
    size: 100,
    timeout: 5000,
  },
})
async handleLogs(messages: IPubSubMessage<Log>[]) {
  // Process 100 messages at once or after 5 seconds
  await this.logRepository.bulkInsert(messages.map(m => m.data));
}
```

---

### 12. 🔀 **Message Routing**

Add smart routing:

```typescript
@Subscribe('order.*', {
  routes: {
    'order.created': 'handleCreated',
    'order.updated': 'handleUpdated',
    'order.cancelled': 'handleCancelled',
  },
})
export class OrderRouter {
  handleCreated(msg) {}
  handleUpdated(msg) {}
  handleCancelled(msg) {}
}
```

---

### 13. 🎚️ **Priority Queues**

Add message priority:

```typescript
await this.pubsub.publish('task', data, {
  priority: 'high', // high, normal, low
});
```

---

### 14. 🔐 **Message Encryption**

Add built-in encryption:

```typescript
PubSubModule.forRoot({
  driver: 'kafka',
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    keyProvider: KmsKeyProvider,
  },
});
```

---

## Recommendation Priority

### **Implement Now:**

1. ✅ Health Checks (2-3 hours)
2. ✅ Manual Acknowledgment (4-6 hours)
3. ✅ Graceful Shutdown (2-3 hours)

**Total:** 8-12 hours of work

### **Implement Later (v2.0):**

4. Schema Validation
5. Message Transformers
6. Retry Policies
7. Metrics Dashboard

### **Maybe Never (Complex/Low Value):**

8. Message Scheduling (use external scheduler)
9. Tracing (use external APM)
10. Encryption (handle at network level)

---

## Current Assessment

### ✅ **What's Already Excellent:**

- Multi-driver architecture
- Auto-discovery
- Type safety
- Code generation
- BaseConsumer/BasePublisher patterns
- Kafka batch subscription fix

### 🎯 **Production-Ready Status:** YES

The current implementation is **production-ready** for most use cases. The Priority 1 enhancements are **nice-to-have** but not critical for launch.

### 💡 **Verdict:**

**Ship it!** Add Priority 1 features incrementally based on actual production needs.
