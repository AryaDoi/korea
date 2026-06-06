# D1 Database Implementation - Setup & Deployment Guide

## Quick Start

This guide walks you through setting up Cloudflare D1 SQLite database for the Warung RMB application.

## Prerequisites

- **Cloudflare Account**: Free or paid tier (D1 has free tier)
- **Wrangler CLI**: `npm install -g @cloudflare/wrangler`
- **Node.js**: 16.x or later
- **Git**: For version control

## Installation & Configuration

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create database
wrangler d1 create warung-rmb

# Output will show:
# ✅ Successfully created D1 database 'warung-rmb'
# 📦 Uploaded database (X KB)
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "warung-rmb"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Update wrangler.toml

Copy the `database_id` from step 2 into `backend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "warung-rmb"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[d1_databases]]
binding = "DB_PREVIEW"
database_name = "warung-rmb-preview"
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
preview = true
```

### 4. Deploy Worker

```bash
# Build TypeScript
npm run build

# Deploy to Cloudflare
wrangler deploy
```

Output should show:
```
✅ Uploaded warung-rmb-api (X KB)
🔗 https://warung-rmb-api.<random>.workers.dev
```

### 5. Initialize Database Schema

```bash
# Check API is working
curl https://warung-rmb-api.<random>.workers.dev/api/health

# Login to admin
curl -X POST https://warung-rmb-api.<random>.workers.dev/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response: {"success": true, "data": {"session_id": "...", ...}}

# Initialize database
curl -X POST https://warung-rmb-api.<random>.workers.dev/api/admin/init-db \
  -H "Cookie: SESSION_ID=<session_id_from_login>"

# Seed sample data
curl -X POST https://warung-rmb-api.<random>.workers.dev/api/admin/seed-db \
  -H "Cookie: SESSION_ID=<session_id_from_login>"
```

### 6. Verify Setup

```bash
# Check database stats
curl https://warung-rmb-api.<random>.workers.dev/api/admin/stats \
  -H "Cookie: SESSION_ID=<session_id>"

# Get categories
curl https://warung-rmb-api.<random>.workers.dev/api/categories

# Response should show sample categories
```

## Local Development

### Run Locally

```bash
# Start development server
wrangler dev

# In another terminal, test endpoints
curl http://localhost:8787/api/categories
```

### Database Operations Locally

```bash
# Initialize schema (uses preview database)
curl -X POST http://localhost:8787/api/admin/init-db \
  -H "Cookie: SESSION_ID=<session_id>"

# View data
wrangler d1 execute warung-rmb --command "SELECT * FROM kategori;" --local
```

### Debug Logging

D1 logs appear in the Wrangler terminal:

```
[wrangler:d1] Preparing D1 database...
[Database] Categories fetched: 3 rows
```

## API Endpoints

### Public Endpoints

```
GET  /api/health                    # Health check
GET  /api/categories                # List all categories
GET  /api/categories/:id            # Get category details
GET  /api/products                  # List products (paginated)
GET  /api/products/:id              # Get product details
GET  /api/products?category=cat-1   # Filter by category
GET  /api/search?q=<keyword>        # Search products
GET  /api/orders/:id                # Get order details
POST /api/checkout                  # Create order
```

### Admin Endpoints (Requires Authentication)

```
POST /api/admin/login               # Admin login
POST /api/admin/logout              # Admin logout
GET  /api/admin/check               # Check auth status
GET  /api/admin/stats               # Get dashboard stats
POST /api/admin/init-db             # Initialize schema
POST /api/admin/seed-db             # Seed sample data
POST /api/admin/reset-db            # Reset database (CAUTION!)
GET  /api/orders                    # List all orders
PUT  /api/orders/:id/status         # Update order status
PUT  /api/orders/:id/note           # Add order note
```

## Database Schema

### Tables

- **kategori** (3 columns): Category data
- **barang** (9 columns): Product data with 50+ rows capacity
- **pesanan** (14 columns): Order records
- **pesanan_detail** (6 columns): Order line items
- **admin** (6 columns): Admin user accounts

### Indexes

Automatically created for performance:
- kategori.nama
- barang(kategori_id, nama)
- pesanan(status_pesanan, tanggal_order, email)
- pesanan_detail(id_pesanan, barang_id)
- admin(username)

## Production Deployment

### 1. Set up Custom Domain

```bash
# Add custom domain route
wrangler deploy --env production

# In Cloudflare Dashboard:
# Workers & Pages > Deployments > Custom domain
```

### 2. Configure Environment

```toml
[env.production]
name = "warung-rmb-api-prod"
routes = [
  { pattern = "api.warung-rmb.com/*", zone_name = "warung-rmb.com" }
]

[env.production.vars]
API_URL = "https://api.warung-rmb.com"
CORS_ORIGIN = "https://warung-rmb.com"
SESSION_TIMEOUT = "3600"
```

