# PubSub Console Commands

Console commands for generating PubSub consumers, publishers, and listeners.

## Installation

Import the `PubSubConsoleModule` in your application's console module:

```typescript
// src/console/console.module.ts
import { Module } from '@nestjs/common';
import { PubSubConsoleModule } from '@nesvel/nestjs-pubsub';

@Module({
  imports: [PubSubConsoleModule],
})
export class ConsoleModule {}
```

## Commands

### make:consumer

Generate a new PubSub consumer class extending `BaseConsumer`.

**Use consumers when you need:**

- Complex message processing logic
- Lifecycle control (onSubscribe/onUnsubscribe hooks)
- Advanced error handling
- State management across messages

**Syntax:**

```bash
bun run console make:consumer <name> [--path=<path>]
```

**Examples:**

```bash
# Generate OrderConsumer in src/consumers/
bun run console make:consumer Order

# Generate in custom path
bun run console make:consumer Payment --path=src/modules/payment/consumers

# Output: order.consumer.ts
```

**Generated class structure:**

```typescript
@Injectable()
export class OrderConsumer extends BaseConsumer<any> {
  getTopic(): string {
    return 'order';
  }

  async handle(message: IPubSubMessage<any>): Promise<void> {
    // Process message
  }

  async onSubscribe(): Promise<void> {
    // Initialization logic
  }

  async onUnsubscribe(): Promise<void> {
    // Cleanup logic
  }
}
```

---

### make:publisher

Generate a new PubSub publisher class extending `BasePublisher`.

**Use publishers when you need:**

- Data validation before publishing
- Data transformation
- Logging and monitoring
- Consistent publishing patterns across the application

**Syntax:**

```bash
bun run console make:publisher <name> [--path=<path>]
```

**Examples:**

```bash
# Generate OrderPublisher in src/publishers/
bun run console make:publisher Order

# Generate in custom path
bun run console make:publisher Payment --path=src/modules/payment/publishers

# Output: order.publisher.ts
```

**Generated class structure:**

```typescript
@Injectable()
export class OrderPublisher extends BasePublisher<any> {
  constructor(protected readonly pubsub: PubSubService) {
    super(pubsub);
  }

  getTopic(): string {
    return 'order';
  }

  protected async beforePublish(data: any, options?: PublishOptions): Promise<void> {
    // Validation, transformation, logging
  }

  protected async afterPublish(data: any, options?: PublishOptions): Promise<void> {
    // Success logging, metrics
  }
}
```

**Usage:**

```typescript
// Inject the publisher
constructor(private readonly orderPublisher: OrderPublisher) {}

// Publish messages
await this.orderPublisher.publish({ orderId: 123, status: 'created' });
```

---

### make:listener

Generate a new PubSub listener class with `@Subscribe` decorators.

**Use listeners when you need:**

- Simple, declarative subscriptions (recommended for 80% of use cases)
- Multiple handlers for different topics in one class
- Quick setup without lifecycle complexity

**Syntax:**

```bash
bun run console make:listener <name> [--path=<path>]
```

**Examples:**

```bash
# Generate OrderListener in src/listeners/
bun run console make:listener Order

# Generate in custom path
bun run console make:listener Payment --path=src/modules/payment/listeners

# Output: order.listener.ts
```

**Generated class structure:**

```typescript
@Injectable()
export class OrderListener {
  @Subscribe('order')
  async handleOrder(message: IPubSubMessage<any>): Promise<void> {
    // Process message
  }

  // Optional: Add multiple handlers
  // @Subscribe('order.created')
  // async handleCreated(message: IPubSubMessage<any>): Promise<void> { }

  // @Subscribe('order.updated')
  // async handleUpdated(message: IPubSubMessage<any>): Promise<void> { }
}
```

---

## Command Options

All make commands support the following options:

| Option   | Description                  | Default        |
| -------- | ---------------------------- | -------------- |
| `--path` | Custom output directory path | `src/<type>s/` |

## File Naming Conventions

Generated files follow these naming conventions:

