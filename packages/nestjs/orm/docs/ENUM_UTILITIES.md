# Enum Utility Methods

Generated enum files come with a comprehensive set of utility methods that make working with enums more powerful and convenient.

## Overview

Every enum generated with `make:enum` includes:

- ✅ Generic helper functions (no enum-specific naming)
- ✅ Type-safe validation and parsing
- ✅ Display formatting utilities
- ✅ Dropdown/select helpers
- ✅ Search and fuzzy matching
- ✅ Runtime assertions

## Basic Structure

```typescript
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// All utility functions follow below...
```

## Utility Methods

### 1. `getValues()` - Get All Enum Values

Returns an array of all enum values (not keys).

```typescript
const statuses = getValues();
// Returns: ['pending', 'processing', 'completed', 'cancelled']
```

**Use cases:**

- Populating dropdowns
- Validation lists
- Iteration

---

### 2. `isValid(value)` - Type Guard

Checks if a value is a valid enum member (case-sensitive).

```typescript
if (isValid('pending')) {
  // TypeScript knows it's OrderStatus
}

isValid('pending'); // true
isValid('invalid'); // false
isValid(null); // false
```

**Use cases:**

- API input validation
- Type guards in conditionals
- Filter functions

---

### 3. `getLabel(value)` - Display Labels

Gets a human-readable label for an enum value. Override this to provide custom labels.

```typescript
// Default implementation (returns value as-is):
getLabel(OrderStatus.PENDING); // 'pending'

// Custom implementation:
export function getLabel(value: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Awaiting Processing',
    [OrderStatus.PROCESSING]: 'In Progress',
    [OrderStatus.COMPLETED]: 'Successfully Completed',
    [OrderStatus.CANCELLED]: 'Cancelled by User',
  };
  return labels[value] || value;
}

getLabel(OrderStatus.PENDING); // 'Awaiting Processing'
```

**Use cases:**

- UI display text
- Email notifications
- Reports and exports

---

### 4. `getEntries()` - Key-Value Pairs

Returns all enum members as `{ key, value }` pairs. Perfect for dropdowns.

```typescript
const options = getEntries();
// Returns: [
//   { key: 'PENDING', value: 'pending' },
//   { key: 'PROCESSING', value: 'processing' },
//   { key: 'COMPLETED', value: 'completed' },
//   { key: 'CANCELLED', value: 'cancelled' },
// ]

// React example:
<select>
  {getEntries().map(opt => (
    <option key={opt.key} value={opt.value}>
      {getLabel(opt.value)}
    </option>
  ))}
</select>

// NestJS validation example:
@IsIn(getValues())
status: OrderStatus;
```

**Use cases:**

- Select/dropdown options
- Radio button groups
- Mapping displays

---

### 5. `getKeys()` - Get Enum Keys

Returns the enum member names (keys), not their values.

```typescript
const keys = getKeys();
// Returns: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']
```

**Use cases:**

- Debugging
- Code generation
- Documentation

---

### 6. `toDisplayString(value)` - Auto-Format Labels

Automatically converts enum values to human-readable format.

```typescript
toDisplayString(OrderStatus.PENDING);
// 'Pending'

// Works with snake_case:
enum Status {
  PENDING_APPROVAL = 'pending_approval',
}
toDisplayString(Status.PENDING_APPROVAL);
// 'Pending Approval'

// Works with kebab-case:
enum Status {
  PENDING_APPROVAL = 'pending-approval',
}
toDisplayString(Status.PENDING_APPROVAL);
// 'Pending Approval'
```

**Use cases:**

- Quick display formatting
- When you don't need custom labels
- Prototyping

---

### 7. `parse(value)` - Case-Insensitive Parsing

Safely parses string input to enum value. Returns `undefined` if invalid.

```typescript
parse('PENDING'); // OrderStatus.PENDING
parse('pending'); // OrderStatus.PENDING
parse('PeNdInG'); // OrderStatus.PENDING
parse('invalid'); // undefined
parse(null); // undefined
parse(undefined); // undefined
```

**Use cases:**

- API input parsing
- Query parameter parsing
- Form submissions
- Case-insensitive validation

**Example in NestJS controller:**

```typescript
@Get()
async findByStatus(@Query('status') statusString: string) {
  const status = parse(statusString);

  if (!status) {
    throw BadRequestException.make('Invalid status');
  }

  return this.orderService.findByStatus(status);
}
```

---

### 8. `parseOrDefault(value, defaultValue)` - Parse with Fallback

Like `parse()`, but returns a default value instead of `undefined`.

```typescript
parseOrDefault('invalid', OrderStatus.PENDING);
// Returns: OrderStatus.PENDING

parseOrDefault('completed', OrderStatus.PENDING);
// Returns: OrderStatus.COMPLETED

parseOrDefault(null, OrderStatus.PENDING);
// Returns: OrderStatus.PENDING
```

**Use cases:**

- Default values for optional parameters
- Configuration with fallbacks
- Graceful degradation

**Example:**

```typescript
@Get()
async findOrders(
  @Query('status') statusString?: string,
) {
  const status = parseOrDefault(statusString, OrderStatus.PENDING);
  return this.orderService.findByStatus(status);
}
```

---

### 9. `search(searchString)` - Fuzzy Matching

Finds the first enum value that contains the search string (case-insensitive).

