# DEPLOYMENT GUIDE - Warung RMB

Complete guide for deploying Warung RMB to Cloudflare Pages (Frontend) and Cloudflare Workers (Backend).

## Prerequisites

Before deployment, ensure you have:
1. [Cloudflare Account](https://dash.cloudflare.com) with a registered domain
2. [Node.js 18+](https://nodejs.org/)
3. [Wrangler CLI 3.50+](https://developers.cloudflare.com/workers/wrangler/)
   ```bash
   npm install -g @cloudflare/wrangler
   ```
4. Git (optional but recommended)

## Project Structure

```
korea/
├── frontend/              # Cloudflare Pages (static + JS)
│   ├── src/
│   │   ├── index.html
│   │   ├── katalog.html
│   │   ├── keranjang.html
│   │   ├── checkout.html
│   │   ├── success.html
│   │   ├── admin/
│   │   │   ├── login.html
│   │   │   ├── index.html
│   │   │   └── orders.html
│   │   ├── css/           # All CSS files
│   │   ├── js/            # All JavaScript files
│   │   └── images/        # Product images
│   ├── package.json
│   ├── wrangler.toml
│   └── .gitignore
└── backend/               # Cloudflare Workers
    ├── src/
    │   ├── index.ts       # Main entry point
    │   ├── types.ts       # TypeScript interfaces
    │   ├── utils/         # Utility functions
    │   ├── middleware/    # Authentication middleware
    │   └── api/           # API handlers
    ├── package.json
    ├── wrangler.toml
    ├── tsconfig.json
    └── .gitignore
```

---

## Step 1: Setup Cloudflare Account

### 1.1 Create Cloudflare Account & Domain
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up or log in
3. Add your domain (e.g., warung-rmb.com)
4. Complete domain verification steps

### 1.2 Get Your Account ID
1. Log into Cloudflare dashboard
2. Go to **Account Settings** (bottom of sidebar)
3. Copy your **Account ID** (looks like: `abc123def456...`)

### 1.3 Create API Token (for local development)
1. Go to **API Tokens** in Account Settings
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template
4. Grant permissions for:
   - Account.Cloudflare Workers Scripts
   - Account.Worker Routes
5. Copy the token

---

## Step 2: Deploy Backend (Workers)

### 2.1 Install Backend Dependencies

```bash
cd korea/backend
npm install
```

### 2.2 Configure Wrangler

Edit `/backend/wrangler.toml`:

```toml
name = "warung-rmb-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Replace with your actual account ID
account_id = "your_account_id_here"

# KV Namespace bindings (create these in Cloudflare dashboard)
[[kv_namespaces]]
binding = "SESSIONS"
id = "your_kv_namespace_id"
preview_id = "your_kv_namespace_preview_id"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "warung-rmb"
database_id = "your_d1_database_id"

# Environment variables
[env.production]
routes = [
  { pattern = "api.warung-rmb.com/*", zone_name = "warung-rmb.com" }
]

[env.production.vars]
API_URL = "https://api.warung-rmb.com"
CORS_ORIGIN = "https://warung-rmb.com"
SESSION_TIMEOUT = "86400"
ADMIN_HASH_SALT = "your_secret_salt_here"
SESSION_SECRET = "your_session_secret_here"
```

### 2.3 Create KV Namespace

```bash
# Create production namespace
wrangler kv:namespace create SESSIONS

# Create preview namespace
wrangler kv:namespace create SESSIONS --preview
```

Save the namespace IDs and add them to `wrangler.toml`.

### 2.4 Create D1 Database

```bash
# Create D1 database
wrangler d1 create warung-rmb

# Apply schema
wrangler d1 execute warung-rmb --file=../schema.sql
```

### 2.5 Deploy Backend

```bash
cd korea/backend

# Development test
npm run dev

# Deploy to production
npm run deploy
```

**Output**: Your backend is now available at `https://api.warung-rmb.com`

---

## Step 3: Deploy Frontend (Pages)

### 3.1 Install Frontend Dependencies

```bash
cd korea/frontend
npm install
```

### 3.2 Configure Frontend API URL

Edit `/frontend/src/js/api.js`:

```javascript
// For production with Cloudflare Workers
const API_BASE_URL = 'https://api.warung-rmb.com';

// For local development with local backend
// const API_BASE_URL = 'http://localhost:8787';
```

### 3.3 Update Frontend wrangler.toml

Edit `/frontend/wrangler.toml`:

```toml
name = "warung-rmb-pages"
compatibility_date = "2024-01-01"
main = "src"

account_id = "your_account_id_here"

# Production deployment
[env.production]
routes = [
  { pattern = "warung-rmb.com/*", zone_name = "warung-rmb.com" }
]
```

### 3.4 Deploy Frontend

```bash
cd korea/frontend

# Development test
npm run dev

# Deploy to production
npm run deploy
```

**Output**: Your frontend is now available at `https://warung-rmb.com`

---

## Step 4: Configure DNS & Routing

### 4.1 Add DNS Records in Cloudflare

1. Go to **DNS** section in Cloudflare dashboard
2. Add CNAME records:

| Type | Name | Content | TTL |
|------|------|---------|-----|
| CNAME | warung-rmb.com | pages.warung-rmb.com | Auto |
| CNAME | api | workers.warung-rmb.com | Auto |

Or use Cloudflare's Workers/Pages routing through the dashboard.

### 4.2 Test Deployment

```bash
# Test frontend
curl https://warung-rmb.com

# Test backend
curl https://api.warung-rmb.com/api/health
```

---

## Step 5: Database Setup

### 5.1 Populate Initial Data

```bash
cd korea/backend

# Execute schema and sample data
wrangler d1 execute warung-rmb --file=../schema.sql
```

### 5.2 Verify Database

```bash
# List database tables
wrangler d1 query warung-rmb "SELECT name FROM sqlite_master WHERE type='table';"
```

---

## Development Workflow

### Local Development (Backend + Frontend)

```bash
# Terminal 1: Start backend (Workers)
cd korea/backend
npm run dev
# Backend runs on http://localhost:8787

# Terminal 2: Start frontend (Pages)
cd korea/frontend
npm run dev
# Frontend runs on http://localhost:5173 (or 3000)
```

Update `frontend/src/js/api.js` to use `http://localhost:8787` during development.

### Test Admin Login

Default credentials:
- **Username**: admin
- **Password**: admin123

⚠️ **CHANGE THESE IN PRODUCTION!**

Edit `/backend/src/api/admin.ts` to update credentials.

---

## Production Considerations

### 1. Security

- [ ] Change admin default credentials
- [ ] Generate strong `SESSION_SECRET` and `ADMIN_HASH_SALT`
- [ ] Enable HTTPS (automatic with Cloudflare)
- [ ] Set strong CORS_ORIGIN value
- [ ] Rotate API tokens regularly

### 2. Database Backups

```bash
# Export D1 database
wrangler d1 export warung-rmb --output=backup.sql
```

### 3. Monitoring

- Use Cloudflare Analytics dashboard
- Check Worker logs: `wrangler tail`
- Monitor D1 query performance

### 4. Performance Optimization

- Enable Cloudflare cache rules
- Optimize image sizes
- Minimize CSS/JavaScript
- Use Cloudflare Workers KV for session caching

---

## Troubleshooting

### Issue: "Account ID not found"
**Solution**: Ensure `account_id` in `wrangler.toml` is correct

### Issue: CORS errors
**Solution**: Check `CORS_ORIGIN` environment variable matches your domain

### Issue: Database connection fails
**Solution**: Verify D1 database binding and `database_id` in `wrangler.toml`

### Issue: Sessions not persisting
**Solution**: Ensure KV namespace is correctly bound and `SESSIONS` binding is configured

### Issue: Admin login fails
**Solution**: Check credentials in `/backend/src/api/admin.ts` match what you're trying to use

---

## Environment Variables Reference

### Backend (wrangler.toml)

```toml
[vars]
API_URL = "https://api.warung-rmb.com"
CORS_ORIGIN = "https://warung-rmb.com"
SESSION_TIMEOUT = "86400"           # 24 hours in seconds
ADMIN_HASH_SALT = "your_salt"
SESSION_SECRET = "your_secret"
```

### Frontend (api.js)

```javascript
const API_BASE_URL = 'https://api.warung-rmb.com';
```

---

## Next Steps

1. Verify all deployments work correctly
2. Test the full user flow (login → catalog → checkout → order)
3. Test admin dashboard (login → view orders → update status)
4. Set up monitoring and alerting
5. Configure payment gateway (Midtrans, Stripe, etc.)
6. Create product management admin UI
7. Set up automated backups

---

## Support & Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
- [KV Namespace Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
