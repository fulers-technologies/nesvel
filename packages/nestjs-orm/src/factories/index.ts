/**
 * Factories Module
 *
 * Laravel Eloquent-inspired factory system for NestJS with MikroORM.
 * Provides comprehensive test data generation and database seeding capabilities.
 *
 * @author Nesvel Team
 * @since 1.0.0
 */

// Base factory class for extending
export * from './base.factory';

// Factory manager for coordination
export * from './factory.manager';

// Re-export factory interfaces from interfaces folder for convenience
export type { IFactory, IFactoryState, IFactoryRelationship, IFactoryConfig } from '../interfaces';
