document.addEventListener('DOMContentLoaded', async () => {
  await loadStatistics();
  await loadFeaturedProducts();
  document.querySelector('.admin-secret-btn')?.addEventListener('click', () => {
    window.location.href = '/admin/login.html';
  });
});

async function loadStatistics() {
  try {
    const data = await api.getProducts(1, 1);
    const categories = await api.getCategories();
    document.getElementById('stat-products').textContent = data.pagination?.total || '0';
    document.getElementById('stat-categories').textContent = categories.length || '0';
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function loadFeaturedProducts() {
  try {
    const response = await api.getProducts(1, 6);
    const products = response.products || [];
    const container = document.getElementById('featured-products');
    container.innerHTML = products.map(product => `
      <div class="product-card">
        ${product.gambar ? `<img src="${product.gambar}" alt="${product.nama}">` : '<div class="no-image">Tidak ada gambar</div>'}
        <div class="product-info">
          <h3>${product.nama}</h3>
          <p class="price">${formatCurrency(product.harga)}</p>
          <button class="btn btn-primary" onclick="addToCart('${product.barang_id}', '${product.nama}')">
            Tambah ke Keranjang
          </button>
          <a href="/katalog.html?product=${product.barang_id}" class="btn btn-secondary">Lihat Detail</a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading featured products:', error);
    document.getElementById('featured-products').innerHTML = '<p>Gagal memuat produk</p>';
  }
}

function addToCart(productId, productName) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  cart[productId] = (cart[productId] || 0) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification(`${productName} ditambahkan ke keranjang`);
}
