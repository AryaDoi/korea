<?php
session_start();
include 'konek.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // 1. Ambil & Bersihkan Data Dasar dari Form
    $nama          = mysqli_real_escape_string($conn, $_POST['nama_depan']);
    $email         = mysqli_real_escape_string($conn, $_POST['email']);
    $alamat        = mysqli_real_escape_string($conn, $_POST['alamat']);
    $detail_alamat = mysqli_real_escape_string($conn, $_POST['detail_alamat']);
    $kota          = mysqli_real_escape_string($conn, $_POST['kota']);
    $kodepos       = mysqli_real_escape_string($conn, $_POST['kodepos']);
    
    // =================================================================
    // LOGIKA NOMOR TELEPON (PENGGABUNGAN KODE NEGARA & NOMOR WA)
    // =================================================================
    $kode_negara = isset($_POST['kode_negara']) ? $_POST['kode_negara'] : '+62';
    
    if ($kode_negara === 'manual') {
        $prefix = trim($_POST['kode_manual']);
        if (strpos($prefix, '+') !== 0) {
            $prefix = '+' . $prefix;
        }
    } else {
        $prefix = $kode_negara;
    }

    // Bersihkan input nomor
    $nomor_wa = trim($_POST['nomor_wa']);
    $nomor_wa = ltrim($nomor_wa, '0');

    // Gabungkan menjadi format internasional dan amankan
    $whatsapp_lengkap = $prefix . $nomor_wa;
    $whatsapp = mysqli_real_escape_string($conn, $whatsapp_lengkap);
    // =================================================================

    // Logika Provinsi
    $provinsi_input = $_POST['provinsi'];
    if ($provinsi_input == 'other') {
        $provinsi = mysqli_real_escape_string($conn, $_POST['provinsi_manual']);
    } else {
        $provinsi = mysqli_real_escape_string($conn, $provinsi_input);
    }

    // 2. Hitung Total Belanja
    $total_belanja = 0;
    $ongkir = 5000; // Disesuaikan dengan checkout.php yang baru
    
    if (!empty($_SESSION['cart'])) {
        foreach ($_SESSION['cart'] as $id_barang => $jumlah) {
            $id_barang = mysqli_real_escape_string($conn, $id_barang);
            $query_harga = mysqli_query($conn, "SELECT harga FROM barang WHERE barang_id = '$id_barang'");
            $data_harga  = mysqli_fetch_assoc($query_harga);
            
            if ($data_harga) {
                $total_belanja += ($data_harga['harga'] * $jumlah);
            }
        }
    } else {
        header("Location: katalog.php");
        exit();
    }

    $total_akhir = $total_belanja + $ongkir;
    $tanggal     = date('Y-m-d H:i:s'); 
    $status      = "PENDING";

    // 3. Simpan ke Tabel 'pesanan'
    $query_pesanan = "INSERT INTO pesanan (nama_penerima, whatsapp, email, alamat_lengkap, detail_alamat, kota, provinsi, kodepos, total_bayar, status_pesanan, tanggal_order) 
                      VALUES ('$nama', '$whatsapp', '$email', '$alamat', '$detail_alamat', '$kota', '$provinsi', '$kodepos', '$total_akhir', '$status', '$tanggal')";

    if (mysqli_query($conn, $query_pesanan)) {
        // Ambil ID pesanan baru
        $id_pesanan_baru = mysqli_insert_id($conn);

        // Variabel untuk menampung teks daftar pesanan WA
        $wa_daftar_pesanan = "";

        // 4. Simpan ke Tabel 'pesanan_detail'
        foreach ($_SESSION['cart'] as $id_barang => $jumlah) {
            $id_barang = mysqli_real_escape_string($conn, $id_barang);
            
            // Ambil harga dan nama barang untuk disimpan di detail & WA
            $q_detail    = mysqli_query($conn, "SELECT nama, harga FROM barang WHERE barang_id = '$id_barang'");
            $d_detail    = mysqli_fetch_assoc($q_detail);
            
            $nama_item   = $d_detail['nama'];
            $harga_item  = $d_detail['harga'];
            $subtotal    = $harga_item * $jumlah;

            // Tambahkan list barang ke variabel WA
            $wa_daftar_pesanan .= "- " . $nama_item . " (" . $jumlah . "x) - ₩" . number_format($subtotal, 0, ',', '.') . "\n";

            $query_det = "INSERT INTO pesanan_detail (id_pesanan, barang_id, jumlah, total) 
                          VALUES ('$id_pesanan_baru', '$id_barang', '$jumlah', '$subtotal')";
            
            if (!mysqli_query($conn, $query_det)) {
                die("Gagal simpan detail pesanan: " . mysqli_error($conn));
            }
        }

        // 5. Bersihkan Keranjang
        unset($_SESSION['cart']);
        
        // =================================================================
        // 6. GENERATE LINK WHATSAPP
        // =================================================================
        
        // Ambil nama provinsi asli untuk ditampilkan di WA (mengatasi jika user pilih 'other' / manual)
        $provinsi_wa = ($_POST['provinsi'] == 'other' && isset($_POST['provinsi_manual'])) ? $_POST['provinsi_manual'] : $_POST['provinsi'];

        // Susun Pesan WA 
        $pesan_wa = "Halo Admin, saya mau order dong:\n\n";
        $pesan_wa .= "Daftar Pesanan:\n";
        $pesan_wa .= $wa_daftar_pesanan . "\n";
        $pesan_wa .= "Total Harga: ₩" . number_format($total_belanja, 0, ',', '.') . "\n";
        $pesan_wa .= "Biaya Pengiriman: ₩" . number_format($ongkir, 0, ',', '.') . "\n";
        $pesan_wa .= "Total Keseluruhan: ₩" . number_format($total_akhir, 0, ',', '.') . "\n\n";
        $pesan_wa .= "Identitas Penerima:\n";
        $pesan_wa .= "Nama: " . $_POST['nama_depan'] . "\n";
        $pesan_wa .= "WhatsApp: " . $whatsapp_lengkap . "\n\n";
        
        // --- FORMAT ALAMAT BARIS PER BARIS ---
        $pesan_wa .= "Alamat Pengiriman:\n";
        $pesan_wa .= "📍 Jalan/Dong: " . $_POST['alamat'] . "\n";
        
        // Cek jika detail alamat diisi, baru tampilkan
        if (!empty($_POST['detail_alamat'])) {
            $pesan_wa .= "🏢 Gedung/Unit: " . $_POST['detail_alamat'] . "\n";
        }
        
        $pesan_wa .= "🏙️ Kota/Distrik: " . $_POST['kota'] . "\n";
        $pesan_wa .= "🗺️ Provinsi: " . $provinsi_wa . "\n";
        $pesan_wa .= "📮 Kode Pos: " . $_POST['kodepos'];
        // -------------------------------------

        // Encode teks agar aman dilempar ke URL (spasi jadi %20, enter jadi %0A, dst)
        $pesan_wa_encoded = urlencode($pesan_wa);
        
        // Nomor WhatsApp Admin (Gunakan format internasional tanpa tanda +)
        $no_admin = "821043282503"; 
        
        $wa_url = "https://api.whatsapp.com/send?phone=" . $no_admin . "&text=" . $pesan_wa_encoded;

        // Arahkan langsung ke WhatsApp
        header("Location: " . $wa_url);
        exit();

    } else {
        die("Gagal membuat pesanan: " . mysqli_error($conn));
    }
} else {
    header("Location: checkout.php");
    exit();
}
?>