<?php
session_start();
include '../php/konek.php';

// CEK APAKAH ADMIN SUDAH LOGIN
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login_admin.php");
    exit();
}

$pesan = '';

// ==========================================
// 1. PROSES UPDATE & HAPUS KATEGORI
// ==========================================
if (isset($_POST['update_kategori'])) {
    $id_kategori = mysqli_real_escape_string($conn, $_POST['kategori_id']);
    $nama_kategori = mysqli_real_escape_string($conn, $_POST['kategori_name']);
    $query_update = "UPDATE kategori SET kategori_name = '$nama_kategori' WHERE kategori_id = '$id_kategori'";
    if (mysqli_query($conn, $query_update)) {
        $pesan = "<div class='alert success'>Kategori berhasil diperbarui!</div>";
    } else {
        $pesan = "<div class='alert error'>Gagal: " . mysqli_error($conn) . "</div>";
    }
}

if (isset($_GET['hapus_kat'])) {
    $id_hapus = mysqli_real_escape_string($conn, $_GET['hapus_kat']);
    if (mysqli_query($conn, "DELETE FROM kategori WHERE kategori_id = '$id_hapus'")) {
        $pesan = "<div class='alert success'>Kategori berhasil dihapus!</div>";
    }
}

// ==========================================
// 2. PROSES UPDATE & HAPUS BARANG
// ==========================================
if (isset($_POST['update_barang'])) {
    $id_barang = $_POST['barang_id'];
    $nama = mysqli_real_escape_string($conn, $_POST['nama']);
    $kategori_id = $_POST['kategori_id'];
    $harga = $_POST['harga'];
    $stock = $_POST['stock'];
    $gambar_lama = $_POST['gambar_lama'];

    if ($_FILES['gambar']['name'] != '') {
        $gambar = $_FILES['gambar']['name'];
        $tmp_name = $_FILES['gambar']['tmp_name'];
        $gambar_baru = rand(1000, 9999) . "_" . $gambar;
        move_uploaded_file($tmp_name, "../images/" . $gambar_baru);
    } else {
        $gambar_baru = $gambar_lama;
    }

    $query_update_brg = "UPDATE barang SET kategori_id = '$kategori_id', gambar = '$gambar_baru', nama = '$nama', harga = '$harga', stock = '$stock' WHERE barang_id = '$id_barang'";
    if (mysqli_query($conn, $query_update_brg)) {
        $pesan = "<div class='alert success'>Produk berhasil diperbarui!</div>";
    }
}

if (isset($_GET['hapus_brg'])) {
    $id_hapus = mysqli_real_escape_string($conn, $_GET['hapus_brg']);
    if (mysqli_query($conn, "DELETE FROM barang WHERE barang_id = '$id_hapus'")) {
        $pesan = "<div class='alert success'>Produk berhasil dihapus!</div>";
    }
}

// ==========================================
// KONFIGURASI PAGINATION & SEARCH
// ==========================================
$limit = 10; 

// Pagination Kategori
$search_kat = isset($_GET['s_kat']) ? mysqli_real_escape_string($conn, $_GET['s_kat']) : '';
$page_kat   = isset($_GET['p_kat']) ? (int)$_GET['p_kat'] : 1;
$start_kat  = ($page_kat > 1) ? ($page_kat * $limit) - $limit : 0;
$total_kat_res = mysqli_query($conn, "SELECT COUNT(*) AS total FROM kategori WHERE kategori_name LIKE '%$search_kat%'");
$total_kat_pages = ceil(mysqli_fetch_assoc($total_kat_res)['total'] / $limit);

