<?php
session_start();
include '../php/konek.php';

// CEK APAKAH ADMIN SUDAH LOGIN
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login_admin.php");
    exit();
}

// ==========================================
// LOGIKA SEARCH & PAGINATION
// ==========================================
$batas = 10;
$halaman = isset($_GET['halaman']) ? (int)$_GET['halaman'] : 1;
$halaman_awal = ($halaman > 1) ? ($halaman * $batas) - $batas : 0;
$search = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';

// Query Hitung Data (Ditambahkan pencarian berdasarkan kota/provinsi jika diperlukan)
$query_count = "SELECT id_pesanan FROM pesanan WHERE nama_penerima LIKE '%$search%' OR id_pesanan LIKE '%$search%' OR alamat_lengkap LIKE '%$search%'";
$data_count = mysqli_query($conn, $query_count);
$total_data = mysqli_num_rows($data_count);
$total_halaman = ceil($total_data / $batas);

// ==========================================
// LOGIKA PEMBUKUAN & STATISTIK
// ==========================================
$total_produk = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM barang"));
$total_kategori = mysqli_num_rows(mysqli_query($conn, "SELECT * FROM kategori"));
$query_omset = mysqli_query($conn, "SELECT SUM(total_bayar) as total FROM pesanan WHERE status_pesanan = 'SELESAI'");
$data_omset = mysqli_fetch_assoc($query_omset);
$total_omset = $data_omset['total'];

