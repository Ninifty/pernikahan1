// Deklarasikan variabel global
let pages;
let openInvitationBtn;
let backgroundMusic;
let musicToggleButton;
let isMusicPlaying = false; // Status awal musik

// --- Variabel baru untuk Konfirmasi Kehadiran ---
let rsvpForm;
let greetingsList;
const GREETINGS_STORAGE_KEY = 'weddingGreetings'; // Kunci untuk localStorage

// Fungsi untuk memutar atau menghentikan musik
function toggleMusic() {
    if (backgroundMusic.paused) {
        backgroundMusic.currentTime=21
        backgroundMusic.play()
            .then(() => {
                isMusicPlaying = true;
                musicToggleButton.innerHTML = '<i class="fas fa-volume-up"></i>'; // Ikon Unmute
            })
            .catch(e => {
                console.warn("Autoplay musik diblokir atau gagal:", e);
                // Jika autoplay diblokir, tetap set ikon mute dan biarkan pengguna klik lagi
                musicToggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
                isMusicPlaying = false;
            });
    } else {
        backgroundMusic.pause();
        isMusicPlaying = false;
        musicToggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>'; // Ikon Mute
    }
}

// Fungsi untuk menggulir Navbar ke posisi tombol
function scrollNavbarToButton(buttonElement) {
    const navbar = document.querySelector('.navbar');
    if (!navbar || !buttonElement) return;

    const buttonLeft = buttonElement.offsetLeft;
    const buttonWidth = buttonElement.offsetWidth;
    const navbarScrollLeft = navbar.scrollLeft;
    const navbarWidth = navbar.offsetWidth;

    let targetScrollLeft = buttonLeft - (navbarWidth / 2) + (buttonWidth / 2);
    targetScrollLeft = Math.max(0, targetScrollLeft);
    const maxScrollLeft = navbar.scrollWidth - navbarWidth;
    targetScrollLeft = Math.min(maxScrollLeft, targetScrollLeft);

    navbar.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });
}

// Fungsi utama untuk menampilkan halaman tertentu dan memicu animasi
function showPage(index) {
    // Sembunyikan semua halaman dan hapus kelas animasi
    pages.forEach(page => {
        page.classList.remove('active');
        page.querySelectorAll('.animate-on-load').forEach(el => {
            el.classList.remove('is-visible');
        });
    });

    const targetPage = pages[index];
    if (targetPage) {
        targetPage.classList.add('active');
        
        targetPage.scrollTop = 0; // Mengatur scroll halaman ke atas saat dibuka

        // Kontrol visibilitas Navbar
        const navbar = document.querySelector('.navbar'); // Query navbar di sini
        if (navbar) {
            if (index === 0) { // Jika di halaman 1 (indeks 0)
                navbar.style.display = 'none'; // Sembunyikan navbar
            } else { // Jika di halaman 2 (indeks 1) dan seterusnya
                navbar.style.display = 'flex'; // Tampilkan navbar
            }
        }

        // Kontrol visibilitas Tombol Musik
        if (musicToggleButton) { // Gunakan variabel global
            if (index === 0) { // Jika di halaman 1 (indeks 0)
                musicToggleButton.style.display = 'none'; // Sembunyikan tombol musik
            } else { // Jika di halaman 2 (indeks 1) dan seterusnya
                musicToggleButton.style.display = 'flex'; // Tampilkan tombol musik
            }
        }

        // Kontrol visibilitas Tombol "Buka Undangan"
        if (openInvitationBtn) { // Gunakan variabel global
            if (index === 0) { // Jika di halaman 1 (indeks 0)
                openInvitationBtn.style.display = 'flex'; // Tampilkan tombol Buka Undangan (gunakan 'flex' karena ada ikon)
            } else { // Jika di halaman lain (selain halaman 1)
                openInvitationBtn.style.display = 'none'; // Sembunyikan tombol Buka Undangan
            }
        }

        // Delay untuk animasi elemen
        setTimeout(() => {
            targetPage.querySelectorAll('.animate-on-load').forEach(el => {
                el.classList.add('is-visible');
            });
        }, 50);

        // Gulir navbar ke tombol yang sesuai dengan halaman aktif
        const currentNavButton = document.querySelector(`.nav-button[data-target="page${index + 1}"]`);
        if (currentNavButton) {
            scrollNavbarToButton(currentNavButton);
        }

        // --- Muat ucapan saat halaman konfirmasi (page6) aktif ---
        // page6 adalah halaman dengan indeks 5 (0-indeks)
        if (index === 5 && greetingsList) {
            loadGreetings();
        }

    } else {
        console.error(`Error fatal: Objek halaman pada indeks ${index} tidak terdefinisi.`);
    }
}

