import type { CanBePrecognitiveInterface } from '@/interfaces';

/**
 * Mixin that provides methods for Laravel Precognition support.
 *
 * Laravel Precognition allows frontend applications to anticipate the outcome
 * of backend requests before they're actually submitted, enabling real-time
 * validation feedback.
 *
 * @param Base - The base class to extend
 * @returns Extended class with precognition methods
 */
export class CanBePrecognitive implements CanBePrecognitiveInterface {
  /**
   * Filter the given array of rules into an array of rules that are included in precognitive headers.
   *
   * When a request includes the "Precognition-Validate-Only" header,
   * only the specified fields should be validated.
   *
   * @param rules - Validation rules object
   * @returns Filtered rules for precognition
   */
  filterPrecognitiveRules(rules: Record<string, any>): Record<string, any> {
    const validateOnly = (this as any).get('precognition-validate-only');

    if (!validateOnly) {
      return rules;
    }

    // Parse comma-separated list of fields to validate
    const fields = validateOnly
      .split(',')
      .map((field: string) => field.trim())
      .filter(Boolean);

    // Filter rules to only include specified fields
    const filtered: Record<string, any> = {};
    for (const field of fields) {
      if (rules[field] !== undefined) {
        filtered[field] = rules[field];
      }
    }

    return filtered;
  }

  /**
   * Determine if the request is attempting to be precognitive.
   *
   * Checks for the presence of the "Precognition" header set to "true".
   *
   * @returns True if Precognition header is present
   */
  isAttemptingPrecognition(): boolean {
    return (this as any).get('precognition') === 'true';
  }

  /**
   * Determine if the request is precognitive.
   *
   * This checks a request attribute that may be set by middleware
   * after validation of precognition headers.
   *
   * @returns True if request is marked as precognitive
   */
  isPrecognitive(): boolean {
    // Check if the request has been marked as precognitive
    // This would typically be set by middleware
    return (this as any).precognitive === true;
  }
}
