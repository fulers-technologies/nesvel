import {
  BaseCommand,
  spinner,
  success,
  error,
  info,
  warning,
  newLine,
  confirm,
} from '@nesvel/nestjs-console';
import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nest-commander';

import { SearchService } from '@/services';
import { InjectSearchService } from '@/decorators';

/**
 * Index Clear Command
 *
 * Removes all documents from an index while keeping the index structure intact.
 * Unlike index:delete, this preserves settings and mappings but clears all data.
 * Requires confirmation before clearing (can be skipped with --force).
 *
 * **Features**:
 * - Clear all documents from index
 * - Preserve index settings and structure
 * - Confirmation prompt (safety)
 * - Force clearing without prompt
 * - Warning for irreversible action
 *
 * **Usage**:
 * ```bash
 * nesvel-search index:clear <index-name>
 * nesvel-search index:clear orders
 * nesvel-search index:clear products --force
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:clear',
  description: 'Clear all documents from an index',
  arguments: '<index>',
  argsDescription: {
    index: 'Name of the index to clear',
  },
})
export class IndexClearCommand extends BaseCommand {
  /**
   * Skip confirmation prompt
   *
   * If true, clears the index without asking for confirmation.
   * Use with caution as this is an irreversible operation.
   *
   * @private
   */
  @Option({
    flags: '--force',
    description: 'Skip confirmation prompt',
  })
  parseForce(): boolean {
    return true;
  }

  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {
    super();
  }

  /**
   * Execute the command
   *
   * Clears all documents from the specified index after confirmation.
   * The index structure (settings, mappings) is preserved.
   * This is an irreversible operation - all data will be lost.
   *
   * @param inputs - Command arguments [indexName]
   * @param options - Command options {force?}
   */
  async run(inputs?: string[], options?: Record<string, any>): Promise<void> {
    const indexName = inputs?.[0];

    // Validate index name
    if (!indexName) {
      error('Index name is required');
      info('Usage: index:clear <index-name>');
      return;
    }

    const force = options?.force || false;

    const spinnerInstance = spinner(`Checking if index "${indexName}" exists...`);
    spinnerInstance.start();

    try {
      // Check if index exists first
      const exists = await this.searchService.indexExists(indexName);

      if (!exists) {
        spinnerInstance.stop();
        warning(`Index "${indexName}" does not exist.`);
        newLine();
        info('Use "index:list" to see all available indices.');
        return;
      }

      // Get document count before clearing
      spinnerInstance.stop();
      const countSpinner = spinner(`Counting documents in "${indexName}"...`);
      countSpinner.start();

      let documentCount = 0;
      try {
        documentCount = await this.searchService.count(indexName);
      } catch {
        // If count fails, continue anyway
        documentCount = 0;
      }

      countSpinner.stop();

      // Show info about what will be cleared
      info(`Index "${indexName}" contains ${documentCount} document(s).`);
      newLine();

      // Show warning
      warning('⚠️  Warning: This will permanently delete all documents from the index!');
      info('The index structure (settings, mappings) will be preserved.');
      newLine();

      // Confirm before clearing (unless --force is used)
      if (!force) {
        const confirmed = await confirm(
          `Are you sure you want to clear all documents from "${indexName}"?`,
          {
            default: false, // default to no for safety
          },
        );

        if (!confirmed) {
          info('Index clearing cancelled');
          return;
        }
      }

      // Show spinner while clearing
      const clearSpinner = spinner(`Clearing all documents from "${indexName}"...`);
      clearSpinner.start();

      // Clear all documents from the index
      await this.searchService.deleteAllDocuments(indexName);

      clearSpinner.stop();

      // Success message
      success(`All documents cleared from index "${indexName}" successfully!`);
      info(`${documentCount} document(s) were removed.`);
      newLine();
      info('Use "index:status ' + indexName + '" to verify the index is empty.');
    } catch (err) {
      if (spinnerInstance) spinnerInstance.stop();

      error(`Failed to clear index: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (err instanceof Error && err.message.includes('not found')) {
        newLine();
        warning(`Index "${indexName}" was not found.`);
        info('It may have been deleted.');
        return; // Don't throw
      }

      if (process.env.DEBUG) {
        newLine();
        error('Stack trace:');
        console.error(err);
      }

      throw err;
    }
  }
}
