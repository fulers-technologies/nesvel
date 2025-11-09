/**
 * Interface for CanBePrecognitive mixin.
 *
 * Provides methods for Laravel Precognition support.
 */
export interface CanBePrecognitiveInterface {
  /**
   * Filter the given array of rules into an array of rules that are included in precognitive headers.
   *
   * @param rules - Validation rules object
   * @returns Filtered rules for precognition
   */
  filterPrecognitiveRules(rules: Record<string, any>): Record<string, any>;

  /**
   * Determine if the request is attempting to be precognitive.
   *
   * @returns True if Precognition header is present
   */
  isAttemptingPrecognition(): boolean;

  /**
   * Determine if the request is precognitive.
   *
   * @returns True if request is marked as precognitive
   */
  isPrecognitive(): boolean;
}
