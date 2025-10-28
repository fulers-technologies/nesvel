import type { Linter } from 'eslint';

import { config as base } from '@nesvel/eslint-config/base';

/**
 * ESLint configuration array
 *
 * Inherits base linting rules including:
 * - TypeScript configuration best practices
 * - Jest configuration patterns
 * - Module export standards
 * - Configuration object validation
 */
const config: Linter.Config[] = [...base];

export default config;
