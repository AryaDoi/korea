# D1 Database API Reference

## Complete API Documentation with D1 Support

This document describes all available API endpoints for the Warung RMB application using Cloudflare D1.

## Authentication

### Session-Based Auth

All admin endpoints require a valid session:

```bash
# Get session ID from login
curl -X POST /api/admin/login -d '{"username":"admin", "password":"..."}'

# Include in requests via Cookie header
curl -H "Cookie: SESSION_ID=<session_id>" /api/admin/stats
```

### CORS Headers

All endpoints include CORS headers:
```
Access-Control-Allow-Origin: https://warung-rmb.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { "...": "..." },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Public Endpoints

### Health Check

Check if API and database are operational.

**Endpoint**: `GET /api/health`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

---

## Category Endpoints

### List Categories

Get all product categories.

**Endpoint**: `GET /api/categories`

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "kategori_id": "cat-1",
      "nama": "Skincare",
      "deskripsi": "Produk perawatan kulit dari Korea",
      "created_at": "2024-01-01T12:00:00Z"
    },
    {
      "kategori_id": "cat-2",
      "nama": "Kosmetik",
      "deskripsi": "Makeup dan kosmetik Korea",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Get Category Details

Get a specific category.

**Endpoint**: `GET /api/categories/{kategori_id}`

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| kategori_id | string | Category ID |

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "kategori_id": "cat-1",
    "nama": "Skincare",
    "deskripsi": "Produk perawatan kulit dari Korea",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Errors**:
- `404`: Category not found

---

## Product Endpoints

### List Products

Get all products with pagination.

**Endpoint**: `GET /api/products`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-based) |
| limit | number | 20 | Items per page (max 100) |
| category | string | - | Filter by category ID |

**Examples**:
```bash
# Get first page
GET /api/products?page=1&limit=20

# Get second page
GET /api/products?page=2&limit=10

# Filter by category
GET /api/products?category=cat-1&limit=20
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "barang_id": "barang-1",
        "nama": "BB Cream Korea",
        "harga": 150000,
        "kategori_id": "cat-2",
        "deskripsi": "BB Cream premium dari Korea",
        "stok": 50,
        "gambar": null,
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Get Product Details

Get a specific product.

**Endpoint**: `GET /api/products/{barang_id}`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "barang_id": "barang-1",
    "nama": "BB Cream Korea",
    "harga": 150000,
    "kategori_id": "cat-2",
    "deskripsi": "BB Cream premium dari Korea",
    "stok": 50,
    "gambar": null,
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

**Errors**:
- `404`: Product not found

### Search Products

Search products by keyword.

**Endpoint**: `GET /api/search?q={keyword}`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search keyword (min 2 chars) |

**Examples**:
```bash
GET /api/search?q=cream
GET /api/search?q=mask
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": [
    {
      "barang_id": "barang-1",
      "nama": "BB Cream Korea",
      "harga": 150000,
      "kategori_id": "cat-2",
      "deskripsi": "BB Cream premium dari Korea",
      "stok": 50,
      "gambar": null,
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

**Errors**:
- `400`: Query too short (< 2 chars)

---

## Cart & Checkout Endpoints

### Get Cart

Get current shopping cart.

**Endpoint**: `GET /api/checkout`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "barang_id": "barang-1",
        "nama": "BB Cream Korea",
        "harga": 150000,
        "qty": 2,
        "subtotal_item": 300000
      }
    ],
    "subtotal": 300000,
    "ongkir": 5000,
    "total": 305000
  }
}
```

### Add to Cart

Add item to shopping cart.

**Endpoint**: `POST /api/cart`

**Request Body**:
```json
{
  "barang_id": "barang-1",
  "qty": 2
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "added": true
  },
  "message": "Item added to cart"
}
```

### Create Order (Checkout)

Create an order from cart.

**Endpoint**: `POST /api/checkout`

**Request Body**:
```json
{
  "nama_depan": "John",
  "email": "john@example.com",
  "alamat": "Jl. Main St 123",
  "kota": "Jakarta",
  "provinsi": "DKI Jakarta",
  "kodepos": "12345",
  "whatsapp": "081234567890"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "order_id": "ORD-xxxxx",
    "total": 305000,
    "status": "PENDING"
  },
  "message": "Order created successfully"
}
```

**Errors**:
- `400`: Missing required fields, invalid email, or empty cart
- `500`: Failed to create order

---

## Order Endpoints

### List Orders

Get all orders (paginated).

**Endpoint**: `GET /api/orders`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default 1) |
| limit | number | Items per page (default 10, max 100) |
| search | string | Search by order ID or customer name |
| status | string | Filter by order status |

**Status Values**: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `SELESAI`

**Examples**:
```bash
GET /api/orders?page=1&limit=10
GET /api/orders?search=john
GET /api/orders?status=PENDING
GET /api/orders?status=SHIPPED&page=2
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id_pesanan": "ORD-xxxxx",
        "nama_penerima": "John",
        "email": "john@example.com",
        "alamat_lengkap": "Jl. Main St 123",
        "kota": "Jakarta",
        "provinsi": "DKI Jakarta",
        "kodepos": "12345",
        "whatsapp": "081234567890",
        "total_bayar": 305000,
        "status_pesanan": "PENDING",
        "ongkir": 5000,
        "tanggal_order": "2024-01-01T12:00:00Z",
        "catatan": null,
        "updated_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### Get Order Details

Get full order with items.

**Endpoint**: `GET /api/orders/{order_id}`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id_pesanan": "ORD-xxxxx",
    "nama_penerima": "John",
    "email": "john@example.com",
    "total_bayar": 305000,
    "status_pesanan": "PENDING",
    "items": [
      {
        "id_detail": "DETAIL-xxxxx",
        "id_pesanan": "ORD-xxxxx",
        "barang_id": "barang-1",
        "jumlah": 2,
        "harga_satuan": 150000,
        "product_name": "BB Cream Korea",
        "product_image": null,
        "product_deskripsi": "BB Cream premium dari Korea"
      }
    ]
  }
}
```

