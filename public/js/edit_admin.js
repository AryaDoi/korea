/**
 * Admin dashboard and orders management
 */

let currentPage = 1;
const ORDERS_PER_PAGE = 10;

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const session = localStorage.getItem('admin_session');
  if (!session) {
    window.location.href = '/admin/login.html';
    return;
  }

  try {
    const authCheck = await api.checkAdminAuth();
    if (!authCheck || !authCheck.data?.authenticated) {
      localStorage.removeItem('admin_session');
      window.location.href = '/admin/login.html';
      return;
    }

    // Display user info
    const userInfo = document.getElementById('admin-user-info');
    if (userInfo && authCheck.data?.username) {
      userInfo.textContent = `Halo, ${authCheck.data.username}`;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    localStorage.removeItem('admin_session');
    window.location.href = '/admin/login.html';
    return;
  }

  // Load dashboard data
  if (window.location.pathname.includes('/admin/index.html')) {
    await loadStatistics();
    await loadOrders();
  } else if (window.location.pathname.includes('/admin/orders.html')) {
    await loadOrders();
    setupOrdersSearch();
  }
});

async function loadStatistics() {
  try {
    const stats = await api.getOrderStats();
    document.getElementById('total-revenue').textContent = formatCurrency(
      stats.data?.total_revenue || 0
    );
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function loadOrders() {
  try {
    const response = await api.getOrders('', currentPage);
    const orders = response.data?.orders || [];

    const tbody = document.getElementById('orders-tbody');

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Tidak ada pesanan</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id_pesanan}</td>
        <td>${order.nama_penerima}</td>
        <td>${formatCurrency(order.total_bayar)}</td>
        <td>
          <select onchange="updateOrderStatus('${order.id_pesanan}', this.value)">
            <option value="PENDING" ${order.status_pesanan === 'PENDING' ? 'selected' : ''}>Pending</option>
            <option value="PROCESSING" ${order.status_pesanan === 'PROCESSING' ? 'selected' : ''}>Processing</option>
            <option value="SHIPPED" ${order.status_pesanan === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
            <option value="DELIVERED" ${order.status_pesanan === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
            <option value="SELESAI" ${order.status_pesanan === 'SELESAI' ? 'selected' : ''}>Selesai</option>
            <option value="CANCELLED" ${order.status_pesanan === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${new Date(order.tanggal_order).toLocaleDateString('id-ID')}</td>
        <td>
          <button class="btn btn-small" onclick="viewOrderDetail('${order.id_pesanan}')">Detail</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('orders-tbody').innerHTML =
      '<tr><td colspan="6">Gagal memuat pesanan</td></tr>';
  }
}

function setupOrdersSearch() {
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  searchBtn?.addEventListener('click', async () => {
    currentPage = 1;
    const searchTerm = searchInput?.value || '';
    
    try {
      const response = await api.getOrders(searchTerm, currentPage);
      const orders = response.data?.orders || [];
      const tbody = document.getElementById('orders-tbody');

      if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Tidak ada hasil</td></tr>';
        return;
      }

      tbody.innerHTML = orders.map(order => `
        <tr>
          <td>${order.id_pesanan}</td>
          <td>${order.nama_penerima}</td>
          <td>${formatCurrency(order.total_bayar)}</td>
          <td>
            <select onchange="updateOrderStatus('${order.id_pesanan}', this.value)">
              <option value="PENDING" ${order.status_pesanan === 'PENDING' ? 'selected' : ''}>Pending</option>
              <option value="PROCESSING" ${order.status_pesanan === 'PROCESSING' ? 'selected' : ''}>Processing</option>
              <option value="SHIPPED" ${order.status_pesanan === 'SHIPPED' ? 'selected' : ''}>Shipped</option>
              <option value="DELIVERED" ${order.status_pesanan === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
              <option value="SELESAI" ${order.status_pesanan === 'SELESAI' ? 'selected' : ''}>Selesai</option>
              <option value="CANCELLED" ${order.status_pesanan === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>${new Date(order.tanggal_order).toLocaleDateString('id-ID')}</td>
          <td>
            <button class="btn btn-small" onclick="viewOrderDetail('${order.id_pesanan}')">Detail</button>
          </td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error searching orders:', error);
      showNotification('Gagal mencari pesanan', 'error');
    }
  });

  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn?.click();
    }
  });
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await api.request(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    });
    showNotification('Status pesanan diperbarui');
    loadOrders();
  } catch (error) {
    console.error('Error updating order:', error);
    showNotification('Gagal memperbarui status', 'error');
  }
}

async function viewOrderDetail(orderId) {
  try {
    const response = await api.getOrder(orderId);
    const order = response.data;

    const detailHtml = `
      <div class="order-detail">
        <h3>${order.id_pesanan}</h3>
        
        <h4>Data Penerima</h4>
        <p><strong>Nama:</strong> ${order.nama_penerima}</p>
        <p><strong>Email:</strong> ${order.email}</p>
        <p><strong>WhatsApp:</strong> ${order.whatsapp}</p>
        <p><strong>Alamat:</strong> ${order.alamat_lengkap}, ${order.kota}, ${order.provinsi}</p>
        
        <h4>Barang</h4>
        <table>
          <thead>
            <tr>
              <th>Produk</th>
              <th>Jumlah</th>
              <th>Harga Satuan</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map(item => `
              <tr>
                <td>${item.product_name || item.barang_id}</td>
                <td>${item.jumlah}</td>
                <td>${formatCurrency(item.harga_satuan)}</td>
                <td>${formatCurrency(item.jumlah * item.harga_satuan)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p><strong>Total:</strong> ${formatCurrency(order.total_bayar)}</p>
        <p><strong>Status:</strong> ${order.status_pesanan}</p>
        <p><strong>Tanggal:</strong> ${new Date(order.tanggal_order).toLocaleDateString('id-ID')}</p>
      </div>
    `;

    document.getElementById('order-detail-content').innerHTML = detailHtml;
    document.getElementById('order-modal').style.display = 'block';
  } catch (error) {
    console.error('Error loading order detail:', error);
    showNotification('Gagal memuat detail pesanan', 'error');
  }
}

function closeOrderModal() {
  document.getElementById('order-modal').style.display = 'none';
}

function logout() {
  if (confirm('Yakin ingin logout?')) {
    localStorage.removeItem('admin_session');
    api.adminLogout().catch(() => {});
    window.location.href = '/admin/login.html';
  }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('order-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
