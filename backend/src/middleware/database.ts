/**
 * Database Context & Connection Middleware
 * Provides a single database instance per request with error handling
 */

import { Env } from '../types';
import { Database } from './database';

/**
 * Database context holder for the current request
 */
class DatabaseContext {
  private db: Database | null = null;
  private env: Env | null = null;
  private initialized: boolean = false;
  private healthCheckCache: { timestamp: number; healthy: boolean } | null = null;
  private healthCheckCacheTTL = 60000; // 1 minute

  /**
   * Initialize database context for a request
   */
  initialize(env: Env): Database {
    if (!this.initialized || this.env !== env) {
      this.db = new Database(env);
      this.env = env;
      this.initialized = true;
    }
    return this.db!;
  }

  /**
   * Get current database instance
   */
  getInstance(): Database | null {
    return this.db;
  }

  /**
   * Check database health with caching
   */
  async checkHealth(): Promise<boolean> {
    if (!this.db) return false;

    const now = Date.now();
    if (
      this.healthCheckCache &&
      now - this.healthCheckCache.timestamp < this.healthCheckCacheTTL
    ) {
      return this.healthCheckCache.healthy;
    }

    const healthy = await this.db.healthCheck();
    this.healthCheckCache = { timestamp: now, healthy };
    return healthy;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.healthCheckCache = null;
  }

  /**
   * Reset context
   */
  reset(): void {
    this.db = null;
    this.env = null;
    this.initialized = false;
    this.healthCheckCache = null;
  }
}

// Global context instance
export const dbContext = new DatabaseContext();

/**
 * Database middleware - initializes and provides database instance
 */
export async function withDatabase<T>(
  env: Env,
  callback: (db: Database) => Promise<T>
): Promise<T> {
  try {
    const db = dbContext.initialize(env);
    return await callback(db);
  } catch (error) {
    console.error('[Database Middleware Error]', error);
    throw error;
  } finally {
    dbContext.reset();
  }
}

/**
 * Connection pool mock (D1 handles this internally)
 * This provides a consistent interface
 */
export class DatabasePool {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /**
   * Get a database instance
   */
  getInstance(): Database {
    return new Database(this.env);
  }

  /**
   * Execute operation with connection
   */
  async execute<T>(
    operation: (db: Database) => Promise<T>
  ): Promise<T> {
    return withDatabase(this.env, operation);
  }

  /**
   * Health check
   */
  async isHealthy(): Promise<boolean> {
    return dbContext.checkHealth();
  }
}

/**
 * Request-scoped database context
 * Use this in request handlers
 */
export function createDatabaseContext(env: Env) {
  return {
    db: new Database(env),
    async health() {
      return await this.db.healthCheck();
    },
    async close() {
      // D1 handles cleanup automatically
      // This is here for interface consistency
    },
  };
}

/**
 * Database transaction wrapper
 * Note: D1 SQLite supports transactions via multiple statements
 */
export async function withTransaction<T>(
  env: Env,
  callback: (db: Database) => Promise<T>
): Promise<T> {
  const db = new Database(env);
  
  try {
    // Begin transaction would go here for full transaction support
    // For now, D1 provides isolation per statement
    const result = await callback(db);
    return result;
  } catch (error) {
    console.error('[Transaction Error]', error);
    throw error;
  }
}

export default DatabaseContext;
