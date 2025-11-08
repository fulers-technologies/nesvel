import { Conditionable } from '../src/decorator/conditionable.decorator';
import type { IConditionable } from '../src/interfaces/conditionable.interface';

/**
 * Test class for Conditionable decorator
 */
@Conditionable()
class TestBuilder implements IConditionable {
  public operations: string[] = [];
  public value: number = 0;

  addOperation(op: string): this {
    this.operations.push(op);
    return this;
  }

  incrementValue(amount: number = 1): this {
    this.value += amount;
    return this;
  }

  getOperations(): string[] {
    return this.operations;
  }

  getValue(): number {
    return this.value;
  }

  reset(): this {
    this.operations = [];
    this.value = 0;
    return this;
  }

  // Implementing IConditionable interface (added by decorator)
  when: any;
  unless: any;
}

describe('@Conditionable', () => {
  let builder: TestBuilder;

  beforeEach(() => {
    builder = new TestBuilder();
  });

  describe('when()', () => {
    it('should execute callback when condition is truthy', () => {
      builder.when(true, (b) => b.addOperation('executed'));

      expect(builder.getOperations()).toEqual(['executed']);
    });

    it('should not execute callback when condition is falsy', () => {
      builder.when(false, (b) => b.addOperation('not executed'));

      expect(builder.getOperations()).toEqual([]);
    });

    it('should execute callback with truthy value (non-boolean)', () => {
      builder.when('hello', (b) => b.addOperation('string truthy'));

      expect(builder.getOperations()).toEqual(['string truthy']);
    });

    it('should not execute callback with falsy values', () => {
      builder
        .when(0, (b) => b.addOperation('zero'))
        .when(null, (b) => b.addOperation('null'))
        .when(undefined, (b) => b.addOperation('undefined'))
        .when('', (b) => b.addOperation('empty string'));

      expect(builder.getOperations()).toEqual([]);
    });

    it('should pass resolved value to callback', () => {
      builder.when(42, (b, value) => {
        expect(value).toBe(42);
        b.incrementValue(value);
      });

      expect(builder.getValue()).toBe(42);
    });

    it('should support function conditions', () => {
      const condition = (b: TestBuilder) => b.getValue() === 0;

      builder.when(condition, (b) => b.addOperation('value is zero'));

      expect(builder.getOperations()).toEqual(['value is zero']);
    });

    it('should re-evaluate function conditions', () => {
      const isValuePositive = (b: TestBuilder) => b.getValue() > 0;

      builder
        .when(isValuePositive, (b) => b.addOperation('first check'))
        .incrementValue(10)
        .when(isValuePositive, (b) => b.addOperation('second check'));

      expect(builder.getOperations()).toEqual(['second check']);
    });

    it('should execute default callback when condition is false', () => {
      builder.when(
        false,
        (b) => b.addOperation('truthy'),
        (b) => b.addOperation('falsy')
      );

      expect(builder.getOperations()).toEqual(['falsy']);
    });

    it('should not execute default callback when condition is true', () => {
      builder.when(
        true,
        (b) => b.addOperation('truthy'),
        (b) => b.addOperation('falsy')
      );

      expect(builder.getOperations()).toEqual(['truthy']);
    });

    it('should support method chaining', () => {
      const result = builder
        .when(true, (b) => b.addOperation('first'))
        .when(true, (b) => b.addOperation('second'))
        .when(false, (b) => b.addOperation('third'));

      expect(result).toBe(builder);
      expect(builder.getOperations()).toEqual(['first', 'second']);
    });

    it('should maintain context within callback', () => {
      builder.when(true, function (this: TestBuilder, b) {
        expect(this).toBe(b);
        this.addOperation('context maintained');
      });

      expect(builder.getOperations()).toEqual(['context maintained']);
    });

    it('should allow returning custom value from callback', () => {
      const result = builder.when(true, () => 'custom return');

      expect(result).toBe('custom return');
    });

    it('should return this when callback returns undefined', () => {
      const result = builder.when(true, (b) => {
        b.addOperation('no return');
      });

      expect(result).toBe(builder);
    });
  });

  describe('unless()', () => {
    it('should execute callback when condition is falsy', () => {
      builder.unless(false, (b) => b.addOperation('executed'));

      expect(builder.getOperations()).toEqual(['executed']);
    });

    it('should not execute callback when condition is truthy', () => {
      builder.unless(true, (b) => b.addOperation('not executed'));

      expect(builder.getOperations()).toEqual([]);
    });

    it('should execute callback with falsy values', () => {
      builder
        .unless(0, (b) => b.addOperation('zero'))
        .unless(null, (b) => b.addOperation('null'))
        .unless(undefined, (b) => b.addOperation('undefined'))
        .unless('', (b) => b.addOperation('empty string'));

      expect(builder.getOperations()).toEqual(['zero', 'null', 'undefined', 'empty string']);
    });

    it('should not execute callback with truthy values', () => {
      builder
        .unless(1, (b) => b.addOperation('one'))
        .unless('hello', (b) => b.addOperation('string'))
        .unless({}, (b) => b.addOperation('object'));

      expect(builder.getOperations()).toEqual([]);
    });

    it('should pass resolved value to callback', () => {
      builder.unless(0, (b, value) => {
        expect(value).toBe(0);
        b.addOperation('got zero');
      });

      expect(builder.getOperations()).toEqual(['got zero']);
    });

    it('should support function conditions', () => {
      const condition = (b: TestBuilder) => b.getValue() > 0;

      builder.unless(condition, (b) => b.addOperation('value not positive'));

      expect(builder.getOperations()).toEqual(['value not positive']);
    });

    it('should execute default callback when condition is true', () => {
      builder.unless(
        true,
        (b) => b.addOperation('falsy'),
        (b) => b.addOperation('truthy')
      );

      expect(builder.getOperations()).toEqual(['truthy']);
    });

    it('should not execute default callback when condition is false', () => {
      builder.unless(
        false,
        (b) => b.addOperation('falsy'),
        (b) => b.addOperation('truthy')
      );

      expect(builder.getOperations()).toEqual(['falsy']);
    });

    it('should support method chaining', () => {
      const result = builder
        .unless(false, (b) => b.addOperation('first'))
        .unless(false, (b) => b.addOperation('second'))
        .unless(true, (b) => b.addOperation('third'));

      expect(result).toBe(builder);
      expect(builder.getOperations()).toEqual(['first', 'second']);
    });
  });

  describe('Complex scenarios', () => {
    it('should combine when() and unless()', () => {
      const hasValue = (b: TestBuilder) => b.getValue() > 0;

      builder
        .when(hasValue, (b) => b.addOperation('has value'))
        .unless(hasValue, (b) => b.addOperation('no value'))
        .incrementValue(5)
        .when(hasValue, (b) => b.addOperation('now has value'))
        .unless(hasValue, (b) => b.addOperation('still no value'));

      expect(builder.getOperations()).toEqual(['no value', 'now has value']);
    });

    it('should handle nested conditions', () => {
      builder.when(true, (b) => {
        b.addOperation('outer');
        b.when(true, (inner) => {
          inner.addOperation('inner');
        });
      });

      expect(builder.getOperations()).toEqual(['outer', 'inner']);
    });

    it('should work with complex filtering logic', () => {
      interface Filter {
        status?: string;
        category?: string;
        minPrice?: number;
      }

      const filters: Filter = {
        status: 'active',
        minPrice: 100,
      };

      builder
        .when(filters.status, (b) => b.addOperation(`status:${filters.status}`))
        .when(filters.category, (b) => b.addOperation(`category:${filters.category}`))
        .when(filters.minPrice, (b) => b.addOperation(`minPrice:${filters.minPrice}`));

      expect(builder.getOperations()).toEqual(['status:active', 'minPrice:100']);
    });

    it('should maintain state across multiple operations', () => {
      builder
        .incrementValue(5)
        .when(
          (b) => b.getValue() >= 5,
          (b) => b.incrementValue(10)
        )
        .when(
          (b) => b.getValue() >= 15,
          (b) => b.addOperation('threshold reached')
        );

      expect(builder.getValue()).toBe(15);
      expect(builder.getOperations()).toEqual(['threshold reached']);
    });
  });
});
