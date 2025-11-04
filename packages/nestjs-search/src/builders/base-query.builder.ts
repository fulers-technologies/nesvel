import type {
  SearchResponse,
  IQueryBuilder,
  IWhereClause,
  IOrderByClause,
  IAggregationClause,
  PaginatedResponse,
} from '@/interfaces';
import type { SearchService } from '@/services';
import type { WhereOperator, OrderDirection, BooleanOperator } from '@/types';

/**
 * Base Query Builder
 *
 * Abstract base class for all query builders.
 * Provides common functionality and fluent API for building search queries.
 * Extended by provider-specific implementations.
 *
 * @template T - The document type
 *
 * @author Nesvel
 * @since 1.0.0
 */
export abstract class BaseQueryBuilder<T = any> implements IQueryBuilder<T> {
  /**
   * Index name to search in
   *
   * @protected
   */
  protected _indexName?: string;

  /**
   * Search query string
   *
   * @protected
   */
  protected _searchQuery?: string;

  /**
   * Fields to search in
   *
   * @protected
   */
  protected _searchFields?: string[];

  /**
   * Where clauses
   *
   * @protected
   */
  protected _whereClauses: IWhereClause[] = [];

  /**
   * Order by clauses
   *
   * @protected
   */
  protected _orderByClauses: IOrderByClause[] = [];

  /**
   * Aggregation clauses
   *
   * @protected
   */
  protected _aggregations: IAggregationClause[] = [];

  /**
   * Fields to highlight
   *
   * @protected
   */
  protected _highlightFields: string[] = [];

  /**
   * Maximum number of results
   *
   * @protected
   */
  protected _limitValue?: number;

  /**
   * Offset for pagination
   *
   * @protected
   */
  protected _offsetValue: number = 0;

  /**
   * Constructor
   *
   * @param searchService - The search service instance
   */
  constructor(protected readonly searchService: SearchService) {}

  /**
   * Set the index name
   */
  public index(indexName: string): this {
    this._indexName = indexName;
    return this;
  }

  /**
   * Perform full-text search
   */
  public search(query: string, fields?: string[]): this {
    this._searchQuery = query;
    if (fields) {
      this._searchFields = fields;
    }
    return this;
  }

  /**
   * Add a where clause
   */
  public where(
    field: string | ((qb: IQueryBuilder<T>) => void),
    operator?: WhereOperator | any,
    value?: any,
  ): this {
    return this.addWhereClause('and', field, operator, value);
  }

  /**
   * Add an OR where clause
   */
  public orWhere(
    field: string | ((qb: IQueryBuilder<T>) => void),
    operator?: WhereOperator | any,
    value?: any,
  ): this {
    return this.addWhereClause('or', field, operator, value);
  }

