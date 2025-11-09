import { Macroable } from '../src/decorator/macroable.decorator';
import type { IMacroable } from '../src/interfaces/macroable.interface';

/**
 * Test class for Macroable decorator
 */
@Macroable()
class TestService implements IMacroable {
  public name: string;

  constructor(name: string = 'Test') {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  // Implementing IMacroable interface (added by decorator)
  [key: string]: any;
  macro: any;
  mixin: any;
  hasMacro: any;
  getMacros: any;
  __call: any;
}

describe('@Macroable', () => {
  let service: TestService;

  beforeEach(() => {
    service = TestService.make();
    // Clear static macros before each test
    if (typeof (TestService as any).flushMacros === 'function') {
      (TestService as any).flushMacros();
    }
  });

  describe('Instance macros', () => {
    it('should register and call instance macro', () => {
      service.macro('greet', function (this: TestService, name: string) {
        return `Hello, ${name}! I'm ${this.getName()}`;
      });

      expect(service.greet('World')).toBe("Hello, World! I'm Test");
    });

    it('should chain macro registration', () => {
      const result = service.macro('first', () => 'first').macro('second', () => 'second');

      expect(result).toBe(service);
      expect(service.first()).toBe('first');
      expect(service.second()).toBe('second');
    });

    it('should access instance properties in macros', () => {
      service.macro('getUpperName', function (this: TestService) {
        return this.getName().toUpperCase();
      });

      expect(service.getUpperName()).toBe('TEST');
    });

    it('should call instance methods from macros', () => {
      service.macro('changeName', function (this: TestService, newName: string) {
        this.setName(newName);
        return this.getName();
      });

      expect(service.changeName('Modified')).toBe('Modified');
      expect(service.getName()).toBe('Modified');
    });

    it('should support multiple parameters', () => {
      service.macro('add', function (a: number, b: number, c: number = 0) {
        return a + b + c;
      });

      expect(service.add(1, 2)).toBe(3);
      expect(service.add(1, 2, 3)).toBe(6);
    });
  });

  describe('Static macros', () => {
    it('should register and call static macro', () => {
      (TestService as any).macro('staticHelper', () => 'I am static');

      expect((TestService as any).staticHelper()).toBe('I am static');
    });

    it('should share static macros across instances', () => {
      (TestService as any).macro('shared', () => 'shared value');

      const instance1 = TestService.make();
      const instance2 = TestService.make();

      expect(instance1.shared()).toBe('shared value');
      expect(instance2.shared()).toBe('shared value');
    });

    it('should prioritize instance macros over static macros', () => {
      (TestService as any).macro('priority', () => 'static');
      service.macro('priority', () => 'instance');

      expect(service.priority()).toBe('instance');
    });
  });

  describe('mixin()', () => {
    it('should register multiple instance macros', () => {
      service.mixin({
        double: (n: number) => n * 2,
        triple: (n: number) => n * 3,
        quadruple: (n: number) => n * 4,
      });

      expect(service.double(5)).toBe(10);
      expect(service.triple(5)).toBe(15);
      expect(service.quadruple(5)).toBe(20);
    });

    it('should replace existing macros by default', () => {
      service.macro('test', () => 'original');
      service.mixin({ test: () => 'replaced' });

      expect(service.test()).toBe('replaced');
    });

    it('should not replace when replace=false', () => {
      service.macro('test', () => 'original');
      service.mixin({ test: () => 'replaced' }, false);

      expect(service.test()).toBe('original');
    });

    it('should chain mixin calls', () => {
      const result = service.mixin({ first: () => 1 }).mixin({ second: () => 2 });

      expect(result).toBe(service);
      expect(service.first()).toBe(1);
      expect(service.second()).toBe(2);
    });
  });

  describe('Static mixin()', () => {
    it('should register multiple static macros', () => {
      (TestService as any).mixin({
        add: (a: number, b: number) => a + b,
        subtract: (a: number, b: number) => a - b,
      });

      expect((TestService as any).add(10, 5)).toBe(15);
      expect((TestService as any).subtract(10, 5)).toBe(5);
    });
  });

  describe('hasMacro()', () => {
    it('should return true for existing instance macro', () => {
      service.macro('exists', () => 'yes');

      expect(service.hasMacro('exists')).toBe(true);
    });

    it('should return false for non-existing macro', () => {
      expect(service.hasMacro('doesNotExist')).toBe(false);
    });

    it('should detect static macros', () => {
      (TestService as any).macro('staticMacro', () => 'static');

      expect(service.hasMacro('staticMacro')).toBe(true);
    });

    it('should detect both static and instance macros', () => {
      (TestService as any).macro('static', () => 'static');
      service.macro('instance', () => 'instance');

      expect(service.hasMacro('static')).toBe(true);
      expect(service.hasMacro('instance')).toBe(true);
    });
  });

  describe('getMacros()', () => {
    it('should return all macro names', () => {
      service.macro('first', () => 1);
      service.macro('second', () => 2);

      const macros = service.getMacros();
      expect(macros).toContain('first');
      expect(macros).toContain('second');
    });

    it('should include static macros', () => {
      (TestService as any).macro('staticMacro', () => 'static');
      service.macro('instanceMacro', () => 'instance');

      const macros = service.getMacros();
      expect(macros).toContain('staticMacro');
      expect(macros).toContain('instanceMacro');
    });

    it('should return unique macro names', () => {
      (TestService as any).macro('shared', () => 'static');
      service.macro('shared', () => 'instance'); // Override

      const macros = service.getMacros();
      const sharedCount = macros.filter((m) => m === 'shared').length;
      expect(sharedCount).toBe(1);
    });
  });

  describe('Static getMacros()', () => {
    it('should return only static macro names', () => {
      (TestService as any).macro('static1', () => 1);
      (TestService as any).macro('static2', () => 2);

      const macros = (TestService as any).getMacros();
      expect(macros).toEqual(['static1', 'static2']);
    });
  });

  describe('__call()', () => {
    it('should call instance macros through __call', () => {
      service.macro('test', (a: number, b: number) => a + b);

      const result = service.__call('test', [5, 3]);
      expect(result).toBe(8);
    });

    it('should call static macros through __call', () => {
      (TestService as any).macro('test', (a: number, b: number) => a * b);

      const result = service.__call('test', [5, 3]);
      expect(result).toBe(15);
    });

    it('should prioritize instance macros in __call', () => {
      (TestService as any).macro('test', () => 'static');
      service.macro('test', () => 'instance');

      expect(service.__call('test', [])).toBe('instance');
    });

    it('should throw error for non-existing macro', () => {
      expect(() => service.__call('doesNotExist', [])).toThrow();
    });
  });

  describe('flushMacros()', () => {
    it('should clear all static macros', () => {
      (TestService as any).macro('test1', () => 1);
      (TestService as any).macro('test2', () => 2);

      (TestService as any).flushMacros();

      expect((TestService as any).hasMacro('test1')).toBe(false);
      expect((TestService as any).hasMacro('test2')).toBe(false);
    });

    it('should not affect instance macros', () => {
      service.macro('instanceMacro', () => 'instance');
      (TestService as any).macro('staticMacro', () => 'static');

      (TestService as any).flushMacros();

      expect(service.hasMacro('instanceMacro')).toBe(true);
      expect((TestService as any).hasMacro('staticMacro')).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should call macros from other macros', () => {
      service.macro('add', function (this: any, a: number, b: number) {
        return a + b;
      });

      service.macro('addThree', function (this: any, a: number, b: number, c: number) {
        return this.add(this.add(a, b), c);
      });

      expect(service.addThree(1, 2, 3)).toBe(6);
    });

    it('should work with method chaining', () => {
      service.macro('appendName', function (this: TestService, suffix: string) {
        this.setName(this.getName() + suffix);
        return this;
      });

      service.appendName('-Modified').appendName('-Again');

      expect(service.getName()).toBe('Test-Modified-Again');
    });

    it('should maintain separate macro registries per instance', () => {
      const service1 = TestService.make('Service1');
      const service2 = TestService.make('Service2');

      service1.macro('test', () => 'service1');
      service2.macro('test', () => 'service2');

      expect(service1.test()).toBe('service1');
      expect(service2.test()).toBe('service2');
    });

    it('should support closures with external variables', () => {
      const multiplier = 3;

      service.macro('multiply', (n: number) => n * multiplier);

      expect(service.multiply(10)).toBe(30);
    });
  });
});
