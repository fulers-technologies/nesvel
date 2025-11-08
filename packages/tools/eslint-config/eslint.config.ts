import type { Linter } from 'eslint';

import { config as base } from '@nesvel/eslint-config/base';

/**
 * ESLint configuration array
 *
 * Inherits base linting rules including:
 * - TypeScript best practices
 * - Code style enforcement
 * - Import/export conventions
 * - General JavaScript/TypeScript standards
 */
const config: Linter.Config[] = [...base];

export default config;
