# PubSub Consumers

## What are Consumers?

**Consumers** are class-based message handlers that extend `BaseConsumer`. They
provide a structured way to handle complex message processing with lifecycle
hooks and state management.

## How Consumers Work

### 1. **Manual Subscription in `onModuleInit`**

Unlike `@Subscribe` decorators which are auto-discovered, consumers must
**manually subscribe** to topics. This is typically done by implementing
`OnModuleInit`:

```typescript
@Injectable()
export class PaymentConsumer
  extends BaseConsumer<PaymentData>
  implements OnModuleInit
{
  constructor(private readonly pubSubService: PubSubService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    // Subscribe to the topic
    await this.pubSubService.subscribe(this.getTopic(), (message) =>
      this.handle(message)
    );

    // Call lifecycle hook
    await this.onSubscribe();
  }
}
```

### 2. **Lifecycle Hooks**

Consumers have three main lifecycle methods:

#### `onSubscribe()`

Called when the consumer starts subscribing. Use for:

- Initializing database connections
- Loading configuration
- Setting up caches
- Preparing resources

#### `handle(message)`

Called for each message received. Use for:

- Processing message data
- Validating payloads
- Updating databases
- Triggering side effects

#### `onUnsubscribe()`

Called when the consumer stops. Use for:

- Closing connections
- Flushing buffers
- Saving state
- Cleanup tasks

### 3. **State Management**

Consumers can maintain internal state across messages:

```typescript
export class PaymentConsumer extends BaseConsumer<PaymentData> {
  private processingQueue: PaymentData[] = [];
  private stats = { processed: 0, failed: 0 };

  async handle(message: IPubSubMessage<PaymentData>): Promise<void> {
    this.processingQueue.push(message.data);
    this.stats.processed++;

    // Process batch when queue is full
    if (this.processingQueue.length >= 10) {
      await this.processBatch();
    }
  }
}
```

## When to Use Consumers vs Listeners

### Use Listeners (80% of cases) ✅

**Pattern:** Simple `@Subscribe` decorators

**Best for:**

- Simple message processing
- No complex initialization needed
- No state management required
- Multiple independent handlers in one class

**Example:**

```typescript
@Injectable()
export class OrderListener {
  @Subscribe('order.created')
  async handleOrderCreated(message: IPubSubMessage<any>): Promise<void> {
    await this.emailService.sendConfirmation(message.data);
  }
}
```

**Pros:**

- ✅ Auto-discovered and registered
- ✅ Declarative and simple
- ✅ No manual wiring needed
- ✅ Multiple handlers in one class

**Cons:**

- ❌ No lifecycle hooks
- ❌ No state management
- ❌ Less control over subscription

---

### Use Consumers (20% of cases) ✅

**Pattern:** Class extending `BaseConsumer` with manual subscription

**Best for:**

- Complex processing logic
- Need lifecycle control (init/cleanup)
- State management across messages
- Batch processing
- Resource pooling

**Example:**

```typescript
@Injectable()
export class PaymentConsumer
  extends BaseConsumer<PaymentData>
  implements OnModuleInit, OnModuleDestroy
{
  private dbConnection: any;
  private processingQueue: PaymentData[] = [];

  async onSubscribe(): Promise<void> {
    this.dbConnection = await this.db.connect();
  }

  async handle(message: IPubSubMessage<PaymentData>): Promise<void> {
    this.processingQueue.push(message.data);
    if (this.processingQueue.length >= 10) {
      await this.processBatch();
    }
  }

  async onUnsubscribe(): Promise<void> {
    await this.processBatch(); // Process remaining
    await this.dbConnection.close();
  }
}
```

**Pros:**

- ✅ Full lifecycle control
- ✅ State management
- ✅ Resource initialization/cleanup
- ✅ Batch processing support

**Cons:**

- ❌ Manual subscription required
- ❌ More boilerplate code
- ❌ Must implement `onModuleInit`

## Complete Consumer Example

