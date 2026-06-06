-- Database Schema for Warung RMB
-- This SQL file should be run against Cloudflare D1 or your external database

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

-- Admin Users Table (optional - customize as needed)
CREATE TABLE IF NOT EXISTS admin (
    admin_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori_id);
CREATE INDEX IF NOT EXISTS idx_barang_nama ON barang(nama);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_pesanan_tanggal ON pesanan(tanggal_order);
CREATE INDEX IF NOT EXISTS idx_pesanan_detail_order ON pesanan_detail(id_pesanan);
CREATE INDEX IF NOT EXISTS idx_pesanan_detail_barang ON pesanan_detail(barang_id);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin(username);

-- Sample Data (optional - remove in production)
INSERT OR IGNORE INTO kategori (kategori_id, nama, deskripsi) VALUES 
    ('cat-1', 'Skincare', 'Produk perawatan kulit dari Korea'),
    ('cat-2', 'Kosmetik', 'Makeup dan kosmetik Korea'),
    ('cat-3', 'Snacks', 'Camilan dan makanan dari Korea');

INSERT OR IGNORE INTO barang (barang_id, nama, harga, kategori_id, deskripsi, stok, gambar) VALUES 
    ('barang-1', 'BB Cream Korea', 150000, 'cat-2', 'BB Cream premium dari Korea', 50, NULL),
    ('barang-2', 'Masker Wajah', 75000, 'cat-1', 'Masker wajah Korea populer', 100, NULL),
    ('barang-3', 'Snack Spicy', 45000, 'cat-3', 'Makanan spicy Korea', 75, NULL);
