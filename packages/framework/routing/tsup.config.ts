import { defineConfig } from 'tsup';
import { nestLibPreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/nestjs-routing
 *
 * Uses the NestJS library preset with bundling enabled.
 * Bundles all dependencies to avoid missing module errors
 * and ensure proper path alias resolution.
 */
export default defineConfig({
  ...nestLibPreset,
  bundle: true, // Bundle to avoid missing module errors
});