```typescript
search('pend'); // OrderStatus.PENDING
search('PROC'); // OrderStatus.PROCESSING
search('ing'); // OrderStatus.PROCESSING (first match)
search('xyz'); // undefined
```

**Use cases:**

- Autocomplete functionality
- Fuzzy search
- Abbreviation matching
- User-friendly input

**Example autocomplete:**

```typescript
@Get('autocomplete')
async autocomplete(@Query('q') query: string) {
  const match = search(query);

  if (match) {
    return { value: match, label: getLabel(match) };
  }

  return null;
}
```

---

### 10. `assertValid(value, message?)` - Runtime Assertions

Asserts that a value is valid, throwing an error if not. Provides TypeScript type narrowing.

```typescript
try {
  assertValid('pending');
  // Type is now narrowed to OrderStatus
} catch (error: Error | any) {
  // Throws: Invalid OrderStatus value: xyz. Valid values: pending, processing, completed, cancelled
}

// Custom error message:
assertValid(value, 'Order status must be one of: pending, processing, completed');
```

**Use cases:**

- Critical validation points
- API middleware
- Data migration scripts
- Contract enforcement

**Example middleware:**

```typescript
@Injectable()
export class ValidateStatusPipe implements PipeTransform {
  transform(value: any) {
    assertValid(value, 'Invalid order status provided');
    return value; // TypeScript knows it's OrderStatus now
  }
}

@Post()
async create(@Body('status', ValidateStatusPipe) status: OrderStatus) {
  // status is guaranteed to be valid here
}
```

---

## Complete Usage Example

```typescript
// enum file: src/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Override getLabel for custom display text
export function getLabel(value: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: '⏳ Awaiting Processing',
    [OrderStatus.PROCESSING]: '⚙️ In Progress',
    [OrderStatus.COMPLETED]: '✅ Completed',
    [OrderStatus.CANCELLED]: '❌ Cancelled',
  };
  return labels[value];
}

// ... all other utility functions are auto-generated
```

### In a NestJS Controller

```typescript
import {
  OrderStatus,
  getValues,
  isValid,
  parse,
  parseOrDefault,
  getEntries,
  assertValid,
} from '@/enums/order-status.enum';

@Controller('orders')
export class OrderController {
  // Example 1: List all statuses for dropdown
  @Get('statuses')
  getStatuses() {
    return getEntries().map(({ key, value }) => ({
      key,
      value,
      label: getLabel(value),
    }));
    // Returns:
    // [
    //   { key: 'PENDING', value: 'pending', label: '⏳ Awaiting Processing' },
    //   { key: 'PROCESSING', value: 'processing', label: '⚙️ In Progress' },
    //   ...
    // ]
  }

  // Example 2: Query with optional status filter
  @Get()
  async findAll(@Query('status') statusString?: string) {
    const status = statusString ? parse(statusString) : undefined;

    if (statusString && !status) {
      throw BadRequestException.make(`Invalid status. Valid values: ${getValues().join(', ')}`);
    }

    return this.orderService.findAll(status);
  }

  // Example 3: Create with validated status
  @Post()
  async create(@Body() createDto: CreateOrderDto) {
    // Validate status
    assertValid(createDto.status, 'Invalid order status');

    return this.orderService.create(createDto);
  }

  // Example 4: Update status with default fallback
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') statusString: string) {
    // Parse or use default
    const status = parseOrDefault(statusString, OrderStatus.PENDING);

    return this.orderService.updateStatus(id, status);
  }
}
```

### In a React Component

```typescript
import {
  OrderStatus,
  getEntries,
  getLabel,
  isValid,
} from '@/enums/order-status.enum';

export function OrderStatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select status...</option>
      {getEntries().map(({ key, value }) => (
        <option key={key} value={value}>
          {getLabel(value)}
        </option>
      ))}
    </select>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  if (!isValid(status)) {
    return <span>Invalid Status</span>;
  }

  return (
    <span className="badge">
      {getLabel(status)}
    </span>
  );
}
```

---

## Best Practices

### 1. Always Override `getLabel()` for User-Facing Enums

```typescript
export function getLabel(value: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.PROCESSING]: 'Processing',
    [OrderStatus.COMPLETED]: 'Completed',
    [OrderStatus.CANCELLED]: 'Cancelled',
  };
  return labels[value];
}
```

### 2. Use `parse()` for Optional Inputs

```typescript
const status = parse(req.query.status);
if (status) {
  // Use it
}
```

### 3. Use `assertValid()` for Required Inputs

```typescript
assertValid(dto.status); // Throws if invalid
// Continue knowing it's valid
```

### 4. Use `getEntries()` for Dropdowns

```typescript
const options = getEntries();
// Perfect for select elements
```

### 5. Use `search()` for User-Friendly Matching

```typescript
const match = search(userInput);
// Allows partial matches
```

---

## Migration from Old Enums

If you have existing enums without these utilities:

```bash
# Regenerate the enum
bun orm make:enum YourEnumName --path=src/enums

# Copy your enum values to the new file
# Replace PLACEHOLDER with your actual values
```

---

## Related Documentation

- [Make Commands](./MAKE_COMMANDS.md) - Overview of all make commands
- [Entity Decorators](./ENTITY_DECORATORS.md) - Using enums in entities
- [Validation](./VALIDATION.md) - Enum validation with class-validator
