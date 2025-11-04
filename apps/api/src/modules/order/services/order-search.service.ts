import { Injectable } from '@nestjs/common';
import { InjectSearchService, SearchService, SearchModel } from '@nesvel/nestjs-search';

import type { SearchResponse, PaginatedResponse } from '@nesvel/nestjs-search';

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
 * Order Search Model
 *
 * Laravel Eloquent-style Active Record pattern for Order search operations.
 */
export class OrderSearch extends SearchModel<OrderSearchDocument> {
  static indexName = 'orders';

  /**
   * Get active orders (not cancelled)
   */
  static active() {
    return this.query<OrderSearchDocument>().where('status', '!=', 'cancelled');
  }

  /**
   * Get orders by status
   */
  static byStatus(status: OrderSearchDocument['status']) {
    return this.query<OrderSearchDocument>().where('status', status);
  }

  /**
   * Get high-value orders
   */
  static highValue(minAmount: number = 1000) {
    return this.query<OrderSearchDocument>().where('total', '>=', minAmount);
  }
}

/**
 * Order Search Service
 *
 * Comprehensive service demonstrating all search patterns:
 * - Direct SearchService usage with query builder
 * - SearchModel Active Record pattern
 * - Complex queries with filtering, sorting, and pagination
 * - Full-text search across multiple fields
 * - Aggregations and faceted search
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
  constructor(
    @InjectSearchService()
    private readonly searchService: SearchService,
  ) {}

  /**
   * Search orders with full-text search
   *
   * Searches across customer name, email, and order number.
   *
   * @param searchTerm - Search query
   * @param page - Page number (1-indexed)
   * @returns Paginated search results
   *
   * @example
   * ```typescript
   * const results = await orderSearchService.searchOrders('john', 1);
   * console.log(`Found ${results.total} orders`);
   * ```
   */
  async searchOrders(
    searchTerm: string,
    page: number = 1,
  ): Promise<PaginatedResponse<OrderSearchDocument>> {
    // Using query builder
    const query = this.searchService.query<OrderSearchDocument>();

    return query
      .index('orders')
      .search(searchTerm, ['customerName', 'customerEmail', 'orderNumber'])
      .where('status', '!=', 'cancelled')
      .orderBy('createdAt', 'desc')
      .paginate(20, page);
  }

  /**
   * Get orders by status with pagination
   *
   * @param status - Order status
   * @param page - Page number
   * @returns Paginated results
   *
   * @example
   * ```typescript
   * const pending = await orderSearchService.getOrdersByStatus('pending', 1);
   * ```
   */
  async getOrdersByStatus(
    status: OrderSearchDocument['status'],
    page: number = 1,
  ): Promise<PaginatedResponse<OrderSearchDocument>> {
    // Using SearchModel Active Record pattern
    return OrderSearch.byStatus(status).orderBy('createdAt', 'desc').paginate(20, page);
  }

  /**
   * Get active orders (not cancelled)
   *
   * @returns All active orders
   *
   * @example
   * ```typescript
   * const active = await orderSearchService.getActiveOrders();
   * console.log(`${active.hits.length} active orders`);
   * ```
   */
  async getActiveOrders(): Promise<SearchResponse<OrderSearchDocument>> {
    // Using SearchModel
    return OrderSearch.active().orderBy('createdAt', 'desc').limit(100).get();
  }

  /**
   * Get high-value orders
   *
   * @param minAmount - Minimum order amount
   * @returns Orders above threshold
   *
   * @example
   * ```typescript
   * const highValue = await orderSearchService.getHighValueOrders(5000);
   * ```
   */
  async getHighValueOrders(minAmount: number = 1000): Promise<SearchResponse<OrderSearchDocument>> {
    // Using SearchModel
    return OrderSearch.highValue(minAmount).orderBy('total', 'desc').get();
  }

  /**
   * Find order by ID
   *
   * @param orderId - Order ID
   * @returns Order document or null
   *
   * @example
   * ```typescript
   * const order = await orderSearchService.findOrder('order_123');
   * if (order) {
   *   console.log(`Order ${order.orderNumber} found`);
   * }
   * ```
   */
  async findOrder(orderId: string): Promise<OrderSearchDocument | null> {
    // Using SearchModel
    return OrderSearch.find(orderId);
  }

  /**
   * Complex order search with multiple filters
   *
   * Demonstrates advanced query building with:
   * - Multiple where conditions
   * - Nested OR conditions
   * - Range filters
   * - IN clauses
   * - Sorting and pagination
   *
   * @param filters - Search filters
   * @returns Paginated results
   *
   * @example
   * ```typescript
   * const results = await orderSearchService.complexSearch({
   *   statuses: ['processing', 'shipped'],
   *   minAmount: 100,
   *   maxAmount: 5000,
   *   countries: ['US', 'CA', 'UK'],
   *   page: 1,
   * });
   * ```
   */
  async complexSearch(filters: {
    searchTerm?: string;
    statuses?: OrderSearchDocument['status'][];
    minAmount?: number;
    maxAmount?: number;
    countries?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
  }): Promise<PaginatedResponse<OrderSearchDocument>> {
    const query = this.searchService.query<OrderSearchDocument>();

    query.index('orders');

    // Full-text search if provided
    if (filters.searchTerm) {
      query.search(filters.searchTerm, ['customerName', 'customerEmail', 'orderNumber']);
    }

    // Status filter with OR conditions
    if (filters.statuses && filters.statuses.length > 0) {
      query.whereIn('status', filters.statuses);
    }

    // Price range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        query.whereBetween('total', [filters.minAmount, filters.maxAmount]);
      } else if (filters.minAmount !== undefined) {
        query.where('total', '>=', filters.minAmount);
      } else if (filters.maxAmount !== undefined) {
        query.where('total', '<=', filters.maxAmount);
      }
    }

    // Country filter
    if (filters.countries && filters.countries.length > 0) {
      query.whereIn('shippingCountry', filters.countries);
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      if (filters.startDate && filters.endDate) {
        query.whereBetween('createdAt', [filters.startDate, filters.endDate]);
      } else if (filters.startDate) {
        query.where('createdAt', '>=', filters.startDate);
      } else if (filters.endDate) {
        query.where('createdAt', '<=', filters.endDate);
      }
    }

    // Sort by newest first
    query.orderBy('createdAt', 'desc');

    // Paginate
    return query.paginate(20, filters.page || 1);
  }

  /**
   * Search orders with nested conditions
   *
   * Demonstrates using callback pattern for grouped OR conditions.
   *
   * @param searchTerm - Search term
   * @param page - Page number
   * @returns Paginated results
   *
   * @example
   * ```typescript
   * // Find orders that are:
   * // - High value (>= $1000) AND
   * // - Either processing OR shipped
   * const results = await orderSearchService.searchWithNestedConditions('', 1);
   * ```
   */
  async searchWithNestedConditions(
    searchTerm?: string,
    page: number = 1,
  ): Promise<PaginatedResponse<OrderSearchDocument>> {
    const query = this.searchService.query<OrderSearchDocument>();

    return query
      .index('orders')
      .where('total', '>=', 1000) // High value orders
      .where((qb) => {
        // Nested OR: either processing OR shipped
        qb.where('status', 'processing').orWhere('status', 'shipped');
      })
      .orderBy('total', 'desc')
      .paginate(20, page);
  }

  /**
   * Get order count by status
   *
   * @param status - Order status
   * @returns Number of orders
   *
   * @example
   * ```typescript
   * const pendingCount = await orderSearchService.countByStatus('pending');
   * console.log(`${pendingCount} pending orders`);
   * ```
   */
  async countByStatus(status: OrderSearchDocument['status']): Promise<number> {
    return OrderSearch.byStatus(status).count();
  }

  /**
   * Check if any high-value orders exist
   *
   * @param minAmount - Minimum amount
   * @returns True if orders exist
   *
   * @example
   * ```typescript
   * const hasHighValue = await orderSearchService.hasHighValueOrders(10000);
   * if (hasHighValue) {
   *   console.log('We have VIP orders!');
   * }
   * ```
   */
  async hasHighValueOrders(minAmount: number = 5000): Promise<boolean> {
    return OrderSearch.highValue(minAmount).exists();
  }

  /**
   * Get recent orders
   *
   * @param limit - Number of orders to retrieve
   * @returns Recent orders
   *
   * @example
   * ```typescript
   * const recent = await orderSearchService.getRecentOrders(10);
   * ```
   */
  async getRecentOrders(limit: number = 10): Promise<SearchResponse<OrderSearchDocument>> {
    return this.searchService
      .index<OrderSearchDocument>('orders')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
  }

  /**
   * Advanced search with convenience method
   *
   * Demonstrates using createSearchQuery() convenience method.
   *
   * @param searchTerm - Search term
   * @param page - Page number
   * @returns Paginated results
   *
   * @example
   * ```typescript
   * const results = await orderSearchService.quickSearch('john@example.com', 1);
   * ```
   */
  async quickSearch(
    searchTerm: string,
    page: number = 1,
  ): Promise<PaginatedResponse<OrderSearchDocument>> {
    // createSearchQuery() sets index and search in one call
    return this.searchService
      .createSearchQuery<OrderSearchDocument>('orders', searchTerm, [
        'customerName',
        'customerEmail',
        'orderNumber',
      ])
      .where('status', '!=', 'cancelled')
      .orderBy('createdAt', 'desc')
      .paginate(20, page);
  }

  /**
   * Get first order for a customer
   *
   * @param customerEmail - Customer email
   * @returns First order or null
   *
   * @example
   * ```typescript
   * const firstOrder = await orderSearchService.getFirstOrderByCustomer('john@example.com');
   * ```
   */
  async getFirstOrderByCustomer(customerEmail: string): Promise<OrderSearchDocument | null> {
    return this.searchService
      .query<OrderSearchDocument>()
      .index('orders')
      .where('customerEmail', customerEmail)
      .orderBy('createdAt', 'asc')
      .first();
  }

  /**
   * Get customer lifetime value
   *
   * @param customerEmail - Customer email
   * @returns Total order value
   *
   * @example
   * ```typescript
   * const orders = await orderSearchService.getCustomerOrders('john@example.com');
   * const total = orders.hits.reduce((sum, hit) => sum + hit.document.total, 0);
   * console.log(`Customer lifetime value: $${total}`);
   * ```
   */
  async getCustomerOrders(customerEmail: string): Promise<SearchResponse<OrderSearchDocument>> {
    return this.searchService
      .query<OrderSearchDocument>()
      .index('orders')
      .where('customerEmail', customerEmail)
      .where('status', '!=', 'cancelled')
      .orderBy('createdAt', 'desc')
      .get();
  }

  /**
   * Bulk operations - Index multiple orders
   *
   * @param orders - Array of order documents
   *
   * @example
   * ```typescript
   * await orderSearchService.indexOrders([
   *   { id: '1', orderNumber: 'ORD-001', ... },
   *   { id: '2', orderNumber: 'ORD-002', ... },
   * ]);
   * ```
   */
  async indexOrders(orders: OrderSearchDocument[]): Promise<void> {
    return this.searchService.indexDocuments('orders', orders);
  }

  /**
   * Index a single order
   *
   * @param order - Order document
   *
   * @example
   * ```typescript
   * await orderSearchService.indexOrder({
   *   id: 'order_123',
   *   orderNumber: 'ORD-12345',
   *   customerName: 'John Doe',
   *   customerEmail: 'john@example.com',
   *   status: 'pending',
   *   total: 299.99,
   *   currency: 'USD',
   *   itemCount: 3,
   *   createdAt: new Date().toISOString(),
   *   updatedAt: new Date().toISOString(),
   * });
   * ```
   */
  async indexOrder(order: OrderSearchDocument): Promise<void> {
    return this.searchService.indexDocument('orders', order);
  }

  /**
   * Update order status in search index
   *
   * @param orderId - Order ID
   * @param status - New status
   *
   * @example
   * ```typescript
   * await orderSearchService.updateOrderStatus('order_123', 'shipped');
   * ```
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderSearchDocument['status'],
  ): Promise<void> {
    return this.searchService.updateDocument('orders', orderId, { status });
  }

  /**
   * Delete order from search index
   *
   * @param orderId - Order ID
   *
   * @example
   * ```typescript
   * await orderSearchService.deleteOrder('order_123');
   * ```
   */
  async deleteOrder(orderId: string): Promise<void> {
    return this.searchService.deleteDocument('orders', orderId);
  }
}
