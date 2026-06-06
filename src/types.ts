// Type definitions for the entire application

export interface Env {
  SESSIONS: KVNamespace;
  DB: D1Database;
  SESSION_SECRET: string;
  ADMIN_HASH_SALT: string;
  API_URL: string;
  CORS_ORIGIN: string;
  SESSION_TIMEOUT: string;
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
}

// Category/Kategori
export interface Kategori {
  kategori_id: string;
  nama: string;
  deskripsi?: string;
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
}

// Order Detail/Pesanan Detail
export interface PesananDetail {
  id_detail: string;
  id_pesanan: string;
  barang_id: string;
  jumlah: number;
  harga_satuan: number;
}

// Admin
export interface Admin {
  admin_id: string;
  username: string;
  password_hash: string;
  email?: string;
  created_at?: string;
}

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
