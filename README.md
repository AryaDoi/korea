# Warung RMB - Cloudflare Pages + Workers Refactor

This is a comprehensive refactor of the Warung RMB e-commerce platform to use **Cloudflare Pages** (frontend) and **Cloudflare Workers** (backend).

## Architecture Overview

### Frontend - Cloudflare Pages
- Static HTML/CSS/JavaScript site
- Served globally with Cloudflare's edge network
- Client-side cart management (localStorage)
- API calls to Workers backend

### Backend - Cloudflare Workers
- Serverless compute on Cloudflare's edge
- REST API endpoints for all operations
- Session management with Cloudflare KV
- D1 Database integration (or external database)

## Project Structure

```
korea/
├── public/                    # Cloudflare Pages root
│   ├── index.html
│   ├── katalog.html
│   ├── keranjang.html
│   ├── checkout.html
│   ├── success.html
│   ├── admin/
│   │   ├── login.html
│   │   ├── index.html
│   │   └── orders.html
│   ├── css/                   # Existing CSS files
│   ├── js/
│   │   ├── api.js            # API client library
│   │   ├── index.js          # Home page logic
│   │   ├── katalog.js        # Catalog logic
│   │   ├── keranjang.js      # Cart logic
│   │   ├── checkout.js       # Checkout logic
│   │   └── edit_admin.js     # Admin dashboard logic
│   └── images/               # Product images
│
├── src/                       # Cloudflare Workers source
│   ├── index.ts              # Main worker entry point
│   ├── types.ts              # TypeScript type definitions
│   ├── api/
│   │   ├── products.ts       # Product endpoints
│   │   ├── checkout.ts       # Cart & checkout endpoints
│   │   ├── orders.ts         # Order endpoints
│   │   └── admin.ts          # Admin authentication
│   ├── utils/
│   │   ├── database.ts       # Database abstraction layer
│   │   ├── session.ts        # Session management
│   │   ├── auth.ts           # Authentication utilities
│   │   └── helpers.ts        # General utilities
│   └── middleware/
│       └── auth.ts           # Authentication middleware
│
├── wrangler.toml             # Cloudflare Workers config
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Cloudflare account
- Domain (optional, can use .workers.dev)

### 1. Local Development Setup

```bash
# Navigate to project directory
cd korea

# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database (optional, if using Cloudflare D1)
wrangler d1 create warung-rmb

# Create KV namespace for sessions
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview

# Update wrangler.toml with:
# - account_id
# - KV namespace IDs
# - D1 database ID (if using D1)
```

### 2. Environment Configuration

Edit `wrangler.toml`:

```toml
account_id = "your-account-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-id"

[[d1_databases]]
binding = "DB"
database_id = "your-d1-database-id"
```

Set secrets:
```bash
wrangler secret put SESSION_SECRET
wrangler secret put ADMIN_HASH_SALT
```

### 3. Database Setup

#### Option A: Cloudflare D1 (Recommended)
```bash
# Create database
wrangler d1 create warung-rmb

# Run migrations
wrangler d1 execute warung-rmb --file=schema.sql

# See Database Schema section below
```

#### Option B: External MySQL (PlanetScale, DigitalOcean, etc.)

Update `src/utils/database.ts` to use your external database connection.

### 4. Local Development

```bash
# Start Workers locally
wrangler dev

# In another terminal, serve Pages locally
wrangler pages dev ./public

# Frontend available at: http://localhost:5173
# API available at: http://localhost:8787
```

### 5. Deployment

```bash
# Deploy Workers
npm run deploy

# Deploy Pages
npm run pages:deploy

# Or use wrangler directly
wrangler deploy
wrangler pages deploy ./public
```

## Database Schema

Create `schema.sql`:

```sql
-- Categories
CREATE TABLE IF NOT EXISTS kategori (
    kategori_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    deskripsi TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS barang (
    barang_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    harga INTEGER NOT NULL,
    kategori_id TEXT NOT NULL,
    deskripsi TEXT,
    stok INTEGER DEFAULT 0,
    gambar TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kategori_id) REFERENCES kategori(kategori_id)
);

-- Orders
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
    catatan TEXT
);

