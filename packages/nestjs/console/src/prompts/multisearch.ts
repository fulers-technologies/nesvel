import { search } from '@inquirer/prompts';
import { getTheme } from '@/themes/config';

/**
 * Multi-Search Prompt
 *
 * @description
 * Provides a searchable select interface where users can filter through
 * a large list of options by typing. Supports async data fetching.
 * Similar to autocomplete but with built-in search functionality.
 *
 * @param {string} message - The prompt message
 * @param {function} source - Function that returns choices based on search term
 * @param {object} options - Prompt options
 * @param {string} options.placeholder - Placeholder text for search input
 * @returns {Promise<T>} The selected value
 *
 * @example
 * ```typescript
 * const countries = [
 *   'United States', 'United Kingdom', 'Canada', 'Australia',
 *   'Germany', 'France', 'Japan', 'China', 'Brazil', 'India',
 * ];
 *
 * const country = await multisearch(
 *   'Select your country',
 *   async (term) => {
 *     if (!term) return countries;
 *     return countries.filter(c =>
 *       c.toLowerCase().includes(term.toLowerCase())
 *     );
 *   },
 *   {
 *     placeholder: 'Type to search...',
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Async data fetching with API
 * const user = await multisearch(
 *   'Search for user',
 *   async (term) => {
 *     if (!term || term.length < 2) return [];
 *
 *     const response = await fetch(`/api/users?q=${term}`);
 *     const users = await response.json();
 *
 *     return users.map(u => ({
 *       value: u.id,
 *       label: `${u.name} (${u.email})`,
 *       description: u.role,
 *     }));
 *   },
 *   {
 *     placeholder: 'Type at least 2 characters...',
 *   }
 * );
 * ```
 */
export async function multisearch<T = string>(
  message: string,
  source: (
    term: string | undefined
  ) => Promise<Array<string | { value: T; label: string; description?: string }>>,
  _options: {
    placeholder?: string;
  } = {}
): Promise<T> {
  const theme = getTheme();

  return search({
    message: theme.primary(message),
    source: async (term) => {
      // Fetch choices based on search term
      const choices = await source(term);

      // Format choices for inquirer
      return choices.map((choice) => {
        if (typeof choice === 'string') {
          return {
            value: choice as T,
            name: choice,
          };
        }
        return {
          value: choice.value,
          name: choice.label,
          description: choice.description,
        };
      });
    },
    theme: {
      prefix: theme.success(theme.prefix),
    },
  });
}

/**
 * Simple Search Prompt
 *
 * @description
 * A simplified version of multisearch that takes a static list of choices
 * and filters them locally. Perfect for smaller datasets that don't require
 * async fetching.
 *
 * @param {string} message - The prompt message
 * @param {Array} choices - Static list of choices to search through
 * @param {object} options - Prompt options
 * @param {string} options.placeholder - Placeholder text for search input
 * @returns {Promise<T>} The selected value
 *
 * @example
 * ```typescript
 * const framework = await simpleSearch(
 *   'Select framework',
 *   [
 *     { value: 'react', label: 'React', description: 'A JavaScript library' },
 *     { value: 'vue', label: 'Vue.js', description: 'The Progressive Framework' },
 *     { value: 'angular', label: 'Angular', description: 'Platform for web apps' },
 *     { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced' },
 *   ],
 *   {
 *     placeholder: 'Type to filter...',
 *   }
 * );
 * ```
 */
export async function simpleSearch<T = string>(
  message: string,
  choices: Array<string | { value: T; label: string; description?: string }>,
  options: {
    placeholder?: string;
  } = {}
): Promise<T> {
  return multisearch<T>(
    message,
    async (term) => {
      // No search term, return all choices
      if (!term) return choices;

      // Filter choices based on search term
      const lowerTerm = term.toLowerCase();
      return choices.filter((choice) => {
        if (typeof choice === 'string') {
          return choice.toLowerCase().includes(lowerTerm);
        }
        return (
          choice.label.toLowerCase().includes(lowerTerm) ||
          choice.description?.toLowerCase().includes(lowerTerm)
        );
      });
    },
    options
  );
}
