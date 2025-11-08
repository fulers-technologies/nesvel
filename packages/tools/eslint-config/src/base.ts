import type { Linter } from 'eslint';

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import onlyWarn from 'eslint-plugin-only-warn';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint Configuration Array
 *
 * Foundation configuration for all TypeScript packages in the monorepo.
 * Provides core linting rules with monorepo-specific enhancements.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. ESLint recommended rules for JavaScript
 * 2. Prettier integration (disables conflicting rules)
 * 3. TypeScript ESLint recommended rules
 * 4. Turborepo plugin (monorepo best practices)
 * 5. Only-warn plugin (converts errors to warnings)
 * 6. Ignore patterns (excludes build output)
 *
 * @example
 * ```typescript
 * import { config as baseConfig } from '@nesvel/eslint-config/base';
 *
 * export default [
 *   ...baseConfig,
 *   {
 *     // Add custom rules
 *   }
 * ];
 * ```
 */
export const config: Linter.Config[] = [
  // Core ESLint recommended rules for JavaScript
  // Provides fundamental linting for common JavaScript issues
  js.configs.recommended,

  // Prettier integration - disables ESLint rules that conflict with Prettier
  // This prevents conflicts between ESLint formatting and Prettier formatting
  eslintConfigPrettier as any,

  // TypeScript ESLint recommended rules
  // Adds TypeScript-aware linting rules for type safety
  ...tseslint.configs.recommended,

  // Turborepo plugin configuration
  // Enforces monorepo best practices and catches common Turbo issues
  // Note: Temporarily disabled due to compatibility issues with jiti
  // {
  //   plugins: {
  //     turbo: turboPlugin as any,
  //   },
  //   rules: {
  //     // Warn when environment variables are used but not declared in turbo.json
  //     // This helps catch missing environment variable declarations early
  //     'turbo/no-undeclared-env-vars': 'warn',
  //   },
  // },

  // Only-warn plugin configuration
  // Converts all ESLint errors to warnings for a less disruptive developer experience
  // This allows developers to see issues without breaking their workflow
  {
    plugins: {
      onlyWarn: onlyWarn as any,
    },
  },

  // Ignore patterns
  // Exclude build output and generated files from linting
  {
    ignores: [
      'dist/**', // Build output directory
    ],
  },
];
