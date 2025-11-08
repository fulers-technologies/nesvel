import { getTheme } from '@/themes/config';
import { text } from './text';
import { password } from './password';
import { number } from './number';
import { select } from './select';
import { confirm } from './confirm';
import type { FormField } from '@/interfaces/form-field.interface';

/**
 * Form Result
 *
 * @description
 * Object containing all form field values keyed by field name.
 */
export type FormResult<T extends FormField[]> = {
  [K in T[number]['name']]: any;
};

/**
 * Form Prompt
 *
 * @description
 * Creates an interactive form with multiple fields of different types.
 * Collects structured input from the user in a sequential manner.
 * Similar to Laravel's form() prompt.
 *
 * @param {FormField[]} fields - Array of form field configurations
 * @param {object} options - Form options
 * @param {string} options.title - Form title displayed at the top
 * @returns {Promise<FormResult>} Object with field names as keys and user inputs as values
 *
 * @example
 * ```typescript
 * const user = await form([
 *   {
 *     name: 'username',
 *     type: 'text',
 *     message: 'Username',
 *     required: true,
 *     validate: (v) => v.length >= 3 || 'At least 3 characters',
 *   },
 *   {
 *     name: 'email',
 *     type: 'text',
 *     message: 'Email',
 *     required: true,
 *     validate: (v) => v.includes('@') || 'Invalid email',
 *   },
 *   {
 *     name: 'password',
 *     type: 'password',
 *     message: 'Password',
 *     required: true,
 *     min: 8,
 *   },
 *   {
 *     name: 'age',
 *     type: 'number',
 *     message: 'Age',
 *     min: 18,
 *   },
 *   {
 *     name: 'role',
 *     type: 'select',
 *     message: 'Role',
 *     choices: ['admin', 'user', 'guest'],
 *   },
 * ], {
 *   title: 'User Registration',
 * });
 *
 * console.log(user);
 * // { username: 'john', email: 'john@example.com', password: '****', age: 25, role: 'user' }
 * ```
 */
export async function form<T extends FormField[]>(
  fields: T,
  options: {
    title?: string;
  } = {}
): Promise<FormResult<T>> {
  const result: Record<string, any> = {};

  const theme = getTheme();

  // Display form title if provided
  if (options.title) {
    console.log('\n' + theme.highlight(theme.primary(options.title)));
    console.log(theme.muted('─'.repeat(options.title.length)) + '\n');
  }

  // Process each field sequentially
  for (const field of fields) {
    let value: any;

    switch (field.type) {
      case 'text':
        value = await text(field.message, {
          default: field.default,
          placeholder: field.placeholder,
          required: field.required,
          validate: (v) => {
            // Check min/max length
            if (field.min && v.length < field.min) {
              return `Minimum length is ${field.min}`;
            }
            if (field.max && v.length > field.max) {
              return `Maximum length is ${field.max}`;
            }
            // Custom validation
            if (field.validate) {
              return field.validate(v);
            }
            return true;
          },
        });
        break;

      case 'password':
        value = await password(field.message, {
          required: field.required,
          minLength: field.min,
          validate: field.validate,
        });
        break;

      case 'number':
        value = await number(field.message, {
          default: field.default,
          min: field.min,
          max: field.max,
          required: field.required,
        });
        break;

      case 'select':
        value = await select(field.message, field.choices || [], {
          default: field.default,
        });
        break;

      case 'confirm':
        value = await confirm(field.message, {
          default: field.default,
        });
        break;

      default:
        throw new Error(`Unknown field type: ${(field as any).type}`);
    }

    result[field.name] = value;
  }

  return result as FormResult<T>;
}
