import 'reflect-metadata';
import {
  DatabaseException,
  ModelNotFoundException,
  QueryException,
  ValidationException,
  RelationNotFoundException,
} from '../../src/exceptions';

describe('ORM Exceptions', () => {
  describe('DatabaseException', () => {
    it('should create database exception with message and connection', () => {
      const error = DatabaseException.make(
        'CONNECTION_FAILED',
        'Connection failed',
        undefined,
        'test_db',
      );
      expect(error).toBeInstanceOf(DatabaseException);
      expect(error.message).toBe('Connection failed');
      expect(error.connectionName).toBe('test_db');
    });

    it('should include original error when provided', () => {
      const originalError = new Error('Original error');
      const error = DatabaseException.make(
        'CONNECTION_FAILED',
        'Wrapper error',
        undefined,
        'default',
        originalError,
      );
      expect(error.originalError).toBe(originalError);
    });
  });

  describe('ModelNotFoundException', () => {
    it('should create model not found exception', () => {
      const error = ModelNotFoundException.make('User', ['user-123']);
      expect(error).toBeInstanceOf(ModelNotFoundException);
      expect(error.model).toBe('User');
      expect(error.ids).toEqual(['user-123']);
    });

    it('should handle custom error messages', () => {
      const error = ModelNotFoundException.make('Post', ['post-456'], undefined, 'Custom message');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('QueryException', () => {
    it('should create query exception with SQL and parameters', () => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      const params = [123];
      const error = QueryException.make('default', sql, params, undefined, 'Query failed');

      expect(error).toBeInstanceOf(QueryException);
      expect(error.sql).toBe(sql);
      expect(error.bindings).toEqual(params);
    });
  });

  describe('ValidationException', () => {
    it('should create validation exception with field details', () => {
      const error = ValidationException.make('email', 'Validation failed', 'User');

      expect(error).toBeInstanceOf(ValidationException);
      expect(error.entity).toBe('User');
      expect(error.hasFieldError('email')).toBe(true);
      expect(error.getFieldError('email')).toBe('Validation failed');
    });
  });

  describe('RelationNotFoundException', () => {
    it('should create relation not found exception with constraint details', () => {
      const error = RelationNotFoundException.make('User', 'posts', 'Relation not found');

      expect(error).toBeInstanceOf(RelationNotFoundException);
      expect(error.model).toBe('User');
      expect(error.relation).toBe('posts');
      expect(error.message).toBe('Relation not found');
    });
  });
});
