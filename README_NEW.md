# Warung RMB - Cloudflare Serverless E-commerce Platform

**Warung RMB** is a modern e-commerce platform for Korean items (Jastip Korea) that's been refactored from traditional PHP/MySQL to serverless architecture on Cloudflare.

## 🎯 Project Overview

### Transformation
- **From**: Apache + PHP 5.6 + MySQL on XAMPP
- **To**: Cloudflare Pages (Frontend) + Cloudflare Workers (Backend) + D1 Database

### Technology Stack

**Frontend (Cloudflare Pages)**
- HTML5 + CSS3 + Vanilla JavaScript
- No build tools required for basic deployment
- Global CDN with 200+ edge locations
- Automatic HTTPS and HTTP/2

**Backend (Cloudflare Workers)**
- TypeScript 5.0+
- Hono.js routing (optional, can use itty-router)
- Cloudflare KV for session storage
- Cloudflare D1 for database
- Sub-millisecond edge execution globally

**Features**
- ✨ Product catalog with categories and search
- 🛒 Shopping cart with localStorage + KV session backup
- 💳 Checkout and order management
- 👨‍💼 Admin dashboard for order tracking
- 🔐 Session-based authentication
- 📦 Order status management

---

## 📁 Project Structure

```
korea/
├── frontend/                      # Cloudflare Pages
│   ├── src/
│   │   ├── index.html             # Home page
│   │   ├── katalog.html           # Product catalog
│   │   ├── keranjang.html         # Shopping cart
│   │   ├── checkout.html          # Checkout form
│   │   ├── success.html           # Order confirmation
│   │   ├── admin/
│   │   │   ├── login.html         # Admin login
│   │   │   ├── index.html         # Admin dashboard
│   │   │   └── orders.html        # Order management
│   │   ├── css/                   # Stylesheets
│   │   │   ├── index.css
│   │   │   ├── katalog.css
│   │   │   ├── keranjang.css
│   │   │   ├── checkout.css
│   │   │   ├── sucsess.css
│   │   │   ├── login_admin.css
│   │   │   ├── index_admin.css
│   │   │   └── edit_admin.css
│   │   ├── js/                    # Frontend logic
│   │   │   ├── api.js             # API client
│   │   │   ├── index.js           # Homepage
│   │   │   ├── katalog.js         # Catalog page
│   │   │   ├── keranjang.js       # Cart page
│   │   │   ├── checkout.js        # Checkout logic
│   │   │   └── edit_admin.js      # Admin page logic
│   │   └── images/                # Product images (placeholder)
│   ├── package.json
│   ├── wrangler.toml
│   └── .gitignore
│
├── backend/                       # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts               # Main router
│   │   ├── types.ts               # TypeScript types
│   │   ├── utils/
│   │   │   ├── database.ts        # D1 database wrapper
│   │   │   ├── session.ts         # KV session manager
│   │   │   ├── helpers.ts         # Utility functions
│   │   │   └── auth.ts            # JWT & password utils
│   │   ├── middleware/
│   │   │   └── auth.ts            # Auth middleware
│   │   └── api/
│   │       ├── products.ts        # Products & categories
│   │       ├── checkout.ts        # Cart & checkout
│   │       ├── orders.ts          # Order management
│   │       └── admin.ts           # Admin endpoints
│   ├── package.json
│   ├── wrangler.toml
│   ├── tsconfig.json
│   └── .gitignore
│
├── schema.sql                     # Database schema
├── README.md                      # This file
├── DEPLOYMENT.md                  # Deployment guide
├── MIGRATION_GUIDE.md             # Migration from PHP
├── QUICK_START.md                 # 5-minute setup
├── REFACTORING_SUMMARY.md         # Architecture decisions
├── deploy.sh                      # Deployment script (Unix/Linux/Mac)
└── deploy.bat                     # Deployment script (Windows)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare Account (free tier OK)
- Wrangler CLI: `npm install -g @cloudflare/wrangler`

### Local Development (5 minutes)

**Terminal 1 - Backend:**
```bash
cd korea/backend
npm install
npm run dev
# Runs on http://localhost:8787
```

**Terminal 2 - Frontend:**
```bash
cd korea/frontend
npm install
npm run dev
# Runs on http://localhost:5173 or http://localhost:3000
```

**Access:**
- Frontend: http://localhost:5173
- API: http://localhost:8787
- Admin: http://localhost:5173/admin/login.html

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

---

## 📖 API Documentation

### Base URL
- **Development**: `http://localhost:8787`
- **Production**: `https://api.warung-rmb.com`

### Endpoints

#### Products
```
GET    /api/categories              # Get all categories
GET    /api/categories/{id}         # Get category by ID
GET    /api/products                # List products (paginated)
GET    /api/products/{id}           # Get product details
GET    /api/products?category={id}  # Filter by category
GET    /api/products/search?q={query}  # Search products
```

#### Shopping Cart
```
GET    /api/checkout                # Get cart contents
POST   /api/cart                    # Add to cart
DELETE /api/cart                    # Remove from cart
POST   /api/checkout                # Process checkout
```

#### Orders
```
GET    /api/orders                  # List orders (admin)
GET    /api/orders/{id}             # Get order details
PUT    /api/orders/{id}/status      # Update order status
GET    /api/orders/stats            # Get statistics (admin)
```

#### Admin
```
POST   /api/admin/login             # Admin login
POST   /api/admin/logout            # Admin logout
GET    /api/admin/check             # Verify authentication
```

### Example Requests

