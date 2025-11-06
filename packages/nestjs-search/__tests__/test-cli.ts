#!/usr/bin/env ts-node
/**
 * Test script for Search CLI commands
 *
 * This script tests both Meilisearch and Elasticsearch providers.
 */

import 'reflect-metadata';
import { MeilisearchProvider, ElasticsearchProvider } from './src/providers';
import { SearchService, IndexNamingService } from './src/services';
import { MeiliSearch } from 'meilisearch';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';

/**
 * Test a search provider with comprehensive tests
 */
async function testProvider(providerName: string, searchService: SearchService): Promise<boolean> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${providerName} Provider`);
  console.log('='.repeat(60));

  try {
    // Test 1: List indices
    console.log('\nTest 1: Listing indices...');
    const indices = await searchService.listIndices();
    console.log(`✓ Found ${indices.length} indices:`);
    indices.forEach((index: any) => {
      const docCount = index.documentCount || index.docsCount || 0;
      console.log(`  - ${index.uid || index.name}: ${docCount} documents`);
    });

    // Test 2: Count documents in first index (if exists)
    if (indices.length > 0) {
      const firstIndex = indices[0].uid || indices[0].name;
      console.log(`\nTest 2: Counting documents in "${firstIndex}"...`);
      const count = await searchService.count(firstIndex);
      console.log(`✓ Document count: ${count}`);
    }

    // Test 3: Create a test index with documents
    const testIndexName = `test_${providerName.toLowerCase()}_products`;
    console.log(`\nTest 3: Creating test index "${testIndexName}" with documents...`);

    try {
      // Check if index exists and delete it first
      // Note: Skip this check for Meilisearch since indices are created async
      if (providerName !== 'Meilisearch' && (await searchService.indexExists(testIndexName))) {
        console.log('⚠  Index already exists, deleting it first...');
        await searchService.deleteIndex(testIndexName);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Create index with provider-specific settings
      const settings =
        providerName === 'Elasticsearch'
          ? {
              // Elasticsearch uses mappings instead of Meilisearch-style attributes
              mappings: {
                properties: {
                  id: { type: 'keyword' },
                  name: { type: 'text' },
                  description: { type: 'text' },
                  category: { type: 'keyword' },
                  price: { type: 'float' },
                },
              },
            }
          : {
              // Meilisearch settings
              searchableAttributes: ['name', 'description'],
              filterableAttributes: ['category', 'price'],
              sortableAttributes: ['price', 'name'],
            };

      await searchService.createIndex(testIndexName, settings);
      console.log('✓ Test index created');

      // Wait for index to be ready (Meilisearch is async, Elasticsearch is sync)
      const waitTime = providerName === 'Meilisearch' ? 2000 : 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      console.log(`⏳ Waited ${waitTime}ms for index to be ready`);

      // Index some test documents
      console.log('\nIndexing test documents...');
      const testProducts = [
        {
          id: '1',
          name: 'Laptop',
          description: 'Powerful laptop for work',
          category: 'Electronics',
          price: 999,
        },
        {
          id: '2',
          name: 'Mouse',
          description: 'Wireless gaming mouse',
          category: 'Electronics',
          price: 49,
        },
        {
          id: '3',
          name: 'Keyboard',
          description: 'Mechanical keyboard',
          category: 'Electronics',
          price: 129,
        },
      ];
      await searchService.indexDocuments(testIndexName, testProducts);
      console.log(`✓ Indexed ${testProducts.length} documents`);

      // Wait a bit for indexing to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 4: Search documents
      console.log('\nTest 4: Searching for "laptop"...');
      const results = await searchService.search(testIndexName, 'laptop');
      console.log(`✓ Found ${results.total} result(s)`);
      if (results.hits.length > 0) {
        const hit = results.hits[0] as any;
        console.log(`  - ${hit.name || hit._source?.name}: $${hit.price || hit._source?.price}`);
      }

      // Test 5: Count documents
      console.log('\nTest 5: Counting documents...');
      const count = await searchService.count(testIndexName);
      console.log(`✓ Document count: ${count}`);

      // Test 6: Get index stats
      console.log('\nTest 6: Getting index stats...');
      const stats = await searchService.getIndexStats(testIndexName);
      const statsStr = JSON.stringify(stats, null, 2);
      console.log(`✓ Stats retrieved: ${statsStr.substring(0, 100)}...`);

      // Test 7: Update a document
      console.log('\nTest 7: Updating a document...');
      await searchService.updateDocument(testIndexName, '1', { price: 899 });
      console.log('✓ Document updated');

      // Test 8: Delete a document
      console.log('\nTest 8: Deleting a document...');
      await searchService.deleteDocument(testIndexName, '3');
      console.log('✓ Document deleted');

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Test 9: Verify count after deletion
      console.log('\nTest 9: Verifying count after deletion...');
      const newCount = await searchService.count(testIndexName);
      console.log(`✓ New document count: ${newCount}`);

      // Clean up (commented out for inspection)
      // console.log('\nCleaning up test index...');
      // await searchService.deleteIndex(testIndexName);
      // console.log('✓ Test index deleted');
      console.log('\n⚠️  Cleanup skipped - index left for inspection');
      console.log(`   Index: ${testIndexName}`);

      // Test 10: Alias and naming strategy tests (Elasticsearch only)
      if (providerName === 'Elasticsearch') {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Index Naming Strategy and Aliases');
        console.log('='.repeat(60));

        // Test timestamped naming strategy
        console.log('\nTest 10a: Timestamped naming strategy...');
        const namingService = new IndexNamingService({ indexNamingStrategy: 'timestamped' });
        const baseIndexName = 'test_alias_products';
        const physicalIndexName = namingService.getPhysicalIndexName(baseIndexName);
        const aliasName = namingService.getAliasName(baseIndexName);

        console.log(`  Physical name: ${physicalIndexName}`);
        console.log(`  Alias name: ${aliasName}`);
        console.log(`  Should use aliases: ${namingService.shouldUseAliases()}`);

        // Create physical index
        console.log('\n  Creating physical index with alias...');
        await searchService.createIndex(physicalIndexName, {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              price: { type: 'float' },
            },
          },
        });

        // Create alias
        await searchService.createAlias(physicalIndexName, aliasName);
        console.log(`  ✓ Created alias: ${aliasName} -> ${physicalIndexName}`);

        // Verify alias
        const aliases = await searchService.getAliases(physicalIndexName);
        console.log(`  ✓ Aliases: [${aliases.join(', ')}]`);

        // Index documents using alias
        await searchService.indexDocuments(aliasName, [
          { id: '1', name: 'Test Product', price: 99.99 },
        ]);
        console.log('  ✓ Indexed documents using alias');

        // Search using alias
        const aliasResults = await searchService.search(aliasName, 'test');
        console.log(`  ✓ Search via alias found ${aliasResults.total} result(s)`);

        // Test zero-downtime reindex
        console.log('\nTest 10b: Zero-downtime reindex with alias switching...');
        const newPhysicalIndexName = namingService.getPhysicalIndexName(baseIndexName);
        console.log(`  Creating new index: ${newPhysicalIndexName}`);

        await searchService.createIndex(newPhysicalIndexName, {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              price: { type: 'float' },
            },
          },
        });

        // Index more documents to new index
        await searchService.indexDocuments(newPhysicalIndexName, [
          { id: '1', name: 'Test Product', price: 99.99 },
          { id: '2', name: 'Another Product', price: 149.99 },
        ]);
        console.log('  ✓ Indexed documents to new index');

        // Atomically switch alias
        await searchService.updateAlias(aliasName, newPhysicalIndexName, physicalIndexName);
        console.log(`  ✓ Switched alias from ${physicalIndexName} to ${newPhysicalIndexName}`);

        // Verify alias points to new index
        const newAliases = await searchService.getAliases(newPhysicalIndexName);
        console.log(`  ✓ New index aliases: [${newAliases.join(', ')}]`);

        // Search using alias (should show new data)
        const newAliasResults = await searchService.search(aliasName, 'product');
        console.log(`  ✓ Search via alias now returns ${newAliasResults.total} result(s)`);

        // Clean up alias test indices
        console.log('\n  Cleaning up alias test indices...');
        await searchService.deleteIndex(physicalIndexName);
        await searchService.deleteIndex(newPhysicalIndexName);
        console.log('  ✓ Cleanup completed');

        // Test versioned naming strategy
        console.log('\nTest 10c: Versioned naming strategy...');
        const versionedNamingService = new IndexNamingService({ indexNamingStrategy: 'versioned' });
        const versionedBaseIndex = 'test_versioned_products';
        const v1Index = versionedNamingService.getPhysicalIndexName(versionedBaseIndex, 1);
        const v2Index = versionedNamingService.getPhysicalIndexName(versionedBaseIndex, 2);
        const versionedAlias = versionedNamingService.getAliasName(versionedBaseIndex);

        console.log(`  V1 index: ${v1Index}`);
        console.log(`  V2 index: ${v2Index}`);
        console.log(`  Alias: ${versionedAlias}`);

        // Create v1 and alias
        await searchService.createIndex(v1Index);
        await searchService.createAlias(v1Index, versionedAlias);
        await searchService.indexDocuments(v1Index, [{ id: '1', name: 'V1 Product', price: 50 }]);
        console.log('  ✓ Created V1 index with alias');

        // Create v2 and switch alias
        await searchService.createIndex(v2Index);
        await searchService.indexDocuments(v2Index, [
          { id: '1', name: 'V2 Product', price: 50 },
          { id: '2', name: 'New Product', price: 75 },
        ]);
        await searchService.updateAlias(versionedAlias, v2Index, v1Index);
        console.log('  ✓ Created V2 index and switched alias');

        // Verify
        const v2Aliases = await searchService.getAliases(v2Index);
        console.log(`  ✓ V2 aliases: [${v2Aliases.join(', ')}]`);

        // Clean up
        await searchService.deleteIndex(v1Index);
        await searchService.deleteIndex(v2Index);
        console.log('  ✓ Cleanup completed');
      }

      console.log('\n' + '='.repeat(60));
      console.log(`✅ All tests passed for ${providerName}!`);
      return true;
    } catch (error: any) {
      console.error(`\n❌ Test failed for ${providerName}:`, error.message);

      // Try to clean up
      try {
        if (await searchService.indexExists(testIndexName)) {
          await searchService.deleteIndex(testIndexName);
          console.log('✓ Cleaned up test index');
        }
      } catch (cleanupError) {
        console.error('Failed to clean up:', cleanupError);
      }

      return false;
    }
  } catch (error: any) {
    console.error(`\n❌ Test failed for ${providerName}:`, error.message);
    return false;
  }
}

/**
 * Check if a service is available
 */
async function checkService(name: string, url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error: Error | any) {
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('Search Provider Test Suite');
  console.log('='.repeat(60));

  const results: { provider: string; success: boolean }[] = [];

  // Test Meilisearch
  console.log('\nChecking Meilisearch availability...');
  const meilisearchAvailable = await checkService('Meilisearch', 'http://localhost:7700/health');

  if (meilisearchAvailable) {
    console.log('✓ Meilisearch is running');
    try {
      const client = new MeiliSearch({
        host: 'http://localhost:7700',
      });
      const provider = new MeilisearchProvider(client);
      const searchService = new SearchService(provider);

      const success = await testProvider('Meilisearch', searchService);
      results.push({ provider: 'Meilisearch', success });
    } catch (error: any) {
      console.error('❌ Failed to initialize Meilisearch:', error.message);
      results.push({ provider: 'Meilisearch', success: false });
    }
  } else {
    console.log('⚠  Meilisearch is not running at http://localhost:7700');
    console.log('   Start it with: docker run -p 7700:7700 getmeili/meilisearch');
  }

  // Test Elasticsearch
  console.log('\n\nChecking Elasticsearch availability...');
  const elasticsearchAvailable = await checkService('Elasticsearch', 'http://localhost:9200');

  if (elasticsearchAvailable) {
    console.log('✓ Elasticsearch is running');
    try {
      const client = new ElasticsearchClient({
        node: 'http://localhost:9200',
      });
      const provider = new ElasticsearchProvider(client);
      const searchService = new SearchService(provider);

      const success = await testProvider('Elasticsearch', searchService);
      results.push({ provider: 'Elasticsearch', success });
    } catch (error: any) {
      console.error('❌ Failed to initialize Elasticsearch:', error.message);
      results.push({ provider: 'Elasticsearch', success: false });
    }
  } else {
    console.log('⚠  Elasticsearch is not running at http://localhost:9200');
    console.log(
      '   Start it with: docker run -p 9200:9200 -e "discovery.type=single-node" elasticsearch:8.11.0',
    );
  }

  // Print summary
  console.log('\n\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  if (results.length === 0) {
    console.log('⚠  No search providers were tested');
    console.log('   Please start Meilisearch or Elasticsearch and try again');
    process.exit(1);
  }

  results.forEach(({ provider, success }) => {
    const status = success ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${provider}`);
  });

  const allPassed = results.every((r) => r.success);

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

main();
