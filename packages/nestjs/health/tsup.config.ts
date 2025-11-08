import { defineConfig } from 'tsup';
import { nestLibPreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/nestjs-health
 *
 * Uses the NestJS library preset with external dependencies.
 * Marks @nestjs/terminus and optional database libraries as external
 * to avoid bundling issues with optional peer dependencies.
 */
export default defineConfig({
  ...nestLibPreset,
  bundle: true, // Bundle to avoid missing module errors
});
