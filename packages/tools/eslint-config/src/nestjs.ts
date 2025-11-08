import type { Linter } from 'eslint';

import nestjsTyped from '@darraghor/eslint-plugin-nestjs-typed';
import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * NestJS ESLint Configuration Array
 *
 * ESLint configuration for NestJS applications and libraries.
 * Extends base config with Node.js environment settings.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. Base config (TypeScript, Prettier, Turbo)
 * 2. ESLint recommended rules
 * 3. Prettier integration
 * 4. TypeScript rules with decorator support
 * 5. Node.js + ES2022 globals
 * 6. Ignore patterns (dist, coverage)
 *
 * @example
 * ```typescript
 * import { config as nestConfig } from '@nesvel/eslint-config/nestjs';
 *
 * export default [
 *   ...nestConfig,
 *   {
 *     rules: {
 *       // NestJS-specific overrides
 *     }
 *   }
 * ];
 * ```
 */
export const config: Linter.Config[] = [
  // Inherit all base configuration rules
  // Includes TypeScript, Prettier, Turbo, and core ESLint rules
  ...baseConfig,

  // Core JavaScript linting rules
  js.configs.recommended,

  // Prettier integration to prevent formatting conflicts
  eslintConfigPrettier as any,

  // TypeScript recommended rules
  // Essential for NestJS which heavily uses TypeScript decorators
  ...tseslint.configs.recommended,

  // NestJS-specific linting rules
  // Catches common NestJS issues at build time:
  // - DI issues (missing providers, mismatched injections)
  // - Swagger/OpenAPI decorator issues
  // - Security issues (class-transformer CVE)
  // - Validation decorator issues
  nestjsTyped.configs.flatRecommended as any,

  // Node.js environment configuration
  // Provides global variables and APIs available in Node.js runtime
  {
    languageOptions: {
      globals: {
        // Node.js built-in globals (process, Buffer, __dirname, etc.)
        ...globals.node,
        // Modern JavaScript features (Promise, Symbol, BigInt, etc.)
        ...globals.es2022,
      },
    },
  },

  // Ignore patterns for NestJS projects
  // Excludes build output and test coverage from linting
  {
    ignores: [
      'dist/**', // Compiled JavaScript output
      'coverage/**', // Jest coverage reports
    ],
  },
];
