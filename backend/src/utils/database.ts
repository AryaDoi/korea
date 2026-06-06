import { Env, Barang, Kategori, Pesanan, PesananDetail, D1Result, DatabaseError } from '../types';

/**
 * D1 Database Service - Cloudflare SQLite Database
 * Handles all database operations with proper error handling and connection management
 */
export class Database {
  private db: D1Database | null;
  private env: Env;

  constructor(env: Env) {
    this.db = env.DB || null;
    this.env = env;
  }

  /**
   * Private method to handle D1 query errors
   */
  private handleError(error: any, operation: string): DatabaseError {
    const dbError: DatabaseError = {
      code: error?.code || 'DB_ERROR',
      message: error?.message || `Database operation failed: ${operation}`,
      timestamp: new Date().toISOString(),
    };
    console.error(`[Database Error - ${operation}]`, dbError);
    return dbError;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Kategori[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db.prepare('SELECT * FROM kategori ORDER BY nama ASC').all<Kategori>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, 'getCategories');
      return [];
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(kategoriId: string): Promise<Kategori | null> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM kategori WHERE kategori_id = ?1')
        .bind(kategoriId)
        .first<Kategori>();
      return result || null;
    } catch (error) {
      this.handleError(error, `getCategoryById: ${kategoriId}`);
      return null;
    }
  }

  /**
   * Get all products with pagination
   */
  async getProducts(limit: number = 20, offset: number = 0): Promise<Barang[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM barang ORDER BY created_at DESC LIMIT ?1 OFFSET ?2')
        .bind(limit, offset)
        .all<Barang>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `getProducts: limit=${limit}, offset=${offset}`);
      return [];
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(barangId: string): Promise<Barang | null> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM barang WHERE barang_id = ?1')
        .bind(barangId)
        .first<Barang>();
      return result || null;
    } catch (error) {
      this.handleError(error, `getProductById: ${barangId}`);
      return null;
    }
  }

  /**
   * Get products by category with pagination
   */
  async getProductsByCategory(kategoriId: string, limit: number = 20, offset: number = 0): Promise<Barang[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM barang WHERE kategori_id = ?1 ORDER BY created_at DESC LIMIT ?2 OFFSET ?3')
        .bind(kategoriId, limit, offset)
        .all<Barang>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `getProductsByCategory: ${kategoriId}`);
      return [];
    }
  }

  /**
   * Get total product count
   */
  async getProductCount(): Promise<number> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT COUNT(*) as count FROM barang')
        .first<{ count: number }>();
      return result?.count || 0;
    } catch (error) {
      this.handleError(error, 'getProductCount');
      return 0;
    }
  }

  /**
   * Get product count by category
   */
  async getProductCountByCategory(kategoriId: string): Promise<number> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT COUNT(*) as count FROM barang WHERE kategori_id = ?1')
        .bind(kategoriId)
        .first<{ count: number }>();
      return result?.count || 0;
    } catch (error) {
      this.handleError(error, `getProductCountByCategory: ${kategoriId}`);
      return 0;
    }
  }

  /**
   * Search products by keyword
   */
  async searchProducts(keyword: string, limit: number = 50): Promise<Barang[]> {
    try {
      if (!this.db || !keyword.trim()) throw new Error('Invalid search parameters');
      const searchTerm = `%${keyword}%`;
      const result = await this.db
        .prepare('SELECT * FROM barang WHERE nama LIKE ?1 OR deskripsi LIKE ?1 ORDER BY nama ASC LIMIT ?2')
        .bind(searchTerm, limit)
        .all<Barang>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `searchProducts: ${keyword}`);
      return [];
    }
  }

  /**
   * Create a new order
   */
  async createOrder(pesanan: Pesanan): Promise<string> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare(`INSERT INTO pesanan 
          (id_pesanan, nama_penerima, email, alamat_lengkap, kota, provinsi, kodepos, whatsapp, total_bayar, status_pesanan, tanggal_order, ongkir) 
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`)
        .bind(
          pesanan.id_pesanan,
          pesanan.nama_penerima,
          pesanan.email,
          pesanan.alamat_lengkap,
          pesanan.kota,
          pesanan.provinsi,
          pesanan.kodepos || '',
          pesanan.whatsapp || '',
          pesanan.total_bayar,
          pesanan.status_pesanan || 'PENDING',
          pesanan.tanggal_order || new Date().toISOString(),
          pesanan.ongkir || 5000
        )
        .run();
      return result.success ? pesanan.id_pesanan : '';
    } catch (error) {
      this.handleError(error, `createOrder: ${pesanan.id_pesanan}`);
      return '';
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Pesanan | null> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM pesanan WHERE id_pesanan = ?1')
        .bind(orderId)
        .first<Pesanan>();
      return result || null;
    } catch (error) {
      this.handleError(error, `getOrderById: ${orderId}`);
      return null;
    }
  }

  /**
   * Get all orders with optional search and pagination
   */
  async getOrders(search?: string, limit: number = 10, offset: number = 0): Promise<Pesanan[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      let query = 'SELECT * FROM pesanan WHERE 1=1';
      const params: any[] = [];

      if (search && search.trim()) {
        query += ` AND (nama_penerima LIKE ?${params.length + 1} OR id_pesanan LIKE ?${params.length + 2})`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ` ORDER BY tanggal_order DESC LIMIT ?${params.length + 1} OFFSET ?${params.length + 2}`;
      params.push(limit, offset);

      const result = await this.db.prepare(query).bind(...params).all<Pesanan>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `getOrders: search=${search}`);
      return [];
    }
  }

  /**
   * Get total orders count
   */
  async getOrdersCount(search?: string): Promise<number> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      let query = 'SELECT COUNT(*) as count FROM pesanan WHERE 1=1';
      const params: any[] = [];

      if (search && search.trim()) {
        query += ` AND (nama_penerima LIKE ?${params.length + 1} OR id_pesanan LIKE ?${params.length + 2})`;
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const result = await this.db.prepare(query).bind(...params).first<{ count: number }>();
      return result?.count || 0;
    } catch (error) {
      this.handleError(error, `getOrdersCount: search=${search}`);
      return 0;
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string, limit: number = 10, offset: number = 0): Promise<Pesanan[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM pesanan WHERE status_pesanan = ?1 ORDER BY tanggal_order DESC LIMIT ?2 OFFSET ?3')
        .bind(status, limit, offset)
        .all<Pesanan>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `getOrdersByStatus: ${status}`);
      return [];
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('UPDATE pesanan SET status_pesanan = ?1, updated_at = ?2 WHERE id_pesanan = ?3')
        .bind(status, new Date().toISOString(), orderId)
        .run();
      return result.success || false;
    } catch (error) {
      this.handleError(error, `updateOrderStatus: ${orderId} -> ${status}`);
      return false;
    }
  }

  /**
   * Add order note/comment
   */
  async updateOrderNote(orderId: string, catatan: string): Promise<boolean> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('UPDATE pesanan SET catatan = ?1, updated_at = ?2 WHERE id_pesanan = ?3')
        .bind(catatan, new Date().toISOString(), orderId)
        .run();
      return result.success || false;
    } catch (error) {
      this.handleError(error, `updateOrderNote: ${orderId}`);
      return false;
    }
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue(): Promise<number> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare("SELECT SUM(total_bayar) as total FROM pesanan WHERE status_pesanan = 'SELESAI'")
        .first<{ total: number | null }>();
      return result?.total || 0;
    } catch (error) {
      this.handleError(error, 'getTotalRevenue');
      return 0;
    }
  }

  /**
   * Get revenue by date range
   */
  async getRevenueByDateRange(startDate: string, endDate: string): Promise<number> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare(
          "SELECT SUM(total_bayar) as total FROM pesanan WHERE status_pesanan = 'SELESAI' AND tanggal_order BETWEEN ?1 AND ?2"
        )
        .bind(startDate, endDate)
        .first<{ total: number | null }>();
      return result?.total || 0;
    } catch (error) {
      this.handleError(error, `getRevenueByDateRange: ${startDate} - ${endDate}`);
      return 0;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    completed: number;
  }> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status_pesanan = 'PENDING' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status_pesanan = 'PROCESSING' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status_pesanan = 'SHIPPED' THEN 1 ELSE 0 END) as shipped,
            SUM(CASE WHEN status_pesanan = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN status_pesanan = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status_pesanan = 'SELESAI' THEN 1 ELSE 0 END) as completed
          FROM pesanan
        `)
        .first<{
          total: number;
          pending: number;
          processing: number;
          shipped: number;
          delivered: number;
          cancelled: number;
          completed: number;
        }>();

      return {
        total: result?.total || 0,
        pending: result?.pending || 0,
        processing: result?.processing || 0,
        shipped: result?.shipped || 0,
        delivered: result?.delivered || 0,
        cancelled: result?.cancelled || 0,
        completed: result?.completed || 0,
      };
    } catch (error) {
      this.handleError(error, 'getOrderStats');
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        completed: 0,
      };
    }
  }

  /**
   * Add order detail
   */
  async addOrderDetail(detail: PesananDetail): Promise<boolean> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare(
          'INSERT INTO pesanan_detail (id_detail, id_pesanan, barang_id, jumlah, harga_satuan) VALUES (?1, ?2, ?3, ?4, ?5)'
        )
        .bind(detail.id_detail, detail.id_pesanan, detail.barang_id, detail.jumlah, detail.harga_satuan)
        .run();
      return result.success || false;
    } catch (error) {
      this.handleError(error, `addOrderDetail: ${detail.id_detail}`);
      return false;
    }
  }

  /**
   * Get order details
   */
  async getOrderDetails(orderId: string): Promise<PesananDetail[]> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('SELECT * FROM pesanan_detail WHERE id_pesanan = ?1 ORDER BY created_at ASC')
        .bind(orderId)
        .all<PesananDetail>();
      return result.results || [];
    } catch (error) {
      this.handleError(error, `getOrderDetails: ${orderId}`);
      return [];
    }
  }

  /**
   * Delete order detail
   */
  async deleteOrderDetail(detailId: string): Promise<boolean> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db
        .prepare('DELETE FROM pesanan_detail WHERE id_detail = ?1')
        .bind(detailId)
        .run();
      return result.success || false;
    } catch (error) {
      this.handleError(error, `deleteOrderDetail: ${detailId}`);
      return false;
    }
  }

  /**
   * Get order with all details and product info
   */
  async getOrderWithDetails(orderId: string) {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) return null;

      const details = await this.getOrderDetails(orderId);
      const items = await Promise.all(
        details.map(async (detail) => {
          const product = await this.getProductById(detail.barang_id);
          return {
            ...detail,
            product_name: product?.nama || 'Unknown',
            product_image: product?.gambar,
            product_deskripsi: product?.deskripsi,
          };
        })
      );

      return { ...order, items };
    } catch (error) {
      this.handleError(error, `getOrderWithDetails: ${orderId}`);
      return null;
    }
  }

  /**
   * Check database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) throw new Error('Database not initialized');
      const result = await this.db.prepare('SELECT 1').first();
      return result !== null;
    } catch (error) {
      this.handleError(error, 'healthCheck');
      return false;
    }
  }
}