```typescript
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  BaseConsumer,
  IPubSubMessage,
  PubSubService,
} from '@nesvel/nestjs-pubsub';

@Injectable()
export class PaymentConsumer
  extends BaseConsumer<PaymentData>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PaymentConsumer.name);
  private processingQueue: PaymentData[] = [];
  private stats = { processed: 0, failed: 0, totalAmount: 0 };
  private isReady = false;

  constructor(private readonly pubSubService: PubSubService) {
    super();
  }

  // Topic definition
  getTopic(): string {
    return 'payment.processed';
  }

  // NestJS module initialization
  async onModuleInit(): Promise<void> {
    await this.pubSubService.subscribe(this.getTopic(), (message) =>
      this.handle(message)
    );
    await this.onSubscribe();
  }

  // NestJS module destruction
  async onModuleDestroy(): Promise<void> {
    await this.onUnsubscribe();
  }

  // Consumer lifecycle: Start
  async onSubscribe(): Promise<void> {
    this.logger.log('Initializing PaymentConsumer...');
    // Initialize resources
    this.isReady = true;
  }

  // Message handler
  async handle(message: IPubSubMessage<PaymentData>): Promise<void> {
    if (!this.isReady) {
      this.logger.warn('Consumer not ready');
      return;
    }

    const payment = message.data;
    this.logger.log(`Processing payment ${payment.paymentId}`);

    try {
      // Process payment
      this.processingQueue.push(payment);
      this.stats.processed++;
      this.stats.totalAmount += payment.amount;

      // Batch processing
      if (this.processingQueue.length >= 10) {
        await this.processBatch();
      }
    } catch (error: any) {
      this.stats.failed++;
      this.logger.error(`Failed to process payment:`, error);
      throw error;
    }
  }

  // Consumer lifecycle: Stop
  async onUnsubscribe(): Promise<void> {
    this.logger.log('Shutting down PaymentConsumer...');
    this.isReady = false;

    // Process remaining items
    if (this.processingQueue.length > 0) {
      await this.processBatch();
    }

    // Log final stats
    this.logger.log('Final statistics:', this.stats);
  }

  // Helper method
  private async processBatch(): Promise<void> {
    const batch = [...this.processingQueue];
    this.processingQueue = [];
    this.logger.log(`Processing batch of ${batch.length} payments`);
    // Bulk database update...
  }

  // Public API
  getStats() {
    return { ...this.stats, queueSize: this.processingQueue.length };
  }
}
```

## Key Differences Summary

| Feature        | Listener (@Subscribe)   | Consumer (BaseConsumer)   |
| -------------- | ----------------------- | ------------------------- |
| **Setup**      | Automatic               | Manual subscription       |
| **Discovery**  | Auto-discovered         | Must register + subscribe |
| **Lifecycle**  | No hooks                | onSubscribe/onUnsubscribe |
| **State**      | Instance variables only | Full state management     |
| **Complexity** | Simple                  | Complex                   |
| **Use Cases**  | 80% - Simple handlers   | 20% - Complex processing  |
| **Code**       | Less boilerplate        | More boilerplate          |
| **Control**    | Limited                 | Full control              |

## Best Practices

1. **Choose the right pattern**: Use listeners for simple cases, consumers for
   complex ones
2. **Implement lifecycle properly**: Always clean up resources in
   `onUnsubscribe()`
3. **Error handling**: Catch and log errors, decide whether to re-throw
4. **State management**: Keep state minimal and well-documented
5. **Testing**: Mock PubSubService in unit tests
6. **Monitoring**: Expose statistics via public methods
7. **Graceful shutdown**: Process remaining items before unsubscribing

## Testing

### Testing Listeners

```typescript
describe('OrderListener', () => {
  let listener: OrderListener;

  beforeEach(() => {
    listener = new OrderListener();
  });

  it('should handle order created event', async () => {
    const message = {
      data: { orderId: '123', status: 'created' },
      topic: 'order.created',
      timestamp: new Date(),
    };

    await listener.handleOrderCreated(message);
    // Assert expectations
  });
});
```

### Testing Consumers

```typescript
describe('PaymentConsumer', () => {
  let consumer: PaymentConsumer;
  let pubSubService: MockPubSubService;

  beforeEach(async () => {
    pubSubService = new MockPubSubService();
    consumer = new PaymentConsumer(pubSubService);

    // Initialize
    await consumer.onModuleInit();
  });

  afterEach(async () => {
    // Cleanup
    await consumer.onModuleDestroy();
  });

  it('should process payment messages', async () => {
    const message = {
      data: { paymentId: 'PAY-123', amount: 100 },
      topic: 'payment.processed',
      timestamp: new Date(),
    };

    await consumer.handle(message);

    const stats = consumer.getStats();
    expect(stats.processed).toBe(1);
    expect(stats.totalAmount).toBe(100);
  });
});
```

## Registration

Consumers must be registered in your module's providers:

```typescript
@Module({
  providers: [
    PaymentConsumer, // Register the consumer
    // ... other providers
  ],
})
export class AppModule {}
```

The consumer will automatically call `onModuleInit()` when the module starts,
which triggers the subscription.
