/**
 * Search Document Interface
 *
 * Represents a document to be indexed in the search engine.
 * Documents consist of an ID and any additional data fields.
 *
 * @example
 * ```typescript
 * const document: SearchDocument = {
 *   id: 1,
 *   title: 'My Post',
 *   content: 'Post content...',
 *   tags: ['typescript', 'nestjs'],
 * };
 * ```
 *
 * @author Nesvel
 * @since 1.0.0
 */
export interface SearchDocument {
  /**
   * Unique identifier for the document
   */
  id: string | number;

  /**
   * Document data to be indexed
   * Can contain any additional fields
   */
  [key: string]: any;
}