| Input               | Class Name                 | File Name                       | Topic Name          |
| ------------------- | -------------------------- | ------------------------------- | ------------------- |
| `Order`             | `OrderConsumer`            | `order.consumer.ts`             | `order`             |
| `OrderItem`         | `OrderItemConsumer`        | `order-item.consumer.ts`        | `order-item`        |
| `payment_processed` | `PaymentProcessedConsumer` | `payment-processed.consumer.ts` | `payment-processed` |

## When to Use What?

### Use Listeners (80% of cases)

- Simple message processing
- Multiple topics in one class
- Quick setup
- Example: Logging, notifications, simple data sync

### Use Consumers (20% of cases)

- Complex processing logic
- Need lifecycle hooks (onSubscribe/onUnsubscribe)
- State management required
- Advanced error handling
- Example: Order processing, payment workflows, data aggregation

### Use Publishers (Optional)

- Need validation/transformation before publishing
- Want consistent publishing patterns
- Need logging/monitoring hooks
- Example: Event sourcing, audit logging, multi-step workflows

## Registration

After generating classes, register them in your module:

### Consumers

```typescript
import { OrderConsumer } from './consumers/order.consumer';

@Module({
  providers: [OrderConsumer],
})
export class OrderModule {}
```

### Publishers

```typescript
import { OrderPublisher } from './publishers/order.publisher';

@Module({
  providers: [OrderPublisher],
  exports: [OrderPublisher], // Export if used in other modules
})
export class OrderModule {}
```

### Listeners

```typescript
import { OrderListener } from './listeners/order.listener';

@Module({
  providers: [OrderListener],
})
export class OrderModule {}
```

## Examples

### Complete Workflow Example

```bash
# 1. Generate a publisher for creating orders
bun run console make:publisher Order

# 2. Generate a listener for processing orders
bun run console make:listener Order

# 3. Generate a consumer for complex order fulfillment
bun run console make:consumer OrderFulfillment
```

**Publisher usage:**

```typescript
@Injectable()
export class OrderService {
  constructor(private readonly orderPublisher: OrderPublisher) {}

  async createOrder(data: CreateOrderDto) {
    const order = await this.repository.save(data);
    await this.orderPublisher.publish(order);
    return order;
  }
}
```

**Listener usage:**

```typescript
@Injectable()
export class OrderListener {
  @Subscribe('order')
  async handleOrder(message: IPubSubMessage<Order>): Promise<void> {
    console.log('Order received:', message.data);
    await this.notificationService.sendConfirmation(message.data);
  }
}
```

**Consumer usage:**

```typescript
@Injectable()
export class OrderFulfillmentConsumer extends BaseConsumer<Order> {
  getTopic(): string {
    return 'order';
  }

  async onSubscribe(): Promise<void> {
    // Initialize database connections, load config
    await this.inventoryService.connect();
  }

  async handle(message: IPubSubMessage<Order>): Promise<void> {
    // Complex multi-step processing
    await this.inventoryService.reserve(message.data);
    await this.shippingService.createLabel(message.data);
    await this.paymentService.capture(message.data);
  }

  async onUnsubscribe(): Promise<void> {
    // Cleanup
    await this.inventoryService.disconnect();
  }
}
```

## Best Practices

1. **Choose the right pattern**: Use listeners for simple cases, consumers for complex ones
2. **Topic naming**: Use kebab-case (e.g., `order-created`, `payment-processed`)
3. **Error handling**: Always handle errors in your handlers
4. **Type safety**: Define proper types for your message data
5. **Testing**: Write unit tests for your handlers
6. **Documentation**: Add docblocks explaining what each handler does

## Troubleshooting

### Command not found

Ensure `PubSubConsoleModule` is imported in your console module.

### Generated file not where expected

Use the `--path` option to specify a custom output directory.

### TypeScript errors after generation

Run `bun install` and rebuild the package: `bun build --filter=@nesvel/nestjs-pubsub`

## Related Documentation

- [PubSub Module README](../../README.md)
- [BaseConsumer API](../consumers/base.consumer.ts)
- [BasePublisher API](../publishers/base.publisher.ts)
- [@Subscribe Decorator](../decorators/subscribe.decorator.ts)
