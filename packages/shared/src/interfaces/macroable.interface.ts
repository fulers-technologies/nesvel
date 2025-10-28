/**
 * Macroable Interface
 *
 * Laravel-inspired interface for classes decorated with @Macroable()
 * Supports both static and instance macros, matching Laravel's Macroable trait.
 *
 * @example
 * ```typescript
 * // Static macros (shared across all instances)
 * MyService.macro('staticHelper', function() { ... });
 * MyService.staticHelper();
 *
 * // Instance macros (per-instance)
 * const service = new MyService();
 * service.macro('instanceHelper', function() { ... });
 * service.instanceHelper();
 * ```
 */
export interface IMacroable {
  /**
   * Index signature to allow dynamic macro method access
   * This allows calling macros without type casting: service.myMacro()
   * instead of (service as any).myMacro()
   */
  [key: string]: ((...args: any[]) => any) | any;

  /**
   * Register a macro (custom method) on this instance
   *
   * @param name - The name of the macro
   * @param fn - The function to execute. 'this' will be bound to the instance.
   * @returns this for chaining
   *
   * @example
   * ```typescript
   * service.macro('greet', function(name: string) {
   *   return `Hello, ${name}!`;
   * });
   * service.greet('World'); // "Hello, World!"
   * ```
   */
  macro(name: string, fn: Function): this;

  /**
   * Register multiple macros at once on this instance
   *
   * @param methods - Object containing method names and functions
   * @param replace - Whether to replace existing macros (default: true)
   * @returns this for chaining
   *
   * @example
   * ```typescript
   * service.mixin({
   *   add: function(a, b) { return a + b; },
   *   multiply: function(a, b) { return a * b; }
   * });
   * ```
   */
  mixin(methods: Record<string, Function>, replace?: boolean): this;

  /**
   * Check if a macro exists on this instance or class
   *
   * @param name - The macro name
   * @returns true if the macro exists
   */
  hasMacro(name: string): boolean;

  /**
   * Get all registered macro names (both static and instance)
   *
   * @returns Array of macro names
   */
  getMacros(): string[];

  /**
   * Dynamically handle calls to macros
   * This method is called when a macro is invoked
   *
   * @param method - The macro name
   * @param parameters - Arguments passed to the macro
   * @returns The result of the macro execution
   */
  __call(method: string, parameters: any[]): any;
}

/**
 * Static Macroable Interface
 *
 * Interface for static methods available on Macroable classes
 */
export interface IMacroableStatic {
  /**
   * Register a static macro (shared across all instances)
   *
   * @param name - The name of the macro
   * @param fn - The function to execute. 'this' will be bound to the instance when called.
   *
   * @example
   * ```typescript
   * MyService.macro('staticHelper', function() {
   *   return 'I am shared!';
   * });
   * ```
   */
  macro(name: string, fn: Function): void;

  /**
   * Register multiple static macros at once
   *
   * @param methods - Object containing method names and functions
   * @param replace - Whether to replace existing macros (default: true)
   *
   * @example
   * ```typescript
   * MyService.mixin({
   *   helper1: function() { ... },
   *   helper2: function() { ... }
   * });
   * ```
   */
  mixin(methods: Record<string, Function>, replace?: boolean): void;

  /**
   * Check if a static macro exists
   *
   * @param name - The macro name
   * @returns true if the static macro exists
   */
  hasMacro(name: string): boolean;

  /**
   * Remove all static macros
   *
   * @example
   * ```typescript
   * MyService.flushMacros();
   * ```
   */
  flushMacros(): void;

  /**
   * Get all registered static macro names
   *
   * @returns Array of static macro names
   */
  getMacros(): string[];
}
