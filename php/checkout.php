<?php 
session_start();
include 'konek.php'; 

$total_belanja = 0;
$items_checkout = [];

if (isset($_SESSION['cart']) && !empty($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $id_barang => $jumlah) {
        $id_barang = mysqli_real_escape_string($conn, $id_barang);
        $query = mysqli_query($conn, "SELECT * FROM barang WHERE barang_id = '$id_barang'");
        if ($row = mysqli_fetch_assoc($query)) {
            $subtotal = $row['harga'] * $jumlah;
            $total_belanja += $subtotal;
            
            $row['qty'] = $jumlah;
            $row['subtotal_item'] = $subtotal;
            $items_checkout[] = $row;
        }
    }
} else {
    header("Location: katalog.php");
    exit();
}

$ongkir = 5000;
$total_akhir = $total_belanja + $ongkir;
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Warung RMB</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/checkout.css">

</head>
<body>

    <header class="navbar" style="display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; padding: 0 40px !important; box-sizing: border-box !important; height: 90px !important; width: 100% !important;">
        
        <div class="logo" style="flex: 1 !important; display: flex !important; justify-content: flex-start !important;">
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px;">
                <img src="../images/logo.png" alt="Logo Warung RMB" style="height: 75px !important; width: auto !important; display: block !important; object-fit: contain !important;">
                <div class="logo-text">
                    <h1 style="margin: 0; line-height: 1.2;">Warung RMB</h1>
                    <span style="font-size: 10px; letter-spacing: 1px;">RAMAH · MURAH · BERKAH</span>
                </div>
            </a>
        </div>

        <nav class="nav-links" style="flex: 1 !important; display: flex !important; justify-content: center !important; align-items: center !important; gap: 30px !important;">
            <a href="katalog.php" class="navbar-custom-link">Katalog</a>
            <a href="https://wa.me/+821043282503" target="_blank" class="navbar-custom-link">Hubungi Kami</a>
        </nav>
        
        <div class="nav-right" style="flex: 1 !important; display: flex !important; justify-content: flex-end !important; align-items: center !important;">
            <a href="keranjang.php" class="cart-btn" style="text-decoration: none !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; min-width: 150px !important; padding: 10px 24px !important; border-radius: 20px !important; box-sizing: border-box !important;">
                <div class="cart-content" style="display: flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; width: 100% !important;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0 !important;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0"></path></svg>
                    <span class="cart-text" style="font-weight: 500 !important;">Keranjang</span>
                </div>
            </a>
        </div>

     </header>

    <div class="checkout-container">
        <form action="proses-checkout.php" method="POST" class="checkout-grid">
            
            <div class="form-section">
                <h2 class="page-title">Checkout</h2>
                <h4>Lengkapi detail pengiriman & pembayaran</h4>
                
                <div class="card">
                    <div class="section-header">
                        <span class="step-number">1</span>
                        <h3>Identitas Penerima</h3>
                    </div>
                    <div class="input-grid">
                        <div class="full-width">
                            <label>Nama Lengkap</label>
                            <input type="text" name="nama_depan" placeholder="Masukkan nama penerima" required>
                        </div>
                   <div class="half-width" style="width: 100%; box-sizing: border-box;">
                        <label style="display: block; margin-bottom: 5px;">Nomor WhatsApp</label>
                        <div class="phone-input-group" style="display: flex; align-items: center; gap: 8px; width: 100%; box-sizing: border-box;">
                            
                            <select name="kode_negara" id="kode_negara" style="width: 80px; padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: #fff; flex-shrink: 0;">
                                <option value="+62">+62</option>
                                <option value="+82">+82</option>
                            </select>
                            
                            <input type="tel" 
                                name="nomor_wa" 
                                placeholder="8586314..." 
                                style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd; width: 100%; box-sizing: border-box;" 
                                pattern="[0-9]*" 
                                inputmode="numeric" 
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')" 
                                required>
                        </div>
                        <small style="color: #888; font-size: 0.75rem; margin-top: 4px; display: block;">
                            💡 Tanpa angka 0 di depan.
                        </small>
                    </div>
                        <div class="half-width">
                            <label>Email</label>
                            <input type="email" name="email" placeholder="email@contoh.com" required>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="section-header">
                        <span class="step-number">2</span>
                        <h3>Alamat Pengiriman (Korea Selatan)</h3>
                    </div>
                    <div class="input-grid">
                        <div class="full-width">
                            <label>Alamat Dasar (Jalan / Dong)</label>
                            <input type="text" name="alamat" placeholder="Contoh: Wongok-dong 123-4" required>
                        </div>
                        <div class="full-width">
                            <label>Detail Alamat (Gedung/Unit)</label>
                            <input type="text" name="detail_alamat" placeholder="Contoh: Apt. 101ho / Lt. 2 (Opsional)">
                        </div>
                        <div class="half-width">
                            <label>Kota / Distrik (Si/Gun/Gu)</label>
                            <input type="text" name="kota" placeholder="Contoh: Ansan-si" required>
                        </div>
                        <div class="half-width">
                            <label>Provinsi / Wilayah Khusus</label>
                            <select name="provinsi" onchange="toggleOther(this, 'other_provinsi')" required>
                                <option value="">Pilih wilayah...</option>
                                <option value="Seoul">Seoul</option>
                                <option value="Gyeonggi-do">Gyeonggi-do</option>
                                <option value="Incheon">Incheon</option>
                                <option value="Busan">Busan</option>
                                <option value="Daegu">Daegu</option>
                                <option value="Daejeon">Daejeon</option>
                                <option value="Gwangju">Gwangju</option>
                                <option value="Ulsan">Ulsan</option>
                                <option value="Gangwon-do">Gangwon-do</option>
                                <option value="Chungcheongbuk-do">Chungcheongbuk-do</option>
                                <option value="Chungcheongnam-do">Chungcheongnam-do</option>
                                <option value="Jeollabuk-do">Jeollabuk-do</option>
                                <option value="Jeollanam-do">Jeollanam-do</option>
                                <option value="Gyeongsangbuk-do">Gyeongsangbuk-do</option>
                                <option value="Gyeongsangnam-do">Gyeongsangnam-do</option>
                                <option value="Jeju-do">Jeju-do</option>
                                <option value="other">Lainnya (Isi Sendiri)</option>
                            </select>
                            <input type="text" id="other_provinsi" name="provinsi_manual" placeholder="Tulis nama provinsi..." class="manual-input">
                        </div>
                        <div class="half-width">
                            <label>Kode Pos</label>
                            <input type="text" name="kodepos" placeholder="Contoh: 15432" required>
                        </div>
                    </div>
                </div>


                <a href="keranjang.php" class="btn-back">← Kembali ke Keranjang</a>
            </div>

            <div class="summary-section">
                <div class="summary-card sticky-card">
                    <h3>Ringkasan Pesanan</h3>
                    <div class="items-scroll">
                        <?php foreach ($items_checkout as $item): ?>
                        <div class="summary-item-row">
                            <div class="item-img">
                                <img src="../images/<?php echo $item['gambar']; ?>" alt="produk">
                            </div>
                            <div class="item-info">
                                <strong><?php echo $item['nama']; ?></strong>
                                <span><?php echo $item['qty']; ?>x</span>
                            </div>
                            <div class="item-price">₩<?php echo number_format($item['subtotal_item'], 0, ',', '.'); ?></div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <div class="price-breakdown">
                        <div class="price-row">
                            <span>Subtotal</span>
                            <span>₩<?php echo number_format($total_belanja, 0, ',', '.'); ?></span>
                        </div>
                        <div class="price-row">
                            <span>Biaya Pengiriman</span>
                            <span>₩<?php echo number_format($ongkir, 0, ',', '.'); ?></span>
                        </div>
                        <hr>
                        <div class="price-row total">
                            <span>Total Pembayaran</span>
                            <span class="final-price">₩<?php echo number_format($total_akhir, 0, ',', '.'); ?></span>
                        </div>
                    </div>

                    <button type="submit" name="submit_checkout" class="btn-checkout">Konfirmasi Pesanan</button>
                    
                    <div class="secure-footer">
                        <span>🔒 Aman</span>
                        <span>🛡️ Terenkripsi</span>
                        <span>✅ Terpercaya</span>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <script src="../js/checkout.js"></script>
</body>
</html>