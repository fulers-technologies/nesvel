import { Command, Option } from 'nest-commander';
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
  confirm,
} from '@nesvel/nestjs-console';
import { InjectSearchService } from '@/decorators';
import { SearchService } from '@/services';

/**
 * Index Reindex Command
 *
 * Rebuilds an index (or all indices) by clearing documents and re-indexing from the data source.
 * Uses zero-downtime reindexing strategy with temporary indices and alias swapping (Elasticsearch).
 *
 * This is useful when:
 * - Index mappings have changed
 * - Data has become corrupted or stale
 * - Need to apply new analysis settings
 * - Migrating between search providers
 * - Bulk updating all indices
 *
 * **Features**:
 * - Reindex single index or all indices
 * - Zero-downtime reindexing (creates temp index, swaps alias)
 * - Uses IndexNamingService for consistent naming
 * - Progress tracking
 * - Confirmation prompt (safety)
 * - Force reindex without prompt
 * - Batch processing support
 *
 * **Usage**:
 * ```bash
 * # Reindex a specific index
 * nesvel-search index:reindex <index-name>
 * nesvel-search index:reindex orders
 * nesvel-search index:reindex products --force
 * nesvel-search index:reindex users --batch-size=100
 *
 * # Reindex all indices
 * nesvel-search index:reindex
 * nesvel-search index:reindex --force
 * nesvel-search index:reindex --batch-size=500
 * ```
 *
 * **Note**: This command requires that you have a data source configured
 * for the index (e.g., database models, API endpoints). The actual reindexing
 * logic should be implemented in your application's search service by extending
 * SearchService and providing a dataSource function.
 *
 * @author Nesvel
 * @since 1.0.0
 */
@Injectable()
@Command({
  name: 'index:reindex',
  description: 'Rebuild an index (or all indices) from the data source',
  arguments: '[index]',
  argsDescription: {
    index: 'Name of the index to reindex (optional - if not provided, reindexes all indices)',
  },
})
export class IndexReindexCommand extends BaseCommand {
  /**
   * Skip confirmation prompt
   *
   * If true, reindexes the index without asking for confirmation.
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

  /**
   * Batch size for reindexing
   *
   * Number of documents to process in each batch.
   * Larger batches are faster but use more memory.
   *
   * @private
   */
  @Option({
    flags: '--batch-size <number>',
    description: 'Number of documents to process per batch (default: 100)',
  })
  parseBatchSize(val: string): number {
    const size = parseInt(val, 10);
    if (isNaN(size) || size < 1) {
      throw new Error('Batch size must be a positive number');
    }
    return size;
  }

