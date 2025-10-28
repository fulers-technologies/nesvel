import type { Linter } from 'eslint';

import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { config as baseConfig } from './base.js';

/**
 * React Internal ESLint Configuration Array
 *
 * Browser-focused linting for React component libraries.
 * Includes React, Hooks, and browser/service worker environment.
 *
 * @type {Linter.Config[]}
 * @constant
 *
 * Configuration layers:
 * 1. Base config (TypeScript, Prettier, Turbo)
 * 2. ESLint recommended rules
 * 3. Prettier integration
 * 4. TypeScript rules
 * 5. React recommended config
 * 6. Browser + Service Worker globals
 * 7. React Hooks rules
 * 8. React auto-import disabled
 *
 * @example
 * ```typescript
 * import { config as reactConfig } from '@nesvel/eslint-config/react-internal';
 *
 * export default [
 *   ...reactConfig,
 *   {
 *     rules: {
 *       // Component library overrides
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
  // Essential for type-safe React components
  ...tseslint.configs.recommended,

  // React recommended configuration
  // Enables JSX syntax and React-specific rules
  pluginReact.configs.flat.recommended as any,

  // Browser and service worker environment configuration
  // Suitable for client-side React component libraries
  {
    languageOptions: {
      // Inherit React's language options (JSX parser, etc.)
      ...(pluginReact.configs.flat.recommended as any).languageOptions,
      globals: {
        // Service Worker APIs for offline-first React apps
        // (self, caches, skipWaiting, clients, etc.)
        ...globals.serviceworker,
        // Browser APIs for client-side code
        // (window, document, navigator, localStorage, etc.)
        ...globals.browser,
      },
    },
  },

  // React Hooks rules enforcement
  // Ensures proper usage of useState, useEffect, useMemo, useCallback, etc.
  {
    plugins: {
      'react-hooks': pluginReactHooks as any,
    },
    settings: {
      // Automatically detect React version to apply version-specific rules
      react: { version: 'detect' },
    },
    rules: {
      // React Hooks rules (exhaustive-deps, rules-of-hooks, etc.)
      ...(pluginReactHooks.configs.recommended as any).rules,
      // Disable React import requirement (modern React with new JSX transform)
      'react/react-in-jsx-scope': 'off',
    },
  },
];
