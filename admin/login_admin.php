<?php
session_start();

// PENTING: Hubungkan ke file koneksi database. 
// Sesuaikan path 'konek.php' jika file ini berada di dalam folder admin (misal: include '../konek.php';)
include '../php/konek.php'; 

// Jika admin sudah login sebelumnya, langsung arahkan ke Dashboard
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: index_admin.php");
    exit();
}

$error = '';

// Proses saat tombol login ditekan
if (isset($_POST['login'])) {
    // Ambil inputan dan bersihkan dari karakter berbahaya (mencegah SQL Injection)
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = mysqli_real_escape_string($conn, $_POST['password']);

    // Cari admin berdasarkan username
    $query_admin = "SELECT * FROM admin WHERE username = '$username'";
    $hasil_admin = mysqli_query($conn, $query_admin);

    // Cek apakah username ditemukan di database
    if (mysqli_num_rows($hasil_admin) === 1) {
        $data_admin = mysqli_fetch_assoc($hasil_admin);
        
        // Cek apakah password cocok
        // Catatan: Ini mengasumsikan password di database berupa teks biasa (plain text).
        if ($password === $data_admin['password']) {
            
            // Set session login
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_id']        = $data_admin['admin_id']; // Menyimpan ID admin
            $_SESSION['admin_username']  = $data_admin['username']; // Menyimpan username admin
            
            // Arahkan ke halaman utama dashboard
            header("Location: index_admin.php");
            exit();
        } else {
            $error = "Password salah!";
        }
    } else {
        $error = "Username tidak ditemukan!";
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin - Warung RMB</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../css/login_admin.css">
</head>
<body>

    <div class="login-container">
        <div class="login-card">
            
            <div class="login-header">
                <h2>Admin Login</h2>
                <p>Dashboard Warung RMB</p>
            </div>
            
            <?php if ($error != ''): ?>
                <div class="alert error"><?php echo $error; ?></div>
            <?php endif; ?>

            <form action="" method="POST">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required autofocus placeholder="Masukkan username">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required placeholder="Masukkan password">
                </div>
                <button type="submit" name="login" class="btn-login">Masuk</button>
            </form>
            
        </div>
    </div>

</body>
</html>