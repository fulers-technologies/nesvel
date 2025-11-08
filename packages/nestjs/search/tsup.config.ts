import { join } from 'path';
import { defineConfig } from 'tsup';
import { cliLibPreset } from '@nesvel/tsup-config';
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
        '@builders': join(__dirname, 'src/builders'),
        '@console': join(__dirname, 'src/console'),
        '@constants': join(__dirname, 'src/constants'),
        '@decorators': join(__dirname, 'src/decorators'),
        '@enums': join(__dirname, 'src/enums'),
        '@interfaces': join(__dirname, 'src/interfaces'),
        '@providers': join(__dirname, 'src/providers'),
        '@services': join(__dirname, 'src/services'),
        '@subscribers': join(__dirname, 'src/subscribers'),
      }),
    ],
    // Keep all dependencies external - don't bundle them
    external: [
      '@elastic/elasticsearch',
      'meilisearch',
      '@nestjs/common',
      '@nestjs/core',
      '@nesvel/nestjs-console',
      'nest-commander',
      'reflect-metadata',
      'rxjs',
      'reflect-metadata',
    ],
  },

  // CLI build
  {
    ...cliLibPreset,
    entry: ['src/cli.ts'],
    external: [
      ...((cliLibPreset.external as string[]) || []),
      '@elastic/elasticsearch',
      'meilisearch',
      '@nestjs/common',
      '@nestjs/core',
      '@nestjs/platform-express',
      'nest-commander',
      '@nesvel/nestjs-console',
      '@nesvel/shared',
    ],
  },
]);
