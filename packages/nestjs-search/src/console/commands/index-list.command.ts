import { Command } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import {
  BaseCommand,
  spinner,
  success,
  error,
  info,
  warning,
  displayTable,
  newLine,
} from '@nesvel/nestjs-console';
import { InjectSearchService } from '@/decorators';
import { SearchService } from '@/services';

/**
 * Index List Command
 *
 * Lists all search indices with their statistics including document count,
 * size, and status. Works with both Elasticsearch and Meilisearch.
 *
 * **Features**:
 * - Lists all indices in the search engine
 * - Shows document counts and sizes
 * - Displays data in formatted table
 * - Color-coded output for better readability
 *
 * **Usage**:
 * ```bash
 * nesvel-search index:list
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:list',
  description: 'List all search indices with statistics',
})
export class IndexListCommand extends BaseCommand {
  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {
    super();
  }

  /**
   * Execute the command
   *
   * Lists all indices and displays them in a formatted table with statistics.
   * Handles errors gracefully and provides helpful feedback.
   *
   * @param inputs - Command arguments (unused)
   * @param options - Command options (unused)
   */
  async run(inputs?: string[], options?: Record<string, any>): Promise<void> {
    const spinnerInstance = spinner('Fetching indices...');
    spinnerInstance.start();

    try {
      // Get list of indices from the search service
      const indices = await this.searchService.listIndices();

      spinnerInstance.stop();

      // Check if any indices exist
      if (!indices || indices.length === 0) {
        warning('No indices found.');
        newLine();
        info('To create an index, use:');
        info('  nesvel-search index:create <index-name>');
        return;
      }

      // Display success message
      success(`Found ${indices.length} index(es)`);
      newLine();

      // Prepare table data with fallbacks for missing fields
      const tableData = await Promise.all(
        indices.map(async (index: any) => {
          // Extract index name (different providers use different keys)
          const name = index.name || index.index || index.uuid || 'Unknown';

          // Extract document count
          const docCount =
            index.docsCount || index.documentCount || index.docs_count || index['docs.count'] || 0;

          // Extract size
          const size =
            index.storeSize || index.size || index.store_size || index['store.size'] || 'N/A';

          // Extract health/status
          const health = index.health || index.status || 'N/A';

          // Get aliases for this index
          let aliases: string[] = [];
          try {
            aliases = await this.searchService.getAliases(name);
          } catch (err) {
            // Silently ignore errors (e.g., for Meilisearch or system indices)
          }

          return [
            name,
            typeof docCount === 'number' ? docCount.toLocaleString() : docCount.toString(),
            typeof size === 'number' ? `${(size / 1024 / 1024).toFixed(2)} MB` : size,
            health,
            aliases.length > 0 ? aliases.join(', ') : '-',
          ];
        }),
      );

      // Display the table
      displayTable(tableData, {
        head: ['Index Name', 'Documents', 'Size', 'Status', 'Aliases'],
      });

      // Additional helpful info
      newLine();
      info('To view detailed stats for an index, use:');
      info('  nesvel-search index:status <index-name>');
    } catch (err) {
      spinnerInstance.stop();

      // Check if it's a "not implemented" error
      if (err instanceof Error && err.message.includes('not yet implemented')) {
        error('Index listing is not yet supported by your search provider.');
        newLine();
        info('This feature requires implementation in the search provider.');
        info('You can still manage indices using other commands:');
        info('  - index:status <name>');
        info('  - index:create <name>');
        info('  - index:delete <name>');
        return; // Don't throw, allow graceful exit
      }

      // Handle other errors
      error(`Failed to list indices: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (process.env.DEBUG) {
        newLine();
        error('Stack trace:');
        console.error(err);
      }

      throw err;
    }
  }
}
