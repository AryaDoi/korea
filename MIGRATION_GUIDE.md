# Migration Guide: PHP to Cloudflare Workers

## Overview

This guide explains how to migrate from your existing PHP-based system to the new Cloudflare Pages + Workers architecture.

## What's Changed

### Architecture
**Before:** 
- Single server running Apache + PHP + MySQL
- Session stored in PHP `$_SESSION`
- All pages server-rendered

**After:**
- Static pages on Cloudflare Pages (CDN)
- API on Cloudflare Workers (serverless)
- Session in Cloudflare KV
- Database on D1 or external service

### Benefits
✅ Faster global performance (edge computing)
✅ Better scalability (serverless)
✅ Reduced costs (pay per request)
✅ Built-in DDoS protection
✅ Automatic HTTPS

## Step-by-Step Migration

### 1. Data Migration

#### Export Current Database
```bash
# From your current server/MySQL
mysqldump -u root -p kora > kora_backup.sql
```

#### Import to D1
```bash
# Using the schema.sql provided
wrangler d1 execute warung-rmb --file=schema.sql

# Then import your data
wrangler d1 execute warung-rmb < kora_backup.sql
```

### 2. Update Product Images

Copy your images to `public/images/`:
```bash
# Copy from old XAMPP location
cp -r /xampp5.6/htdocs/korea/images/* ./public/images/
```

### 3. Update Database Connections

The new system connects via Workers, no direct MySQL connection needed.

**Files affected:**
- `src/utils/database.ts` - Already configured for D1
- `public/js/api.js` - Already points to API endpoints

### 4. Admin Credentials

**Old PHP:**
```php
// Stored in database, checked with direct query
```

**New:**
```typescript
// In src/api/admin.ts
// Currently hardcoded, should be moved to database
```

Update admin credentials:
```bash
# Edit src/api/admin.ts ADMIN_USERS object
```

### 5. Session Management

**Old PHP:**
```php
$_SESSION['cart']      // Cart items
$_SESSION['admin_logged_in']  // Admin status
```

**New JavaScript:**
```javascript
localStorage.getItem('cart')  // Client-side cart
// Sessions managed via KV namespace and cookies
```

### 6. Form Processing

**Old PHP:**
```php
// In proses-checkout.php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Process form
    mysqli_query($conn, "INSERT INTO pesanan...");
}
```

**New JavaScript:**
```javascript
// In public/js/checkout.js
async function handleCheckoutSubmit(e) {
    e.preventDefault();
    const response = await api.checkout(data);
}
```

## File Mapping

| Old PHP File | New Location | Type |
|---|---|---|
| `php/index.php` | `public/index.html` | Pages |
| `php/katalog.php` | `public/katalog.html` | Pages |
| `php/checkout.php` | `public/checkout.html` | Pages |
| `php/konek.php` | `src/utils/database.ts` | Workers |
| `php/proses-checkout.php` | `src/api/checkout.ts` | Workers |
| `php/keranjang.php` | `public/keranjang.html` | Pages |
| `admin/index_admin.php` | `public/admin/index.html` | Pages |
| `admin/login_admin.php` | `public/admin/login.html` | Pages |

## API Endpoint Changes

### Product Listing
**Old:**
```
GET /php/katalog.php
```

**New:**
```
GET /api/products
GET /api/products/search?q=term
GET /api/categories
```

### Checkout
**Old:**
```
POST /php/proses-checkout.php
```

**New:**
```
POST /api/checkout
```

### Cart
**Old:**
```
Session-based
```

**New:**
```
POST /api/cart (add item)
DELETE /api/cart (remove item)
GET /api/checkout (view cart)
```

## Authentication Changes

### Session Handling

**Old:**
```php
session_start();
$_SESSION['admin_logged_in'] = true;
```

**New:**
```javascript
// Login via API
const response = await api.adminLogin(username, password);
localStorage.setItem('admin_session', response.data.session_id);

// Check auth
const authCheck = await api.checkAdminAuth();
if (!authCheck.data.authenticated) {
    redirect('/admin/login.html');
}
```

## Testing Before Migration

### Local Testing
```bash
# Start local dev environment
npm run dev  # Terminal 1
npm run pages:dev  # Terminal 2

# Test all features:
# - [ ] Browse products
# - [ ] Search products
# - [ ] Add to cart
# - [ ] Checkout
# - [ ] Admin login
# - [ ] View orders
```

### Production Testing
After initial deployment:
1. Test product catalog
2. Complete a test order
3. Check admin dashboard
4. Verify notifications

## Rollback Plan

If issues arise:

1. **Keep old server running** during transition
2. **Update DNS** to point to old server if needed
3. **Database backup** before importing
4. **Test thoroughly** locally first

## Performance Considerations

### Caching
- Product data can be cached (changes infrequently)
- Order data should not be cached
- Images cached by CDN automatically

### Database
- D1 provides global replication
- Use external MySQL for larger databases
- Consider caching frequently accessed data in KV

## Cost Comparison

### Old (XAMPP/VPS)
- Server: ~$5-50/month
- Uptime: ~99%
- Geographic distribution: Single location

### New (Cloudflare)
- Workers: ~$5/month included (free tier for small sites)
- Pages: Free
- Uptime: 99.95%+
- Geographic distribution: 200+ data centers globally

## Rollout Steps

### Phase 1: Setup
- [ ] Create Cloudflare account
- [ ] Create KV namespaces
- [ ] Create D1 database
- [ ] Deploy Workers
- [ ] Deploy Pages

### Phase 2: Testing
- [ ] Test all features locally
- [ ] Test on production endpoints
- [ ] Load testing
- [ ] Security audit

### Phase 3: Migration
- [ ] Export data from old MySQL
- [ ] Import to D1
- [ ] Update DNS (if using custom domain)
- [ ] Monitor for issues
- [ ] Decommission old server (after 30 days)

## Support & Resources

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- D1 Database: https://developers.cloudflare.com/d1/
- KV Storage: https://developers.cloudflare.com/kv/

## Checklist for Go-Live

- [ ] All environment variables set
- [ ] Admin credentials updated
- [ ] Database migrated
- [ ] Images uploaded
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Email notifications set up
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Support documentation updated

## Common Issues & Solutions

### Issue: Cart data lost on page reload
**Solution:** Change from localStorage to KV-backed session

### Issue: Slow image loading
**Solution:** Optimize images, enable Cloudflare image optimization

### Issue: CORS errors
**Solution:** Check CORS_ORIGIN in wrangler.toml matches your domain

### Issue: Admin can't login
**Solution:** Check SESSION_SECRET is set and KV namespace is accessible

Refer to README.md for additional troubleshooting.
