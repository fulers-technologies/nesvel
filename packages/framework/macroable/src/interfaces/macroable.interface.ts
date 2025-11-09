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
 * const service = MyService.make();
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