  /**
   * Add a WHERE IN clause
   */
  public whereIn(field: string, values: any[]): this {
    this._whereClauses.push({
      type: 'in',
      field,
      values,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE IN clause
   */
  public orWhereIn(field: string, values: any[]): this {
    this._whereClauses.push({
      type: 'in',
      field,
      values,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add a WHERE NOT IN clause
   */
  public whereNotIn(field: string, values: any[]): this {
    this._whereClauses.push({
      type: 'not_in',
      field,
      values,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE NOT IN clause
   */
  public orWhereNotIn(field: string, values: any[]): this {
    this._whereClauses.push({
      type: 'not_in',
      field,
      values,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add a WHERE BETWEEN clause
   */
  public whereBetween(field: string, range: [any, any]): this {
    this._whereClauses.push({
      type: 'between',
      field,
      values: range,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE BETWEEN clause
   */
  public orWhereBetween(field: string, range: [any, any]): this {
    this._whereClauses.push({
      type: 'between',
      field,
      values: range,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add a WHERE NOT BETWEEN clause
   */
  public whereNotBetween(field: string, range: [any, any]): this {
    this._whereClauses.push({
      type: 'not_between',
      field,
      values: range,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE NOT BETWEEN clause
   */
  public orWhereNotBetween(field: string, range: [any, any]): this {
    this._whereClauses.push({
      type: 'not_between',
      field,
      values: range,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add a WHERE NULL clause
   */
  public whereNull(field: string): this {
    this._whereClauses.push({
      type: 'null',
      field,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE NULL clause
   */
  public orWhereNull(field: string): this {
    this._whereClauses.push({
      type: 'null',
      field,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add a WHERE NOT NULL clause
   */
  public whereNotNull(field: string): this {
    this._whereClauses.push({
      type: 'not_null',
      field,
      boolean: 'and',
    });
    return this;
  }

  /**
   * Add an OR WHERE NOT NULL clause
   */
  public orWhereNotNull(field: string): this {
    this._whereClauses.push({
      type: 'not_null',
      field,
      boolean: 'or',
    });
    return this;
  }

  /**
   * Add an ORDER BY clause
   */
  public orderBy(field: string, direction: OrderDirection = 'asc'): this {
    this._orderByClauses.push({ field, direction });
    return this;
  }

  /**
   * Set the limit
   */
  public limit(limit: number): this {
    this._limitValue = limit;
    return this;
  }

  /**
   * Alias for limit()
   */
  public take(take: number): this {
    return this.limit(take);
  }

  /**
   * Set the offset
   */
  public offset(offset: number): this {
    this._offsetValue = offset;
    return this;
  }

  /**
   * Alias for offset()
   */
  public skip(skip: number): this {
    return this.offset(skip);
  }

  /**
   * Add highlight fields
   */
  public highlight(...fields: string[]): this {
    this._highlightFields.push(...fields);
    return this;
  }

  /**
   * Add aggregation
   */
  public aggregate(name: string, field: string, type: string = 'terms'): this {
    this._aggregations.push({
      name,
      field,
      type: type as any,
    });
    return this;
  }

  /**
   * Execute query and get all results
   */
  public async get(): Promise<SearchResponse<T>> {
    this.ensureIndexSet();
    const query = this.buildQuery();
    const response = await this.searchService.search(
      this._indexName!,
      this._searchQuery || '',
      query,
    );
    return response as SearchResponse<T>;
  }

  /**
   * Alias for get()
   */
  public async all(): Promise<SearchResponse<T>> {
    return this.get();
  }

  /**
   * Get the first result
   */
  public async first(): Promise<T | null> {
    this.limit(1);
    const response = await this.get();
    return response.hits.length > 0 ? (response.hits[0]?.document as T) : null;
  }

  /**
   * Get the first result or fail
   */
  public async firstOrFail(): Promise<T> {
    const result = await this.first();
    if (!result) {
      throw new Error(`No results found for query in index: ${this._indexName}`);
    }
    return result;
  }

  /**
   * Find by ID
   */
  public async find(id: string | number): Promise<T | null> {
    this.ensureIndexSet();
    return (await this.searchService.getDocument(this._indexName!, id)) as T | null;
  }

  /**
   * Find by ID or fail
   */
  public async findOrFail(id: string | number): Promise<T> {
    const result = await this.find(id);
    if (!result) {
      throw new Error(`Document with ID ${id} not found in index: ${this._indexName}`);
    }
    return result;
  }

  /**
   * Get count
   */
  public async count(): Promise<number> {
    const response = await this.get();
    return response.total;
  }

  /**
   * Check if exists
   */
  public async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  /**
   * Paginate results
   *
   * @param perPage - Results per page
   * @param page - Page number (1-indexed, defaults to 1)
   * @returns Promise resolving to paginated response
   */
  public async paginate(perPage: number, page: number = 1): Promise<PaginatedResponse<T>> {
    const offset = (page - 1) * perPage;
    this.limit(perPage).offset(offset);

    const response = await this.get();
    const total = response.total;
    const lastPage = Math.ceil(total / perPage);

    return {
      data: response.hits.map((hit) => hit.document) as T[],
      total,
      perPage,
      currentPage: page,
      lastPage,
      from: offset + 1,
      to: Math.min(offset + perPage, total),
    };
  }

  /**
   * Get where clauses
   */
  public getWhereClauses(): IWhereClause[] {
    return this._whereClauses;
  }

  /**
   * Get order by clauses
   */
  public getOrderByClauses(): IOrderByClause[] {
    return this._orderByClauses;
  }

  /**
   * Get aggregations
   */
  public getAggregations(): IAggregationClause[] {
    return this._aggregations;
  }

  /**
   * Clone the query builder
   */
  public abstract clone(): IQueryBuilder<T>;

  /**
   * Get the raw query object (provider-specific)
   */
  public abstract toQuery(): any;

  /**
   * Build the query for execution
   * Must be implemented by provider-specific builders
   *
   * @protected
   */
  protected abstract buildQuery(): any;

  /**
   * Add a where clause (internal helper)
   *
   * @protected
   */
  protected addWhereClause(
    boolean: BooleanOperator,
    field: string | ((qb: IQueryBuilder<T>) => void),
    operator?: WhereOperator | any,
    value?: any,
  ): this {
    // Handle nested where (callback)
    if (typeof field === 'function') {
      const nestedBuilder = this.clone();
      field(nestedBuilder);
      this._whereClauses.push({
        type: 'nested',
        field: '',
        boolean,
        nested: nestedBuilder.getWhereClauses(),
      });
      return this;
    }

    // Handle 2-argument form: where('field', value) assumes '=' operator
    if (value === undefined && operator !== undefined) {
      value = operator;
      operator = '=';
    }

    this._whereClauses.push({
      type: 'basic',
      field,
      operator: operator as WhereOperator,
      value,
      boolean,
    });

    return this;
  }

  /**
   * Ensure index is set
   *
   * @protected
   */
  protected ensureIndexSet(): void {
    if (!this._indexName) {
      throw new Error('Index name must be set before executing query. Use .index(name) method.');
    }
  }
}
