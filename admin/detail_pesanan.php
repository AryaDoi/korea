<?php
session_start();
include '../php/konek.php';

$id = mysqli_real_escape_string($conn, $_GET['id']);

// Ambil data pesanan
$query = mysqli_query($conn, "SELECT * FROM pesanan WHERE id_pesanan = '$id'");
$data = mysqli_fetch_assoc($query);

// Jika ID pesanan tidak ditemukan di database, kembalikan ke dashboard
if (!$data) {
    header("Location: index_admin.php");
    exit();
}

// Ambil detail barang yang dibeli (DITAMBAHKAN b.harga AGAR TIDAK ERROR)
$items = mysqli_query($conn, "SELECT pd.*, b.nama, b.harga FROM pesanan_detail pd JOIN barang b ON pd.barang_id = b.barang_id WHERE pd.id_pesanan = '$id'");
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Pesanan #<?php echo $id; ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f4f7fa; margin: 0; padding: 40px; color: #333; }
        .container { max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f1f1; padding-bottom: 20px; margin-bottom: 20px; }
        .back-btn { text-decoration: none; color: #666; font-size: 0.9rem; display: flex; align-items: center; gap: 5px; }
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-selesai { background: #dcfce7; color: #166534; }
        
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-box h4 { margin: 0 0 5px 0; color: #888; font-size: 0.75rem; text-transform: uppercase; }
        .info-box p { margin: 0; font-weight: 600; color: #2d3748; line-height: 1.4; }
        .info-box .sub-text { font-size: 0.85rem; color: #64748b; font-weight: 400; }

        .table-items { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table-items th { text-align: left; background: #f8fafc; padding: 12px; font-size: 0.85rem; color: #64748b; }
        .table-items td { padding: 12px; border-bottom: 1px solid #edf2f7; }
        
        .total-section { margin-top: 20px; text-align: right; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .total-section h2 { margin: 0; color: #0284c7; }
        
        .wa-action { display: block; text-align: center; background: #16a34a; color: white; text-decoration: none; padding: 12px; border-radius: 8px; margin-top: 20px; font-weight: 600; transition: 0.3s; }
        .wa-action:hover { background: #15803d; }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <a href="index_admin.php" class="back-btn">← Kembali</a>
        <span class="status-badge <?php echo ($data['status_pesanan'] == 'SELESAI') ? 'status-selesai' : 'status-pending'; ?>">
            <?php echo $data['status_pesanan']; ?>
        </span>
    </div>

    <h3>Invoice #<?php echo $data['id_pesanan']; ?></h3>
    <p style="color: #999; font-size: 0.85rem;">Dipesan pada: <?php echo date('d F Y, H:i', strtotime($data['tanggal_order'])); ?></p>

    <div class="grid">
        <div class="info-box">
            <h4>Penerima</h4>
            <p><?php echo htmlspecialchars($data['nama_penerima']); ?></p>
        </div>
        <div class="info-box">
            <h4>WhatsApp</h4>
            <p><?php echo htmlspecialchars($data['whatsapp']); ?></p>
        </div>
        
        <div class="info-box" style="grid-column: span 2;">
            <h4>Alamat Pengiriman</h4>
            <p>
                <?php echo nl2br(htmlspecialchars($data['alamat_lengkap'])); ?><br>
                
                <?php if (!empty($data['detail_alamat'])): ?>
                    <span style="color: #0284c7;">Detail: <?php echo htmlspecialchars($data['detail_alamat']); ?></span><br>
                <?php endif; ?>
                
                <span class="sub-text">
                    <?php echo htmlspecialchars($data['kota']); ?>, 
                    <?php echo htmlspecialchars($data['provinsi']); ?> - 
                    <strong style="color: #333;"><?php echo htmlspecialchars($data['kodepos']); ?></strong>
                </span>
            </p>
        </div>
    </div>

    <h4>Rincian Produk</h4>
    <table class="table-items">
        <thead>
            <tr>
                <th>Produk</th>
                <th>Harga Satuan</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <?php while($item = mysqli_fetch_assoc($items)): ?>
            <tr>
                <td><?php echo htmlspecialchars($item['nama']); ?></td>
                <td>₩<?php echo number_format($item['harga'], 0, ',', '.'); ?></td>
                <td style="text-align:center;"><?php echo $item['jumlah']; ?></td>
                <td style="text-align:right;">₩<?php echo number_format($item['total'], 0, ',', '.'); ?></td>
            </tr>
            <?php endwhile; ?>
        </tbody>
    </table>

    <div class="total-section">
        <p style="margin:0; font-size: 0.9rem; color: #64748b;">Total Pembayaran (Termasuk Ongkir)</p>
        <h2>₩<?php echo number_format($data['total_bayar'], 0, ',', '.'); ?></h2>
    </div>

    <a href="https://wa.me/<?php echo preg_replace('/[^0-9]/', '', $data['whatsapp']); ?>" target="_blank" class="wa-action">
        Hubungi Pembeli via WhatsApp
    </a>
</div>

</body>
</html>