### 3. Deploy to Production

```bash
wrangler deploy --env production
```

### 4. Monitor Performance

```bash
# View logs
wrangler tail --env production

# Check analytics in Cloudflare Dashboard:
# Workers > Analytics > warung-rmb-api
```

## Backup & Restore

### Export Data

```bash
# Export entire database as SQL
wrangler d1 execute warung-rmb --command ".dump" > backup-$(date +%Y%m%d).sql

# Or specific table
wrangler d1 execute warung-rmb --command "SELECT * FROM pesanan;" > orders.csv
```

### Restore Data

```bash
# From backup file
wrangler d1 execute warung-rmb --file=backup-20240101.sql

# Or SQL statements
wrangler d1 execute warung-rmb --command "INSERT INTO kategori VALUES ('cat-1', 'Electronics', NULL);"
```

## Troubleshooting

### Database Not Found

```bash
# Check database exists
wrangler d1 list

# If missing, create it again
wrangler d1 create warung-rmb
```

### Connection Errors

```bash
# Verify binding in wrangler.toml
# - Check database_id is correct
# - Ensure binding name matches env.DB

# Test connection
curl https://api.warung-rmb.com/api/health
```

### Slow Queries

```bash
# Check indexes are created
wrangler d1 execute warung-rmb --command ".indexes"

# Check query plan
wrangler d1 execute warung-rmb --command "EXPLAIN QUERY PLAN SELECT * FROM barang WHERE kategori_id = 'cat-1';"
```

### Too Many Requests

D1 has rate limits on free tier:
- 5M read queries/month
- 100K write queries/month

Monitor usage in [Cloudflare Dashboard](https://dash.cloudflare.com)

## Security Checklist

- ✅ SQL injection protection: All queries use parameterized statements
- ✅ CORS configured: Only allow your domain
- ✅ Admin auth required: Session-based authentication
- ✅ Rate limiting: Implement in production
- ✅ HTTPS enforced: Always use HTTPS endpoints
- ✅ Sensitive data: Use environment variables for secrets

## Performance Tips

1. **Use Pagination**: Always paginate large result sets
   ```
   GET /api/products?page=1&limit=20
   ```

2. **Cache Static Data**: Implement caching for categories
   ```typescript
   const categories = await db.getCategories();
   // Cache in KV for 1 hour
   ```

3. **Optimize Queries**: Use indexed columns in WHERE clauses
   - Good: `WHERE kategori_id = ?` (indexed)
   - Avoid: `WHERE LOWER(nama) LIKE ?` (not indexed)

4. **Monitor Metrics**: Check Cloudflare Analytics
   - Response times
   - Error rates
   - Query execution time

## Cost Analysis

**Free Tier**:
- 5M read operations/month
- 100K write operations/month
- 5GB storage
- Enough for ~50K monthly visitors

**Paid Tier** (if exceeding free tier):
- $0.50 per million reads
- $0.50 per million writes
- Includes all free tier features

## Next Steps

1. ✅ Database initialized
2. ✅ Schema created
3. ✅ API deployed
4. → Add more products via admin panel
5. → Configure frontend API URL
6. → Set up monitoring & alerts
7. → Enable backups

## Support

- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Community Forum](https://community.cloudflare.com)
- GitHub Issues in your repo

## File Structure

```
backend/
├── src/
│   ├── index.ts              # Main worker
│   ├── types.ts              # Type definitions
│   ├── api/
│   │   ├── admin.ts          # Admin endpoints (NEW)
│   │   ├── checkout.ts       # Checkout endpoints
│   │   ├── orders.ts         # Order endpoints
│   │   └── products.ts       # Product endpoints
│   ├── middleware/
│   │   ├── auth.ts           # Auth middleware
│   │   └── database.ts       # Database context (NEW)
│   └── utils/
│       ├── auth.ts           # Auth utilities
│       ├── database.ts       # Database class (UPDATED)
│       ├── db-init.ts        # DB initialization (NEW)
│       ├── helpers.ts        # Helper functions
│       └── session.ts        # Session management
├── wrangler.toml             # Configuration (UPDATED)
└── package.json              # Dependencies

D1_MIGRATION_GUIDE.md          # Full migration guide (NEW)
```

## Example: Create a Product Programmatically

```bash
# Get admin session
SESSION=$(curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.data.session_id')

# Add product (via admin endpoint - implementation needed)
curl -X POST http://localhost:8787/api/admin/products \
  -H "Cookie: SESSION_ID=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Korean Sunscreen",
    "harga": 250000,
    "kategori_id": "cat-1",
    "deskripsi": "SPF 50+ sunscreen",
    "stok": 100
  }'
```

---

**Last Updated**: 2024-01-01  
**Version**: 1.0  
**Status**: Production Ready