**Get Products:**
```bash
curl http://localhost:8787/api/products?page=1&limit=20
```

**Add to Cart:**
```bash
curl -X POST http://localhost:8787/api/cart \
  -H "Content-Type: application/json" \
  -d '{"barang_id": "1", "qty": 2}'
```

**Admin Login:**
```bash
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

---

## 🗄️ Database Schema

### Tables

**kategori** - Product categories
```sql
CREATE TABLE kategori (
  kategori_id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT
);
```

**barang** - Products
```sql
CREATE TABLE barang (
  barang_id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  harga REAL NOT NULL,
  kategori_id TEXT,
  deskripsi TEXT,
  stok INTEGER,
  gambar TEXT,
  FOREIGN KEY(kategori_id) REFERENCES kategori(kategori_id)
);
```

**pesanan** - Orders
```sql
CREATE TABLE pesanan (
  id_pesanan TEXT PRIMARY KEY,
  nama_penerima TEXT NOT NULL,
  email TEXT NOT NULL,
  alamat_lengkap TEXT,
  kota TEXT,
  provinsi TEXT,
  kodepos TEXT,
  whatsapp TEXT,
  total_bayar REAL,
  status_pesanan TEXT,
  tanggal_order TEXT,
  ongkir REAL
);
```

**pesanan_detail** - Order items
```sql
CREATE TABLE pesanan_detail (
  id_detail TEXT PRIMARY KEY,
  id_pesanan TEXT,
  barang_id TEXT,
  jumlah INTEGER,
  harga_satuan REAL,
  FOREIGN KEY(id_pesanan) REFERENCES pesanan(id_pesanan),
  FOREIGN KEY(barang_id) REFERENCES barang(barang_id)
);
```

**admin** - Admin users
```sql
CREATE TABLE admin (
  admin_id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  email TEXT
);
```

---

## 🔐 Environment Variables

### Backend (wrangler.toml)

```toml
[vars]
API_URL = "https://api.warung-rmb.com"           # API base URL
CORS_ORIGIN = "https://warung-rmb.com"           # Allowed origins
SESSION_TIMEOUT = "86400"                        # Session TTL (seconds)
ADMIN_HASH_SALT = "your_secret_salt"             # Password salt
SESSION_SECRET = "your_session_secret"           # Session encryption
```

### KV Namespaces
- **SESSIONS**: Stores user sessions with auto-expiration

### D1 Database
- **warung-rmb**: Main application database

---

## 🚀 Deployment to Cloudflare

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy

```bash
# One-command deployment (Windows)
./deploy.bat

# One-command deployment (Mac/Linux)
./deploy.sh
```

Or manual deployment:

```bash
# Deploy backend
cd korea/backend
npm run deploy

# Deploy frontend
cd korea/frontend
npm run deploy
```

**After Deployment:**
- Frontend: https://warung-rmb.com
- Backend API: https://api.warung-rmb.com
- Admin Panel: https://warung-rmb.com/admin/login.html

---

## 🔄 Migration from PHP

For developers migrating from the original PHP version, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

### Key Changes
- PHP endpoints → TypeScript API endpoints
- MySQL queries → D1 SQL queries
- PHP sessions → Cloudflare KV storage
- Server-side rendering → Static HTML + JavaScript
- File uploads → Cloudflare R2 (for future enhancement)

---

## ⚙️ Configuration

### Changing Admin Credentials

Edit `/backend/src/api/admin.ts`:

```typescript
const ADMIN_USERS = {
  admin1: {
    username: 'your_username',
    password_hash: hashPassword('your_password', 'salt'),
    email: 'your_email@example.com',
  },
};
```

### Changing Session Timeout

Edit `/backend/wrangler.toml`:

```toml
[vars]
SESSION_TIMEOUT = "604800"  # 7 days in seconds
```

### Custom CORS Origins

Edit `/backend/wrangler.toml`:

```toml
[vars]
CORS_ORIGIN = "https://custom-domain.com,https://other-domain.com"
```

---

## 📊 Monitoring & Debugging

### View Backend Logs

```bash
wrangler tail
```

### View Database Logs

```bash
wrangler d1 execute warung-rmb "SELECT * FROM pesanan LIMIT 10;"
```

### Monitor KV Usage

```bash
wrangler kv:key list --binding SESSIONS
```

---

## 🛠️ Troubleshooting

### Issue: Sessions not persisting
- Check KV namespace is created and ID is in wrangler.toml
- Verify SESSIONS binding exists

### Issue: API CORS errors
- Ensure CORS_ORIGIN in wrangler.toml matches your domain
- Check browser console for exact origin mismatch

### Issue: Database not connecting
- Verify D1 database_id in wrangler.toml
- Check database migrations have been applied: `wrangler d1 execute warung-rmb --file=../schema.sql`

### Issue: Products not loading
- Verify sample data has been inserted in database
- Check API response: `curl http://localhost:8787/api/products`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Project overview (this file) |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Complete deployment instructions |
| [QUICK_START.md](./QUICK_START.md) | 5-minute local setup guide |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Guide for migrating from PHP |
| [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) | Architecture decisions & rationale |
| [schema.sql](./schema.sql) | Database schema & sample data |

---

## 🎓 Learning Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [KV Storage Guide](https://developers.cloudflare.com/workers/runtime-apis/kv/)

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🤝 Support

For issues and questions:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
3. Check Cloudflare dashboard for error messages
4. Open an issue with detailed error logs

---

**Built with ❤️ for Warung RMB**

Last Updated: 2024
