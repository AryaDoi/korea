# Cloudflare D1 SQLite Database Migration Guide

## Overview

This guide explains how to migrate from your existing database implementation to **Cloudflare D1**, a serverless SQLite database service built for Cloudflare Workers.

## What is D1?

- **SQLite-based**: Uses industry-standard SQLite
- **Serverless**: No infrastructure to manage
- **Integrated**: Works seamlessly with Cloudflare Workers
- **Scalable**: Handles variable workloads efficiently
- **Secure**: Data is encrypted at rest and in transit

## Migration Steps

### 1. Prerequisites

- Cloudflare account with a domain
- Wrangler CLI installed (`npm install -g @cloudflare/wrangler`)
- Node.js 16+ installed

### 2. Create D1 Database

```bash
# Create a new D1 database
wrangler d1 create warung-rmb

# The output will show:
# - Database ID (for production)
# - Preview ID (for development)
```

Save the **database_id** and **preview_id** from the output.

### 3. Update wrangler.toml

Update your `backend/wrangler.toml` with the IDs from step 2:

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

### 4. Initialize Database Schema

The new `db-init.ts` utility provides initialization functions. Create an API endpoint to initialize:

```typescript
// In your src/index.ts, add:
import { initializeDatabase, seedDatabase } from './utils/db-init';

if (pathname === '/api/admin/init-db' && method === 'POST') {
  // Add auth check here before running
  const result = await initializeDatabase(env);
  return successResponse(result, undefined, corsHeaders(env));
}

if (pathname === '/api/admin/seed-db' && method === 'POST') {
  // Add auth check here before running
  const seedResult = await seedDatabase(env);
  return successResponse(seedResult, undefined, corsHeaders(env));
}
```

Or run directly via Wrangler:

```bash
# Deploy first
wrangler deploy

# Then initialize
curl -X POST https://your-api.workers.dev/api/admin/init-db
```

### 5. Migrate Existing Data (Optional)

If migrating from another database:

```bash
# Export data from your existing database as CSV/JSON
# Then create a migration script in backend/scripts/migrate.ts

# Or use Wrangler's batch import:
wrangler d1 execute warung-rmb --file=schema.sql
wrangler d1 execute warung-rmb --file=seeds.sql
```

### 6. Development & Testing

```bash
# Run locally with Wrangler
wrangler dev

# Test API locally
curl http://localhost:8787/api/categories

# Run with preview database
wrangler dev --env development
```

### 7. Production Deployment

```bash
# Build and deploy
npm run build
wrangler deploy

# Verify database is working
curl https://your-api.workers.dev/api/health
```

## Database Schema

The schema includes the following tables:

### kategori (Categories)
- `kategori_id` (TEXT, PK)
- `nama` (TEXT, UNIQUE)
- `deskripsi` (TEXT)
- `created_at` (TEXT)

### barang (Products)
- `barang_id` (TEXT, PK)
- `nama` (TEXT)
- `harga` (INTEGER)
- `kategori_id` (TEXT, FK)
- `deskripsi` (TEXT)
- `stok` (INTEGER)
- `gambar` (TEXT)
- `created_at`, `updated_at` (TEXT)

### pesanan (Orders)
- `id_pesanan` (TEXT, PK)
- `nama_penerima` (TEXT)
- `email` (TEXT)
- `alamat_lengkap` (TEXT)
- `kota`, `provinsi`, `kodepos` (TEXT)
- `whatsapp` (TEXT)
- `total_bayar` (INTEGER)
- `status_pesanan` (TEXT)
- `ongkir` (INTEGER)
- `tanggal_order` (TEXT)
- `catatan` (TEXT)
- `updated_at` (TEXT)

### pesanan_detail (Order Items)
- `id_detail` (TEXT, PK)
- `id_pesanan` (TEXT, FK)
- `barang_id` (TEXT, FK)
- `jumlah` (INTEGER)
- `harga_satuan` (INTEGER)
- `created_at` (TEXT)

### admin (Admin Users)
- `admin_id` (TEXT, PK)
- `username` (TEXT, UNIQUE)
- `password_hash` (TEXT)
- `email` (TEXT, UNIQUE)
- `created_at`, `updated_at` (TEXT)

