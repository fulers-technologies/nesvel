import type { PackageJson } from '../interfaces/package-json.interface';

/**
 * Computes external dependencies from package.json.
 *
 * @param {PackageJson} pkg - Package metadata
 * @returns {string[]} Deduplicated array of package names
 */
export function computeExternals(pkg: PackageJson): string[] {
  // Extract package names from each dependency type
  const deps = Object.keys(pkg.dependencies || {});
  const devDeps = Object.keys(pkg.devDependencies || {});
  const peerDeps = Object.keys(pkg.peerDependencies || {});

  // Combine all dependencies and remove duplicates using Set
  return [...new Set([...deps, ...devDeps, ...peerDeps])];
}