  /**
   * Clear index before reindexing
   *
   * If true, clears all existing documents before reindexing.
   * If false, new documents will be added/updated alongside existing ones.
   *
   * @private
   */
  @Option({
    flags: '--clear',
    description: 'Clear existing documents before reindexing (default: true)',
  })
  parseClear(): boolean {
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
   * Reindexes the specified index or all indices by:
   * 1. Listing all indices if no specific index is provided
   * 2. Fetching data from the source
   * 3. Indexing documents in batches
   * 4. Showing progress
   *
   * @param inputs - Command arguments [indexName?]
   * @param options - Command options {force?, batchSize?, clear?}
   */
  async run(inputs?: string[], options?: Record<string, any>): Promise<void> {
    const indexName = inputs?.[0];

    // If no index name provided, reindex all indices
    if (!indexName) {
      await this.reindexAllIndices(options);
      return;
    }

    const force = options?.force || false;
    const batchSize = options?.batchSize || 100;
    const clear = options?.clear !== false; // Default to true

    const spinnerInstance = spinner(`Checking if index "${indexName}" exists...`);
    spinnerInstance.start();

    try {
      // Check if index exists
      const exists = await this.searchService.indexExists(indexName);

      if (!exists) {
        spinnerInstance.stop();
        warning(`Index "${indexName}" does not exist.`);
        newLine();
        info('Use "index:create ' + indexName + '" to create it first.');
        return;
      }

      // Get current document count
      spinnerInstance.stop();
      let currentCount = 0;
      try {
        const countSpinner = spinner(`Counting documents in "${indexName}"...`);
        countSpinner.start();
        currentCount = await this.searchService.count(indexName);
        countSpinner.stop();
      } catch {
        // Ignore count errors
      }

      // Show reindex info
      info(`Current document count: ${currentCount}`);
      info(`Batch size: ${batchSize}`);
      info(`Clear before reindex: ${clear ? 'Yes' : 'No'}`);
      newLine();

      // Warn if clearing
      if (clear) {
        warning('⚠️  Warning: Existing documents will be cleared before reindexing!');
        newLine();
      }

      // Confirm before reindexing (unless --force is used)
      if (!force) {
        const confirmed = await confirm(`Are you sure you want to reindex "${indexName}"?`, {
          default: false, // default to no for safety
        });

        if (!confirmed) {
          info('Reindexing cancelled');
          return;
        }
      }

      // Step 1: Reindex documents
      const reindexSpinner = spinner(`Reindexing "${indexName}" (batch size: ${batchSize})...`);
      reindexSpinner.start();

      try {
        // Call the search service's reindex method with required data source
        // Note: This will fail if the user hasn't provided a data source implementation
        // The user needs to extend SearchService and implement the reindex method with their data source
        
        const result = await this.searchService.reindex(indexName, {
          batchSize,
          deleteOldIndex: clear,
          dataSource: async () => {
            // This is a placeholder that will throw an error
            // Users must extend SearchService and provide their own data source
            throw new Error(
              'Data source not configured. You must provide a dataSource function ' +
              'that fetches documents from your database, API, or other source.',
            );
          },
        });

        reindexSpinner.stop();

        // Display results
        success('Reindexing completed successfully!');
        newLine();

        // Show statistics
        displayTable(
          [
            ['Total Documents', result.totalDocuments.toString()],
            ['Indexed', result.indexedDocuments.toString()],
            ['Failed', result.failedDocuments.toString()],
            ['Old Index', result.oldIndexName || 'N/A'],
            ['New Index', result.newIndexName],
            ['Duration (ms)', result.duration.toString()],
          ],
          {
            head: ['Metric', 'Value'],
          },
        );

        newLine();
        info('Use "index:status ' + indexName + '" to verify the index.');
      } catch (err) {
        reindexSpinner.stop();

        // Check if data source is not configured
        if (
          err instanceof Error &&
          (err.message.includes('Data source not configured') ||
            err.message.includes('dataSource') ||
            err.message.includes('not implemented'))
        ) {
          error('Reindex data source is not configured.');
          newLine();
          warning('To enable reindexing, you need to provide a data source:');
          newLine();
          info('Option 1: Extend SearchService in your application:');
          info('```typescript');
          info('@Injectable()');
          info('export class MySearchService extends SearchService {');
          info('  constructor(');
          info('    provider: ISearchProvider,');
          info('    private productRepo: ProductRepository,');
          info('  ) {');
          info('    super(provider);');
          info('  }');
          newLine();
          info('  async reindex(indexName: string, options: any) {');
          info('    return super.reindex(indexName, {');
          info('      ...options,');
          info('      dataSource: async () => {');
          info('        const products = await this.productRepo.findAll();');
          info('        return products.map(p => ({');
          info('          id: p.id,');
          info('          name: p.name,');
          info('          price: p.price,');
          info('        }));');
          info('      },');
          info('    });');
          info('  }');
          info('}');
          info('```');
          newLine();
          info('Option 2: Create a custom reindex command with your data source.');
          return;
        }

        throw err;
      }
    } catch (err) {
      if (spinnerInstance) spinnerInstance.stop();

      error(`Failed to reindex: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (process.env.DEBUG) {
        newLine();
        error('Stack trace:');
        console.error(err);
      }

      throw err;
    }
  }

  /**
   * Reindex all indices
   *
   * Lists all indices and reindexes each one sequentially.
   *
   * @param options - Command options {force?, batchSize?, clear?}
   * @private
   */
  private async reindexAllIndices(options?: Record<string, any>): Promise<void> {
    const force = options?.force || false;
    const batchSize = options?.batchSize || 100;
    const clear = options?.clear !== false; // Default to true

    const listSpinner = spinner('Listing all indices...');
    listSpinner.start();

    try {
      // Get all indices
      const indices = await this.searchService.listIndices();
      listSpinner.stop();

      if (indices.length === 0) {
        warning('No indices found.');
        return;
      }

      success(`Found ${indices.length} index(es)`);
      newLine();

      // Display indices
      const indexNames = indices.map((idx: any) => idx.uid || idx.name);
      info('Indices to reindex:');
      indexNames.forEach((name: string) => info(`  - ${name}`));
      newLine();

      // Confirm before reindexing all (unless --force is used)
      if (!force) {
        const confirmed = await confirm(
          `Are you sure you want to reindex all ${indices.length} indices?`,
          {
            default: false, // default to no for safety
          },
        );

        if (!confirmed) {
          info('Reindexing cancelled');
          return;
        }
      }

      newLine();

      // Reindex each index
      let successCount = 0;
      let failCount = 0;
      const results: Array<{ index: string; success: boolean; error?: string }> = [];

      for (const indexName of indexNames) {
        info(`[${successCount + failCount + 1}/${indices.length}] Reindexing "${indexName}"...`);

        try {
          const result = await this.searchService.reindex(indexName, {
            batchSize,
            deleteOldIndex: clear,
            dataSource: async () => {
              throw new Error(
                'Data source not configured. You must provide a dataSource function ' +
                  'that fetches documents from your database, API, or other source.',
              );
            },
          });

          success(`  ✓ ${indexName}: ${result.indexedDocuments} documents indexed`);
          successCount++;
          results.push({ index: indexName, success: true });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          error(`  ✗ ${indexName}: ${errorMsg}`);
          failCount++;
          results.push({ index: indexName, success: false, error: errorMsg });
        }

        newLine();
      }

      // Display summary
      newLine();
      info('='.repeat(50));
      info('Reindex Summary');
      info('='.repeat(50));
      success(`Successful: ${successCount}`);
      if (failCount > 0) {
        error(`Failed: ${failCount}`);
      }
      info(`Total: ${indices.length}`);
      newLine();

      // Show failed indices
      if (failCount > 0) {
        warning('Failed indices:');
        results
          .filter((r) => !r.success)
          .forEach((r) => {
            error(`  - ${r.index}: ${r.error}`);
          });
        newLine();
      }
    } catch (err) {
      if (listSpinner) listSpinner.stop();

      error(`Failed to reindex all indices: ${err instanceof Error ? err.message : 'Unknown error'}`);

      if (process.env.DEBUG) {
        newLine();
        error('Stack trace:');
        console.error(err);
      }

      throw err;
    }
  }
}
