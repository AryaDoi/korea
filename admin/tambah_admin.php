<?php
session_start();
include '../php/konek.php';

// CEK APAKAH ADMIN SUDAH LOGIN
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login_admin.php");
    exit();
}

$pesan = '';

// Ambil ID berikutnya untuk tampilan informasi
$q_last_kat = mysqli_query($conn, "SELECT MAX(kategori_id) as last_id FROM kategori");
$next_kat = (mysqli_fetch_assoc($q_last_kat)['last_id'] > 0) ? mysqli_fetch_assoc($q_last_kat)['last_id'] + 1 : 1;

$q_last_brg = mysqli_query($conn, "SELECT MAX(barang_id) as last_id FROM barang");
$next_brg = (mysqli_fetch_assoc($q_last_brg)['last_id'] > 0) ? mysqli_fetch_assoc($q_last_brg)['last_id'] + 1 : 1;

// ==========================================
// 1. LOGIKA UNTUK MENAMBAH KATEGORI
// ==========================================
if (isset($_POST['tambah_kategori'])) {
    $nama_kategori = mysqli_real_escape_string($conn, $_POST['kategori_name']);
    
    // ID otomatis (A_I) dari database
    $query_kat = "INSERT INTO kategori (kategori_name) VALUES ('$nama_kategori')";
    if (mysqli_query($conn, $query_kat)) {
        $pesan = "<div class='alert success'>Kategori <b>$nama_kategori</b> berhasil ditambahkan!</div>";
        // Refresh ID berikutnya setelah simpan
        $next_kat++;
    } else {
        $pesan = "<div class='alert error'>Gagal menambah kategori: " . mysqli_error($conn) . "</div>";
    }
}

// ==========================================
// 2. LOGIKA UNTUK MENAMBAH BARANG
// ==========================================
if (isset($_POST['tambah_barang'])) {
    $nama = mysqli_real_escape_string($conn, $_POST['nama']);
    $kategori_id = mysqli_real_escape_string($conn, $_POST['kategori_id']);
    $harga = (int)$_POST['harga'];
    $stock = (int)$_POST['stock'];

    if ($harga < 0 || $stock < 0) {
        $pesan = "<div class='alert error'>Harga atau Stok tidak boleh negatif!</div>";
    } else {
        $gambar = $_FILES['gambar']['name'];
        $tmp_name = $_FILES['gambar']['tmp_name'];
        $folder_tujuan = "../images/";
        $gambar_baru = rand(1000, 9999) . "_" . $gambar;
        
        if (move_uploaded_file($tmp_name, $folder_tujuan . $gambar_baru)) {
            // ID Barang otomatis (A_I)
            $query_barang = "INSERT INTO barang (kategori_id, gambar, nama, harga, stock) 
                             VALUES ('$kategori_id', '$gambar_baru', '$nama', '$harga', '$stock')";
                             
            if (mysqli_query($conn, $query_barang)) {
                $pesan = "<div class='alert success'>Produk <b>$nama</b> berhasil disimpan!</div>";
                // Refresh ID berikutnya setelah simpan
                $next_brg++;
            } else {
                $pesan = "<div class='alert error'>Database Error: " . mysqli_error($conn) . "</div>";
            }
        } else {
            $pesan = "<div class='alert error'>Gagal upload gambar. Cek folder <b>'images'</b>.</div>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin - Warung RMB</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/tambah_admin.css">
</head>
<body>

    <aside class="sidebar">
        <div class="sidebar-brand">
            <h2>Admin<br>Warung RMB</h2>
        </div>
        <ul class="nav-menu">
            <li><a href="index_admin.php">Dashboard Utama</a></li>
            <li class="active"><a href="tambah_admin.php">Tambah Data</a></li> 
            <li><a href="edit_admin.php">Edit Data</a></li>
            <li style="margin-top: 2rem; border-top: 1px solid #e1e5eb; padding-top: 1rem;">
            <li><a href="logout.php" style="color: #dc2626; font-weight: 600;">Keluar (Logout)</a></li>
        </ul>
    </aside>

    <main class="main-content">
        <div class="header-title">
            <h1>Tambah Data Produk</h1>
            <p style="color: #777;">Kelola kategori dan inventaris produk Anda secara otomatis.</p>
        </div>

        <?php echo $pesan; ?>

        <div class="grid-container">
            <div class="card">
                <h3>+ Tambah Kategori</h3>
                <form action="" method="POST">
                    <div class="form-group">
                        <label>Nama Kategori</label>
                        <input type="text" name="kategori_name" placeholder="Misal: Snack Korea" required>
                    </div>
                    <button type="submit" name="tambah_kategori" class="btn-submit">Simpan Kategori</button>
                </form>
            </div>

            <div class="card">
                <h3>+ Tambah Produk Baru</h3>
                <form action="" method="POST" enctype="multipart/form-data">
                    <div class="form-group">
                        <label>Nama Produk</label>
                        <input type="text" name="nama" placeholder="Nama barang..." required>
                    </div>
                    <div class="form-group">
                        <label>Kategori</label>
                        <select name="kategori_id" required>
                            <option value="">-- Pilih Kategori --</option>
                            <?php
                            $r_kat = mysqli_query($conn, "SELECT * FROM kategori ORDER BY kategori_id ASC");
                            while ($row_kat = mysqli_fetch_assoc($r_kat)) {
                                echo "<option value='{$row_kat['kategori_id']}'>[{$row_kat['kategori_id']}] {$row_kat['kategori_name']}</option>";
                            }
                            ?>
                        </select>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <div class="form-group" style="flex: 1;">
                            <label>Harga (₩)</label>
                            <input type="number" name="harga" min="0" required>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Stok</label>
                            <input type="number" name="stock" min="0" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Foto Produk</label>
                        <input type="file" name="gambar" accept="image/*" required>
                    </div>
                    <button type="submit" name="tambah_barang" class="btn-submit">Simpan & Upload</button>
                </form>
            </div>
        </div>
    </main>
</body>
</html>