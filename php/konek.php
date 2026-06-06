<?php
$host = "localhost";
$user = "root";      
$pass = "";          
$db   = "kora";     

// Membuat koneksi
$conn = mysqli_connect($host, $user, $pass, $db);

// Cek koneksi
if (!$conn) {
    die("Koneksi database gagal: " . mysqli_connect_error());
}
?>