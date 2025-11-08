import type { Linter } from 'eslint';
import { config as nest } from '@nesvel/eslint-config/nestjs';

/**
 * ESLint configuration array
 *
 * Inherits all NestJS-specific linting rules including:
 * - Command pattern validation
 * - CLI decorator usage
 * - Console service implementations
 * - Input/output handling standards
 */
const config: Linter.Config[] = [...nest];

export default config;
