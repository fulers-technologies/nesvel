import type { PackageJson } from '../interfaces/package-json.interface';

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Loads and parses package.json from current working directory.
 *
 * @returns {PackageJson} Parsed package.json metadata
 * @throws {Error} If file cannot be read or JSON is invalid
 */
export function loadPackageJson(): PackageJson {
  // Resolve absolute path to package.json
  const pkgPath = resolve(process.cwd(), 'package.json');

  try {
    // Read file synchronously (build-time operation)
    const content = readFileSync(pkgPath, 'utf-8');

    // Parse and return JSON
    return JSON.parse(content);
  } catch (error: Error | any) {
    // Throw descriptive error with original cause
    throw new Error(
      `Failed to load package.json from ${pkgPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
