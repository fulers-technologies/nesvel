import { Command, Option } from 'nest-commander';
import { Injectable } from '@nestjs/common';
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
import { InjectSearchService } from '@/decorators';
import { SearchService } from '@/services';

/**
 * Index Delete Command
 *
 * Permanently deletes an existing search index and all its data.
 * Requires confirmation before deletion (can be skipped with --force).
 *
 * **Features**:
 * - Delete index permanently
 * - Confirmation prompt (safety)
 * - Force deletion without prompt
 * - Warning for irreversible action
 *
 * **Usage**:
 * ```bash
 * nesvel-search index:delete <index-name>
 * nesvel-search index:delete old_orders
 * nesvel-search index:delete temp_index --force
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:delete',
  description: 'Delete a search index permanently',
  arguments: '<index>',
  argsDescription: {
    index: 'Name of the index to delete',
  },
})
export class IndexDeleteCommand extends BaseCommand {
  /**
   * Skip confirmation prompt
   *
   * If true, deletes the index without asking for confirmation.
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
   * Deletes the specified index after confirmation.
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
      info('Usage: index:delete <index-name>');
      return;
    }

    const force = options?.force || false;

    const spinnerInstance = spinner(`Checking if index "${indexName}" exists...`);
    spinnerInstance.start();

    try {
      // Check if index exists first
      const exists = await this.searchService.indexExists(indexName);

      spinnerInstance.stop();

      if (!exists) {
        warning(`Index "${indexName}" does not exist.`);
        newLine();
        info('Use "index:list" to see all available indices.');
        return;
      }

      // Show warning
      warning('⚠️  Warning: This will permanently delete the index and all its data!');
      newLine();

      // Confirm before deleting (unless --force is used)
      if (!force) {
        const confirmed = await confirm(`Are you sure you want to delete index "${indexName}"?`, {
          default: false, // default to no for safety
        });

        if (!confirmed) {
          info('Index deletion cancelled');
          return;
        }
      }

      // Show spinner while deleting
      const deleteSpinner = spinner(`Deleting index "${indexName}"...`);
      deleteSpinner.start();

      // Delete the index
      await this.searchService.deleteIndex(indexName);

      deleteSpinner.stop();

      // Success message
      success(`Index "${indexName}" deleted successfully!`);
      newLine();
      info('Use "index:list" to view remaining indices.');
    } catch (err) {
      if (spinnerInstance) spinnerInstance.stop();

      error(`Failed to delete index: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (err instanceof Error && err.message.includes('not found')) {
        newLine();
        warning(`Index "${indexName}" was not found.`);
        info('It may have been deleted already.');
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