// Query Utama
$query_pesanan = mysqli_query($conn, "
    SELECT p.*, GROUP_CONCAT(CONCAT(b.nama, ' (', pd.jumlah, ')') SEPARATOR ', ') as daftar_barang
    FROM pesanan p
    LEFT JOIN pesanan_detail pd ON p.id_pesanan = pd.id_pesanan
    LEFT JOIN barang b ON pd.barang_id = b.barang_id
    WHERE p.nama_penerima LIKE '%$search%' OR p.id_pesanan LIKE '%$search%' OR p.alamat_lengkap LIKE '%$search%'
    GROUP BY p.id_pesanan
    ORDER BY p.tanggal_order DESC 
    LIMIT $halaman_awal, $batas
");
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Dashboard Admin - Warung RMB</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/index_admin.css">
    <style>
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #eee; }
        .stat-card h3 { font-size: 1.5rem; margin: 0; color: #1e293b; }
        .highlight { border-left: 5px solid #10b981; }
        .order-section { margin-top: 30px; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .order-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.85rem; }
        .order-table th { background: #f8fafc; color: #64748b; text-align: left; padding: 12px; border-bottom: 2px solid #edf2f7; }
        .order-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        
        /* Dropdown Styling */
        .status-select {
            padding: 5px 8px;
            border-radius: 6px;
            border: 1px solid #ddd;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
        }
        .status-PENDING { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
        .status-PROSES { background-color: #e0f2fe; color: #075985; border-color: #bae6fd; }
        .status-DIKIRIM { background-color: #ede9fe; color: #5b21b6; border-color: #ddd6fe; }
        .status-SELESAI { background-color: #dcfce7; color: #166534; border-color: #bbf7d0; }
        .status-BATAL { background-color: #fee2e2; color: #991b1b; border-color: #fecaca; }

        .btn-view { background: #0284c7; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.8rem; font-weight: 600; }
        .pagination { margin-top: 20px; display: flex; gap: 5px; justify-content: center; }
        .page-link { padding: 6px 12px; border: 1px solid #ddd; text-decoration: none; color: #333; border-radius: 4px; }
        .page-link.active { background: #0284c7; color: white; border-color: #0284c7; }
        
        /* Tambahan style untuk mempercantik tampilan alamat */
        .alamat-box { line-height: 1.4; }
        .alamat-box .detail { color: #0284c7; font-weight: 600; }
        .alamat-box .region { color: #64748b; font-size: 0.8rem; }
    </style>
</head>
<body>

    <aside class="sidebar">
        <div class="sidebar-brand"><h2>Admin RMB</h2></div>
        <ul class="nav-menu">
            <li class="active"><a href="index_admin.php">Dashboard Utama</a></li>
            <li><a href="tambah_admin.php">Tambah Data</a></li> 
            <li><a href="edit_admin.php">Edit Data</a></li>
            <li style="margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem;"></li>
            <li><a href="logout.php" style="color: #dc2626; font-weight: 600;">Logout</a></li>
        </ul>
    </aside>

    <main class="main-content">
        <div class="header-title">
            <h1>Dashboard Admin</h1>
            <p>Kelola data pesanan dan pembukuan.</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card highlight"><p>Omset Selesai</p><h3>₩<?php echo number_format($total_omset, 0, '', ','); ?></h3></div>
            <div class="stat-card"><p>Produk</p><h3><?php echo $total_produk; ?></h3></div>
            <div class="stat-card"><p>Kategori</p><h3><?php echo $total_kategori; ?></h3></div>
        </div>

        <div class="order-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3>Data Pesanan</h3>
                <div style="display: flex; gap: 8px;">
                    <form id="searchForm" method="GET">
                        <input type="text" name="search" id="searchInput" placeholder="Ketik untuk mencari..." value="<?php echo htmlspecialchars($search); ?>" style="padding: 8px; border-radius: 5px; border: 1px solid #ddd;">
                    </form>
                    <a href="export_excel.php" class="btn-view" style="background: #16a34a;">Export Excel</a>
                </div>
            </div>

            <table class="order-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tanggal</th>
                        <th>Waktu</th>
                        <th>Penerima</th>
                        <th>WhatsApp</th>
                        <th style="width: 25%;">Alamat Lengkap</th>
                        <th>Barang (Qty)</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if(mysqli_num_rows($query_pesanan) > 0): ?>
                        <?php while($row = mysqli_fetch_assoc($query_pesanan)): ?>
                        <tr>
                            <td><strong>#<?php echo $row['id_pesanan']; ?></strong></td>
                            <td><?php echo date('d/m/Y', strtotime($row['tanggal_order'])); ?></td>
                            <td><?php echo date('H:i', strtotime($row['tanggal_order'])); ?></td>
                            <td><b><?php echo $row['nama_penerima']; ?></b></td>
                            <td><a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $row['whatsapp']); ?>" target="_blank" style="color:#16a34a; text-decoration:none; font-weight:bold;">📱 <?php echo $row['whatsapp']; ?></a></td>
                            
                            <td>
                                <div class="alamat-box">
                                    <?php echo nl2br(htmlspecialchars($row['alamat_lengkap'])); ?><br>
                                    
                                    <?php if(!empty($row['detail_alamat'])): ?>
                                        <span class="detail">Detail: <?php echo htmlspecialchars($row['detail_alamat']); ?></span><br>
                                    <?php endif; ?>
                                    
                                    <span class="region">
                                        <?php echo htmlspecialchars($row['kota']); ?>, 
                                        <?php echo htmlspecialchars($row['provinsi']); ?> - 
                                        <strong><?php echo htmlspecialchars($row['kodepos']); ?></strong>
                                    </span>
                                </div>
                            </td>
                            <td><small><i><?php echo $row['daftar_barang']; ?></i></small></td>
                            <td><strong>₩<?php echo number_format($row['total_bayar'], 0, ',', '.'); ?></strong></td>
                            
                            <td>
                                <form action="update_status.php" method="POST">
                                    <input type="hidden" name="id_pesanan" value="<?php echo $row['id_pesanan']; ?>">
                                    <select name="status_baru" onchange="this.form.submit()" class="status-select status-<?php echo $row['status_pesanan']; ?>">
                                        <option value="PENDING" <?php echo ($row['status_pesanan'] == 'PENDING') ? 'selected' : ''; ?>>PENDING</option>
                                        <option value="PROSES" <?php echo ($row['status_pesanan'] == 'PROSES') ? 'selected' : ''; ?>>PROSES</option>
                                        <option value="DIKIRIM" <?php echo ($row['status_pesanan'] == 'DIKIRIM') ? 'selected' : ''; ?>>DIKIRIM</option>
                                        <option value="SELESAI" <?php echo ($row['status_pesanan'] == 'SELESAI') ? 'selected' : ''; ?>>SELESAI</option>
                                        <option value="BATAL" <?php echo ($row['status_pesanan'] == 'BATAL') ? 'selected' : ''; ?>>BATAL</option>
                                    </select>
                                </form>
                            </td>

                            <td><a href="detail_pesanan.php?id=<?php echo $row['id_pesanan']; ?>" class="btn-view">Detail</a></td>
                        </tr>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <tr><td colspan="10" style="text-align:center; padding: 20px;">Data tidak ditemukan.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>

            <div class="pagination">
                <?php for($i=1; $i<=$total_halaman; $i++): ?>
                    <a href="?halaman=<?php echo $i; ?>&search=<?php echo $search; ?>" class="page-link <?php if($halaman==$i) echo 'active'; ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
            </div>
        </div>
    </main>

    <script>
        let timeout = null;
        document.getElementById('searchInput').addEventListener('keyup', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                document.getElementById('searchForm').submit();
            }, 500);
        });
    </script>
</body>
</html>