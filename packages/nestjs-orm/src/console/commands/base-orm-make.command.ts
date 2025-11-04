import { Injectable } from '@nestjs/common';
import { BaseMakeCommand } from '@nesvel/nestjs-console';
import type { MakeCommandOptions } from '@nesvel/nestjs-console';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Base ORM Make Command
 *
 * Extends BaseMakeCommand to override the stubs path to use
 * ORM-specific stubs instead of nestjs-console stubs.
 *
 * All ORM make commands should extend this class instead of
 * BaseMakeCommand directly.
 */
@Injectable()
export abstract class BaseOrmMakeCommand extends BaseMakeCommand {
  /**
   * Override to provide ORM-specific stubs path
   * Handles both running from source (tsx) and built dist
   */
  protected getStubsPath(): string {
    // Try to find stubs relative to __dirname first (for built dist)
    const distStubsPath = path.join(__dirname, 'stubs');
    if (fs.existsSync(distStubsPath)) {
      return distStubsPath;
    }

    // When running from source with tsx, look in dist folder
    // __dirname will be something like .../src/console/commands
    const sourceStubsPath = path.join(__dirname, '../../../dist/stubs');
    if (fs.existsSync(sourceStubsPath)) {
      return sourceStubsPath;
    }

    // Fallback to searching from project root
    const projectRoot = this.findProjectRoot();
    const possiblePaths = [
      path.join(projectRoot, 'dist', 'stubs'),
      path.join(projectRoot, 'stubs'),
    ];

    for (const stubPath of possiblePaths) {
      if (fs.existsSync(stubPath)) {
        return stubPath;
      }
    }

    // Last resort: return dist stubs path (will error if not found)
    return distStubsPath;
  }

