# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Create Required Resources
```bash
# Create KV namespace for sessions
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "SESSIONS" --preview
```

### 4. Configure wrangler.toml
Update these values:
- `account_id` - Your Cloudflare account ID
- `[[kv_namespaces]]` - Your KV namespace IDs from step 3

### 5. Set Secrets
```bash
wrangler secret put SESSION_SECRET
# Enter a random string like: super-secret-key-change-in-production

wrangler secret put ADMIN_HASH_SALT
# Enter another random string like: my-salt-value
```

### 6. Run Locally
```bash
# Terminal 1: Start Workers API
npm run dev

# Terminal 2 (new window): Start Pages frontend
npm run pages:dev

# Open http://localhost:5173 in your browser
```

### 7. Deploy to Production
```bash
npm run deploy          # Deploy Workers
npm run pages:deploy    # Deploy Pages
```

## Using the Admin Dashboard

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**IMPORTANT:** Change these immediately in `src/api/admin.ts` after deploying!

### Access Admin Panel
1. Go to your deployed Pages URL
2. Click the secret admin button (empty button on navbar)
3. Login with credentials
4. Manage orders and view statistics

## Environment Variables

### Development
- API runs on: `http://localhost:8787`
- Pages runs on: `http://localhost:5173`

### Production
- Ensure CORS_ORIGIN matches your domain
- Set in `wrangler.toml` under `[env.production.vars]`

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/index.ts` | Main API router |
| `src/utils/database.ts` | Database operations |
| `src/utils/session.ts` | Session management |
| `public/js/api.js` | Frontend API client |
| `public/index.html` | Home page |
| `public/katalog.html` | Product catalog |

## Common Tasks

### Add a New Product
1. Add directly to database or via admin panel (when implemented)
2. Product appears automatically in catalog

### Process an Order
1. Admin receives order notification
2. Login to admin dashboard
3. Update order status (PENDING → PROCESSING → SHIPPED → DELIVERED)

### Update Product Price
1. Modify database directly (temporary)
2. Build admin product editor (future)

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run build
```

### API returns 404
- Check URL paths in `src/index.ts`
- Ensure wrangler is running: `npm run dev`

### Cart not saving
- Check browser localStorage
- Open DevTools → Application → Local Storage
- Should show `cart` object with product IDs

### Admin login fails
- Check browser cookies
- Clear cache: DevTools → Application → Clear Storage
- Default creds: admin / admin123

## Next: Production Setup

1. **Database Migration**
   - Export your current MySQL database
   - Import into Cloudflare D1 using schema.sql

2. **Custom Domain**
   - Add domain in Cloudflare dashboard
   - Update CORS_ORIGIN in wrangler.toml

3. **Security**
   - Change admin credentials
   - Use bcrypt for password hashing
   - Enable rate limiting

4. **Monitoring**
   - View logs: `wrangler tail`
   - Set up error tracking
   - Configure analytics

See README.md for complete documentation.
