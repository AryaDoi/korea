<?php 
    session_start();
    include 'konek.php'; 

    // 1. LOGIKA TAMBAH KE KERANJANG
    if (isset($_GET['action']) && $_GET['action'] == 'add') {
        $id_barang = (int)$_GET['id'];
        
        // Cek stok di database terlebih dahulu
        $cek_stok = mysqli_query($conn, "SELECT stock FROM barang WHERE barang_id = $id_barang");
        $data_stok = mysqli_fetch_assoc($cek_stok);
        
        // Dapatkan jumlah saat ini di sesi (default 0 jika belum ada)
        $jumlah_di_cart = isset($_SESSION['cart'][$id_barang]) ? $_SESSION['cart'][$id_barang] : 0;
        
        // Hanya tambah jika stok masih cukup
        if ($data_stok['stock'] > $jumlah_di_cart) {
            $_SESSION['cart'][$id_barang] = $jumlah_di_cart + 1;
        } else {
            echo "<script>alert('Maaf, stok barang habis!'); window.location='katalog.php';</script>";
            exit;
        }
        
        $redirect_url = "katalog.php";
        $queryParams = [];
        if (isset($_GET['kategori']) && (int)$_GET['kategori'] > 0) {
            $queryParams[] = "kategori=" . (int)$_GET['kategori'];
        }
        if (isset($_GET['search']) && !empty($_GET['search'])) {
            $queryParams[] = "search=" . urlencode($_GET['search']);
        }
        
        if (count($queryParams) > 0) {
            $redirect_url .= "?" . implode("&", $queryParams);
        }
        
        header("Location: " . $redirect_url);
        exit();
    }

    $total_cart = (isset($_SESSION['cart'])) ? array_sum($_SESSION['cart']) : 0;

    // 2. LOGIKA FILTER & SEARCH
    $kategori_filter = isset($_GET['kategori']) ? (int)$_GET['kategori'] : 0;
    $search_query = isset($_GET['search']) ? mysqli_real_escape_string($conn, $_GET['search']) : '';

    $query = "SELECT barang.*, kategori.kategori_name 
              FROM barang 
              JOIN kategori ON barang.kategori_id = kategori.kategori_id WHERE 1=1";

    if ($kategori_filter > 0) {
        $query .= " AND barang.kategori_id = $kategori_filter";
    }
    if (!empty($search_query)) {
        $query .= " AND barang.nama LIKE '%$search_query%'";
    }
    
    $result_produk = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Katalog - Warung RMB</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/katalog.css">
    <link rel="stylesheet" href="../css/animasi.css">
