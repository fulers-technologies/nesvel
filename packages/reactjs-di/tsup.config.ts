import { defineConfig } from 'tsup';
import { reactLibPreset } from '@nesvel/tsup-config';

/**
 * Build configuration for @nesvel/reactjs-di
 *
 * Uses the React library preset which:
 * - Bundles all code for easy consumption
 * - Supports JSX/TSX with React external
 * - Outputs both ESM and CJS formats
 * - Generates TypeScript declarations
 */
export default defineConfig(reactLibPreset);
