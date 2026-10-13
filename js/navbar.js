// Script Otomatis Memuat Navbar Dejede
document.addEventListener("DOMContentLoaded", function() {
    const navbarHTML = `
    <nav class="navbar" aria-label="Menu utama">
        <a href="index.html" class="logo">DEJEDE</a>
        <div class="nav-links">
            <a href="index.html">Home</a>
            <a href="pristlist.html">Pristlist</a>
            <a href="booking.html">Booking</a>
            <div class="nav-dropdown" id="toolDropdown">
                <button type="button" class="drop-btn nav-highlight" onclick="toggleDropdown(event)" aria-haspopup="true">Tools ▾</button>
                <div class="dropdown-content">
                    <a href="weddinggen.html">Weddinggen</a>
                    <a href="schedulegen.html">Schedulegen</a>
                    <a href="https://dejede.github.io/rental/">Rental</a>
                    <a href="https://dejede.github.io/bukutamu/">Buku Tamu</a>
                    <a href="jadwaldejede.html">Jadwal</a>
                    <a href="streameventgen.html">Streamgen</a>
					<a href="invoice.html">Invoice</a>
					<a href="susunalbum.html">Susun Album</a>
                </div>
            </div>
            <a href="about.html">About</a>
        </div>
    </nav>`;

    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;

        // Otomatis tandai menu (active) sesuai halaman saat ini
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        const navLinks = container.querySelectorAll('.nav-links > a');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
});