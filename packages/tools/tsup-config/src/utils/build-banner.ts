import type { PackageJson } from '../interfaces/package-json.interface';

/**
 * Builds a license banner from package metadata.
 *
 * @param {PackageJson} pkg - Package metadata
 * @returns {string} Formatted JSDoc banner comment
 */
export function buildBanner(pkg: PackageJson): string {
  // Extract metadata with fallback defaults
  const name = pkg.name || 'Unknown Package';
  const version = pkg.version || '0.0.0';
  const author = pkg.author || 'Unknown Author';
  const license = pkg.license || 'UNLICENSED';

  // Format as JSDoc comment block
  return `/**
 * ${name} v${version}
 * (c) ${new Date().getFullYear()} ${author}
 * @license ${license}
 */`;
}
