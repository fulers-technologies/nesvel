import type { Linter } from 'eslint';

import { config as base } from '@nesvel/eslint-config/base';

/**
 * ESLint configuration array
 *
 * Inherits base linting rules including:
 * - Shared utility function standards
 * - Common type definitions
 * - Framework-agnostic code patterns
 * - Reusable helper conventions
 */
const config: Linter.Config[] = [...base];

export default config;
