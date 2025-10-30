/**
 * Console Prompts Library
 *
 * @description
 * A comprehensive console utilities library providing Laravel-style prompts,
 * messages, themes, and interactive CLI components.
 *
 * @module console-prompts
 *
 * @example
 * ```typescript
 * import { text, confirm, success, error } from 'console-prompts';
 *
 * const name = await text('What is your name?');
 * const confirmed = await confirm('Are you sure?');
 *
 * if (confirmed) {
 *   success('Operation completed!');
 * } else {
 *   error('Operation cancelled');
 * }
 * ```
 */

// Export all prompts
export * from './prompts';

// Export all message utilities
export * from './messages';

// Export enums
export * from './enums';

// Export themes
export * from './themes';

// Export interfaces
export * from './interfaces';

// Export console commands and utilities
export * from './console';

// Re-export nest-commander for convenience
export {
  Command,
  CommandRunner,
  Option,
  CommandFactory,
  Question,
  QuestionSet,
} from 'nest-commander';