**Errors**:
- `404`: Order not found

---

## Admin Endpoints

### Admin Login

Authenticate as admin.

**Endpoint**: `POST /api/admin/login`

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "session_id": "sess_xxxxx",
    "username": "admin",
    "email": "admin@warung-rmb.com"
  },
  "message": "Login successful"
}
```

**Headers**: Sets `Set-Cookie: SESSION_ID=...`

**Errors**:
- `400`: Missing username or password
- `401`: Invalid credentials

### Admin Logout

Logout admin session.

**Endpoint**: `POST /api/admin/logout`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "logged_out": true
  },
  "message": "Logged out successfully"
}
```

### Check Admin Auth

Verify admin session is valid.

**Endpoint**: `GET /api/admin/check`

**Auth**: Required (Cookie: SESSION_ID)

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "username": "admin",
    "email": "admin@warung-rmb.com",
    "authenticated": true
  }
}
```

**Errors**:
- `401`: Not authenticated

### Update Order Status

Update order status.

**Endpoint**: `PUT /api/orders/{order_id}/status`

**Auth**: Required

**Request Body**:
```json
{
  "status": "PROCESSING"
}
```

**Valid Statuses**: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `SELESAI`

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "ORD-xxxxx",
    "status": "PROCESSING",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Order status updated successfully"
}
```

### Add Order Note

Add or update order note.

**Endpoint**: `PUT /api/orders/{order_id}/note`

**Auth**: Required

**Request Body**:
```json
{
  "catatan": "Customer called - ready to ship"
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "id": "ORD-xxxxx",
    "catatan": "Customer called - ready to ship",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Order note updated successfully"
}
```

### Get Order Statistics

Get dashboard statistics.

**Endpoint**: `GET /api/admin/stats`

**Auth**: Required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "orders": {
      "total": 50,
      "pending": 10,
      "processing": 5,
      "shipped": 15,
      "delivered": 18,
      "cancelled": 2,
      "completed": 18
    },
    "total_revenue": 15250000,
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Initialize Database

Initialize database schema (first-time setup).

**Endpoint**: `POST /api/admin/init-db`

**Auth**: Required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Database initialized: 15 statements executed"
  }
}
```

### Seed Database

Insert sample data for testing.

**Endpoint**: `POST /api/admin/seed-db`

**Auth**: Required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Seed data inserted: 3 categories and 5 products"
  }
}
```

### Get Database Stats

Get database statistics and row counts.

**Endpoint**: `GET /api/admin/db-stats`

**Auth**: Required

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "categories": 3,
    "products": 5,
    "orders": 50,
    "order_details": 120,
    "admins": 1
  }
}
```

### Reset Database

Delete all data and reinitialize schema (CAUTION!).

**Endpoint**: `POST /api/admin/reset-db`

**Auth**: Required

**Request Body**:
```json
{
  "confirm": true
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Database reset complete: tables dropped and schema reinitialized"
  }
}
```

**Errors**:
- `400`: Missing confirmation

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input or missing required fields |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | HTTP method not allowed |
| 500 | Internal Server Error | Server error or database failure |
| 503 | Service Unavailable | Database connection failed |

---

## Rate Limiting

Free tier limits (per month):
- Read queries: 5,000,000
- Write queries: 100,000

Implement pagination to reduce query count:
```bash
# ✅ Good: Paginated
GET /api/products?page=1&limit=20

# ❌ Bad: Fetches all products
GET /api/products?limit=10000
```

---

## Examples

### JavaScript/Fetch

```javascript
// Get products
const response = await fetch('https://api.warung-rmb.com/api/products?page=1&limit=20');
const { data } = await response.json();
console.log(data.products);

// Search products
const search = await fetch('https://api.warung-rmb.com/api/search?q=cream');
const results = await search.json();

// Create order
const order = await fetch('https://api.warung-rmb.com/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nama_depan: 'John',
    email: 'john@example.com',
    alamat: 'Jl. Main St 123',
    kota: 'Jakarta',
    provinsi: 'DKI Jakarta',
    kodepos: '12345',
    whatsapp: '081234567890'
  })
});
const result = await order.json();
console.log(result.data.order_id);
```

### cURL

```bash
# Login
SESSION=$(curl -s -X POST https://api.warung-rmb.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.session_id')

# Get stats
curl -H "Cookie: SESSION_ID=$SESSION" \
  https://api.warung-rmb.com/api/admin/stats

# Update order
curl -X PUT https://api.warung-rmb.com/api/orders/ORD-123/status \
  -H "Cookie: SESSION_ID=$SESSION" \
  -H "Content-Type: application/json" \
  -d '{"status":"SHIPPED"}'
```

---

**Last Updated**: 2024-01-01  
**API Version**: 1.0  
**Database**: Cloudflare D1 (SQLite)
