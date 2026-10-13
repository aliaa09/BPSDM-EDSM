let isLoginMode = true;

// 1. FUNGSI TOGGLE LIHAT PASSWORD (IKON MATA)
function togglePassword() {
    const pwdInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

// 2. FUNGSI TOGGLE ANTARA LOGIN & DAFTAR (SIGN IN)
function toggleMode() {
    isLoginMode = !isLoginMode;
    
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const typeSelector = document.getElementById('typeSelector');
    const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');
    const toggleText = document.getElementById('toggleText');
    const verificationBox = document.getElementById('verificationBox');
    
    // Sembunyikan notifikasi
    hideMessages();
    if(verificationBox) verificationBox.classList.add('hidden');

    if (isLoginMode) {
        formTitle.innerText = 'Masuk Ke Akun Kedinasan';
        submitBtn.innerHTML = 'Masuk Ke Sistem <i class="fa-solid fa-arrow-right text-xs"></i>';
        typeSelector.classList.add('hidden');
        forgotPasswordContainer.classList.remove('hidden');
        toggleText.innerHTML = 'Belum terdaftar? <button onclick="toggleMode()" type="button" class="font-bold text-esdmNavy hover:underline">Daftar Akun Baru</button>';
    } else {
        formTitle.innerText = 'Daftar Akun Kedinasan';
        submitBtn.innerHTML = 'Kirim Kode Verifikasi Email <i class="fa-solid fa-paper-plane text-xs"></i>';
        typeSelector.classList.remove('hidden');
        forgotPasswordContainer.classList.add('hidden');
        toggleText.innerHTML = 'Sudah memiliki akun? <button onclick="toggleMode()" type="button" class="font-bold text-esdmNavy hover:underline">Kembali ke Login</button>';
    }
}

// 3. FUNGSI PENANGANAN SUBMIT (LOGIN & REGISTRASI)
function handleAuth(event) {
    event.preventDefault();
    hideMessages();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const userType = document.getElementById('userType') ? document.getElementById('userType').value : 'internal';
    const verificationBox = document.getElementById('verificationBox');
    const otpInput = document.getElementById('otpInput');

    // Ambil basis data pengguna dari localStorage
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    if (!isLoginMode) {
        // --- PROSES DAFTAR (SIGN IN) ---
        
        // Cek apakah email sudah terdaftar
        const existingUser = registeredUsers.find(u => u.email === email);
        if (existingUser) {
            showError('Email ini sudah terdaftar. Silakan lakukan login.');
            return;
        }

        // Cek apakah langkah verifikasi OTP sudah tampil
        if (verificationBox && verificationBox.classList.contains('hidden')) {
            // Munculkan kolom verifikasi email
            verificationBox.classList.remove('hidden');
            showSuccess('Kode verifikasi 6-digit telah dikirim ke email Anda. (Gunakan kode demo: 123456)');
            document.getElementById('submitBtn').innerHTML = 'Verifikasi & Simpan Akun <i class="fa-solid fa-check text-xs"></i>';
            return;
        }

        // Validasi Kode Verifikasi OTP
        if (otpInput && otpInput.value.trim() !== '123456') {
            showError('Kode verifikasi email salah! Masukkan kode demo: 123456');
            return;
        }

        // Simpan Akun Baru ke Database Lokal
        registeredUsers.push({
            email: email,
            password: password,
            role: userType,
            verified: true
        });
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        showSuccess('Verifikasi Email Berhasil! Akun Anda telah terdaftar. Silakan login.');
        
        setTimeout(() => {
            toggleMode();
            document.getElementById('password').value = '';
            if(otpInput) otpInput.value = '';
        }, 1500);

    } else {
        // --- PROSES LOGIN ---
        
        // Cek akun di database lokal
        const user = registeredUsers.find(u => u.email === email);

        if (!user) {
            showError('Email belum terdaftar! Silakan tekan "Daftar Akun Baru" terlebih dahulu.');
            return;
        }

        if (user.password !== password) {
            showError('Kata sandi yang Anda masukkan salah.');
            return;
        }

        // Set role pengguna aktif
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('activeUserEmail', user.email);

        // Redirect ke Beranda
        window.location.href = 'beranda.html';
    }
}

// 4. FUNGSI RESMI GOOGLE LOGIN (SDK)
function handleGoogleLogin() {
    // Memeriksa API Google Client ID
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Dapat diganti dengan OAuth Client ID asli nanti
            callback: handleGoogleResponse
        });
        google.accounts.id.prompt(); // Memunculkan pop-up Google Sign-In
    } else {
        // Simulasi Login Google jika Client ID belum dikonfigurasi
        const demoEmail = "pengguna.google@esdm.go.id";
        let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        
        let user = registeredUsers.find(u => u.email === demoEmail);
        if(!user) {
            registeredUsers.push({
                email: demoEmail,
                password: "google_authenticated",
                role: "internal",
                verified: true
            });
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }

        localStorage.setItem('userRole', 'internal');
        localStorage.setItem('activeUserEmail', demoEmail);
        window.location.href = 'beranda.html';
    }
}

function handleGoogleResponse(response) {
    localStorage.setItem('userRole', 'internal');
    window.location.href = 'beranda.html';
}

// FUNGSI BANTUAN NOTIFIKASI INLINE
function showError(msg) {
    const errorBox = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorBox && errorText) {
        errorText.innerText = msg;
        errorBox.classList.remove('hidden');
    }
}

function showSuccess(msg) {
    const successBox = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    if (successBox && successText) {
        successText.innerText = msg;
        successBox.classList.remove('hidden');
    }
}

function hideMessages() {
    const errorBox = document.getElementById('errorMessage');
    const successBox = document.getElementById('successMessage');
    if (errorBox) errorBox.classList.add('hidden');
    if (successBox) successBox.classList.add('hidden');
}