-- Order Items
CREATE TABLE IF NOT EXISTS pesanan_detail (
    id_detail TEXT PRIMARY KEY,
    id_pesanan TEXT NOT NULL,
    barang_id TEXT NOT NULL,
    jumlah INTEGER NOT NULL,
    harga_satuan INTEGER NOT NULL,
    FOREIGN KEY (id_pesanan) REFERENCES pesanan(id_pesanan),
    FOREIGN KEY (barang_id) REFERENCES barang(barang_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_barang_kategori ON barang(kategori_id);
CREATE INDEX IF NOT EXISTS idx_pesanan_status ON pesanan(status_pesanan);
CREATE INDEX IF NOT EXISTS idx_pesanan_detail_order ON pesanan_detail(id_pesanan);
```

## API Endpoints

### Products
- `GET /api/categories` - List all categories
- `GET /api/categories/{id}` - Get category by ID
- `GET /api/products` - List products (paginated)
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products?category={id}` - Get products by category
- `GET /api/products/search?q={query}` - Search products

### Cart & Checkout
- `GET /api/checkout` - Get current cart
- `POST /api/checkout` - Process checkout
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart` - Remove item from cart

### Orders
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/stats` - Get order statistics

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/check` - Check authentication status

## Frontend Features

### User Experience
- Product catalog with categories
- Search functionality
- Shopping cart (stored in localStorage)
- Checkout form with address fields
- Order confirmation page
- Responsive design

### Admin Dashboard
- Login authentication
- Order management with status updates
- Order search
- Revenue statistics
- Order details view

## Migration from PHP

### Key Changes

1. **Session Management**
   - Old: PHP `$_SESSION`
   - New: Cloudflare KV + cookies

2. **Database Queries**
   - Old: Direct mysqli queries
   - New: Database abstraction layer (D1 or external API)

3. **Form Processing**
   - Old: PHP POST handling
   - New: JavaScript fetch to API endpoints

4. **Cart Management**
   - Old: Session-based
   - New: localStorage + API sync

## Configuration

### Environment Variables

Set in `wrangler.toml` or via `wrangler secret put`:

```
API_URL=https://api.warung-rmb.com
CORS_ORIGIN=https://warung-rmb.com
SESSION_TIMEOUT=3600
SESSION_SECRET=your-secret-key
ADMIN_HASH_SALT=your-salt
```

### CORS Configuration

Update in `wrangler.toml`:
```toml
[env.production.vars]
CORS_ORIGIN = "https://your-domain.com"
```

## Performance Optimizations

1. **Edge Caching**
   - Pages cached at Cloudflare edge
   - API responses cached where appropriate

2. **Database**
   - Use D1 for best latency (colocated with Workers)
   - Or use PlanetScale MySQL (global distribution)

3. **Images**
   - Serve from Cloudflare CDN
   - Use WebP with fallbacks
   - Implement lazy loading

## Security Best Practices

1. **Authentication**
   - Use stronger password hashing (bcrypt/argon2)
   - Implement CSRF protection
   - Use HTTPS only

2. **Data Protection**
   - Validate all inputs
   - SQL injection prevention (parameterized queries)
   - Store sensitive data in secrets

3. **CORS**
   - Restrict origin to your domain
   - Use credentials carefully

## Troubleshooting

### API Not Responding
```bash
# Check worker status
wrangler tail

# Local development
wrangler dev --local
```

### Database Connection Issues
```bash
# Test D1 connection
wrangler d1 list

# For external DB, check connection string in code
```

### Session Problems
```bash
# Check KV namespaces
wrangler kv:namespace list

# View KV contents
wrangler kv:key list --namespace-id=YOUR_ID
```

## Deployment Checklist

- [ ] Update `wrangler.toml` with account details
- [ ] Set all required secrets
- [ ] Configure database
- [ ] Test locally: `wrangler dev`
- [ ] Test Pages locally: `wrangler pages dev ./public`
- [ ] Deploy Workers: `wrangler deploy`
- [ ] Deploy Pages: `wrangler pages deploy ./public`
- [ ] Test production endpoints
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and logging

## Next Steps

1. **Migrate Database**
   - Export existing MySQL data
   - Import into D1 or new database

2. **Add Features**
   - Payment gateway integration
   - Email notifications
   - Admin product management
   - Analytics

3. **Optimization**
   - Image optimization
   - Add caching headers
   - Implement service worker for offline support

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Analytics (Cloudflare Analytics)
   - Performance monitoring

## Support

For issues or questions:
1. Check Cloudflare Workers documentation: https://developers.cloudflare.com/workers/
2. Check Cloudflare Pages documentation: https://developers.cloudflare.com/pages/
3. Review error logs: `wrangler tail`

## License

All rights reserved - Warung RMB
