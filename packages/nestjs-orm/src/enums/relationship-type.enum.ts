/**
 * Relationship Type Enum
 *
 * Defines the types of relationships that can exist between entities in the ORM.
 * These relationship types determine how entities are associated and how data
 * is loaded and persisted across related tables.
 *
 * @enum {string}
 * @since 1.0.0
 */
export enum RelationshipType {
  /**
   * One-to-one relationship
   * One entity instance is associated with exactly one instance of another entity
   * Example: User hasOne Profile
   */
  HAS_ONE = 'hasOne',

  /**
   * One-to-many relationship
   * One entity instance is associated with multiple instances of another entity
   * Example: User hasMany Posts
   */
  HAS_MANY = 'hasMany',

  /**
   * Many-to-one relationship (inverse of one-to-many)
   * Multiple entity instances are associated with one instance of another entity
   * Example: Post belongsTo User
   */
  BELONGS_TO = 'belongsTo',

  /**
   * Many-to-many relationship
   * Multiple entity instances are associated with multiple instances of another entity
   * Typically requires a junction/pivot table
   * Example: User manyToMany Roles
   */
  MANY_TO_MANY = 'manyToMany',
}
