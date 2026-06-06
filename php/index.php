<?php
session_start();
include 'konek.php'; 

// 1. Logika Keranjang (Navbar)
$total_cart = 0;
if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
    $total_cart = array_sum($_SESSION['cart']);
}

// 2. Ambil Data Statistik Real-time dari Database
$query_produk = mysqli_query($conn, "SELECT COUNT(*) as total FROM barang");
$data_produk = mysqli_fetch_assoc($query_produk);
$total_produk = $data_produk['total'];

// Hitung Total Kategori (Ambil dari tabel 'kategori' sesuai gambar database)
$query_kategori = mysqli_query($conn, "SELECT COUNT(*) as total FROM kategori");
$data_kategori = mysqli_fetch_assoc($query_kategori);
$total_kategori = $data_kategori['total'];
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Warung RMB - Jastip Indonesia Korea</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../css/index.css">

</head>
<body>

   <header class="navbar" style="display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 40px !important; box-sizing: border-box !important; height: 90px !important;">
            <a href="javascript:void(0)" class="admin-secret-btn"></a>            
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px;">
                <img src="../images/logo.png" alt="Logo Warung RMB" style="height: 75px !important; width: auto !important; display: block !important; object-fit: contain !important;">
                <div class="logo-text">
                    <h1 style="margin: 0; line-height: 1.2;">Warung RMB</h1>
                    <span style="font-size: 10px; letter-spacing: 1px;">RAMAH · MURAH · BERKAH</span>
                </div>
            </a>
        </div>

        <nav class="nav-links" style="display: flex !important; justify-content: center !important; gap: 30px !important; flex: 1 !important;">
            <a href="katalog.php">Katalog</a>
            <a href="https://wa.me/+821043282503" target="_blank">Hubungi Kami</a>
        </nav>
        
        <div class="nav-actions" style="display: flex !important; justify-content: flex-end !important; width: 300px !important;">
            <a href="keranjang.php" class="cart-btn" style="display: flex !important; align-items: center !important;">
                <svg class="cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span class="cart-text" style="margin-left: 10px;">Keranjang</span>
                <span class="cart-badge"><?php echo $total_cart; ?></span>
            </a>
        </div>
    </header>

    <main class="hero-container">
        
        <div class="hero-left">
            <div class="eyebrow">
                <span class="dot">●</span>  INDONESIA · KOREA ·  MART <span class="dot">●</span>
            </div>
            
            <h1 class="headline">
                Rasa rumah,<br>
                <span class="italic-gray">di mana pun</span><br>
                kamu berada.
            </h1>
            
            <p class="description">
                Cemilan, bumbu, dan kebutuhan sehari-hari khas Indonesia — Korea dengan harga terjangkau.
            </p>
            
            <div class="hero-buttons">
                <a href="katalog.php" class="btn btn-primary">
                    Jelajahi Katalog 
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            </div>
        </div>

        <div class="hero-right">
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-number"><?php echo number_format($total_produk, 0, ',', '.'); ?></span>
                    <span class="stat-label">Produk tersedia</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number"><?php echo number_format($total_kategori, 0, ',', '.'); ?></span>
                    <span class="stat-label">Kategori pilihan</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">24/7</span>
                    <span class="stat-label">Customer support</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">~2wk</span>
                    <span class="stat-label">Estimasi pengiriman</span>
                </div>
            </div>
        </div>
      
    </main>
    
<script src="../js/index.js"></script>
</body>
</html>