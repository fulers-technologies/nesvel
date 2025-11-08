import type { Linter } from 'eslint';

import { config as base } from '@nesvel/eslint-config/base';

/**
 * ESLint configuration array
 *
 * Inherits base linting rules including:
 * - TypeScript configuration best practices
 * - tsconfig.json conventions
 * - Compiler option standards
 * - Build configuration patterns
 */
const config: Linter.Config[] = [...base];

export default config;
