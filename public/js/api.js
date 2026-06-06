/**
 * API Client for Cloudflare Worker Backend
 * This handles all communication with the API
 */

const API_BASE_URL = window.location.origin; // Same origin for Cloudflare Pages
// For development with separate backend:
// const API_BASE_URL = 'http://localhost:8787';

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for sessions
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ========== PRODUCTS ==========
  async getCategories() {
    return this.request('/api/categories');
  }

  async getProducts(page = 1, limit = 20) {
    return this.request(`/api/products?page=${page}&limit=${limit}`);
  }

  async getProductsByCategory(categoryId) {
    return this.request(`/api/products?category=${categoryId}`);
  }

  async getProduct(productId) {
    return this.request(`/api/products/${productId}`);
  }

  async searchProducts(query) {
    return this.request(`/api/products/search?q=${encodeURIComponent(query)}`);
  }

  // ========== CART ==========
  async addToCart(barangId, qty = 1) {
    return this.request('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ barang_id: barangId, qty }),
    });
  }

  async removeFromCart(barangId) {
    return this.request('/api/cart', {
      method: 'DELETE',
      body: JSON.stringify({ barang_id: barangId }),
    });
  }

  async getCart() {
    return this.request('/api/checkout', {
      method: 'GET',
    });
  }

  // ========== CHECKOUT ==========
  async checkout(customerData) {
    return this.request('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // ========== ORDERS ==========
  async getOrder(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  async getOrders(search = '', page = 1) {
    return this.request(`/api/orders?search=${encodeURIComponent(search)}&page=${page}`);
  }

  async getOrderStats() {
    return this.request('/api/orders/stats');
  }

  // ========== ADMIN ==========
  async adminLogin(username, password) {
    return this.request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async adminLogout() {
    return this.request('/api/admin/logout', {
      method: 'POST',
    });
  }

  async checkAdminAuth() {
    try {
      return await this.request('/api/admin/check');
    } catch (error) {
      return null;
    }
  }
}

// Global API instance
const api = new ApiClient();

// ========== UTILITY FUNCTIONS ==========

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function showNotification(message, type = 'success') {
  const div = document.createElement('div');
  div.className = `notification notification-${type}`;
  div.textContent = message;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

function getCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll('#cart-count');
  badges.forEach(b => b.textContent = count);
}

// Update cart badge on page load
updateCartBadge();