// Pagination Barang
$search_brg = isset($_GET['s_brg']) ? mysqli_real_escape_string($conn, $_GET['s_brg']) : '';
$page_brg   = isset($_GET['p_brg']) ? (int)$_GET['p_brg'] : 1;
$start_brg  = ($page_brg > 1) ? ($page_brg * $limit) - $limit : 0;
$total_brg_res = mysqli_query($conn, "SELECT COUNT(*) AS total FROM barang WHERE nama LIKE '%$search_brg%'");
$total_brg_pages = ceil(mysqli_fetch_assoc($total_brg_res)['total'] / $limit);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Data - Dashboard Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/index_admin.css">
    <link rel="stylesheet" href="../css/edit_admin.css">
    <style>
        .table-header-tool { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: #f8fafc; border-bottom: 1px solid #e1e5eb; }
        .search-box input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; width: 250px; outline: none; }
        .pagination { display: flex; gap: 5px; padding: 1.5rem 2rem; justify-content: center; background: white; }
        .pagination a { padding: 8px 14px; border: 1px solid #ddd; text-decoration: none; color: #333; border-radius: 4px; font-size: 0.9rem; }
        .pagination a.active { background: #0284c7; color: white; border-color: #0284c7; }
        .alert { padding: 1rem; margin-bottom: 1rem; border-radius: 8px; font-weight: 500; text-align: center; }
        .success { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .error { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 600; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
        .form-group input[readonly] { background-color: #f1f5f9; color: #64748b; cursor: not-allowed; }
        .btn-submit { padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; text-align: center; }
        .btn-cancel { padding: 10px 20px; background: #64748b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; flex: 1; text-align: center; text-decoration: none; }
        .btn-submit:hover { background: #0369a1; }
        .btn-cancel:hover { background: #475569; }
        .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    </style>
</head>
<body>

    <aside class="sidebar">
        <div class="sidebar-brand"><h2>Admin<br>Warung RMB</h2></div>
        <ul class="nav-menu">
            <li><a href="index_admin.php">Dashboard Utama</a></li>
            <li><a href="tambah_admin.php">Tambah Data</a></li>
            <li class="active"><a href="edit_admin.php">Edit Data</a></li>
            <li style="margin-top: 2rem; border-top: 1px solid #e1e5eb; padding-top: 1rem;"></li>
            <li><a href="logout.php" style="color: #dc2626; font-weight: 600;">Keluar (Logout)</a></li>
        </ul>
    </aside>

    <main class="main-content">
        <div class="header-title">
            <h1>Manajemen Data</h1>
            <p style="color: #777;">Kelola kategori dan produk Anda.</p>
        </div>

        <?php echo $pesan; ?>

        <!-- ========================================== -->
        <!-- 1. AREA FORM EDIT (KATEGORI) -->
        <!-- ========================================== -->
       <?php if (isset($_GET['edit_kat'])): 
            $id_edit_kat = mysqli_real_escape_string($conn, $_GET['edit_kat']);
            $data_kat = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM kategori WHERE kategori_id = '$id_edit_kat'"));
        ?>
           <div class="card-edit-kategori">
                <h3>✎ Edit Kategori</h3>
                <form action="edit_admin.php" method="POST" class="form-inline">
                    <div class="form-group">
                        <label>ID Kategori (Read only)</label>
                        <input type="text" name="kategori_id" value="<?php echo $data_kat['kategori_id']; ?>" readonly style="width: 60px;">
                    </div>
                    <div class="form-group">
                        <label>Nama Kategori</label>
                        <input type="text" name="kategori_name" value="<?php echo $data_kat['kategori_name']; ?>" required style="width: 250px;">
                    </div>
                    <div class="form-actions">
                        <button type="submit" name="update_kategori" class="btn-submit">Simpan</button>
                        <a href="edit_admin.php" class="btn-cancel">Batal</a>
                    </div>
                </form>
            </div>
        <?php endif; ?>

        <!-- ========================================== -->
        <!-- 2. AREA FORM EDIT (BARANG) -->
        <!-- ========================================== -->
        <?php if (isset($_GET['edit_brg'])): 
            $id_edit_brg = mysqli_real_escape_string($conn, $_GET['edit_brg']);
            $data_brg = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM barang WHERE barang_id = '$id_edit_brg'"));
        ?>
           <div class="form-edit-produk-container">
                <h3>✎ Edit Produk: <?php echo $data_brg['nama']; ?></h3>
                <form action="edit_admin.php" method="POST" enctype="multipart/form-data">
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>ID Produk (Read only)</label>
                            <input type="text" name="barang_id" value="<?php echo $data_brg['barang_id']; ?>" readonly>
                        </div>
                        <div class="form-group">
                            <label>Nama Produk</label>
                            <input type="text" name="nama" value="<?php echo $data_brg['nama']; ?>" required>
                        </div>
                    </div>

                    <input type="hidden" name="gambar_lama" value="<?php echo $data_brg['gambar']; ?>">
                    
                    <div class="form-group">
                        <label>Kategori</label>
                        <select name="kategori_id">
                            <?php 
                            $kats = mysqli_query($conn, "SELECT * FROM kategori");
                            while($k = mysqli_fetch_assoc($kats)){
                                $sel = ($k['kategori_id'] == $data_brg['kategori_id']) ? 'selected' : '';
                                echo "<option value='{$k['kategori_id']}' $sel>{$k['kategori_name']}</option>";
                            }
                            ?>
                        </select>
                    </div>

                    <div class="grid-form">
                        <div class="form-group">
                            <label>Harga (Won)</label>
                            <input type="number" name="harga" value="<?php echo $data_brg['harga']; ?>" required>
                        </div>
                        <div class="form-group">
                            <label>Stock</label>
                            <input type="number" name="stock" value="<?php echo $data_brg['stock']; ?>" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Ganti Gambar (Opsional)</label>
                        <input type="file" name="gambar">
                    </div>

                    <div class="form-actions">
                        <button type="submit" name="update_barang" class="btn-submit">Simpan</button>
                        <a href="edit_admin.php" class="btn-cancel">Batal</a>
                    </div>
                </form>
            </div>
        <?php endif; ?>

        <!-- ========================================== -->
        <!-- 3. TABEL DAFTAR KATEGORI -->
        <!-- ========================================== -->
        <div class="card" style="margin-bottom: 2rem; padding: 0; overflow: hidden;">
            <div class="table-header-tool">
                <h3 style="margin: 0; font-size: 1.1rem;">Daftar Kategori</h3>
                <div class="search-box">
                    <input type="text" id="inputKategori" placeholder="Cari kategori..." onkeyup="liveSearch('inputKategori', 'tabelKategori', 1)">
                </div>
            </div>
            <table class="data-table" id="tabelKategori">
                <thead>
                    <tr><th width="15%">ID</th><th width="55%">Nama Kategori</th><th width="30%">Aksi</th></tr>
                </thead>
                <tbody>
                    <?php
                    $res_kat = mysqli_query($conn, "SELECT * FROM kategori WHERE kategori_name LIKE '%$search_kat%' ORDER BY kategori_id DESC LIMIT $start_kat, $limit");
                    while ($row = mysqli_fetch_assoc($res_kat)) {
                        echo "<tr>
                                <td style='padding-left: 2rem;'>{$row['kategori_id']}</td>
                                <td style='font-weight: 500;'>".ucfirst($row['kategori_name'])."</td>
                                <td>
                                    <a href='edit_admin.php?edit_kat={$row['kategori_id']}' class='btn-action btn-edit'>Edit</a>
                                    <a href='edit_admin.php?hapus_kat={$row['kategori_id']}' class='btn-action btn-delete' onclick='return confirm(\"Hapus kategori ini?\")'>Hapus</a>
                                </td>
                              </tr>";
                    }
                    ?>
                </tbody>
            </table>
            <div class="pagination">
                <?php for($i=1; $i<=$total_kat_pages; $i++): ?>
                    <a href="?p_kat=<?php echo $i; ?>&s_kat=<?php echo $search_kat; ?>" class="<?php if($page_kat == $i) echo 'active'; ?>"><?php echo $i; ?></a>
                <?php endfor; ?>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- 4. TABEL DAFTAR BARANG -->
        <!-- ========================================== -->
        <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-header-tool">
                <h3 style="margin: 0; font-size: 1.1rem;">Daftar Barang (Produk)</h3>
                <div class="search-box">
                    <input type="text" id="inputBarang" placeholder="Cari nama produk..." onkeyup="liveSearch('inputBarang', 'tabelBarang', 2)">
                </div>
            </div>
            <table class="data-table" id="tabelBarang">
                <thead>
                    <tr>
                        <th width="10%">ID</th>
                        <th width="10%">Gambar</th>
                        <th width="25%">Nama Produk</th>
                        <th width="15%">Kategori</th>
                        <th width="10%">Harga</th>
                        <th width="10%">Stock</th>
                        <th width="20%">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $query_brg = "SELECT barang.*, kategori.kategori_name FROM barang 
                                  LEFT JOIN kategori ON barang.kategori_id = kategori.kategori_id
                                  WHERE barang.nama LIKE '%$search_brg%'
                                  ORDER BY barang.barang_id DESC LIMIT $start_brg, $limit";
                    $res_brg = mysqli_query($conn, $query_brg);

                    if(mysqli_num_rows($res_brg) > 0) {
                        while ($row = mysqli_fetch_assoc($res_brg)) {
                            $harga_rp = "₩" . number_format($row['harga'], 0, ',', '.');
                            $img = !empty($row['gambar']) ? "../images/{$row['gambar']}" : "../images/default.png";
                            echo "<tr>
                                    <td style='padding-left: 2rem;'>{$row['barang_id']}</td>
                                    <td><img src='$img' style='width:50px; height:50px; object-fit:cover; border-radius:4px;'></td>
                                    <td style='color: #1a1a1a; font-weight: 500;'>{$row['nama']}</td>
                                    <td>{$row['kategori_name']}</td>
                                    <td>{$harga_rp}</td>
                                    <td>{$row['stock']}</td>
                                    <td>
                                        <a href='edit_admin.php?edit_brg={$row['barang_id']}' class='btn-action btn-edit'>Edit</a>
                                        <a href='edit_admin.php?hapus_brg={$row['barang_id']}' class='btn-action btn-delete' onclick='return confirm(\"Hapus produk ini?\")'>Hapus</a>
                                    </td>
                                  </tr>";
                        }
                    } else {
                        echo "<tr><td colspan='7' style='text-align:center; padding:2rem;'>Data tidak ditemukan.</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
            <div class="pagination">
                <?php for($j=1; $j<=$total_brg_pages; $j++): ?>
                    <a href="?p_brg=<?php echo $j; ?>&s_brg=<?php echo $search_brg; ?>" class="<?php if($page_brg == $j) echo 'active'; ?>"><?php echo $j; ?></a>
                <?php endfor; ?>
            </div>
        </div>
    </main>

    <script src="../js/edit_admin.js"></script>
</body>
</html>