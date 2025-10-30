/**
 * Form Field Configuration
 *
 * @description
 * Defines the structure and validation rules for a single form field.
 */
export interface FormField {
  /** Unique identifier for the field */
  name: string;

  /** Field type */
  type: 'text' | 'password' | 'number' | 'select' | 'confirm';

  /** Prompt message displayed to user */
  message: string;

  /** Default value for the field */
  default?: any;

  /** Whether the field is required */
  required?: boolean;

  /** Choices for select fields */
  choices?: string[] | Array<{ value: any; label: string }>;

  /** Validation function */
  validate?: (value: any) => boolean | string;

  /** Placeholder text */
  placeholder?: string;

  /** Minimum value (for number) or length (for text) */
  min?: number;

  /** Maximum value (for number) or length (for text) */
  max?: number;
}
