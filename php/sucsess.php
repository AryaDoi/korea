<?php
session_start();
include 'konek.php';

$id_order = isset($_GET['id']) ? mysqli_real_escape_string($conn, $_GET['id']) : null;
if (!$id_order) { die("ID Pesanan tidak ditemukan."); }

$query = mysqli_query($conn, "SELECT * FROM pesanan WHERE id_pesanan = '$id_order'");
$data = mysqli_fetch_assoc($query);

if ($data) {
    $no_pesanan = "#RMB-" . str_pad($data['id_pesanan'], 5, "0", STR_PAD_LEFT);
    $total_bayar = $data['total_bayar'];
} else {
    die("Data tidak ditemukan.");
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesanan Berhasil - Warung RMB</title>

    <link rel="stylesheet" href="../css/sucsess.css">
    
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>


    <header class="navbar" style="display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 0 40px !important; box-sizing: border-box !important; height: 90px !important; position: relative !important; width: 100% !important;">
        
        <div class="logo" style="display: flex !important; justify-content: flex-start !important; align-items: center !important;">
            <a href="index.php" style="text-decoration: none; color: inherit; display: flex; align-items: center; gap: 16px;">
                <img src="../images/logo.png" alt="Logo Warung RMB" style="height: 75px !important; width: auto !important; display: block !important; object-fit: contain !important; margin: 0 !important;">
                <div class="logo-text">
                    <h1 style="margin: 0; line-height: 1.2;">Warung RMB</h1>
                    <span style="font-size: 10px; letter-spacing: 1px;">RAMAH · MURAH · BERKAH</span>
                </div>
            </a>
        </div>

       <nav class="nav-links" style="display: flex !important; gap: 30px !important; position: absolute !important; left: 50% !important; transform: translateX(-50%) !important; white-space: nowrap !important; align-items: center !important;">
            <a href="katalog.php" class="navbar-custom-link">Katalog</a>
            <a href="https://wa.me/+821043282503" target="_blank" class="navbar-custom-link">Hubungi Kami</a>
        </nav>

        <div class="nav-right-placeholder" style="width: 150px; flex-shrink: 0;"></div>

    </header>

    <main class="wrapper">
        <div class="check-container">
            <div class="check-icon">✓</div>
        </div>

        <h1 class="main-title">Pesanan Masuk!</h1>
        
        <p class="desc">
            Terima kasih telah berbelanja di Warung RMB. Silakan lakukan pembayaran melalui QRIS di bawah. 
        <strong>Jika sudah transfer, mohon kirimkan screenshot halaman ini dan bukti pembayaran</strong> 
        ke WhatsApp kami agar pesanan segera diproses.
        </p>

        <!-- QRIS Area -->
        <div class="qris-display">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WarungRMB-<?php echo $no_pesanan; ?>" alt="QRIS">
            <p>Scan untuk membayar</p>
        </div>

        <!-- Info Card -->
        <div class="info-card">
            <div class="info-row">
                <span>No. Pesanan</span>
                <span class="text-right"><?php echo $no_pesanan; ?></span>
            </div>
            <div class="info-row">
                <span>Total Pembayaran</span>
                <span class="text-right">₩<?php echo number_format($total_bayar, 0, ',', '.'); ?></span>
            </div>
            <div class="info-row">
                <span>Estimasi Tiba</span>
                <span class="text-right">10–14 hari kerja</span>
            </div>
            <div class="info-row">
                <span>Kontak</span>
                <span class="text-right">+82 10-8107-7102</span>
            </div>
        </div>

        <!-- Buttons -->
        <div class="btn-group">
            <a href="katalog.php" class="btn btn-black">Belanja Lagi</a>
            <?php $wa_link = "https://wa.me/6285863144773?text=" . urlencode("Halo, saya konfirmasi pesanan " . $no_pesanan); ?>
            <a href="<?php echo $wa_link; ?>" class="btn btn-outline" target="_blank">WhatsApp</a>
        </div>

        <p class="footer-hint">*Pesanan akan otomatis dibatalkan jika tidak ada konfirmasi bukti pembayaran dalam 1x24 jam. </p>
    </main>

</body>
</html>