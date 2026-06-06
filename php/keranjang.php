<?php
    session_start();
    include 'konek.php';


    if (isset($_GET['action']) && isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        
        if (isset($_SESSION['cart'][$id])) {
            if ($_GET['action'] == 'plus') {
                $_SESSION['cart'][$id]++;
            } elseif ($_GET['action'] == 'minus') {
                $_SESSION['cart'][$id]--;
        
                if ($_SESSION['cart'][$id] <= 0) {
                    unset($_SESSION['cart'][$id]);
                }
            } elseif ($_GET['action'] == 'remove') {
                // Hapus barang sepenuhnya
                unset($_SESSION['cart'][$id]);
            }
        }
        
        header("Location: keranjang.php");
        exit();
    }

    $total_cart = 0;
    if (isset($_SESSION['cart'])) {
        $total_cart = array_sum($_SESSION['cart']);
    }
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keranjang - Warung RMB</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;0,800;1,700;1,800&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../css/katalog.css">
    <link rel="stylesheet" href="../css/keranjang.css">
    <link rel="stylesheet" href="../css/checkout.css">

</head>
<body style="background-color: #f9f9f9; overflow-y: auto;">

    <header class="navbar" style="display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 40px !important; box-sizing: border-box !important;">
        
        <div class="logo" style="flex: 1 !important; display: flex !important; justify-content: flex-start !important;">
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px;">
                <img src="../images/logo.png" alt="Logo Warung RMB" style="height: 75px !important; width: auto !important; display: block !important; object-fit: contain !important;">
                <div class="logo-text">
                    <h1 style="margin: 0; line-height: 1.2;">Warung RMB</h1>
                    <span style="font-size: 10px; letter-spacing: 1px;">RAMAH · MURAH · BERKAH</span>
                </div>
            </a>
        </div>

        <nav class="nav-links">
            <a href="katalog.php">Katalog</a>
            <a href="https://wa.me/+821043282503" target="_blank">Hubungi Kami</a>
        </nav>

        <div class="nav-actions" style="flex: 1 !important; display: flex !important; justify-content: flex-end !important;">
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

    <!-- Konten Halaman Keranjang -->
    <main class="cart-container">

        <div class="cart-header-title">
            <h1 class="main-title">Keranjang</h1>
            <p class="sub-title"><?php echo $total_cart; ?> item dalam keranjangmu</p>
        </div>
        
        <div class="cart-layout">
            
            <!-- Sisi Kiri: Daftar Produk -->
            <div class="cart-left">
                <div class="cart-box">
                    <div class="cart-table-header">
                        <span class="col-produk">PRODUK</span>
                        <span class="col-jumlah" style="text-align: center;">JUMLAH</span>
                        <span class="col-subtotal" style="text-align: right; margin-right: 30px;">SUBTOTAL</span>
                    </div>

                    <?php
                    $total_belanja = 0;

                    if (!empty($_SESSION['cart'])) {
                        
                        foreach ($_SESSION['cart'] as $id_barang => $jumlah) {
                            
                            // Query diubah memakai JOIN untuk mengambil nama kategori
                            $query_cart = "SELECT barang.*, kategori.kategori_name 
                                           FROM barang 
                                           LEFT JOIN kategori ON barang.kategori_id = kategori.kategori_id 
                                           WHERE barang.barang_id = $id_barang";
                            $result_cart = mysqli_query($conn, $query_cart);
                            
                            if ($row_cart = mysqli_fetch_assoc($result_cart)) {
                                $subtotal = $row_cart['harga'] * $jumlah;
                                $total_belanja += $subtotal; 
                                
                                $harga_format = number_format($row_cart['harga'], 0, ',', '.');
                                $subtotal_format = number_format($subtotal, 0, ',', '.');
                                ?>
                                
                                <!-- Baris Produk Sesuai Desain Baru -->
                                <div class="cart-item-row">
                                    <div class="col-produk cart-item-info">
                                        <div class="cart-item-img">
                                            <?php 
                                                $gambar = $row_cart['gambar'];
                                                if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $gambar)) {
                                                    echo '<img src="../images/' . $gambar . '" alt="' . $row_cart['nama'] . '">';
                                                } else {
                                                    echo '<span style="font-size: 2.5rem;">' . $gambar . '</span>'; 
                                                }
                                            ?>
                                        </div>
                                        <div>
                                            <h4><?php echo $row_cart['nama']; ?></h4>
                                            <!-- Menampilkan Kategori dan Harga Satuan -->
                                            <span class="cart-item-meta">
                                                <?php echo ucfirst($row_cart['kategori_name']); ?> · ₩<?php echo $harga_format; ?> / item
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- Kontrol Jumlah (+ / -) -->
                                    <div class="col-jumlah">
                                        <div class="qty-controls">
                                            <a href="keranjang.php?action=minus&id=<?php echo $id_barang; ?>" class="qty-btn" data-no-animation>-</a>
                                            
                                            <span class="qty-number" style="margin: 0 15px; font-weight: 600;"><?php echo $jumlah; ?></span>
                                            
                                            <?php if ($jumlah < $row_cart['stock']): ?>
                                                <a href="keranjang.php?action=plus&id=<?php echo $id_barang; ?>" class="qty-btn" data-no-animation>+</a>
                                            <?php else: ?>
                                                <span class="qty-btn" style="color: #ccc; cursor: not-allowed; padding: 0 10px;">+</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    
                                    <!-- Subtotal & Tombol Hapus (x) -->
                                    <div class="col-subtotal cart-item-actions">
                                        <span class="cart-item-subtotal">₩<?php echo $subtotal_format; ?></span>
                                        <a href="keranjang.php?action=remove&id=<?php echo $id_barang; ?>" class="remove-btn" title="Hapus item">&times;</a>
                                    </div>
                                </div>

                                <?php
                            }
                        }
                    } else {
                        ?>
                        <div class="cart-empty-state">
                            <div class="empty-icon">🛒</div>
                            <p>Keranjangmu kosong.<br>Yuk mulai belanja!</p>
                        </div>
                        <?php
                    }
                    ?>
                </div>

                <a href="katalog.php" class="btn-lanjut-belanja">← Lanjut Belanja</a>
            </div>

            <!-- Sisi Kanan: Ringkasan Pesanan -->
            <div class="cart-right">
                <div class="summary-box">
                    <h3>Ringkasan Pesanan</h3>
                    
                    <?php
                        $ongkir = ($total_belanja > 0) ? 5000 : 0;
                        $total_akhir = $total_belanja + $ongkir;
                    ?>

                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>₩<?php echo number_format($total_belanja, 0, ',', '.'); ?></span>
                    </div>
                    <div class="summary-row">
                        <span>Ongkir (estimasi)</span>
                        <span>₩<?php echo number_format($ongkir, 0, ',', '.'); ?></span>
                    </div>
                    <div class="summary-total">
                        <span>Total</span>
                        <span class="total-price">₩<?php echo number_format($total_akhir, 0, ',', '.'); ?></span>
                    </div>

                    <a href="checkout.php" style="text-decoration: none;">
                            <button class="btn-checkout">→ Lanjut ke Checkout</button>
                    </a>

                    <div class="trust-badges">
                        <span>🛡️ Aman</span>
                        <span>🔒 Terenkripsi</span>
                        <span>✔️ Terpercaya</span>
                    </div>
                </div>
            </div>

        </div>
    </main>

</body>
</html>