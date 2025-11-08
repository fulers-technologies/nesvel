import { Injectable } from '@nestjs/common';
import { BaseMakeCommand } from '@nesvel/nestjs-console';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Base PubSub Make Command
 *
 * Extends BaseMakeCommand to override the stubs path to use
 * PubSub-specific stubs instead of nestjs-console stubs.
 *
 * All PubSub make commands should extend this class instead of
 * BaseMakeCommand directly.
 */
@Injectable()
export abstract class BasePubSubMakeCommand extends BaseMakeCommand {
  /**
   * Override to provide PubSub-specific stubs path
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
}