## API Changes

### Paginated Responses

All list endpoints now return pagination metadata:

```json
{
  "success": true,
  "data": {
    "orders": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Enhanced Error Handling

All endpoints now return detailed error messages:

```json
{
  "success": false,
  "error": "Invalid status. Allowed: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, SELESAI"
}
```

### New Endpoints

#### GET /api/health
Health check endpoint

```bash
curl https://api.example.com/api/health
```

#### GET /api/admin/stats
Get order statistics

```bash
curl https://api.example.com/api/admin/stats
```

#### PUT /api/orders/:id/note
Update order note

```bash
curl -X PUT https://api.example.com/api/orders/ORD-123/note \
  -H "Content-Type: application/json" \
  -d '{"catatan": "Customer called - ready to ship"}'
```

## Configuration

### Environment Variables

Add to `wrangler.toml` or `.env`:

```toml
[env.production.vars]
API_URL = "https://api.example.com"
CORS_ORIGIN = "https://example.com"
SESSION_TIMEOUT = "3600"

[env.development.vars]
API_URL = "http://localhost:8787"
CORS_ORIGIN = "http://localhost:3000"
SESSION_TIMEOUT = "3600"
```

## Performance Optimization

### Indexes

Indexes are automatically created on:
- `barang(kategori_id)` - for category filtering
- `barang(nama)` - for search
- `pesanan(status_pesanan)` - for status filtering
- `pesanan(tanggal_order)` - for date range queries
- `pesanan(email)` - for customer lookups
- `pesanan_detail(id_pesanan)` - for order joins
- `pesanan_detail(barang_id)` - for product tracking

### Query Best Practices

1. **Use pagination** to limit result sets
2. **Use indexed columns** in WHERE clauses
3. **Avoid SELECT \*** when possible
4. **Use prepared statements** (automatic in D1)

## Troubleshooting

### Database Not Initializing

```bash
# Check database status
wrangler d1 info warung-rmb

# View database schema
wrangler d1 execute warung-rmb --command "SELECT sql FROM sqlite_master WHERE type='table';"
```

### Connection Errors

1. Verify `database_id` in `wrangler.toml`
2. Check Cloudflare account has D1 enabled
3. Ensure worker has DB binding in environment

### Slow Queries

1. Check indexes are created
2. Verify pagination is being used
3. Review query complexity
4. Check D1 analytics dashboard

## Backup & Restore

### Export Database

```bash
# Export all data as SQL
wrangler d1 execute warung-rmb --command ".dump" > backup.sql

# Or export specific table
wrangler d1 execute warung-rmb --command "SELECT * FROM pesanan;" > orders.csv
```

### Restore Database

```bash
# From SQL backup
wrangler d1 execute warung-rmb --file=backup.sql

# Or recreate schema and re-seed
wrangler d1 execute warung-rmb --file=schema.sql
wrangler d1 execute warung-rmb --file=seeds.sql
```

## Security

### SQL Injection Prevention

All queries use parameterized statements (D1's `.bind()` method):

```typescript
// ✅ Safe
const result = await db.prepare('SELECT * FROM barang WHERE barang_id = ?1')
  .bind(barangId)
  .first();

// ❌ Unsafe
const result = await db.prepare(`SELECT * FROM barang WHERE barang_id = '${barangId}'`)
  .first();
```

### Authentication

Add authentication middleware to sensitive endpoints:

```typescript
// In index.ts
if (pathname.startsWith('/api/admin/')) {
  const auth = await authenticateAdmin(request, env);
  if (!auth) {
    return errorResponse('Unauthorized', 401, corsHeaders(env));
  }
}
```

## Cost Optimization

- **Reads**: Free tier includes 5M reads/month
- **Writes**: 100K writes/month included
- **Stored Data**: 5GB free storage
- Monitor usage in Cloudflare dashboard

## Next Steps

1. Review the updated [Database.ts](../utils/database.ts) for all available methods
2. Update frontend API calls if any schemas changed
3. Test locally before deploying to production
4. Monitor performance in Cloudflare Analytics
5. Set up regular backups

## Support & Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [SQLite Documentation](https://sqlite.org/docs.html)
- Cloudflare Community Forum
