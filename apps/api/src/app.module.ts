import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { I18nModule } from '@nesvel/nestjs-i18n';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SearchModule } from '@nesvel/nestjs-search';
import { SwaggerModule } from '@nesvel/nestjs-swagger';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AppController } from './controllers/app.controller';
import { databaseConfig } from './config/database.config';
import { i18nConfig } from './config/i18n.config';
import { swaggerConfig } from './config/swagger.config';
import { searchConfig } from './config/search.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { PubSubModule } from '@nesvel/nestjs-pubsub';
import { pubsubConfig } from './config/pubsub.config';
// import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    // Database configuration (MikroORM)
    MikroOrmModule.forRoot(databaseConfig),

    // Rate limiting configuration
    ThrottlerModule.forRoot(rateLimitConfig),

    // I18n configuration
    I18nModule.forRoot(i18nConfig),

    // Swagger documentation
    SwaggerModule.forRoot(swaggerConfig),

    // Search configuration
    SearchModule.forRoot(searchConfig),

    PubSubModule.forRoot(pubsubConfig),

    // Register orders search index with comprehensive configuration
    SearchModule.registerIndex({
      // Index configuration
      name: 'orders',
      alias: 'orders_v1', // Useful for zero-downtime reindexing
      autoCreate: true, // Auto-create index on startup
      autoUpdateSettings: false, // Don't auto-update in production

      /**
       * Elasticsearch Configuration
       *
       * Full configuration for Elasticsearch index including:
       * - Shard and replica settings
       * - Field mappings with proper types
       * - Custom analyzers for text search
       * - Refresh interval optimization
       */
      elasticsearch: {
        // Shard configuration
        numberOfShards: 3, // Distribute data across 3 primary shards
        numberOfReplicas: 2, // 2 replicas for high availability
        refreshInterval: '1s', // Index refresh rate

        // Field mappings
        mappings: {
          properties: {
            // Order identification
            id: {
              type: 'keyword',
            },
            orderNumber: {
              type: 'keyword', // Exact match for order numbers
            },

            // Customer information
            customerName: {
              type: 'text',
              analyzer: 'standard',
              fields: {
                keyword: {
                  type: 'keyword', // For exact match and aggregations
                },
                suggest: {
                  type: 'completion', // For autocomplete
                },
              },
            },
            customerEmail: {
              type: 'keyword', // Email as exact match
            },
            customerPhone: {
              type: 'keyword',
            },

            // Order details
            status: {
              type: 'keyword', // pending, processing, shipped, delivered, cancelled
            },
            total: {
              type: 'float',
            },
            subtotal: {
              type: 'float',
            },
            tax: {
              type: 'float',
            },
            shippingCost: {
              type: 'float',
            },
            discount: {
              type: 'float',
            },
            currency: {
              type: 'keyword', // USD, EUR, etc.
            },

            // Items and products
            items: {
              type: 'nested', // Array of order items
              properties: {
                productId: { type: 'keyword' },
                productName: {
                  type: 'text',
                  analyzer: 'standard',
                },
                sku: { type: 'keyword' },
                quantity: { type: 'integer' },
                price: { type: 'float' },
                total: { type: 'float' },
              },
            },

            // Shipping information
            shippingAddress: {
              properties: {
                street: { type: 'text' },
                city: { type: 'keyword' },
                state: { type: 'keyword' },
                zipCode: { type: 'keyword' },
                country: { type: 'keyword' },
              },
            },
            billingAddress: {
              properties: {
                street: { type: 'text' },
                city: { type: 'keyword' },
                state: { type: 'keyword' },
                zipCode: { type: 'keyword' },
                country: { type: 'keyword' },
              },
            },

            // Payment information
            paymentMethod: {
              type: 'keyword', // credit_card, paypal, bank_transfer, etc.
            },
            paymentStatus: {
              type: 'keyword', // pending, paid, failed, refunded
            },

            // Fulfillment
            trackingNumber: {
              type: 'keyword',
            },
            carrier: {
              type: 'keyword', // UPS, FedEx, USPS, etc.
            },

            // Additional fields
            notes: {
              type: 'text',
              analyzer: 'standard',
            },
            tags: {
              type: 'keyword', // Array of tags
            },

            // Timestamps
            createdAt: {
              type: 'date',
            },
            updatedAt: {
              type: 'date',
            },
            paidAt: {
              type: 'date',
            },
            shippedAt: {
              type: 'date',
            },
            deliveredAt: {
              type: 'date',
            },
            cancelledAt: {
              type: 'date',
            },

            // Metadata
            source: {
              type: 'keyword', // web, mobile, api, admin
            },
            version: {
              type: 'integer',
            },
          },
        },

        // Advanced settings
        settings: {
          // Performance tuning
          max_result_window: 10000, // Maximum results for pagination

          // Custom analyzers for better search
          analysis: {
            analyzer: {
              // Email analyzer
              email_analyzer: {
                type: 'custom',
                tokenizer: 'uax_url_email',
                filter: ['lowercase'],
              },
              // Name analyzer with stemming
              name_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'name_stemmer'],
              },
            },
            filter: {
              name_stemmer: {
                type: 'stemmer',
                language: 'english',
              },
            },
          },
        },
      },

      /**
       * Meilisearch Configuration
       *
       * Full configuration for Meilisearch including:
       * - Searchable, filterable, and sortable attributes
       * - Ranking rules for relevance
       * - Typo tolerance settings
       * - Synonyms and stop words
       */
      meilisearch: {
        // Primary key
        primaryKey: 'id',

        // Searchable attributes (in order of importance)
        searchableAttributes: [
          'orderNumber',
          'customerName',
          'customerEmail',
          'customerPhone',
          'items.productName',
          'items.sku',
          'trackingNumber',
          'notes',
        ],

        // Displayed attributes (fields returned in results)
        displayedAttributes: [
          'id',
          'orderNumber',
          'customerName',
          'customerEmail',
          'status',
          'total',
          'currency',
          'paymentStatus',
          'trackingNumber',
          'carrier',
          'shippingAddress',
          'createdAt',
          'updatedAt',
          'shippedAt',
          'deliveredAt',
        ],

        // Filterable attributes (for WHERE clauses)
        filterableAttributes: [
          'status',
          'paymentStatus',
          'paymentMethod',
          'currency',
          'total',
          'carrier',
          'shippingAddress.city',
          'shippingAddress.state',
          'shippingAddress.country',
          'tags',
          'source',
          'createdAt',
          'updatedAt',
          'paidAt',
          'shippedAt',
          'deliveredAt',
        ],

        // Sortable attributes
        sortableAttributes: [
          'total',
          'createdAt',
          'updatedAt',
          'paidAt',
          'shippedAt',
          'deliveredAt',
        ],

        // Ranking rules (in order of priority)
        rankingRules: [
          'words', // Number of matching words
          'typo', // Fewer typos = better rank
          'proximity', // Distance between words
          'attribute', // Order of searchableAttributes
          'sort', // Custom sort
          'exactness', // Exact matches first
        ],

        // Stop words (words to ignore during search)
        stopWords: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'],

        // Synonyms for better search
        synonyms: {
          order: ['purchase', 'transaction'],
          shipped: ['sent', 'dispatched', 'delivered'],
          cancelled: ['canceled', 'voided'],
          customer: ['client', 'buyer'],
        },

        // Distinct attribute (for deduplication)
        distinctAttribute: 'orderNumber',

        // Typo tolerance
        typoTolerance: {
          enabled: true,
          minWordSizeForTypos: {
            oneTypo: 4, // Allow 1 typo for words >= 4 chars
            twoTypos: 8, // Allow 2 typos for words >= 8 chars
          },
          disableOnWords: [
            // Exact match required for these
            'id',
            'sku',
          ],
          disableOnAttributes: [
            // No typo tolerance on these fields
            'orderNumber',
            'customerEmail',
            'trackingNumber',
          ],
        },
      },
    }),
    // OrderModule,
  ],
  controllers: [AppController],
  providers: [
    // Apply throttler guard globally to all routes
    // Individual routes can opt-out using @SkipThrottle() decorator
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
