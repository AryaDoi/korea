document.addEventListener("DOMContentLoaded", () => {
    const secretBtn = document.querySelector('.admin-secret-btn');

    if (secretBtn) {
        let timer;
        const goToAdmin = () => { 
            window.location.href = '../admin/login_admin.php'; 
        };

        // Saat tombol ditekan
        secretBtn.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Mencegah aksi bawaan browser
            timer = setTimeout(goToAdmin, 2000);
        });

        // Saat tombol dilepas atau kursor keluar
        secretBtn.addEventListener('mouseup', () => clearTimeout(timer));
        secretBtn.addEventListener('mouseleave', () => clearTimeout(timer));

        // Support untuk HP (Touch)
        secretBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); 
            timer = setTimeout(goToAdmin, 2000);
        }, { passive: false });
        
        secretBtn.addEventListener('touchend', () => clearTimeout(timer));
    }
});