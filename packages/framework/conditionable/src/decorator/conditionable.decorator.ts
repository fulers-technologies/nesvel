/**
 * Conditionable Decorator
 *
 * Laravel-inspired decorator that adds conditional execution methods to a class.
 * Provides fluent conditional logic similar to Laravel's Conditionable trait.
 *
 * Features:
 * - when() - Execute callback if condition is truthy
 * - unless() - Execute callback if condition is falsy
 * - Supports callbacks that resolve conditions dynamically
 * - Supports default callbacks when condition is not met
 * - Maintains fluent interface (returns `this` for chaining)
 *
 * @example Basic usage
 * ```typescript
 * @Conditionable()
 * @Injectable()
 * export class QueryBuilder {
 *   private filters: string[] = [];
 *
 *   where(field: string, value: any) {
 *     this.filters.push(`${field} = ${value}`);
 *     return this;
 *   }
 *
 *   build() {
 *     return this.filters.join(' AND ');
 *   }
 * }
 *
 * const query = new QueryBuilder();
 * query
 *   .when(user.isAdmin, (q) => q.where('role', 'admin'))
 *   .when(false, (q) => q.where('status', 'active'))
 *   .build();
 * // Only applies admin filter
 * ```
 *
 * @example With dynamic condition
 * ```typescript
 * const hasPermission = (q) => q.user.hasRole('admin');
 *
 * query
 *   .when(hasPermission, (q) => q.where('sensitive', true))
 *   .unless(hasPermission, (q) => q.where('public_only', true))
 *   .build();
 * ```
 *
 * @example With default callback
 * ```typescript
 * query
 *   .when(
 *     sortBy === 'date',
 *     (q) => q.orderBy('created_at'),
 *     (q) => q.orderBy('name') // Default when condition is false
 *   )
 *   .build();
 * ```
 *
 * @example Chaining multiple conditions
 * ```typescript
 * const builder = new QueryBuilder()
 *   .when(filters.status, (q) => q.where('status', filters.status))
 *   .when(filters.category, (q) => q.where('category', filters.category))
 *   .unless(user.isAdmin, (q) => q.where('public', true))
 *   .build();
 * ```
 */
export function Conditionable() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const decorated = class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        /**
         * Apply the callback if the given "value" is (or resolves to) truthy.
         *
         * @param value - The condition to evaluate (can be a value or a function that returns a value)
         * @param callback - The callback to execute if condition is truthy
         * @param defaultCallback - Optional callback to execute if condition is falsy
         * @returns this for method chaining, or the callback return value if it doesn't return this
         *
         * @example
         * ```typescript
         * instance
         *   .when(true, (obj) => obj.doSomething())
         *   .when(() => someCheck(), (obj) => obj.doSomethingElse());
         * ```
         */
        Object.defineProperty(this, 'when', {
          value: <TValue = any, TReturn = any>(
            value?: TValue | ((instance: any) => TValue),
            callback?: (instance: any, value: TValue) => TReturn | void,
            defaultCallback?: (instance: any, value: TValue) => TReturn | void
          ): any => {
            // Resolve value if it's a function
            const resolvedValue =
              typeof value === 'function' && !(value instanceof Promise)
                ? (value as Function)(proxy)
                : value;

            // If condition is truthy, execute the callback
            if (resolvedValue) {
              if (callback) {
                const result = callback(proxy, resolvedValue);
                // Return the result if it's not undefined, otherwise return this for chaining
                return result !== undefined ? result : proxy;
              }
            } else {
              // If condition is falsy and default callback exists, execute it
              if (defaultCallback) {
                const result = defaultCallback(proxy, resolvedValue);
                return result !== undefined ? result : proxy;
              }
            }

            // Return this for method chaining
            return proxy;
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        /**
         * Apply the callback if the given "value" is (or resolves to) falsy.
         *
         * @param value - The condition to evaluate (can be a value or a function that returns a value)
         * @param callback - The callback to execute if condition is falsy
         * @param defaultCallback - Optional callback to execute if condition is truthy
         * @returns this for method chaining, or the callback return value if it doesn't return this
         *
         * @example
         * ```typescript
         * instance
         *   .unless(false, (obj) => obj.doSomething())
         *   .unless(() => !someCheck(), (obj) => obj.doSomethingElse());
         * ```
         */
        Object.defineProperty(this, 'unless', {
          value: <TValue = any, TReturn = any>(
            value?: TValue | ((instance: any) => TValue),
            callback?: (instance: any, value: TValue) => TReturn | void,
            defaultCallback?: (instance: any, value: TValue) => TReturn | void
          ): any => {
            // Resolve value if it's a function
            const resolvedValue =
              typeof value === 'function' && !(value instanceof Promise)
                ? (value as Function)(proxy)
                : value;

            // If condition is falsy, execute the callback
            if (!resolvedValue) {
              if (callback) {
                const result = callback(proxy, resolvedValue);
                // Return the result if it's not undefined, otherwise return this for chaining
                return result !== undefined ? result : proxy;
              }
            } else {
              // If condition is truthy and default callback exists, execute it
              if (defaultCallback) {
                const result = defaultCallback(proxy, resolvedValue);
                return result !== undefined ? result : proxy;
              }
            }

            // Return this for method chaining
            return proxy;
          },
          writable: false,
          enumerable: false,
          configurable: false,
        });

        // Return Proxy to maintain proper context
        const proxy = new Proxy(this, {
          get: (target: any, prop: string | symbol): any => {
            // Return property from target
            if (prop in target) {
              const value = target[prop];
              // Bind functions to proxy to maintain context
              if (typeof value === 'function') {
                return value.bind(proxy);
              }
              return value;
            }

            return undefined;
          },

          has: (target: any, prop: string | symbol): boolean => {
            return prop in target;
          },
        });

        return proxy;
      }
    };

    // Preserve class name
    Object.defineProperty(decorated, 'name', { value: constructor.name });

    return decorated as any;
  };
}
