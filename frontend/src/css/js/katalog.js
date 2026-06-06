let currentPage = 1;
let currentCategory = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadProducts();
  document.getElementById('search-btn')?.addEventListener('click', handleSearch);
  document.getElementById('search-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
});

async function loadCategories() {
  try {
    const categories = await api.getCategories();
    const container = document.getElementById('categories-list');
    const html = `
      <a href="javascript:void(0)" onclick="filterByCategory(null)" class="category-link${!currentCategory ? ' active' : ''}">
        Semua Produk
      </a>
      ${categories.map(cat => `
        <a href="javascript:void(0)" onclick="filterByCategory('${cat.kategori_id}')" class="category-link">
          ${cat.nama}
        </a>
      `).join('')}
    `;
    container.innerHTML = html;
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadProducts() {
  try {
    let response;
    if (currentCategory) {
      response = await api.getProductsByCategory(currentCategory);
      response = { products: Array.isArray(response) ? response : [] };
    } else {
      response = await api.getProducts(currentPage, 20);
    }

    const products = response.products || [];
    const container = document.getElementById('products-grid');

    if (products.length === 0) {
      container.innerHTML = '<p>Tidak ada produk ditemukan</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card">
        ${product.gambar ? `<img src="${product.gambar}" alt="${product.nama}">` : '<div class="no-image">Tidak ada gambar</div>'}
        <div class="product-info">
          <h3>${product.nama}</h3>
          <p class="description">${product.deskripsi?.substring(0, 50) || ''}</p>
          <p class="price">${formatCurrency(product.harga)}</p>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="addToCart('${product.barang_id}', '${product.nama}')">Tambah</button>
            <a href="javascript:void(0)" onclick="viewProduct('${product.barang_id}')" class="btn btn-secondary">Detail</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('products-grid').innerHTML = '<p>Gagal memuat produk</p>';
  }
}

async function handleSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query) {
    loadProducts();
    return;
  }

  try {
    const results = await api.searchProducts(query);
    const container = document.getElementById('products-grid');
    if (results.length === 0) {
      container.innerHTML = '<p>Produk tidak ditemukan</p>';
      return;
    }
    container.innerHTML = results.map(product => `
      <div class="product-card">
        ${product.gambar ? `<img src="${product.gambar}" alt="${product.nama}">` : '<div class="no-image">Tidak ada gambar</div>'}
        <div class="product-info">
          <h3>${product.nama}</h3>
          <p class="price">${formatCurrency(product.harga)}</p>
          <button class="btn btn-primary" onclick="addToCart('${product.barang_id}', '${product.nama}')">Tambah</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error searching products:', error);
    showNotification('Gagal mencari produk', 'error');
  }
}

function filterByCategory(categoryId) {
  currentCategory = categoryId;
  currentPage = 1;
  document.querySelectorAll('.category-link').forEach(link => link.classList.remove('active'));
  event.target.classList.add('active');
  loadProducts();
}

function viewProduct(productId) {
  localStorage.setItem('selectedProduct', productId);
  window.location.href = `/katalog.html?product=${productId}`;
}

function addToCart(productId, productName) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  cart[productId] = (cart[productId] || 0) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  showNotification(`${productName} ditambahkan ke keranjang`);
}
