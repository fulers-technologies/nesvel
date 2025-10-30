/**
 * Factory State Interface
 *
 * Defines the structure for factory state definitions.
 * States allow you to create variations of your base factory data.
 *
 * @template T - The entity type this state applies to
 *
 * @author Nesvel Team
 * @since 1.0.0
 */
export interface IFactoryState<T = any> {
  /**
   * The name of the state
   *
   * Used to identify and reference the state when applying it to factories.
   * Should be descriptive and unique within the factory's state collection.
   *
   * @example 'admin', 'inactive', 'verified', 'suspended'
   */
  name: string;

  /**
   * Function that modifies attributes for this state
   *
   * Takes the current attributes being built and applies state-specific
   * modifications, returning the modified attributes object.
   *
   * @param attributes - Current attributes being built
   * @param parameters - Any parameters passed to the state
   * @returns Modified attributes with state-specific changes
   *
   * @example
   * ```typescript
   * apply: (attributes, role = 'admin') => ({
   *   ...attributes,
   *   role,
   *   permissions: ['*'],
   *   isActive: true
   * })
   * ```
   */
  apply(attributes: Partial<T>, ...parameters: any[]): Partial<T>;
}
