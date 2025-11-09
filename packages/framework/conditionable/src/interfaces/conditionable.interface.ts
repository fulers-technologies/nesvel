/**
 * Conditionable Interface
 *
 * Laravel-inspired interface for classes decorated with @Conditionable()
 * Provides fluent conditional execution methods.
 *
 * @example
 * ```typescript
 * @Conditionable()
 * class QueryBuilder implements IConditionable {
 *   // ... your methods
 * }
 *
 * const query = QueryBuilder.make();
 * query
 *   .when(condition, (q) => q.where('field', 'value'))
 *   .unless(!condition, (q) => q.where('other', 'value'))
 *   .build();
 * ```
 */
export interface IConditionable {
  /**
   * Apply the callback if the given "value" is (or resolves to) truthy.
   *
   * @template TValue - The type of the condition value
   * @template TReturn - The return type of the callback
   *
   * @param value - The condition to evaluate (can be a value or a function that returns a value)
   * @param callback - The callback to execute if condition is truthy
   * @param defaultCallback - Optional callback to execute if condition is falsy
   * @returns this for method chaining, or the callback return value
   *
   * @example Basic usage
   * ```typescript
   * instance.when(true, (obj) => obj.doSomething())
   * ```
   *
   * @example With function condition
   * ```typescript
   * instance.when(() => someCheck(), (obj) => obj.doSomething())
   * ```
   *
   * @example With default callback
   * ```typescript
   * instance.when(
   *   condition,
   *   (obj) => obj.doSomethingTrue(),
   *   (obj) => obj.doSomethingFalse()
   * )
   * ```
   */
  when<TValue = any, TReturn = any>(
    value?: TValue | ((instance: this) => TValue),
    callback?: (instance: this, value: TValue) => TReturn | void,
    defaultCallback?: (instance: this, value: TValue) => TReturn | void
  ): this | TReturn;

  /**
   * Apply the callback if the given "value" is (or resolves to) falsy.
   *
   * @template TValue - The type of the condition value
   * @template TReturn - The return type of the callback
   *
   * @param value - The condition to evaluate (can be a value or a function that returns a value)
   * @param callback - The callback to execute if condition is falsy
   * @param defaultCallback - Optional callback to execute if condition is truthy
   * @returns this for method chaining, or the callback return value
   *
   * @example Basic usage
   * ```typescript
   * instance.unless(false, (obj) => obj.doSomething())
   * ```
   *
   * @example With function condition
   * ```typescript
   * instance.unless(() => !someCheck(), (obj) => obj.doSomething())
   * ```
   *
   * @example With default callback
   * ```typescript
   * instance.unless(
   *   condition,
   *   (obj) => obj.doSomethingFalse(),
   *   (obj) => obj.doSomethingTrue()
   * )
   * ```
   */
  unless<TValue = any, TReturn = any>(
    value?: TValue | ((instance: this) => TValue),
    callback?: (instance: this, value: TValue) => TReturn | void,
    defaultCallback?: (instance: this, value: TValue) => TReturn | void
  ): this | TReturn;
}
