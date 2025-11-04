# @nesvel/nestjs-search

[![NestJS](https://img.shields.io/badge/NestJS-11-red)](#) [![MikroORM](https://img.shields.io/badge/MikroORM-6.x-5D2C8A)](#) [![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](#) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Search engine integration for NestJS with Elasticsearch and Meilisearch support. Seamlessly sync your MikroORM entities with powerful search engines.

## Features

- 🔍 **Multi-Engine Support** - Elasticsearch and Meilisearch providers
- 🔄 **Auto-Sync** - Automatic entity synchronization on create/update/delete
- 🎯 **Type-Safe** - Full TypeScript support with proper typing
- 🔌 **Plug & Play** - Works with `@nesvel/nestjs-orm` Searchable mixin
- ⚡ **Performance** - Efficient bulk indexing and search operations
- 🛠️ **Flexible** - Manual control or automatic synchronization

## Installation

```bash
# Using Bun
bun add @nesvel/nestjs-search

# Using npm
npm install @nesvel/nestjs-search
```

### Search Engine Packages

Install the **native** search engine client you want to use:

```bash
# For Elasticsearch (official client)
bun add @elastic/elasticsearch

# For Meilisearch (official client)
bun add meilisearch
```

## Quick Start

### 1. Define Searchable Entity

```typescript
import { Entity, Property } from '@mikro-orm/core';
import { HasSearchable, BaseEntity } from '@nesvel/nestjs-orm';

@Entity()
export class Post extends HasSearchable(BaseEntity, {
  searchableColumns: ['title', 'content', 'excerpt'],
  searchMode: 'partial',
}) {
  @Property()
  title!: string;

  @Property()
  content!: string;

  @Property()
  excerpt!: string;

  @Property()
  status!: string;

  // Only index published posts
  shouldBeSearchable(): boolean {
    return this.status === 'published';
  }
}
```

### 2. Configure Search Module

#### Using Elasticsearch

```typescript
import { Module } from '@nestjs/common';
import { SearchModule, SearchConnectionType } from '@nesvel/nestjs-search';

@Module({
  imports: [
    SearchModule.forRoot({
      connection: SearchConnectionType.ELASTICSEARCH,
      indexPrefix: 'myapp',
      autoSync: true,
      elasticsearch: {
        node: 'http://localhost:9200',
        auth: {
          username: 'elastic',
          password: 'changeme',
        },
      },
    }),
  ],
})
export class AppModule {}
```

#### Using Meilisearch

```typescript
import { Module } from '@nestjs/common';
import { SearchModule, SearchConnectionType } from '@nesvel/nestjs-search';

@Module({
  imports: [
    SearchModule.forRoot({
      connection: SearchConnectionType.MEILISEARCH,
      indexPrefix: 'myapp',
      autoSync: true,
      meilisearch: {
        host: 'http://localhost:7700',
        apiKey: 'your-master-key',
      },
    }),
  ],
})
export class AppModule {}
```

### 3. Use Search Service

```typescript
import { Injectable } from '@nestjs/common';
import { SearchService } from '@nesvel/nestjs-search';

@Injectable()
export class PostService {
  constructor(private readonly searchService: SearchService) {}

  async search(query: string) {
    return this.searchService.search('posts', query, {
      limit: 20,
      filters: { status: 'published' },
    });
  }

  async indexPost(post: Post) {
    await this.searchService.indexDocument('posts', {
      id: post.id,
      ...post.toSearchableArray(),
    });
  }
}
```

## Configuration

### Module Options

```typescript
interface SearchModuleOptions {
  // Search engine type
  connection: SearchConnectionType;

  // Index name prefix (default: 'nesvel')
  indexPrefix?: string;

  // Auto-sync entities with IHasSearchable (default: true)
  autoSync?: boolean;

  // Elasticsearch config
  elasticsearch?: {
    node: string | string[];
    auth?: { username: string; password: string } | { apiKey: string };
    clientOptions?: Record<string, any>;
  };

  // Meilisearch config
  meilisearch?: {
    host: string;
    apiKey?: string;
    clientOptions?: Record<string, any>;
  };
}
```

### Async Configuration

```typescript
SearchModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    connection: SearchConnectionType.ELASTICSEARCH,
    elasticsearch: {
      node: configService.get('ELASTICSEARCH_NODE'),
      auth: {
        username: configService.get('ELASTICSEARCH_USER'),
        password: configService.get('ELASTICSEARCH_PASSWORD'),
      },
    },
  }),
  inject: [ConfigService],
});
```

## API Reference

### SearchService

```typescript
class SearchService {
  // Index management
  createIndex(indexName: string, settings?: Record<string, any>): Promise<void>;
  deleteIndex(indexName: string): Promise<void>;
  indexExists(indexName: string): Promise<boolean>;

  // Document operations
  indexDocument(indexName: string, document: SearchDocument): Promise<void>;
  indexDocuments(indexName: string, documents: SearchDocument[]): Promise<void>;
  updateDocument(indexName: string, id: string | number, partial: any): Promise<void>;
  deleteDocument(indexName: string, id: string | number): Promise<void>;

  // Search operations
  search(indexName: string, query: string, options?: SearchOptions): Promise<SearchResponse>;
  getDocument(indexName: string, id: string | number): Promise<any>;

  // Utilities
  getIndexStats(indexName: string): Promise<Record<string, any>>;
  clearIndex(indexName: string): Promise<void>;
}
```

## Auto-Sync Behavior

When `autoSync: true`, the SearchableSubscriber automatically:

- **On Create**: Indexes the entity if `shouldBeSearchable()` returns true
- **On Update**: Updates the document in the search engine
- **On Delete**: Removes the document from the search engine

## Development

```bash
# Install dependencies
bun install

# Build
bun build

# Watch mode
bun build:watch

# Test
bun test

# Lint
bun lint
```

## License

MIT © Nesvel
