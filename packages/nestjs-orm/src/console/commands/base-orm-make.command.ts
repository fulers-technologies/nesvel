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
   */
  protected async generateFromStub(
    name: string,
    options: MakeCommandOptions,
    additionalVars: Record<string, any> = {},
  ): Promise<void> {
    // Ensure tsconfig paths exist before generating files
    await this.ensureTsconfigPaths();
    
    // Call parent generateFromStub
    await super.generateFromStub(name, options, additionalVars);
  }
}
