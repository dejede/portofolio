/* pristlist.html - pricelist terkunci, margin vendor/partner, keranjang belanja */
(function () {
  'use strict';

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const KEY_NORMAL = 'PLDEJEDE';
  const KEY_VENDOR = 'VENDORDEJEDE';
  const KEY_PARTNER = 'PARTNERDEJEDE';
  const CART_KEY = 'dejedeCart';

  const $ = function (id) { return document.getElementById(id); };
  const rupiah = DJ.rupiah;

  /* ===== JUDUL OTOMATIS (contoh: Dejede Pricelist Oktober 2026) ===== */
  const now = new Date();
  const dynamicText = 'Dejede Pricelist ' + BULAN[now.getMonth()] + ' ' + now.getFullYear();
  document.title = dynamicText;
  $('pageHeading').textContent = dynamicText;

  /* ===== GAMBAR: fade-in saat siap ===== */
  document.querySelectorAll('.prist-image img').forEach(function (img) {
    const show = function () { img.classList.add('loaded'); };
    if (img.complete) show();
    else {
      img.addEventListener('load', show, { once: true });
      img.addEventListener('error', show, { once: true });
    }
  });

  /* ===== BUKA KUNCI HARGA ===== */
  function unlockPrice() {
    const keyInput = $('priceKey');
    const lockBox = document.querySelector('.lock-section');
    const input = keyInput.value.toUpperCase();

    if (input !== KEY_NORMAL && input !== KEY_VENDOR && input !== KEY_PARTNER) {
      DJ.alert('Kode Salah! Silakan hubungi admin Dejede.');
      keyInput.value = '';
      return;
    }

    if (input === KEY_NORMAL) DJ.alert('Akses Normal Dibuka.');
    else if (input === KEY_VENDOR) DJ.alert('Mode Vendor Aktif (Margin +100rb/50rb).');
    else DJ.alert('Mode Partner Aktif (Margin +50rb).');

    document.querySelectorAll('.amount').forEach(function (price) {
      /* simpan harga asli ("2500K" -> 2500000) */
      if (!price.dataset.original) {
        let numeric = parseInt(price.textContent.replace(/[^\d]/g, ''));
        if (price.textContent.includes('K') && numeric < 10000) numeric *= 1000;
        price.dataset.original = numeric;
      }

      const original = parseInt(price.dataset.original);
      let margin = 0;
      if (input === KEY_VENDOR) margin = original < 1000000 ? 50000 : 100000;
      else if (input === KEY_PARTNER) margin = 50000;

      price.textContent = rupiah(original + margin);
      price.classList.add('unlocked');
    });

    document.querySelectorAll('.money').forEach(function (m) { m.classList.add('unlocked'); });

    lockBox.classList.add('is-fading');
    setTimeout(function () { lockBox.hidden = true; }, 500);
  }

  /* ===== KERANJANG ===== */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { cart = []; }
  if (!Array.isArray(cart)) cart = [];

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* abaikan */ }
  }

  function updateCartUI() {
    const cartItems = $('cartItems');
    const cartTotal = $('cartTotal');
    const cartCount = $('cartCount');
    if (!cartItems || !cartTotal || !cartCount) return;

    let total = 0;
    cartItems.innerHTML = cart.map(function (item, index) {
      total += item.price;
      const name = DJ.escape(item.name);
      return '<div class="cart-item">' +
        '<span class="cart-item-name">' + name + ' : <i class="cart-item-price">' + rupiah(item.price) + '</i></span>' +
        '<button type="button" class="close-cart-small" data-remove="' + index + '" aria-label="Hapus ' + name + '"></button>' +
        '</div>';
    }).join('');

    cartTotal.textContent = rupiah(total);
    cartCount.textContent = cart.length;
    saveCart();
  }

  function addToCart(button) {
    const priceElement = button.closest('.prist-frame').querySelector('.amount');

    if (!priceElement.classList.contains('unlocked')) {
      DJ.alert('Silakan masukkan kode akses terlebih dahulu.');
      return;
    }

    const name = button.dataset.name;
    const price = parseInt(priceElement.textContent.replace(/[^\d]/g, ''));

    if (!price || isNaN(price)) {
      DJ.alert('Harga tidak valid.');
      return;
    }

    if (cart.some(function (item) { return item.name === name; })) {
      DJ.alert('Paket sudah ada di keranjang.');
      return;
    }

    cart.push({ name: name, price: price });

    button._html = button.innerHTML;          /* simpan tampilan asli (ikon + teks) */
    button.textContent = '✓ Ditambahkan';
    button.disabled = true;

    updateCartUI();
  }

  function removeItem(index) {
    const removed = cart.splice(index, 1)[0];
    updateCartUI();
    if (!removed) return;

    /* kembalikan tombol paket yang dihapus */
    document.querySelectorAll('.btn-cart-red').forEach(function (btn) {
      if (btn.dataset.name === removed.name && btn._html) {
        btn.innerHTML = btn._html;
        btn.disabled = false;
      }
    });
  }

  function toggleCart(e) {
    if (e) e.preventDefault();
    const panel = $('slideCart');
    if (panel) panel.classList.toggle('active');
  }

  function goToBooking() {
    if (cart.length === 0) {
      DJ.alert('Keranjang masih kosong.');
      return;
    }
    saveCart();
    window.location.href = 'booking.html';
  }

  /* ===== EVENT ===== */
  $('unlockBtn').addEventListener('click', unlockPrice);
  $('priceKey').addEventListener('keyup', function (e) { if (e.key === 'Enter') unlockPrice(); });

  document.querySelector('.pristlist-grid').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-cart-red');
    if (btn) addToCart(btn);
  });

  $('cartItems').addEventListener('click', function (e) {
    const btn = e.target.closest('[data-remove]');
    if (btn) removeItem(+btn.dataset.remove);
  });

  $('floatingCart').addEventListener('click', toggleCart);
  $('closeCart').addEventListener('click', toggleCart);
  $('goBooking').addEventListener('click', goToBooking);

  /* tombol keranjang melayang: tampil saat scroll turun */
  let lastScrollY = window.scrollY;
  const floatingCart = $('floatingCart');
  window.addEventListener('scroll', function () {
    floatingCart.classList.toggle('show', window.scrollY > lastScrollY && window.scrollY > 200);
    lastScrollY = window.scrollY;
  }, { passive: true });

  updateCartUI();
})();
