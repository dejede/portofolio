/* index.html - galeri portofolio dengan lazy load progresif */
(function () {
  'use strict';

  const hero = document.querySelector('.hero-img');
  const lazyImages = document.querySelectorAll('.lazy');
  const INITIAL_BATCH = 3;

  /* 1. Hero fade-in */
  if (hero) {
    const showHero = function () { hero.classList.add('loaded'); };
    if (hero.complete) showHero();
    else {
      hero.addEventListener('load', showHero, { once: true });
      hero.addEventListener('error', showHero, { once: true });
    }
  }

  /* 2. Deteksi koneksi lambat / hemat data */
  const conn = navigator.connection || {};
  const slow = conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g';

  function loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;
    const show = function () { img.classList.add('loaded'); };
    img.decoding = 'async';
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
    img.src = src;
    delete img.dataset.src;
  }

  /* 3. Fallback untuk browser tanpa IntersectionObserver */
  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(loadImage);
    return;
  }

  /* 4. 3 gambar pertama langsung, sisanya saat mendekati viewport */
  const observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: slow ? '50px' : '150px' });

  lazyImages.forEach(function (img, i) {
    if (i < INITIAL_BATCH) loadImage(img);
    else observer.observe(img);
  });
})();

/* ===== Lightbox ala post Instagram ===== */
(function () {
  'use strict';
  const tiles = Array.from(document.querySelectorAll('.grid img'));
  const modal = document.getElementById('igModal');
  if (!tiles.length || !modal) return;

  const big = document.getElementById('igBig');
  const cap = document.getElementById('igCap');
  const likeBtn = document.getElementById('igLike');
  const closeBtn = document.getElementById('igClose');
  const liked = new Set();
  let cur = 0, opener = null;

  function show(i) {
    cur = (i + tiles.length) % tiles.length;
    const img = tiles[cur];
    big.src = img.getAttribute('src') || img.dataset.src;
    big.alt = img.alt;
    cap.textContent = 'Portfolio ' + (cur + 1) + ' dari ' + tiles.length + ' — Capturing your beautiful moments ✨ #DejedePhotography #Lumajang';
    likeBtn.classList.toggle('liked', liked.has(cur));
  }
  function open(i) {
    opener = document.activeElement;
    show(i);
    modal.hidden = false;
    document.body.classList.add('ig-lock');
    closeBtn.focus();
  }
  function close() {
    modal.hidden = true;
    document.body.classList.remove('ig-lock');
    if (opener) opener.focus();
  }
  function toggleLike(force) {
    const on = force === true ? true : !liked.has(cur);
    if (on) liked.add(cur); else liked.delete(cur);
    likeBtn.classList.remove('liked');
    void likeBtn.offsetWidth;
    likeBtn.classList.toggle('liked', on);
  }

  tiles.forEach(function (t, i) {
    t.tabIndex = 0;
    t.setAttribute('role', 'button');
    t.addEventListener('click', function () { open(i); });
    t.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(i); });
  });
  closeBtn.addEventListener('click', close);
  document.getElementById('igPrev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('igNext').addEventListener('click', function () { show(cur + 1); });
  likeBtn.addEventListener('click', function () { toggleLike(); });
  big.addEventListener('dblclick', function () { toggleLike(true); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
})();
