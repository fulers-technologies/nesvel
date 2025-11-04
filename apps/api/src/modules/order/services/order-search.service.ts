import { Injectable, Logger } from '@nestjs/common';
import {
  InjectSearchService,
  SearchService,
  SearchQueryBuilder,
  SearchConnectionType,
} from '@nesvel/nestjs-search';

import type { SearchResponse } from '@nesvel/nestjs-search';

/**
 * Order Search Document
 *
 * Defines the structure of order documents in the search index.
 */
export interface OrderSearchDocument {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  currency: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  shippingCountry?: string;
}

/**
 * Order Search Service
 *
 * Demonstrates the new stateless query builder pattern:
 * 1. Build queries using SearchQueryBuilder (no execution)
 * 2. Execute queries via SearchService
 * 3. Inspect and debug queries before execution
 *
 * **Key Benefits**:
 * - No circular dependencies
 * - Queries are composable and testable
 * - Full visibility into generated DSL
 * - Follows Magento 2 / Doctrine QueryBuilder pattern
 *
 * @example
 * ```typescript
 * // In a controller
 * @Controller('orders')
 * export class OrderController {
 *   constructor(private readonly orderSearchService: OrderSearchService) {}
 *
 *   @Get('search')
 *   async search(@Query('q') query: string, @Query('page') page: number) {
 *     return this.orderSearchService.searchOrders(query, page);
 *   }
 * }
 * ```
 */
@Injectable()
export class OrderSearchService {
  private readonly logger = new Logger(OrderSearchService.name);

  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {}

  /**
   * Search orders with full-text search
   *
   * NEW PATTERN: Build query → Execute query
   *
   * @param searchTerm - Search query
   * @param limit - Number of results
   * @returns Search results
   */
  async searchOrders(
    searchTerm: string,
    limit: number = 20,
  ): Promise<SearchResponse<OrderSearchDocument>> {
    // 1. Build the query (stateless, no execution)
    const queryBuilder = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .search(searchTerm, ['customerName', 'customerEmail', 'orderNumber'])
      .where('status', '!=', 'cancelled')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    // Optional: Debug the query before execution
    this.logger.debug('Search Query:', queryBuilder.toJson(true));

    // 2. Build and execute
    const query = queryBuilder.build();
    return this.searchService.search('orders', searchTerm, query);
  }

  /**
   * Get orders by status
   *
   * @param status - Order status
   * @returns Orders matching status
   */
  async getOrdersByStatus(
    status: OrderSearchDocument['status'],
  ): Promise<SearchResponse<OrderSearchDocument>> {
    const query = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .where('status', status)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .build();

    return this.searchService.search('orders', '', query);
  }

  /**
   * Get active orders (not cancelled)
   */
  async getActiveOrders(): Promise<SearchResponse<OrderSearchDocument>> {
    const query = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .where('status', '!=', 'cancelled')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .build();

    return this.searchService.search('orders', '', query);
  }

  /**
   * Get high-value orders
   *
   * @param minAmount - Minimum order amount
   */
  async getHighValueOrders(
    minAmount: number = 1000,
  ): Promise<SearchResponse<OrderSearchDocument>> {
    const query = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .where('total', '>=', minAmount)
      .orderBy('total', 'desc')
      .limit(50)
      .build();

    return this.searchService.search('orders', '', query);
  }

  /**
   * Find order by ID
   *
   * @param orderId - Order ID
   */
  async findOrder(orderId: string): Promise<OrderSearchDocument | null> {
    return this.searchService.getDocument('orders', orderId);
  }

  /**
   * Complex order search with multiple filters
   *
   * Demonstrates advanced query building with:
   * - Multiple where conditions
   * - Range filters
   * - IN clauses
   * - Sorting
   */
  async complexSearch(filters: {
    searchTerm?: string;
    statuses?: OrderSearchDocument['status'][];
    minAmount?: number;
    maxAmount?: number;
    countries?: string[];
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<SearchResponse<OrderSearchDocument>> {
    const builder = SearchQueryBuilder.elasticsearch<OrderSearchDocument>().index('orders');

    // Full-text search if provided
    if (filters.searchTerm) {
      builder.search(filters.searchTerm, ['customerName', 'customerEmail', 'orderNumber']);
    }

    // Status filter with IN clause
    if (filters.statuses && filters.statuses.length > 0) {
      builder.whereIn('status', filters.statuses);
    }

    // Price range filter
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      builder.whereBetween('total', [filters.minAmount, filters.maxAmount]);
    } else if (filters.minAmount !== undefined) {
      builder.where('total', '>=', filters.minAmount);
    } else if (filters.maxAmount !== undefined) {
      builder.where('total', '<=', filters.maxAmount);
    }

    // Country filter
    if (filters.countries && filters.countries.length > 0) {
      builder.whereIn('shippingCountry', filters.countries);
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      builder.whereBetween('createdAt', [filters.startDate, filters.endDate]);
    } else if (filters.startDate) {
      builder.where('createdAt', '>=', filters.startDate);
    } else if (filters.endDate) {
      builder.where('createdAt', '<=', filters.endDate);
    }

    // Sort by newest first
    builder.orderBy('createdAt', 'desc').limit(filters.limit || 20);

    // Debug before execution
    this.logger.debug('Complex Search Options:', builder.getOptions());

    const query = builder.build();
    return this.searchService.search('orders', filters.searchTerm || '', query);
  }

  /**
   * Search with nested conditions
   *
   * Demonstrates callback pattern for grouped OR conditions
   */
  async searchWithNestedConditions(): Promise<SearchResponse<OrderSearchDocument>> {
    const query = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .where('total', '>=', 1000) // High value orders
      .where((qb) => {
        // Nested OR: either processing OR shipped
        qb.where('status', 'processing').orWhere('status', 'shipped');
      })
      .orderBy('total', 'desc')
      .limit(50)
      .build();

    return this.searchService.search('orders', '', query);
  }

  /**
   * Example: Test query building without execution
   *
   * Useful for unit tests or debugging
   */
  buildSearchQuery(searchTerm: string) {
    const builder = SearchQueryBuilder.elasticsearch<OrderSearchDocument>()
      .index('orders')
      .search(searchTerm, ['customerName', 'customerEmail'])
      .where('status', '!=', 'cancelled');

    // Return query object for inspection/testing
    return {
      builder,
      query: builder.build(),
      json: builder.toJson(true),
      options: builder.getOptions(),
    };
  }

  /**
   * Index an order document
   */
  async indexOrder(order: OrderSearchDocument): Promise<void> {
    await this.searchService.indexDocument('orders', order);
  }

  /**
   * Update order status in search index
   */
  async updateOrderStatus(orderId: string, status: OrderSearchDocument['status']): Promise<void> {
    await this.searchService.updateDocument('orders', orderId, { status });
  }

  /**
   * Delete order from search index
   */
  async deleteOrder(orderId: string): Promise<void> {
    await this.searchService.deleteDocument('orders', orderId);
  }
}
