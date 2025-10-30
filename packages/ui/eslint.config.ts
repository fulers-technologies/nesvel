import type { Linter } from 'eslint';
import { config as base } from '@nesvel/eslint-config/base';

/**
 * ESLint configuration array for @nesvel/ui package
 *
 * Extends base configuration with TypeScript parser options
 * to resolve tsconfigRootDir for proper type-aware linting.
 */
const config: Linter.Config[] = [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

export default config;
