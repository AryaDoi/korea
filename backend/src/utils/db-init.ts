/**
 * D1 Database Initialization and Migration Script
 * Runs initialization queries and sets up the database schema
 */

import { Env } from '../types';

const SCHEMA_SQL = `
-- Database Schema for Warung RMB
-- SQLite3 for Cloudflare D1

-- Categories Table
CREATE TABLE IF NOT EXISTS kategori (
    kategori_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS barang (
    barang_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    harga INTEGER NOT NULL,
    kategori_id TEXT NOT NULL,
    deskripsi TEXT,
    stok INTEGER DEFAULT 0,
    gambar TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori(kategori_id)
);

-- Orders Table
CREATE TABLE IF NOT EXISTS pesanan (
    id_pesanan TEXT PRIMARY KEY,
    nama_penerima TEXT NOT NULL,
    email TEXT NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    kota TEXT NOT NULL,
    provinsi TEXT NOT NULL,
    kodepos TEXT,
    whatsapp TEXT NOT NULL,
    total_bayar INTEGER NOT NULL,
    status_pesanan TEXT DEFAULT 'PENDING',
    ongkir INTEGER DEFAULT 5000,
    tanggal_order TEXT DEFAULT CURRENT_TIMESTAMP,
    catatan TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Order Details Table
CREATE TABLE IF NOT EXISTS pesanan_detail (
    id_detail TEXT PRIMARY KEY,
    id_pesanan TEXT NOT NULL,
    barang_id TEXT NOT NULL,
    jumlah INTEGER NOT NULL,
    harga_satuan INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan) ON DELETE CASCADE,
    FOREIGN KEY (barang_id) REFERENCES barang(barang_id)
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin (
    admin_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance Optimization
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori_id);
CREATE INDEX IF NOT EXISTS idx_barang_nama ON barang(nama);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_pesanan_tanggal ON pesanan(tanggal_order);
CREATE INDEX IF NOT EXISTS idx_pesanan_email ON pesanan(email);
CREATE INDEX IF NOT EXISTS idx_pesanan_detail_order ON pesanan_detail(id_pesanan);
CREATE INDEX IF NOT EXISTS idx_pesanan_detail_barang ON pesanan_detail(barang_id);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin(username);
`;

/**
 * Initialize D1 database schema
 * Call this once during setup
 */
