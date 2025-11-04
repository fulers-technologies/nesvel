# Index Registration

## Overview

The `nestjs-search` package provides a declarative API for registering search indices, similar to `BullModule.registerQueue()`. This allows you to configure indices with provider-specific settings at the module level.

## Features

- **Declarative Configuration**: Register indices in your module imports
- **Provider-Specific Settings**: Configure Elasticsearch or Meilisearch settings
- **Auto-Creation**: Automatically create indices on application startup
- **Index Aliases**: Support for index aliases (useful for zero-downtime reindexing)
- **Type Safety**: Full TypeScript support with detailed type definitions

## Basic Usage

### Register a Single Index

```typescript
import { Module } from '@nestjs/common';
import { SearchModule } from '@nesvel/nestjs-search';

@Module({
  imports: [
    // Configure search provider
    SearchModule.forRoot({
      connection: SearchConnectionType.ELASTICSEARCH,
      elasticsearch: {
        node: 'http://localhost:9200',
      },
    }),

    // Register an index
    SearchModule.registerIndex({
      name: 'products',
    }),
  ],
})
export class AppModule {}
```

### Register Multiple Indices

```typescript
@Module({
  imports: [
    SearchModule.forRoot({ ... }),
    
    // Method 1: Multiple registerIndex calls
    SearchModule.registerIndex({ name: 'products' }),
    SearchModule.registerIndex({ name: 'orders' }),
    SearchModule.registerIndex({ name: 'users' }),
    
    // Method 2: Use registerIndices (bulk registration)
    SearchModule.registerIndices([
      { name: 'products' },
      { name: 'orders' },
      { name: 'users' },
    ]),
  ],
})
export class AppModule {}
```

## Elasticsearch Configuration

### Basic Elasticsearch Index

```typescript
SearchModule.registerIndex({
  name: 'products',
  elasticsearch: {
    numberOfShards: 3,
    numberOfReplicas: 2,
    refreshInterval: '5s',
  },
})
```

### With Custom Mappings

```typescript
SearchModule.registerIndex({
  name: 'products',
  elasticsearch: {
    numberOfShards: 3,
    numberOfReplicas: 1,
    mappings: {
      properties: {
        name: {
          type: 'text',
          analyzer: 'standard',
        },
        description: {
          type: 'text',
          analyzer: 'english',
        },
        price: {
          type: 'float',
        },
        category: {
          type: 'keyword',
        },
        tags: {
          type: 'keyword',
        },
        createdAt: {
          type: 'date',
        },
        inStock: {
          type: 'boolean',
        },
      },
    },
  },
})
```

### With Custom Analysis

```typescript
SearchModule.registerIndex({
  name: 'products',
  elasticsearch: {
    numberOfShards: 2,
    analysis: {
      analyzer: {
        my_custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'my_stemmer'],
        },
      },
      filter: {
        my_stemmer: {
          type: 'stemmer',
          language: 'english',
        },
      },
    },
    mappings: {
      properties: {
        name: {
          type: 'text',
          analyzer: 'my_custom_analyzer',
        },
      },
    },
  },
})
```

### With Index Alias

```typescript
SearchModule.registerIndex({
  name: 'products_v2',
  alias: 'products', // Use 'products' to reference this index
  elasticsearch: {
    numberOfShards: 3,
    mappings: { ... },
  },
})
```

## Meilisearch Configuration

### Basic Meilisearch Index

```typescript
SearchModule.registerIndex({
  name: 'products',
  meilisearch: {
    primaryKey: 'id',
    searchableAttributes: ['name', 'description', 'tags'],
    filterableAttributes: ['category', 'price', 'inStock'],
    sortableAttributes: ['price', 'createdAt', 'rating'],
  },
})
```

### With Advanced Settings

```typescript
SearchModule.registerIndex({
  name: 'products',
  meilisearch: {
    primaryKey: 'id',
    
    // Searchable fields
    searchableAttributes: [
      'name',
      'description',
      'tags',
      'category',
    ],
    
    // Fields returned in results
    displayedAttributes: [
      'id',
      'name',
      'price',
      'image',
      'inStock',
    ],
    
    // Filterable fields
    filterableAttributes: [
      'category',
      'price',
      'inStock',
      'brand',
    ],
    
    // Sortable fields
    sortableAttributes: [
      'price',
      'createdAt',
      'rating',
      'popularity',
    ],
    
    // Ranking rules
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    
    // Stop words (words to ignore)
    stopWords: [
      'the',
      'a',
      'an',
    ],
    
    // Synonyms
    synonyms: {
      phone: ['smartphone', 'mobile', 'cellphone'],
      laptop: ['notebook', 'computer'],
    },
    
    // Distinct attribute (deduplication)
    distinctAttribute: 'productId',
    
    // Typo tolerance
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 5,
        twoTypos: 9,
      },
      disableOnWords: ['iphone', 'macbook'],
      disableOnAttributes: ['category'],
    },
  },
})
```

## Auto-Creation Options

### Auto-Create on Startup (Default)

