/* about.html - counter animasi + peta (Leaflet dimuat lazy) */
(function () {
  'use strict';

  /* ===== COUNTER ===== */
  const DURATION = 3000;
  const easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };

  function runCounter(el) {
    const target = +el.dataset.target;
    const suffix = el.dataset.plus === 'true' ? '+' : '';
    const start = performance.now();
    (function step(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = Math.floor(easeOutCubic(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    })(start);
  }

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ===== PETA (koordinat tetap dari Bos) ===== */
  const LAT = -8.305308;
  const LNG = 112.948079;
  const GMAPS_URL = 'https://www.google.com/maps?q=' + LAT + ',' + LNG;
  const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  function openMaps() { window.open(GMAPS_URL, '_blank', 'noopener'); }

  function initMap() {
    const map = L.map('map').setView([LAT, LNG], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const marker = L.marker([LAT, LNG]).addTo(map);
    marker.bindTooltip('<b>Dejede Disini (Klik untuk Navigasi)</b>', {
      permanent: true,
      direction: 'top',
      className: 'my-labels'
    }).openTooltip();

    /* Klik pin, label, atau area peta -> buka Google Maps */
    marker.on('click', openMaps);
    marker.getTooltip().on('click', openMaps);
    map.on('click', openMaps);
  }

  const mapEl = document.getElementById('map');
  if (!mapEl) return;

  function bootMap() {
    Promise.all([DJ.loadCSS(LEAFLET_CSS), DJ.loadScript(LEAFLET_JS)])
      .then(initMap)
      .catch(function () { mapEl.textContent = 'Peta gagal dimuat. Periksa koneksi internet.'; });
  }

  if ('IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { obs.disconnect(); bootMap(); }
    }, { rootMargin: '300px' });
    mapObserver.observe(mapEl);
  } else {
    bootMap();
  }
})();
