/**
 * Cart page (keranjang.html) logic
 */

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  document.getElementById('checkout-btn')?.addEventListener('click', () => {
    window.location.href = '/checkout.html';
  });
});

async function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  if (Object.keys(cart).length === 0) {
    document.getElementById('empty-cart').style.display = 'block';
    document.getElementById('cart-content').style.display = 'none';
    return;
  }

  document.getElementById('empty-cart').style.display = 'none';
  document.getElementById('cart-content').style.display = 'block';

  try {
    // Fetch products for each cart item
    const items = [];
    let subtotal = 0;

    for (const [productId, qty] of Object.entries(cart)) {
      const product = await api.getProduct(productId);
      const itemSubtotal = product.data.harga * qty;
      subtotal += itemSubtotal;

      items.push({
        ...product.data,
        qty,
        subtotal: itemSubtotal,
      });
    }

    // Render cart items
    const cartItemsHtml = items.map(item => `
      <tr>
        <td>
          <div class="item-info">
            ${item.gambar ? `<img src="${item.gambar}" alt="${item.nama}">` : ''}
            <span>${item.nama}</span>
          </div>
        </td>
        <td>${formatCurrency(item.harga)}</td>
        <td>
          <div class="qty-control">
            <button onclick="updateQty('${item.barang_id}', ${item.qty - 1})">-</button>
            <input type="number" value="${item.qty}" readonly>
            <button onclick="updateQty('${item.barang_id}', ${item.qty + 1})">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.subtotal)}</td>
        <td>
          <button onclick="removeFromCart('${item.barang_id}')" class="btn btn-danger">Hapus</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('cart-items').innerHTML = cartItemsHtml;

    // Update summary
    const ongkir = 5000;
    const total = subtotal + ongkir;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('ongkir').textContent = formatCurrency(ongkir);
    document.getElementById('total').textContent = formatCurrency(total);
  } catch (error) {
    console.error('Error loading cart:', error);
    showNotification('Gagal memuat keranjang', 'error');
  }
}

function updateQty(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  cart[productId] = newQty;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
}

function removeFromCart(productId) {
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');
  delete cart[productId];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
  showNotification('Produk dihapus dari keranjang');
}
