import { Env, Barang, Kategori, Pesanan, PesananDetail } from '../types';

/**
 * Database abstraction layer for Cloudflare D1 or external MySQL via API
 * This can be adapted to work with:
 * - Cloudflare D1 (native)
 * - Supabase PostgreSQL
 * - PlanetScale MySQL
 * - External MySQL server via HTTP API
 */

export class Database {
  private db: D1Database | null;
  private apiUrl: string | null;

  constructor(env: Env) {
    this.db = env.DB || null;
    this.apiUrl = null; // Set if using external API
  }

  // ============ KATEGORI (Categories) ============

  async getCategories(): Promise<Kategori[]> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM kategori');
      const result = await stmt.all();
      return (result.results || []) as Kategori[];
    }
    return [];
  }

  async getCategoryById(kategoriId: string): Promise<Kategori | null> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM kategori WHERE kategori_id = ?1');
      const result = await stmt.bind(kategoriId).first();
      return result as Kategori | null;
    }
    return null;
  }

  // ============ BARANG (Products) ============

  async getProducts(limit?: number, offset?: number): Promise<Barang[]> {
    let query = 'SELECT * FROM barang';
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    if (offset) {
      query += ` OFFSET ${offset}`;
    }

    if (this.db) {
      const stmt = this.db.prepare(query);
      const result = await stmt.all();
      return (result.results || []) as Barang[];
    }
    return [];
  }

  async getProductById(barangId: string): Promise<Barang | null> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM barang WHERE barang_id = ?1');
      const result = await stmt.bind(barangId).first();
      return result as Barang | null;
    }
    return null;
  }

  async getProductsByCategory(kategoriId: string): Promise<Barang[]> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM barang WHERE kategori_id = ?1');
      const result = await stmt.bind(kategoriId).all();
      return (result.results || []) as Barang[];
    }
    return [];
  }

  async getProductCount(): Promise<number> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM barang');
      const result = await stmt.first();
      return (result?.count as number) || 0;
    }
    return 0;
  }

  async searchProducts(keyword: string): Promise<Barang[]> {
    if (this.db) {
      const stmt = this.db.prepare(
        'SELECT * FROM barang WHERE nama LIKE ?1 OR deskripsi LIKE ?1'
      );
      const searchTerm = `%${keyword}%`;
      const result = await stmt.bind(searchTerm).all();
      return (result.results || []) as Barang[];
    }
    return [];
  }

  async createProduct(barang: Barang): Promise<boolean> {
    if (this.db) {
      const stmt = this.db.prepare(
        `INSERT INTO barang 
        (barang_id, nama, harga, kategori_id, deskripsi, stok, gambar, created_at) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
      );
      
      const result = await stmt.bind(
        barang.barang_id,
        barang.nama,
        barang.harga,
        barang.kategori_id,
        barang.deskripsi || '',
        barang.stok || 0,
        barang.gambar || null,
        new Date().toISOString()
      ).run();

      return result.success || false;
    }
    return false;
  }

  async updateProduct(barangId: string, updates: Partial<Barang>): Promise<boolean> {
    if (this.db) {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = ?${index + 2}`)
        .join(', ');

      const values = Object.values(updates);

      const stmt = this.db.prepare(
        `UPDATE barang SET ${fields} WHERE barang_id = ?1`
      );

      const result = await stmt.bind(barangId, ...values).run();
      return result.success || false;
    }
    return false;
  }

  // ============ PESANAN (Orders) ============

  async createOrder(pesanan: Pesanan): Promise<string> {
    if (this.db) {
      const stmt = this.db.prepare(
        `INSERT INTO pesanan 
        (id_pesanan, nama_penerima, email, alamat_lengkap, kota, provinsi, kodepos, whatsapp, total_bayar, status_pesanan, tanggal_order, ongkir) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
      );

      const result = await stmt.bind(
        pesanan.id_pesanan,
        pesanan.nama_penerima,
        pesanan.email,
        pesanan.alamat_lengkap,
        pesanan.kota,
        pesanan.provinsi,
        pesanan.kodepos,
        pesanan.whatsapp,
        pesanan.total_bayar,
        pesanan.status_pesanan || 'PENDING',
        pesanan.tanggal_order || new Date().toISOString(),
        pesanan.ongkir || 5000
      ).run();

      return result.success ? pesanan.id_pesanan : '';
    }
    return '';
  }

  async getOrderById(orderId: string): Promise<Pesanan | null> {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM pesanan WHERE id_pesanan = ?1');
      const result = await stmt.bind(orderId).first();
      return result as Pesanan | null;
    }
    return null;
  }

  async getOrders(
    search?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Pesanan[]> {
    let query = 'SELECT * FROM pesanan WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ` AND (nama_penerima LIKE ?${params.length + 1} OR id_pesanan LIKE ?${params.length + 2} OR alamat_lengkap LIKE ?${params.length + 3})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY tanggal_order DESC LIMIT ?${params.length + 1} OFFSET ?${params.length + 2}`;
    params.push(limit, offset);

    if (this.db) {
      const stmt = this.db.prepare(query);
      const result = await stmt.bind(...params).all();
      return (result.results || []) as Pesanan[];
    }
    return [];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    if (this.db) {
      const stmt = this.db.prepare(
        'UPDATE pesanan SET status_pesanan = ?1 WHERE id_pesanan = ?2'
      );
      const result = await stmt.bind(status, orderId).run();
      return result.success || false;
    }
    return false;
  }

  async getTotalRevenue(): Promise<number> {
    if (this.db) {
      const stmt = this.db.prepare(
        "SELECT SUM(total_bayar) as total FROM pesanan WHERE status_pesanan = 'SELESAI'"
      );
      const result = await stmt.first();
      return (result?.total as number) || 0;
    }
    return 0;
  }

  // ============ PESANAN_DETAIL (Order Items) ============

  async addOrderDetail(detail: PesananDetail): Promise<boolean> {
    if (this.db) {
      const stmt = this.db.prepare(
        `INSERT INTO pesanan_detail 
        (id_detail, id_pesanan, barang_id, jumlah, harga_satuan) 
        VALUES (?1, ?2, ?3, ?4, ?5)`
      );

      const result = await stmt.bind(
        detail.id_detail,
        detail.id_pesanan,
        detail.barang_id,
        detail.jumlah,
        detail.harga_satuan
      ).run();

      return result.success || false;
    }
    return false;
  }

  async getOrderDetails(orderId: string): Promise<PesananDetail[]> {
    if (this.db) {
      const stmt = this.db.prepare(
        'SELECT * FROM pesanan_detail WHERE id_pesanan = ?1'
      );
      const result = await stmt.bind(orderId).all();
      return (result.results || []) as PesananDetail[];
    }
    return [];
  }

  // ============ HELPER METHODS ============

  async getOrderWithDetails(orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) return null;

    const details = await this.getOrderDetails(orderId);
    
    // Get product details for each order item
    const items = await Promise.all(
      details.map(async (detail) => {
        const product = await this.getProductById(detail.barang_id);
        return {
          ...detail,
          product_name: product?.nama || 'Unknown',
          product_image: product?.gambar,
        };
      })
    );

    return {
      ...order,
      items,
    };
  }
}
