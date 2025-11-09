/**
 * Macroable Decorator
 *
 * Laravel-inspired decorator that allows adding macros (methods) to a class at runtime.
 * Supports both static macros (shared across all instances) and instance macros.
 * Uses JavaScript Proxy to intercept method calls and check macro registries.
 *
 * Features:
 * - Static macros (shared across all instances)
 * - Instance macros (per-instance)
 * - Mixin support (register multiple macros at once)
 * - Macro existence checking
 * - Flush macros (clear all static macros)
 * - __call magic method support
 *
 * @example
 * ```typescript
 * @Macroable()
 * @Injectable()
 * export class MyService {
 *   // Your methods
 * }
 *
 * // Static macro (shared across all instances)
 * MyService.macro('staticHelper', function() {
 *   return 'I am shared!';
 * });
 *
 * // Instance macro (per-instance)
 * const service = MyService.make();
 * service.macro('sayHello', function(name: string) {
 *   return `Hello, ${name}!`;
 * });
 *
 * service.sayHello('World'); // "Hello, World!"
 * MyService.staticHelper(); // "I am shared!"
 * ```
 */
export function Macroable() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Static macro storage (shared across all instances)
    const staticMacros = new Map<string, Function>();

    const decorated = class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        // Create per-instance macro storage
        const instanceMacros = new Map<string, Function>();

        // Add instance macro() method
        Object.defineProperty(this, 'macro', {
          value: (name: string, fn: Function) => {
            instanceMacros.set(name, fn);
            return this;
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Add instance mixin() method for adding multiple macros at once
        Object.defineProperty(this, 'mixin', {
          value: (methods: Record<string, Function>, replace: boolean = true) => {
            Object.entries(methods).forEach(([name, fn]) => {
              if (replace || !instanceMacros.has(name)) {
                instanceMacros.set(name, fn);
              }
            });
            return this;
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Add instance hasMacro() method
        Object.defineProperty(this, 'hasMacro', {
          value: (name: string) => {
            return instanceMacros.has(name) || staticMacros.has(name);
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Add instance getMacros() method
        Object.defineProperty(this, 'getMacros', {
          value: () => {
            const allMacros = new Set([
              ...Array.from(staticMacros.keys()),
              ...Array.from(instanceMacros.keys()),
            ]);
            return Array.from(allMacros);
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Add __call() magic method for dynamic macro invocation
        Object.defineProperty(this, '__call', {
          value: (method: string, parameters: any[]) => {
            // Check instance macros first
            if (instanceMacros.has(method)) {
              const macro = instanceMacros.get(method)!;
              return macro.apply(proxy, parameters);
            }

            // Then check static macros
            if (staticMacros.has(method)) {
              const macro = staticMacros.get(method)!;
              return macro.apply(proxy, parameters);
            }

            throw new Error(`Method ${method} does not exist on ${constructor.name}.`);
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Return Proxy to intercept method calls
        const proxy = Proxy.make(this, {
          get: (target: any, prop: string | symbol): any => {
            // First, check if property exists on target
            if (prop in target) {
              return target[prop];
            }

            // Then check instance macros
            if (typeof prop === 'string' && instanceMacros.has(prop)) {
              const macro = instanceMacros.get(prop)!;
              // Bind to proxy so macros can call other macros and instance methods
              return macro.bind(proxy);
            }

            // Then check static macros
            if (typeof prop === 'string' && staticMacros.has(prop)) {
              const macro = staticMacros.get(prop)!;
              // Bind to proxy so macros can call instance methods
              return macro.bind(proxy);
            }

            // Return undefined for non-existent properties
            return undefined;
          },

          has: (target: any, prop: string | symbol): boolean => {
            return (
              prop in target ||
              (typeof prop === 'string' && (instanceMacros.has(prop) || staticMacros.has(prop)))
            );
          },
        });

        return proxy;
      }
    };

    // Add static macro() method
    Object.defineProperty(decorated, 'macro', {
      value: (name: string, fn: Function) => {
        staticMacros.set(name, fn);
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // Add static mixin() method
    Object.defineProperty(decorated, 'mixin', {
      value: (methods: Record<string, Function>, replace: boolean = true) => {
        Object.entries(methods).forEach(([name, fn]) => {
          if (replace || !staticMacros.has(name)) {
            staticMacros.set(name, fn);
          }
        });
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // Add static hasMacro() method
    Object.defineProperty(decorated, 'hasMacro', {
      value: (name: string) => staticMacros.has(name),
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // Add static flushMacros() method
    Object.defineProperty(decorated, 'flushMacros', {
      value: () => {
        staticMacros.clear();
      },
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // Add static getMacros() method
    Object.defineProperty(decorated, 'getMacros', {
      value: () => Array.from(staticMacros.keys()),
      writable: false,
      enumerable: false,
      configurable: false,
    });

    // Create a proxy for the class to intercept static method calls
    const classProxy = Proxy.make(decorated, {
      get: (target: any, prop: string | symbol): any => {
        // First, check if property exists on the class
        if (prop in target) {
          return target[prop];
        }

        // Then check static macros
        if (typeof prop === 'string' && staticMacros.has(prop)) {
          const macro = staticMacros.get(prop)!;
          // For static calls, bind to null or the class itself
          // Laravel binds to null for static context
          return (...args: any[]) => macro.apply(null, args);
        }

        return undefined;
      },

      has: (target: any, prop: string | symbol): boolean => {
        return prop in target || (typeof prop === 'string' && staticMacros.has(prop));
      },
    });

    // Preserve class name
    Object.defineProperty(classProxy, 'name', { value: constructor.name });

    return classProxy as any;
  };
}