  /**
   * Ensure tsconfig.json exists with required path aliases
   * This runs before generating any files
   */
  protected async ensureTsconfigPaths(): Promise<void> {
    const projectRoot = this.findProjectRoot();
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

    // Check if tsconfig exists with path aliases
    if (!fs.existsSync(tsconfigPath)) {
      // Create tsconfig using make:tsconfig command
      try {
        await this.callSilent('make:tsconfig', []);
        console.log('\n✓ Created tsconfig.json with path aliases\n');
      } catch (error) {
        // If command fails, log a warning but continue
        console.warn('⚠️  Could not create tsconfig.json automatically');
      }
      return;
    }

    // Check if existing tsconfig has path aliases
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(tsconfigContent);

      // If no paths configured, warn the user
      if (!tsconfig.compilerOptions?.paths) {
        console.warn(
          '\n⚠️  Warning: tsconfig.json exists but has no path aliases configured.\n' +
            '   Run `make:tsconfig` to add path aliases.\n',
        );
      }
    } catch (error) {
      // Invalid JSON or read error, just skip
      return;
    }
  }

  /**
   * Override generateFromStub to ensure tsconfig paths before generating
   * and fix --path option behavior
   */
  protected async generateFromStub(
    name: string,
    options: MakeCommandOptions,
    additionalVars: Record<string, any> = {},
  ): Promise<void> {
    // Ensure tsconfig paths exist before generating files
    await this.ensureTsconfigPaths();

    // Fix --path behavior: when --path is provided, use it as complete path
    // Don't append outputDir subdirectories
    if (this.customPath) {
      const originalOutputDir = options.outputDir;
      // Use custom path as-is, without appending outputDir
      options = { ...options, outputDir: this.customPath };
      // Temporarily clear customPath so parent doesn't try to process it
      const tempPath = this.customPath;
      this.customPath = undefined;

      try {
        await super.generateFromStub(name, options, additionalVars);
        // Register the generated file in the appropriate module
        await this.registerInModule(name, options, additionalVars);
      } finally {
        // Restore for potential next use
        this.customPath = tempPath;
        options.outputDir = originalOutputDir;
      }
    } else {
      // Call parent generateFromStub normally
      await super.generateFromStub(name, options, additionalVars);
      // Register the generated file in the appropriate module
      await this.registerInModule(name, options, additionalVars);
    }
  }

  /**
   * Register generated file in the appropriate module
   *
   * This method automatically adds the generated class to the nearest module file:
   * - If generating in src/modules/{module}/{type}/, registers in {module}.module.ts
   * - Otherwise, registers in app.module.ts
   *
   * Only registers applicable classes:
   * - Controllers: added to `controllers` array
   * - Services: added to `providers` and `exports` arrays
   * - Repositories: added to `providers` array
   * - Subscribers: added to `providers` array
   * - Middlewares: added to `providers` array
   *
   * Skips registration for:
   * - DTOs, enums, factories, migrations, scopes, seeders (not module-registered)
   *
   * @param name - The base name of the generated file
   * @param options - The make command options
   * @param additionalVars - Additional template variables
   */
  protected async registerInModule(
    name: string,
    options: MakeCommandOptions,
    additionalVars: Record<string, any> = {},
  ): Promise<void> {
    // Only register specific types in modules
    const registerableTypes = ['controller', 'service', 'repository', 'subscriber', 'middleware'];
    if (!registerableTypes.includes(options.stubName)) {
      return; // Skip DTOs, enums, factories, migrations, scopes, seeders
    }

    const fileName = this.toFileName(name);
    const className = this.toClassName(name);
    const projectRoot = this.findProjectRoot();
    const suffix = options.suffix ? `.${this.toFileName(options.suffix)}` : '';

    // Determine the full class name
    const fullClassName =
      additionalVars.className || `${className}${this.toClassName(options.suffix || '')}`;

    // Determine output path
    let targetDir: string;
    if (this.customPath) {
      let relativeOutputDir = options.outputDir;
      if (relativeOutputDir === 'src') {
        relativeOutputDir = '';
      } else if (relativeOutputDir.startsWith('src/')) {
        relativeOutputDir = relativeOutputDir.slice(4);
      }
      targetDir = relativeOutputDir
        ? path.join(this.customPath, relativeOutputDir)
        : this.customPath;
    } else {
      targetDir = options.outputDir;
    }

    // Find the appropriate module file
    const modulePath = this.findModuleFile(path.join(projectRoot, targetDir));
    if (!modulePath) {
      console.warn(
        `\n⚠️  No module file found. Skipping auto-registration of ${fullClassName}.\n` +
          `   You'll need to manually add it to your module.\n`,
      );
      return;
    }

    // Determine import path relative to module
    const moduleDir = path.dirname(modulePath);
    const generatedFilePath = path.join(projectRoot, targetDir, `${fileName}${suffix}`);
    let importPath = this.getRelativePath(moduleDir, generatedFilePath);

    // Remove .ts extension and ensure it starts with ./
    importPath = importPath.replace(/\.ts$/, '');
    if (!importPath.startsWith('.')) {
      importPath = `./${importPath}`;
    }

    // Determine which array to add the class to
    const registrationInfo = this.getRegistrationInfo(options.stubName);

    // Add import and register in module
    this.addToModule(modulePath, fullClassName, importPath, registrationInfo);

    console.log(`\n✓ Registered ${fullClassName} in ${path.basename(modulePath)}\n`);
  }

  /**
   * Find the nearest module file
   *
   * Searches for a module file in the following order:
   * 1. {module-name}.module.ts in parent directory (for src/modules/{module}/{type}/)
   * 2. app.module.ts in src/ directory
   *
   * @param startPath - The directory to start searching from
   * @returns Path to the module file, or null if not found
   */
  protected findModuleFile(startPath: string): string | null {
    let currentDir = startPath;
    const projectRoot = this.findProjectRoot();

    // First, look for a feature module in parent directories
    while (currentDir.startsWith(projectRoot)) {
      const files = fs.readdirSync(currentDir);
      const moduleFile = files.find((f) => f.endsWith('.module.ts'));

      if (moduleFile) {
        return path.join(currentDir, moduleFile);
      }

      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root
      currentDir = parentDir;
    }

    // Fallback: look for app.module.ts in src/
    const appModulePath = path.join(projectRoot, 'src', 'app.module.ts');
    if (fs.existsSync(appModulePath)) {
      return appModulePath;
    }

    return null;
  }

  /**
   * Get registration information for a given stub type
   *
   * @param stubName - The type of stub (controller, service, etc.)
   * @returns Object with arrays to register in and whether to export
   */
  protected getRegistrationInfo(stubName: string): {
    arrays: string[];
    shouldExport: boolean;
  } {
    switch (stubName) {
      case 'controller':
        return { arrays: ['controllers'], shouldExport: false };
      case 'service':
        return { arrays: ['providers'], shouldExport: true };
      case 'repository':
        return { arrays: ['providers'], shouldExport: false };
      case 'subscriber':
        return { arrays: ['providers'], shouldExport: false };
      case 'middleware':
        return { arrays: ['providers'], shouldExport: false };
      default:
        return { arrays: [], shouldExport: false };
    }
  }

  /**
   * Add a class to a module file
   *
   * Parses the module file using TypeScript AST, adds the import statement,
   * and adds the class to the appropriate decorator arrays.
   *
   * @param modulePath - Path to the module file
   * @param className - Name of the class to add
   * @param importPath - Relative import path
   * @param registrationInfo - Information about where to register
   */
  protected addToModule(
    modulePath: string,
    className: string,
    importPath: string,
    registrationInfo: { arrays: string[]; shouldExport: boolean },
  ): void {
    const content = fs.readFileSync(modulePath, 'utf-8');
    let lines = content.split('\n');

    // Find the last import statement
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    // Check if import already exists
    const importStatement = `import { ${className} } from '${importPath}';`;
    const importExists = lines.some(
      (line) =>
        line.includes(`import { ${className} }`) ||
        line.includes(`${className} } from '${importPath}'`),
    );

    if (!importExists) {
      // Add import after the last import
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, importStatement);
      } else {
        // No imports found, add at the beginning
        lines.unshift(importStatement);
      }
    }

    // Add to appropriate arrays in @Module decorator
    for (const arrayName of registrationInfo.arrays) {
      lines = this.addToModuleArray(lines, className, arrayName);
    }

    // Add to exports if needed
    if (registrationInfo.shouldExport) {
      lines = this.addToModuleArray(lines, className, 'exports');
    }

    // Write back to file
    fs.writeFileSync(modulePath, lines.join('\n'));
  }

  /**
   * Add a class to a specific array in @Module decorator
   *
   * @param lines - Array of file lines
   * @param className - Name of the class to add
   * @param arrayName - Name of the array (controllers, providers, exports)
   * @returns Modified lines array
   */
  protected addToModuleArray(lines: string[], className: string, arrayName: string): string[] {
    // Find the @Module decorator and the specific array
    let inModuleDecorator = false;
    let inTargetArray = false;
    let arrayStartIndex = -1;
    let bracketCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() ?? '';

      // Detect @Module decorator
      if (line.startsWith('@Module')) {
        inModuleDecorator = true;
        continue;
      }

      if (inModuleDecorator) {
        // Look for the target array
        if (line.includes(`${arrayName}:`)) {
          inTargetArray = true;
          arrayStartIndex = i;

          // Check if it's an empty array on the same line
          if (line.includes('[]')) {
            // Replace empty array with array containing the class
            const currentLine = lines[i];
            if (currentLine) {
              lines[i] = currentLine.replace('[]', `[${className}]`);
            }
            return lines;
          }

          // Check if it's a single-line array
          if (line.includes('[') && line.includes(']')) {
            // Multi-item array on one line - add to the end
            const match = line.match(/\[(.*)\]/);
            if (match && match[1]) {
              const items = match[1].split(',').map((s) => s.trim());
              if (!items.includes(className)) {
                items.push(className);
                lines[i] = line.replace(/\[.*\]/, `[${items.join(', ')}]`);
              }
            }
            return lines;
          }

          continue;
        }

        if (inTargetArray) {
          // Track brackets to find the end of the array
          for (const char of line) {
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
          }

          // Check if class already exists in array
          if (line.includes(className)) {
            return lines; // Already registered
          }

          // Found the closing bracket of the array
          if (bracketCount < 0 || line.endsWith('],')) {
            // Insert before the closing bracket
            const currentLine = lines[i];
            const indent = currentLine?.match(/^\s*/)?.[0] ?? '    ';
            lines.splice(i, 0, `${indent}${className},`);
            return lines;
          }
        }

        // Check if we've exited the @Module decorator
        if (line.startsWith('export class')) {
          // If we never found the array, we need to add it
          if (!inTargetArray && arrayStartIndex === -1) {
            // Find the closing of @Module decorator
            for (let j = i - 1; j >= 0; j--) {
              const closingLine = lines[j];
              if (closingLine?.trim() === '})' || closingLine?.trim() === '}') {
                // Add the array before the closing brace
                const indent = closingLine?.match(/^\s*/)?.[0] ?? '  ';
                lines.splice(j, 0, `${indent}${arrayName}: [${className}],`);
                return lines;
              }
            }
          }
          break;
        }
      }
    }

    return lines;
  }
}
