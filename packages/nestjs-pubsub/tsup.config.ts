import { join } from 'path';
import { defineConfig } from 'tsup';
import { nestLibPreset } from '@nesvel/tsup-config';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

/**
 * Build configuration for @nesvel/nestjs-pubsub
 *
 * Uses the NestJS library preset which:
 * - Preserves decorators and metadata (required for NestJS)
 * - Uses TypeScript compiler for proper decorator handling
 * - Outputs both ESM and CJS formats
 * - Generates TypeScript declarations
 */
export default defineConfig({
  ...nestLibPreset,
  bundle: true, // Bundle to avoid missing module errors
  onSuccess: async () => {
    // Copy stubs to dist folder
    const stubsDir = 'src/console/stubs';
    const distStubsDir = 'dist/stubs';

    try {
      mkdirSync(distStubsDir, { recursive: true });
      const files = readdirSync(stubsDir);
      files.forEach((file) => {
        if (file.endsWith('.stub.ejs')) {
          copyFileSync(join(stubsDir, file), join(distStubsDir, file));
        }
      });
      console.log('✓ Copied stubs to dist folder');
    } catch (err: Error | any) {
      console.error('Failed to copy stubs:', err);
    }
  },
});
