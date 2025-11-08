import { defineConfig } from 'tsup';
import { nestLibPreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/nestjs-http
 *
 * Uses the NestJS library preset with bundling enabled.
 * Marks @nestjs/axios, axios, express, and form-data as external
 * to avoid bundling peer dependencies.
 */
export default defineConfig({
  ...nestLibPreset,
  bundle: true, // Bundle internal modules
});
