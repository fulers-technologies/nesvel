import { defineConfig } from 'tsup';
import { cliLibPreset } from '@nesvel/tsup-config';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import pathAliasPlugin from 'esbuild-plugin-path-alias';

/**
 * Build configuration for @nesvel/nestjs-orm
 *
 * Builds both the library and CLI with proper bundling
 */
export default defineConfig([
  // Library build - bundled for proper module resolution
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    bundle: true,
    sourcemap: false,
    minify: false,
    target: 'es2022',
    outDir: 'dist',
    tsconfig: './tsconfig.json',
    esbuildPlugins: [
      pathAliasPlugin({
        '@': join(__dirname, 'src'),
        '@console': join(__dirname, 'src/console'),
        '@decorators': join(__dirname, 'src/decorators'),
        '@entities': join(__dirname, 'src/entities'),
        '@exceptions': join(__dirname, 'src/exceptions'),
        '@factories': join(__dirname, 'src/factories'),
        '@interfaces': join(__dirname, 'src/interfaces'),
        '@migrations': join(__dirname, 'src/migrations'),
        '@mixins': join(__dirname, 'src/mixins'),
        '@repositories': join(__dirname, 'src/repositories'),
        '@seeders': join(__dirname, 'src/seeders'),
        '@services': join(__dirname, 'src/services'),
        '@subscribers': join(__dirname, 'src/subscribers'),
        '@types': join(__dirname, 'src/types'),
        '@utils': join(__dirname, 'src/utils'),
      }),
    ],
    // Keep all dependencies external - don't bundle them
    external: [
      '@mikro-orm/core',
      '@mikro-orm/cli',
      '@mikro-orm/nestjs',
      '@mikro-orm/migrations',
      '@mikro-orm/seeder',
      '@mikro-orm/mongodb',
      '@mikro-orm/mysql',
      '@mikro-orm/postgresql',
      '@mikro-orm/sqlite',
      '@nestjs/common',
      '@nestjs/core',
      '@nesvel/nestjs-console',
      '@nesvel/nestjs-pubsub',
      '@nesvel/shared',
      'nest-commander',
      'nestjs-paginate',
      'reflect-metadata',
      'rxjs',
      'knex',
      'ejs',
      'figlet',
      'uuid',
      '@faker-js/faker',
    ],
  },

  // CLI build
  {
    ...cliLibPreset,
    entry: ['src/cli.ts'],
    external: [
      ...((cliLibPreset.external as string[]) || []),
      '@mikro-orm/core',
      '@mikro-orm/cli',
      '@mikro-orm/migrations',
      '@mikro-orm/nestjs',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
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
