import type { WhereType } from '@/types/where-type.type';
import type { WhereOperator } from '@/types/where-operator.type';
import type { BooleanOperator } from '@/types/boolean-operator.type';

/**
 * Where Clause Interface
 *
 * Defines the structure of a where clause used in search queries.
 * Each where clause represents a single filtering condition that documents
 * must satisfy to be included in search results.
 *
 * **Structure**:
 * - Every clause has a `type` that determines how it's processed
 * - Basic clauses use `field`, `operator`, and `value`
 * - Array clauses (in, not_in) use `field` and `values`
 * - Range clauses (between, not_between) use `field` and `values` [min, max]
 * - Null clauses (null, not_null) only use `field`
 * - Nested clauses contain an array of sub-clauses
 * - All clauses have a `boolean` operator ('and' or 'or') for combining
 *
 * @interface IWhereClause
 *
 * @author Nesvel
 * @since 1.0.0
 *
 * @example
 * ```typescript
 * // Basic where clause
 * const basicClause: IWhereClause = {
 *   type: 'basic',
 *   field: 'status',
 *   operator: '=',
 *   value: 'active',
 *   boolean: 'and'
 * };
 *
 * // WHERE IN clause
 * const inClause: IWhereClause = {
 *   type: 'in',
 *   field: 'category',
 *   values: ['Electronics', 'Computers'],
 *   boolean: 'and'
 * };
 *
 * // WHERE BETWEEN clause
 * const betweenClause: IWhereClause = {
 *   type: 'between',
 *   field: 'price',
 *   values: [100, 500],
 *   boolean: 'and'
 * };
 *
 * // WHERE NULL clause
 * const nullClause: IWhereClause = {
 *   type: 'null',
 *   field: 'deletedAt',
 *   boolean: 'and'
 * };
 *
 * // Nested where clause (OR grouping)
 * const nestedClause: IWhereClause = {
 *   type: 'nested',
 *   field: '',
 *   boolean: 'and',
 *   nested: [
 *     {
 *       type: 'basic',
 *       field: 'category',
 *       operator: '=',
 *       value: 'Electronics',
 *       boolean: 'and'
 *     },
 *     {
 *       type: 'basic',
 *       field: 'category',
 *       operator: '=',
 *       value: 'Computers',
 *       boolean: 'or'
 *     }
 *   ]
 * };
 * ```
 */
export interface IWhereClause {
  /**
   * Type of where clause
   *
   * Determines how this clause is interpreted and translated to
   * provider-specific syntax (Elasticsearch DSL or Meilisearch filters).
   *
   * @type {WhereType}
   */
  type: WhereType;

  /**
   * Field name to filter on
   *
   * The document field that this condition applies to.
   * For nested clauses, this is typically an empty string.
   *
   * @type {string}
   *
   * @example 'price', 'status', 'category', 'createdAt'
   */
  field: string;

  /**
   * Comparison operator
   *
   * Defines the comparison operation for basic clauses.
   * Not used for 'in', 'not_in', 'between', 'null', 'not_null', or 'nested' types.
   *
   * @type {WhereOperator}
   * @optional
   *
   * @example '=', '>', '>=', '<', '<=', '!=', 'like'
   */
  operator?: WhereOperator;

  /**
   * Value to compare against
   *
   * The value used in basic comparisons.
   * Only used when `type` is 'basic'.
   *
   * @type {any}
   * @optional
   *
   * @example 'active', 100, true, '2024-01-01'
   */
  value?: any;

  /**
   * Array of values
   *
   * Used for clauses that involve multiple values:
   * - 'in' and 'not_in': Array of possible values
   * - 'between' and 'not_between': Two-element array [min, max]
   *
   * @type {any[]}
   * @optional
   *
   * @example
   * ['Electronics', 'Computers', 'Software'] // for 'in' clause
   * [100, 500] // for 'between' clause
   */
  values?: any[];

  /**
   * Boolean operator for combining with previous clause
   *
   * Determines how this clause is combined with the previous one:
   * - 'and': Both conditions must be true
   * - 'or': Either condition can be true
   *
   * **Note**: The first clause in a query always uses 'and' implicitly.
   *
   * @type {BooleanOperator}
   * @default 'and'
   */
  boolean: BooleanOperator;

  /**
   * Nested where clauses
   *
   * For 'nested' type clauses, contains an array of sub-clauses
   * that are grouped together. This allows creating complex conditional
   * logic with parentheses-like grouping.
   *
   * @type {IWhereClause[]}
   * @optional
   *
   * @example
   * [
   *   { type: 'basic', field: 'category', operator: '=', value: 'A', boolean: 'and' },
   *   { type: 'basic', field: 'category', operator: '=', value: 'B', boolean: 'or' }
   * ]
   * // Translates to: (category = 'A' OR category = 'B')
   */
  nested?: IWhereClause[];
}
