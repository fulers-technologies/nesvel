import type { IQueryBuilder, IWhereClause, IOrderByClause, IAggregationClause } from '@/interfaces';
import type { WhereOperator, OrderDirection, BooleanOperator } from '@/types';

/**
 * Base Query Builder
 *
 * Abstract stateless base class for all query builders.
 * Provides common functionality and fluent API for building search queries.
 * Does not execute queries - only builds query objects.
 *
 * **Pattern**: Builder pattern - constructs query objects without executing them.
 * Similar to Magento 2, Doctrine QueryBuilder, Eloquent Query Builder.
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
   * Build and return the raw query object
   * Alias for toQuery()
   */
  public build(): any {
    return this.toQuery();
  }

  /**
   * Get the index name
   */
  public getIndex(): string | undefined {
    return this._indexName;
  }

  /**
   * Get the search query string
   */
  public getSearchQuery(): string | undefined {
    return this._searchQuery;
  }

  /**
   * Get the search fields
   */
  public getSearchFields(): string[] | undefined {
    return this._searchFields;
  }

  /**
   * Get the limit value
   */
  public getLimit(): number | undefined {
    return this._limitValue;
  }

  /**
   * Get the offset value
   */
  public getOffset(): number {
    return this._offsetValue;
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
   * Get all query options as a plain object
   */
  public getOptions(): Record<string, any> {
    return {
      index: this._indexName,
      searchQuery: this._searchQuery,
      searchFields: this._searchFields,
      whereClauses: this._whereClauses,
      orderBy: this._orderByClauses,
      aggregations: this._aggregations,
      highlightFields: this._highlightFields,
      limit: this._limitValue,
      offset: this._offsetValue,
    };
  }

  /**
   * Convert the query builder to JSON string
   */
  public toJson(pretty: boolean = false): string {
    const query = this.toQuery();
    return pretty ? JSON.stringify(query, null, 2) : JSON.stringify(query);
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