</head>
<body>

   <header class="navbar" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 0 40px !important; box-sizing: border-box !important; height: 90px !important;">
        
        <div class="logo" style="flex: 1 !important; display: flex !important; justify-content: flex-start !important; align-items: center !important;">
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px;">
                <img src="../images/logo.png" alt="Logo Warung RMB" style="height: 75px !important; width: auto !important; display: block !important; object-fit: contain !important; margin: 0 !important;">
                <div class="logo-text" style="display: flex !important; flex-direction: column !important;">
                    <h1 style="margin: 0; line-height: 1.2;">Warung RMB</h1>
                    <span style="font-size: 10px; letter-spacing: 1px;">RAMAH · MURAH · BERKAH</span>
                </div>
            </a>
        </div>

        <nav class="nav-links" style="flex: 1 !important; display: flex !important; justify-content: center !important; align-items: center !important; gap: 30px !important; position: static !important;">
            <a href="katalog.php" class="navbar-custom-link">Katalog</a>
            <a href="https://wa.me/+821043282503" target="_blank" class="navbar-custom-link">Hubungi Kami</a>
        </nav>

        <div class="nav-actions" style="flex: 1 !important; display: flex !important; justify-content: flex-end !important; align-items: center !important; gap: 20px !important;">
            
            <form action="katalog.php" method="GET" style="display: flex !important; width: 300px !important; position: relative !important; margin: 0 !important;">
                <?php if ($kategori_filter > 0): ?>
                    <input type="hidden" name="kategori" value="<?php echo $kategori_filter; ?>">
                <?php endif; ?>
                <input type="text" name="search" placeholder="Cari menu..." value="<?php echo htmlspecialchars($search_query); ?>" style="width: 100% !important; padding: 8px 16px !important; padding-right: 35px !important; border: 1px solid #ddd !important; border-radius: 20px !important; font-size: 0.85rem !important; outline: none !important;">
                <button type="submit" style="position: absolute !important; right: 12px !important; top: 50% !important; transform: translateY(-50%) !important; background: none !important; border: none !important; cursor: pointer !important; color: #666 !important; display: flex !important; align-items: center !important;">
                    <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </button>
            </form>

            <a href="keranjang.php" class="cart-btn" style="text-decoration: none !important; display: flex !important; align-items: center !important; flex-shrink: 0 !important;">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 20px; height: 20px; margin-right: 8px;">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="cart-text">Keranjang</span>
                <span class="cart-badge" style="margin-left: 6px;"><?php echo $total_cart; ?></span>
            </a>
        </div>

    </header>

    <div class="katalog-container">
        
        <aside class="katalog-sidebar">
            <div class="sidebar-group">
                <h4>KATEGORI</h4>
                <ul class="cat-list">
                    <li class="<?php echo ($kategori_filter == 0) ? 'active' : ''; ?>">
                        <a href="katalog.php" class="cat-link">Semua</a>
                    </li>
                    
                    <?php
                    $res_kat = mysqli_query($conn, "SELECT * FROM kategori");
                    while($row_kat = mysqli_fetch_assoc($res_kat)) {
                        $active_class = ($kategori_filter == $row_kat['kategori_id']) ? 'active' : '';
                        $search_param = !empty($search_query) ? "&search=".urlencode($search_query) : "";
                        echo "<li class='$active_class'>
                                <a href='katalog.php?kategori={$row_kat['kategori_id']}$search_param' class='cat-link'>
                                    ".ucfirst($row_kat['kategori_name'])."
                                </a>
                              </li>";
                    }
                    ?>
                </ul>
            </div>
        </aside>

        <main class="katalog-main">
            <div class="product-grid">
                <?php
                if ($result_produk && mysqli_num_rows($result_produk) > 0) {
                    while($row = mysqli_fetch_assoc($result_produk)) {
                        ?>
                        <div class="product-card">
                            <div class="card-image-area">
                                <span class="badge <?php echo ($row['stock'] <= 0) ? 'badge-out' : ''; ?>">
                                    <?php echo ($row['stock'] > 0) ? 'READY' : 'HABIS'; ?>
                                </span>
                                <img src="../images/<?php echo $row['gambar']; ?>" alt="<?php echo $row['nama']; ?>">
                            </div>

                            <div class="card-info">
                                <span class="cat-label"><?php echo strtoupper($row['kategori_name']); ?></span>
                                <h3 class="product-title"><?php echo $row['nama']; ?></h3>
                                
                                <div class="price-row">
                                    <span class="price">₩<?php echo number_format($row['harga'], 0, ',', '.'); ?></span>
                                    <?php if ($row['stock'] > 0): ?>
                                        <a href="katalog.php?action=add&id=<?php echo $row['barang_id']; ?><?php echo ($kategori_filter > 0 ? '&kategori='.$kategori_filter : ''); ?><?php echo (!empty($search_query) ? '&search='.urlencode($search_query) : ''); ?>" data-no-animation>
                                            <button class="add-to-cart">+</button>
                                        </a>
                                    <?php else: ?>
                                        <button class="add-to-cart" disabled style="background-color: #ccc; cursor: not-allowed;">+</button>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                        <?php
                    }
                } else {
                    echo "<div class='empty-search-container'>
                            <div style='font-size: 3rem; margin-bottom: 10px;'>📦</div>
                            <p>Produk tidak ditemukan.</p>
                            <span style='font-size: 0.9rem; color: #bbb; margin-top: 10px;'>
                                Tidak ada hasil untuk \"" . htmlspecialchars($search_query) . "\"
                            </span>
                          </div>";
                }
                ?>
            </div>
        </main>
    </div>
    <script src="../js/katalog.js"></script>
</body>
</html>