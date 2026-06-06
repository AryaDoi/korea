<?php
include '../php/konek.php';
header("Content-type: application/vnd-ms-excel");
header("Content-Disposition: attachment; filename=Laporan_RMB.xls");
?>
<table border="1">
    <tr>
        <th>ID</th><th>Tanggal</th><th>Penerima</th><th>WhatsApp</th><th>Alamat</th><th>Total</th><th>Status</th>
    </tr>
    <?php
    $ambil = mysqli_query($conn, "SELECT * FROM pesanan ORDER BY tanggal_order DESC");
    while($row = mysqli_fetch_assoc($ambil)){
        echo "<tr>
            <td>#".$row['id_pesanan']."</td>
            <td>".$row['tanggal_order']."</td>
            <td>".$row['nama_penerima']."</td>
            <td>'".$row['whatsapp']."</td> <!-- Tanda petik agar angka nol tidak hilang -->
            <td>".$row['alamat_lengkap']."</td>
            <td>".$row['total_bayar']."</td>
            <td>".$row['status_pesanan']."</td>
        </tr>";
    }
    ?>
</table>