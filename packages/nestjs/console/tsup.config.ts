import { defineConfig } from 'tsup';
import { basePreset } from '@nesvel/tsup-config';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Build configuration for @nesvel/nestjs-console
 *
 * Uses the base preset with bundling:
 * - Bundles all code to avoid module resolution issues
 * - Dual output: ESM and CJS
 * - TypeScript declarations
 */
export default defineConfig({
  ...basePreset,
  bundle: true,
  external: ['@nestjs/common', '@nestjs/core', 'nest-commander', 'inquirer'],
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