```typescript
SearchModule.registerIndex({
  name: 'products',
  autoCreate: true, // Default: true
  elasticsearch: { ... },
})
```

### Disable Auto-Creation

```typescript
SearchModule.registerIndex({
  name: 'products',
  autoCreate: false, // Don't create automatically
  elasticsearch: { ... },
})
```

### Auto-Update Settings

```typescript
SearchModule.registerIndex({
  name: 'products',
  autoCreate: true,
  autoUpdateSettings: true, // Update settings on startup
  meilisearch: { ... },
})
```

## Using Registered Indices

### Accessing Index Configuration

```typescript
import { Injectable } from '@nestjs/common';
import { IndexRegistryService } from '@nesvel/nestjs-search';

@Injectable()
export class MyService {
  constructor(
    private readonly indexRegistry: IndexRegistryService,
  ) {}

  getProductsIndexConfig() {
    // Get by name
    const config = this.indexRegistry.get('products');
    
    // Get by alias
    const configByAlias = this.indexRegistry.get('products_v1');
    
    // Check if registered
    const exists = this.indexRegistry.has('products');
    
    // Resolve alias to index name
    const indexName = this.indexRegistry.resolveIndexName('products_v1');
    // Returns: 'products'
    
    // Get all registered indices
    const allIndices = this.indexRegistry.getAll();
  }
}
```

### Querying with Registered Indices

```typescript
import { Injectable } from '@nestjs/common';
import { SearchService, SearchQueryBuilder } from '@nesvel/nestjs-search';

@Injectable()
export class ProductSearchService {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  async searchProducts(query: string) {
    // Build query
    const searchQuery = SearchQueryBuilder.elasticsearch<Product>()
      .index('products') // Use registered index
      .where('inStock', true)
      .orderBy('price', 'asc')
      .limit(20)
      .build();

    // Execute search
    return this.searchService.search('products', query, searchQuery);
  }
}
```

## Complete Example

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SearchModule, SearchConnectionType } from '@nesvel/nestjs-search';

@Module({
  imports: [
    ConfigModule.forRoot(),
    
    // Configure search provider
    SearchModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: SearchConnectionType.ELASTICSEARCH,
        elasticsearch: {
          node: config.get('ELASTICSEARCH_NODE'),
        },
      }),
      inject: [ConfigService],
    }),
    
    // Register indices
    SearchModule.registerIndices([
      {
        name: 'products',
        alias: 'products_v1',
        elasticsearch: {
          numberOfShards: 3,
          numberOfReplicas: 2,
          mappings: {
            properties: {
              name: { type: 'text' },
              description: { type: 'text' },
              price: { type: 'float' },
              category: { type: 'keyword' },
              inStock: { type: 'boolean' },
            },
          },
        },
      },
      {
        name: 'orders',
        elasticsearch: {
          numberOfShards: 2,
          mappings: {
            properties: {
              orderNumber: { type: 'keyword' },
              customerName: { type: 'text' },
              total: { type: 'float' },
              status: { type: 'keyword' },
              createdAt: { type: 'date' },
            },
          },
        },
      },
      {
        name: 'users',
        elasticsearch: {
          numberOfShards: 1,
          mappings: {
            properties: {
              email: { type: 'keyword' },
              name: { type: 'text' },
              role: { type: 'keyword' },
            },
          },
        },
      },
    ]),
  ],
})
export class AppModule {}
```

## CLI Integration

The registered indices work seamlessly with the search CLI commands:

```bash
# List all registered indices
nesvel-search index:list

# Check status of a registered index
nesvel-search index:status products

# Reindex a registered index
nesvel-search index:reindex products

# Clear a registered index
nesvel-search index:clear orders --force
```

## Best Practices

1. **Use Aliases for Production**: Register indices with version suffixes and use aliases for zero-downtime updates
   ```typescript
   SearchModule.registerIndex({
     name: 'products_v2',
     alias: 'products',
   })
   ```

2. **Disable Auto-Update in Production**: Use `autoUpdateSettings: false` to avoid unexpected changes
   ```typescript
   SearchModule.registerIndex({
     name: 'products',
     autoUpdateSettings: false, // Manual updates only
   })
   ```

3. **Environment-Specific Configuration**: Use async configuration with ConfigService
   ```typescript
   SearchModule.forRootAsync({
     useFactory: (config: ConfigService) => ({
       connection: config.get('SEARCH_PROVIDER'),
       // ...
     }),
   })
   ```

4. **Group Related Indices**: Use feature modules to group related indices
   ```typescript
   // products.module.ts
   @Module({
     imports: [
       SearchModule.registerIndices([
         { name: 'products' },
         { name: 'categories' },
         { name: 'brands' },
       ]),
     ],
   })
   export class ProductsModule {}
   ```

## Notes

- **Meilisearch Settings**: Some Meilisearch settings require additional API calls that are not yet fully implemented. The `applyMeilisearchSettings` method currently logs what would be applied.
- **Elasticsearch Updates**: Updating Elasticsearch settings on existing indices requires closing and reopening the index, which is not done automatically to avoid disruption.
- **Error Handling**: Index initialization errors are logged but don't prevent application startup.
