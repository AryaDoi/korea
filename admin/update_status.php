<?php
session_start();
include '../php/konek.php';

// Cek akses admin
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header("Location: login_admin.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $id_pesanan  = mysqli_real_escape_string($conn, $_POST['id_pesanan']);
    $status_baru = mysqli_real_escape_string($conn, $_POST['status_baru']);

    // 1. Ambil data pesanan saat ini untuk mengecek status dan flag pemotongan
    $query_cek = mysqli_query($conn, "SELECT status_pesanan, stok_terpotong FROM pesanan WHERE id_pesanan = '$id_pesanan'");
    $data_pesanan = mysqli_fetch_assoc($query_cek);

    if ($data_pesanan) {
        $stok_terpotong = $data_pesanan['stok_terpotong'];

        // 2. LOGIKA PENGURANGAN STOCK
        if (($status_baru == 'DIKIRIM' || $status_baru == 'SELESAI') && $stok_terpotong == 0) {
            
            // Ambil rincian barang yang dibeli pada pesanan ini
            $query_items = mysqli_query($conn, "SELECT barang_id, jumlah FROM pesanan_detail WHERE id_pesanan = '$id_pesanan'");
            
            while ($item = mysqli_fetch_assoc($query_items)) {
                $barang_id = $item['barang_id'];
                $qty = $item['jumlah'];
                
                // Kurangi stock di tabel barang (SUDAH DIGANTI MENJADI 'stock')
                mysqli_query($conn, "UPDATE barang SET stock = stock - $qty WHERE barang_id = '$barang_id'");
            }

            // Update status pesanan SEKALIGUS ubah penanda stok_terpotong menjadi 1
            $query_update = "UPDATE pesanan SET status_pesanan = '$status_baru', stok_terpotong = 1 WHERE id_pesanan = '$id_pesanan'";
        
        } 
        // 3. LOGIKA PENGEMBALIAN STOCK (Jika pesanan dibatalkan setelah dikirim/selesai)
        else if ($status_baru == 'BATAL' && $stok_terpotong == 1) {
            
            $query_items = mysqli_query($conn, "SELECT barang_id, jumlah FROM pesanan_detail WHERE id_pesanan = '$id_pesanan'");
            
            while ($item = mysqli_fetch_assoc($query_items)) {
                $barang_id = $item['barang_id'];
                $qty = $item['jumlah'];
                
                // Kembalikan stock ke tabel barang (SUDAH DIGANTI MENJADI 'stock')
                mysqli_query($conn, "UPDATE barang SET stock = stock + $qty WHERE barang_id = '$barang_id'");
            }

            // Update status pesanan dan kembalikan penanda stok_terpotong menjadi 0
            $query_update = "UPDATE pesanan SET status_pesanan = '$status_baru', stok_terpotong = 0 WHERE id_pesanan = '$id_pesanan'";
        
        } 
        // 4. UPDATE STATUS BIASA (Tanpa merubah stock)
        else {
            $query_update = "UPDATE pesanan SET status_pesanan = '$status_baru' WHERE id_pesanan = '$id_pesanan'";
        }

        // Eksekusi query pembaruan
        if (mysqli_query($conn, $query_update)) {
            header("Location: index_admin.php");
            exit();
        } else {
            die("Gagal memperbarui status: " . mysqli_error($conn));
        }
    } else {
        die("Pesanan tidak ditemukan.");
    }
} else {
    header("Location: index_admin.php");
    exit();
}
?>