// Fungsi untuk menyalin teks ke clipboard
function copyToClipboard(elementId) {
    let textToCopy;
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Error: Elemen dengan ID '${elementId}' tidak ditemukan untuk disalin.`);
        alert('Gagal menyalin: Elemen tidak ditemukan.');
        return;
    }

    // Ambil teks yang relevan
    if (elementId.startsWith('accountNumber')) { // Use startsWith to check for both Zee and Junin
        textToCopy = element.innerText.replace('No. Rekening: ', '').trim();
    } else if (elementId === 'phoneNumberDisplay') {
        textToCopy = element.innerText.trim();
    } else {
        textToCopy = element.innerText.trim();
    }

    navigator.clipboard.writeText(textToCopy).then(function() {
        alert('Nomor berhasil disalin!');
    }, function(err) {
        console.error('Gagal menyalin: ', err);
        alert('Gagal menyalin nomor. Silakan salin secara manual.');
    });
}

// --- FUNGSI UNTUK KONFIRMASI KEHADIRAN DAN UCAPAN ---

// Fungsi untuk memuat ucapan dari LocalStorage
function loadGreetings() {
    if (!greetingsList) return; // Pastikan elemen sudah ada

    const storedGreetings = localStorage.removeItem(GREETINGS_STORAGE_KEY);
    let greetings = storedGreetings ? JSON.parse(storedGreetings) : [];

    // Bersihkan daftar ucapan yang ada
    greetingsList.innerHTML = '';

    if (greetings.length === 0) {
        greetingsList.innerHTML = '<p>Belum ada ucapan. Jadilah yang pertama!</p>';
        return;
    }

    // Tampilkan ucapan terbaru di paling atas
    // Gunakan spread operator [...] untuk membuat salinan array sebelum membaliknya
    [...greetings].reverse().forEach(greeting => {
        const greetingItem = document.createElement('div');
        greetingItem.classList.add('greeting-item');
        // Tentukan kelas status kehadiran untuk styling
        const attendanceStatusText = greeting.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir';
        const attendanceClass = greeting.attendance === 'tidak-hadir' ? 'attendance-status not-attending' : 'attendance-status attending';
        
        greetingItem.innerHTML = `
            <h4>${greeting.name} <span class="${attendanceClass}">(${attendanceStatusText})</span></h4>
            <p>${greeting.message}</p>
            <span class="timestamp">${greeting.timestamp}</span>
        `;
        greetingsList.appendChild(greetingItem);
    });
}

// Fungsi untuk menyimpan ucapan ke LocalStorage
function saveGreeting(name, attendance, message) {
    const storedGreetings = localStorage.getItem(GREETINGS_STORAGE_KEY);
    let greetings = storedGreetings ? JSON.parse(storedGreetings) : [];

    const now = new Date();
    // Gunakan opsi timezone untuk memastikan waktu lokal di Bekasi
    const timestamp = now.toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Jakarta' // Zona waktu untuk WIB
    });

    const newGreeting = {
        name,
        attendance,
        message,
        timestamp
    };
    greetings.push(newGreeting);
    localStorage.setItem(GREETINGS_STORAGE_KEY, JSON.stringify(greetings));
}


// --- Kode JavaScript yang berjalan setelah DOM selesai dimuat ---
document.addEventListener('DOMContentLoaded', function() {
    // Ambil referensi elemen HTML
    pages = document.querySelectorAll('.page');
    openInvitationBtn = document.getElementById('open-invitation-btn');
    backgroundMusic = document.getElementById('background-music');
    musicToggleButton = document.getElementById('music-toggle');
    // --- Referensi elemen baru ---
    rsvpForm = document.getElementById('rsvpForm');
    greetingsList = document.getElementById('greetingsList');


    if (backgroundMusic) {
        backgroundMusic.loop = true;
    }

    // Tangani parameter URL dan tampilkan halaman awal
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to');
    if (guestName) {
        const guestNameDisplay = document.getElementById('guestNameDisplay');
        if (guestNameDisplay) {
            guestNameDisplay.innerText = decodeURIComponent(guestName);
        } else {
            console.warn("Elemen dengan ID 'guestNameDisplay' tidak ditemukan.");
        }
        // Jika ada form RSVP, isi nama tamu secara otomatis
        if (document.getElementById('guestNameRsvp')) {
            document.getElementById('guestNameRsvp').value = decodeURIComponent(guestName);
        }
    }

    // Tampilkan halaman pertama (halaman cover) saat DOM selesai dimuat
    showPage(0); // Memastikan halaman 1 aktif dan navbar/tombol musik tersembunyi

    // Event listener untuk tombol Music Toggle
    if (musicToggleButton && backgroundMusic) {
        musicToggleButton.addEventListener('click', toggleMusic);
        // Set ikon awal berdasarkan status musik (defaultnya paused)
        musicToggleButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        console.warn("Elemen audio atau tombol musik tidak ditemukan, fungsi toggle musik dinonaktifkan.");
    }

    // Event listener untuk tombol "Buka Undangan"
    if (openInvitationBtn) {
        openInvitationBtn.addEventListener('click', function() {
            showPage(1); // Pindah ke Page 2 (indeks 1) - ini akan menampilkan navbar & tombol musik
            
            // Coba putar musik saat tombol dibuka
            if (backgroundMusic && !isMusicPlaying) {
                backgroundMusic.currentTime = 0; // Mulai dari awal
                toggleMusic(); // Panggil fungsi toggleMusic untuk memutar
            }

            // Tambahkan kelas ke body untuk menampilkan dekorasi
            document.body.classList.add('invitation-open');
        });
    } else {
        console.error("Error: Elemen dengan ID 'open-invitation-btn' tidak ditemukan di HTML. Tombol 'Buka Undangan' tidak akan berfungsi.");
    }

    // Navigasi untuk tombol navbar
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPageId = this.dataset.target; // Misal: "page1", "page2"
            const targetPageElement = document.getElementById(targetPageId);
            // Cari indeks halaman berdasarkan elemen target
            const targetPageIndex = Array.from(pages).indexOf(targetPageElement);

            if (targetPageIndex !== -1) {
                showPage(targetPageIndex); // Tampilkan halaman yang dituju
            } else {
                console.warn(`Peringatan: Elemen halaman target dengan ID '${targetPageId}' tidak ditemukan untuk tombol ini.`);
            }
        });
    });

    // Countdown Timer
    // GANTI TANGGAL DAN WAKTU ACARA ANDA DI SINI!
    const countdownDate = new Date("August 10, 2025 09:00:00").getTime(); 

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const daysElement = document.getElementById("days");
        const hoursElement = document.getElementById("hours");
        const minutesElement = document.getElementById("minutes");
        const secondsElement = document.getElementById("seconds");
        const countdownContainer = document.getElementById("countdown");

        // Pastikan elemen-elemen ini ada, karena mereka sekarang ada di page6 (indeks 5)
        // Dan hanya akan diperbarui jika page6 aktif
        if (countdownContainer && pages[5].classList.contains('active')) {
             if (distance < 0) {
                clearInterval(x);
                countdownContainer.innerHTML = "ACARA TELAH DIMULAI!";
                countdownContainer.style.fontSize = "1.5em";
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                if (daysElement) daysElement.innerHTML = days < 10 ? "0" + days : days;
                if (hoursElement) hoursElement.innerHTML = hours < 10 ? "0" + hours : hours;
                if (minutesElement) minutesElement.innerHTML = minutes < 10 ? "0" + minutes : minutes;
                if (secondsElement) secondsElement.innerHTML = seconds < 10 ? "0" + seconds : seconds;
            }
        }
    }, 1000);

    // --- Event listener untuk form RSVP (Konfirmasi Kehadiran) ---
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Mencegah form submit dan refresh halaman

            const guestNameRsvp = document.getElementById('guestNameRsvp').value.trim();
            const attendance = document.getElementById('attendance').value;
            const message = document.getElementById('message').value.trim();

            if (guestNameRsvp && attendance) {
                saveGreeting(guestNameRsvp, attendance, message);
                loadGreetings(); // Muat ulang ucapan setelah menyimpan
                rsvpForm.reset(); // Reset form
                alert('Konfirmasi dan ucapan Anda telah terkirim!');
            } else {
                alert('Mohon lengkapi Nama Anda dan Konfirmasi Kehadiran.');
            }
        });
    }
});