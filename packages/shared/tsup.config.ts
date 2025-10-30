import { defineConfig } from 'tsup';
import { basePreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/shared
 *
 * Uses the base preset for standard TypeScript library builds:
 * - Dual output: ESM and CJS
 * - TypeScript declarations
 * - Auto-detected externals
 */
export default defineConfig(basePreset);
