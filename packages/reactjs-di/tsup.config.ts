import { defineConfig } from 'tsup';
import { reactLibPreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/reactjs-di
 *
 * Uses the React library preset with multiple entry points:
 * - Main index for all exports
 * - Separate DIRoutes component for direct import
 */
export default defineConfig({
  ...reactLibPreset,
  entry: {
    index: 'src/index.ts',
    'components/di-routes': 'src/components/di-routes.tsx',
  },
});
