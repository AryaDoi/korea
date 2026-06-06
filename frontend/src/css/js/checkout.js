document.addEventListener('DOMContentLoaded', async () => {
  await loadCheckoutData();
  const form = document.getElementById('checkout-form');
  form?.addEventListener('submit', handleCheckoutSubmit);
});

async function loadCheckoutData() {
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    if (Object.keys(cart).length === 0) {
      window.location.href = '/keranjang.html';
      return;
    }

    let subtotal = 0;
    const items = [];

    for (const [productId, qty] of Object.entries(cart)) {
      const product = await api.getProduct(productId);
      const itemSubtotal = product.data.harga * qty;
      subtotal += itemSubtotal;
      items.push({ ...product.data, qty, subtotal: itemSubtotal });
    }

    const itemsHtml = items.map(item => `
      <div class="order-item">
        <div class="item-name">${item.nama} × ${item.qty}</div>
        <div class="item-price">${formatCurrency(item.subtotal)}</div>
      </div>
    `).join('');

    document.getElementById('order-items').innerHTML = itemsHtml;

    const ongkir = 5000;
    const total = subtotal + ongkir;

    document.getElementById('summary-subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('summary-ongkir').textContent = formatCurrency(ongkir);
    document.getElementById('summary-total').textContent = formatCurrency(total);
  } catch (error) {
    console.error('Error loading checkout:', error);
    showNotification('Gagal memuat data checkout', 'error');
  }
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const cart = JSON.parse(localStorage.getItem('cart') || '{}');

  const data = {
    nama_depan: formData.get('nama_depan'),
    email: formData.get('email'),
    alamat: formData.get('alamat'),
    kota: formData.get('kota'),
    provinsi: formData.get('provinsi'),
    kodepos: formData.get('kodepos'),
    whatsapp: formData.get('whatsapp'),
    cart,
  };

  try {
    const response = await api.checkout(data);
    localStorage.removeItem('cart');
    updateCartBadge();
    window.location.href = `/success.html?order_id=${response.data.order_id}`;
  } catch (error) {
    console.error('Checkout error:', error);
    showNotification(error.message || 'Gagal memproses pesanan', 'error');
  }
}