export async function initializeDatabase(env: Env): Promise<{
  success: boolean;
  message: string;
  errors?: string[];
}> {
  try {
    if (!env.DB) {
      return {
        success: false,
        message: 'Database binding not found',
        errors: ['DB binding not configured in environment'],
      };
    }

    // Split schema into individual statements
    const statements = SCHEMA_SQL.split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    const errors: string[] = [];

    for (const statement of statements) {
      try {
        await env.DB.prepare(statement).run();
      } catch (error: any) {
        // Ignore errors for CREATE TABLE IF NOT EXISTS
        if (!statement.includes('CREATE') && !statement.includes('CREATE INDEX')) {
          errors.push(`Failed to execute: ${statement.substring(0, 50)}... - ${error.message}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      message: `Database initialized: ${statements.length} statements executed`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Database initialization failed',
      errors: [error.message],
    };
  }
}

/**
 * Insert seed/demo data
 */
export async function seedDatabase(env: Env): Promise<{
  success: boolean;
  message: string;
  errors?: string[];
}> {
  try {
    if (!env.DB) {
      return {
        success: false,
        message: 'Database binding not found',
        errors: ['DB binding not configured in environment'],
      };
    }

    const errors: string[] = [];

    // Insert categories
    const categories = [
      { id: 'cat-1', nama: 'Skincare', desc: 'Produk perawatan kulit dari Korea' },
      { id: 'cat-2', nama: 'Kosmetik', desc: 'Makeup dan kosmetik Korea' },
      { id: 'cat-3', nama: 'Snacks', desc: 'Camilan dan makanan dari Korea' },
    ];

    for (const cat of categories) {
      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO kategori (kategori_id, nama, deskripsi) VALUES (?1, ?2, ?3)'
        )
          .bind(cat.id, cat.nama, cat.desc)
          .run();
      } catch (error: any) {
        errors.push(`Failed to insert category ${cat.nama}: ${error.message}`);
      }
    }

    // Insert sample products
    const products = [
      {
        id: 'barang-1',
        nama: 'BB Cream Korea',
        harga: 150000,
        kategori: 'cat-2',
        desc: 'BB Cream premium dari Korea dengan SPF 50+',
        stok: 50,
      },
      {
        id: 'barang-2',
        nama: 'Masker Wajah Pencerah',
        harga: 75000,
        kategori: 'cat-1',
        desc: 'Masker wajah Korea dengan kandungan vitamin C',
        stok: 100,
      },
      {
        id: 'barang-3',
        nama: 'Snack Spicy Korea',
        harga: 45000,
        kategori: 'cat-3',
        desc: 'Makanan spicy Korea populer',
        stok: 75,
      },
      {
        id: 'barang-4',
        nama: 'Toner Essence',
        harga: 95000,
        kategori: 'cat-1',
        desc: 'Toner essence Korea untuk kulit sensitif',
        stok: 60,
      },
      {
        id: 'barang-5',
        nama: 'Lipstick Matte',
        harga: 120000,
        kategori: 'cat-2',
        desc: 'Lipstick matte Korea tahan lama',
        stok: 40,
      },
    ];

    for (const prod of products) {
      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO barang (barang_id, nama, harga, kategori_id, deskripsi, stok) VALUES (?1, ?2, ?3, ?4, ?5, ?6)'
        )
          .bind(prod.id, prod.nama, prod.harga, prod.kategori, prod.desc, prod.stok)
          .run();
      } catch (error: any) {
        errors.push(`Failed to insert product ${prod.nama}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      message: `Seed data inserted: ${categories.length} categories and ${products.length} products`,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Seed data insertion failed',
      errors: [error.message],
    };
  }
}

/**
 * Reset database (delete all data and recreate schema)
 * Use with caution!
 */
export async function resetDatabase(env: Env): Promise<{
  success: boolean;
  message: string;
  errors?: string[];
}> {
  try {
    if (!env.DB) {
      return {
        success: false,
        message: 'Database binding not found',
        errors: ['DB binding not configured in environment'],
      };
    }

    const tables = ['pesanan_detail', 'pesanan', 'barang', 'kategori', 'admin'];
    const errors: string[] = [];

    // Drop tables in reverse order of creation (due to foreign keys)
    for (const table of tables) {
      try {
        await env.DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
      } catch (error: any) {
        errors.push(`Failed to drop table ${table}: ${error.message}`);
      }
    }

    // Reinitialize schema
    const initResult = await initializeDatabase(env);
    if (!initResult.success) {
      return {
        success: false,
        message: 'Failed to reinitialize schema after reset',
        errors: initResult.errors,
      };
    }

    return {
      success: true,
      message: 'Database reset complete: tables dropped and schema reinitialized',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Database reset failed',
      errors: [error.message],
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(env: Env): Promise<{
  success: boolean;
  stats?: {
    categories: number;
    products: number;
    orders: number;
    order_details: number;
    admins: number;
  };
  errors?: string[];
}> {
  try {
    if (!env.DB) {
      return {
        success: false,
        errors: ['DB binding not configured'],
      };
    }

    const tables = ['kategori', 'barang', 'pesanan', 'pesanan_detail', 'admin'];
    const stats: Record<string, number> = {};
    const errors: string[] = [];

    for (const table of tables) {
      try {
        const result = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first<{
          count: number;
        }>();
        const key = {
          kategori: 'categories',
          barang: 'products',
          pesanan: 'orders',
          pesanan_detail: 'order_details',
          admin: 'admins',
        }[table] as keyof typeof stats;
        stats[key] = result?.count || 0;
      } catch (error: any) {
        errors.push(`Failed to count ${table}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      stats: stats as any,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.message],
    };
  }
}
