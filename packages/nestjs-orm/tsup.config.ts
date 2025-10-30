import { defineConfig } from 'tsup';
import { nestLibPreset, cliLibPreset } from '@nesvel/tsup-config';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Build configuration for @nesvel/nestjs-orm
 *
 * Builds both the library and CLI:
 * - Library uses NestJS preset (preserves decorators and metadata)
 * - CLI uses CLI preset (bundled executable)
 */
export default defineConfig([
  // Library build
  nestLibPreset,

  // CLI build
  {
    ...cliLibPreset,
    entry: ['src/cli.ts'],
    // Additional externals specific to this CLI
    external: [
      ...((cliLibPreset.external as string[]) || []),
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      '@mikro-orm/core',
      '@mikro-orm/cli',
      '@mikro-orm/migrations',
      '@mikro-orm/nestjs',
      'nest-commander',
      '@nesvel/nestjs-console',
      'nestjs-paginate',
      '@nesvel/shared',
    ],
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
  },
]);
