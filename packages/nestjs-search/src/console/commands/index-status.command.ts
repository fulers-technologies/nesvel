import {
  BaseCommand,
  spinner,
  success,
  error,
  info,
  warning,
  newLine,
  Group,
  displayTable,
} from '@nesvel/nestjs-console';
import { Command } from 'nest-commander';
import { Injectable } from '@nestjs/common';

import { SearchService } from '@/services';
import { InjectSearchService } from '@/decorators';

/**
 * Index Status Command
 *
 * Shows detailed status and statistics for a specific search index.
 * Displays information like document count, size, health status, and more.
 *
 * **Features**:
 * - Show detailed index statistics
 * - Display document count and storage size
 * - Show index health and status
 * - Pretty formatted output with tables
 *
 * **Usage**:
 * ```bash
 * nesvel-search index:status <index-name>
 * nesvel-search index:status orders
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:status',
  description: 'Show detailed status and statistics for an index',
  arguments: '<index>',
  argsDescription: {
    index: 'Name of the index to check',
  },
})
@Group('Index Management')
export class IndexStatusCommand extends BaseCommand {
  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {
    super();
  }

  /**
   * Execute the command
   *
   * Fetches and displays detailed statistics for the specified index.
   *
   * @param inputs - Command arguments [indexName]
   * @param options - Command options
   */
  async run(inputs?: string[], options?: Record<string, any>): Promise<void> {
    const indexName = inputs?.[0];

    // Validate index name
    if (!indexName) {
      error('Index name is required');
      info('Usage: index:status <index-name>');
      return;
    }

    const spinnerInstance = spinner(`Fetching status for index "${indexName}"...`);
    spinnerInstance.start();

    try {
      // Check if index exists first
      const exists = await this.searchService.indexExists(indexName);

      if (!exists) {
        spinnerInstance.stop();
        warning(`Index "${indexName}" does not exist.`);
        newLine();
        info('Use "index:list" to see all available indices.');
        info('Or create it with: index:create ' + indexName);
        return;
      }

      // Get index stats
      const stats = await this.searchService.getIndexStats(indexName);

      // Get aliases for this index
      let aliases: string[] = [];
      try {
        aliases = await this.searchService.getAliases(indexName);
      } catch (err: Error | any) {
        // Silently ignore errors (e.g., for Meilisearch or system indices)
      }

      spinnerInstance.stop();

      // Display index information
      success(`Index: ${indexName}`);
      newLine();

      // Prepare statistics table with fallbacks
      const statsData = [
        ['Index Name', indexName],
        [
          'Document Count',
          (stats.documentCount || stats.docsCount || stats.docs_count || 0).toLocaleString(),
        ],
        ['Status', stats.status || stats.health || 'Active'],
        [
          'Size',
          typeof stats.size === 'number'
            ? `${(stats.size / 1024 / 1024).toFixed(2)} MB`
            : stats.storeSize || stats.store_size || 'N/A',
        ],
        ['Aliases', aliases.length > 0 ? aliases.join(', ') : '-'],
      ];

      // Display stats table
      displayTable(statsData, {
        header: ['Property', 'Value'],
      });

      // Show additional provider-specific information if available
      if (stats.health && stats.health !== stats.status) {
        newLine();
        info(`Health: ${stats.health}`);
      }

      if (stats.shards) {
        info(
          `Shards: ${stats.shards.total || 0} total, ${stats.shards.successful || 0} successful`,
        );
      }

      if (stats.replicas || stats.numberOfReplicas) {
        info(`Replicas: ${stats.replicas || stats.numberOfReplicas}`);
      }

      // Additional helpful info
      newLine();
      info('To clear all documents: index:clear ' + indexName);
      info('To reindex: index:reindex ' + indexName);
    } catch (err: Error | any) {
      spinnerInstance.stop();

      error(`Failed to get index status: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (err instanceof Error && err.message.includes('not found')) {
        newLine();
        warning(`Index "${indexName}" was not found.`);
        info('Use "index:list" to see all available indices.');
        return; // Don't throw for not found
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
