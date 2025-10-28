/**
 * Tsup Configuration Exports
 */

// Base preset for standard TypeScript libraries
export { basePreset } from './base';

// NestJS library preset (decorators, metadata, no bundling)
export { preset as nestLibPreset } from './nest-lib';

// NestJS application preset (bundled, executable)
export { preset as nestAppPreset } from './nest-app';

// CLI tool preset (bundled, executable, with shebang)
export { preset as cliLibPreset } from './cli-lib';

// React library preset (JSX support, React external)
export { preset as reactLibPreset } from './react-lib';

// Load and parse package.json metadata
export { loadPackageJson } from './utils/load-package-json';

// Compute external dependencies from package.json
export { computeExternals } from './utils/compute-externals';

// Build license banner for output files
export { buildBanner } from './utils/build-banner';

// Type definition for package.json structure
export type { PackageJson } from './interfaces/package-json.interface';

export * from './utils';
export * from './interfaces';
