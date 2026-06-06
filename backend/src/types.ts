// Type definitions for the entire application

export interface Env {
  SESSIONS: KVNamespace;
  DB: D1Database;
  API_URL: string;
  CORS_ORIGIN: string;
  SESSION_TIMEOUT: string;
}

export interface D1Result<T = any> {
  success: boolean;
  meta?: {
    duration: number;
    last_row_id?: number;
    changes?: number;
    served_by?: string;
    internal_stats?: string;
  };
  results?: T[];
  error?: string;
}

export interface D1ExecResult {
  success: boolean;
  meta: {
    duration: number;
    changes: number;
    last_row_id: number;
    served_by: string;
    internal_stats: string;
  };
}

export interface DatabaseError {
  code: string;
  message: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, any>;
}

export interface SessionData {
  admin_id?: string;
  admin_logged_in?: boolean;
  cart?: Record<string, number>;
  user_email?: string;
  created_at: number;
  expires_at: number;
}

export interface DatabaseItem {
  id?: string;
  [key: string]: any;
}

// Product/Barang
export interface Barang {
  barang_id: string;
  nama: string;
  harga: number;
  kategori_id: string;
  deskripsi: string;
  stok: number;
  gambar?: string;
  created_at?: string;
  updated_at?: string;
}

// Category/Kategori
export interface Kategori {
  kategori_id: string;
  nama: string;
  deskripsi?: string;
  created_at?: string;
}

// Order/Pesanan
export interface Pesanan {
  id_pesanan: string;
  nama_penerima: string;
  email: string;
  alamat_lengkap: string;
  kota: string;
  provinsi: string;
  kodepos: string;
  whatsapp: string;
  total_bayar: number;
  status_pesanan: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'SELESAI';
  tanggal_order: string;
  ongkir?: number;
  catatan?: string;
  updated_at?: string;
}

// Order Detail/Pesanan Detail
export interface PesananDetail {
  id_detail: string;
  id_pesanan: string;
  barang_id: string;
  jumlah: number;
  harga_satuan: number;
  created_at?: string;
}

// Admin
export interface Admin {
  admin_id: string;
  username: string;
  password_hash: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export type QueryResult<T> = D1Result<T>;

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cart Item for checkout
export interface CartItem extends Barang {
  qty: number;
  subtotal_item: number;
}
