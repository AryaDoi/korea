document.addEventListener('DOMContentLoaded', function() {
    // 1. Logika Dropdown "Other" untuk Provinsi dan Negara
    const selects = document.querySelectorAll('select[onchange*="toggleOther"]');
    
    selects.forEach(select => {
        const match = select.getAttribute('onchange').match(/'([^']+)'/);
        if (match) {
            const targetId = match[1];
            const manualInput = document.getElementById(targetId);

            if (manualInput) {
                select.addEventListener('change', function() {
                    if (this.value === 'other') {
                        manualInput.style.display = 'block';
                        manualInput.required = true;
                        manualInput.focus();
                    } else {
                        manualInput.style.display = 'none';
                        manualInput.required = false;
                        manualInput.value = ''; 
                    }
                });
            }
        }


        select.removeAttribute('onchange');
    });

    // =========================================================================
    // 2. LOGIKA DROPDOWN KODE NEGARA (WHATSAPP)
    // =========================================================================
    const phoneSelect = document.getElementById('kode_negara');
    const manualPhoneInput = document.getElementById('kode_manual');

    if (phoneSelect && manualPhoneInput) {
        phoneSelect.addEventListener('change', function() {
            if (this.value === 'manual') {
                manualPhoneInput.style.display = 'block';
                manualPhoneInput.required = true;
                manualPhoneInput.focus();
            } else {
                manualPhoneInput.style.display = 'none';
                manualPhoneInput.required = false;
                manualPhoneInput.value = ''; 
            }
        });

        if (phoneSelect.hasAttribute('onchange')) {
            phoneSelect.removeAttribute('onchange');
        }
    }
    // =========================================================================


    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.height = '70px';
                navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.05)';
            } else {
                navbar.style.height = '80px';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    const checkoutForm = document.querySelector('.checkout-grid');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function() {
            const btn = this.querySelector('.btn-confirm, .btn-checkout');
            if (btn) {
                btn.innerHTML = 'Memproses...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
            }
        });
    }
});