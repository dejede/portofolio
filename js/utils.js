/* Dejede - helper bersama (dimuat sebelum js halaman) */
(function (w) {
  'use strict';

  const loaded = {};

  function once(key, create) {
    if (!loaded[key]) {
      loaded[key] = new Promise(function (ok, fail) {
        const el = create();
        el.onload = ok;
        el.onerror = function () { delete loaded[key]; fail(new Error('Gagal memuat ' + key)); };
        document.head.appendChild(el);
      });
    }
    return loaded[key];
  }


  /* ===== DIALOG PESAN (pengganti alert bawaan browser) ===== */
  const ICONS = {
    success: '<path d="M5 13l4 4L19 7"/>',
    error: '<path d="M6 6l12 12M18 6L6 18"/>',
    warn: '<path d="M12 6v8M12 18h.01"/>',
    info: '<path d="M12 10v8M12 6h.01"/>'
  };
  const TITLES = { success: 'Berhasil', error: 'Gagal', warn: 'Perhatian', info: 'Info' };
  const queue = [];
  let overlay, box, active = false, closing = false, current = null, openedAt = 0, lastFocus = null;

  function detectType(msg) {
    if (/^❌|gagal|salah|tidak valid|tidak ditemukan/i.test(msg)) return 'error';
    if (/^✅|berhasil|tersalin|dibuka|aktif/i.test(msg)) return 'success';
    if (/harap|silakan|minimal|kosong|sudah ada/i.test(msg)) return 'warn';
    return 'info';
  }

  /* Desktop: tengah layar. Mobile: di bawah navbar & di atas keyboard (visualViewport) */
  function place() {
    if (!overlay) return;
    const vv = w.visualViewport;
    const s = overlay.style;
    if (!vv || !w.matchMedia('(max-width:768px)').matches) {
      s.left = s.top = '0'; s.width = '100%'; s.height = '100%'; s.paddingTop = s.paddingBottom = '';
      return;
    }
    const nav = document.querySelector('.navbar');
    const navBottom = nav ? Math.max(nav.getBoundingClientRect().bottom - vv.offsetTop, 0) : 0;
    s.left = vv.offsetLeft + 'px';
    s.top = vv.offsetTop + 'px';
    s.width = vv.width + 'px';
    s.height = vv.height + 'px';
    s.paddingTop = Math.min(navBottom + 8, vv.height * 0.45) + 'px';
    s.paddingBottom = '8px';
  }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'dj-overlay';
    overlay.hidden = true;
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'djTitle');
    overlay.setAttribute('aria-describedby', 'djMsg');
    overlay.innerHTML =
      '<div class="dj-box">' +
        '<div class="dj-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></svg></div>' +
        '<div class="dj-title" id="djTitle"></div>' +
        '<div class="dj-msg" id="djMsg"></div>' +
        '<button type="button" class="dj-ok">OK</button>' +
      '</div>';
    document.body.appendChild(overlay);
    box = overlay.firstChild;
    overlay.addEventListener('click', function (e) { if (e.target === overlay || e.target.classList.contains('dj-ok')) closeDialog(); });
    document.addEventListener('keydown', function (e) {
      if (!active || (e.key !== 'Enter' && e.key !== 'Escape' && e.key !== ' ')) return;
      e.preventDefault(); e.stopPropagation();
      if (Date.now() - openedAt > 200) closeDialog();
    }, true);
    if (w.visualViewport) {
      w.visualViewport.addEventListener('resize', place);
      w.visualViewport.addEventListener('scroll', place);
    }
    w.addEventListener('resize', place);
  }

  function showNext() {
    current = queue.shift();
    if (!current) { active = false; return; }
    active = true;
    if (!overlay) build();

    const type = current.type || detectType(current.msg);
    box.className = 'dj-box dj-' + type;
    box.querySelector('svg').innerHTML = ICONS[type];
    overlay.querySelector('.dj-title').textContent = TITLES[type];
    overlay.querySelector('.dj-msg').textContent = String(current.msg).replace(/^[✅❌⚠️\s]+/, '');

    lastFocus = document.activeElement;
    place();
    overlay.hidden = false;
    openedAt = Date.now();
    requestAnimationFrame(function () { overlay.classList.add('show'); });
    /* di layar sentuh jangan pindahkan fokus agar keyboard tidak tertutup/berubah */
    if (!w.matchMedia('(pointer:coarse)').matches) overlay.querySelector('.dj-ok').focus();
  }

  function closeDialog() {
    if (!active || closing) return;
    closing = true;
    const item = current;
    overlay.classList.remove('show');
    setTimeout(function () {
      overlay.hidden = true;
      const f = lastFocus;
      const typing = f && /^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName);
      if (f && document.contains(f) && !(typing && w.matchMedia('(pointer:coarse)').matches)) f.focus({ preventScroll: true });
      closing = false;
      item.resolve();
      showNext();
    }, 180);
  }

  function showAlert(msg, type) {
    return new Promise(function (resolve) {
      queue.push({ msg: msg, type: type, resolve: resolve });
      if (!active) showNext();
    });
  }

  w.DJ = {
    alert: showAlert,

    rupiah: function (n) { return 'Rp ' + n.toLocaleString('id-ID'); },

    /* "2026-10-10" -> "Sabtu, 10 Oktober 2026" ('' jika kosong) */
    dateID: function (str) {
      if (!str) return '';
      return new Date(str + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    },

    escape: function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },

    /* Clipboard modern; jika ditolak (WebView in-app, HTTP, dll) fallback ke execCommand */
    copy: function (text) {
      function legacy() {
        return new Promise(function (ok, fail) {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          ta.setSelectionRange(0, 99999);
          try { document.execCommand('copy') ? ok() : fail(); } catch (e) { fail(e); }
          ta.remove();
        });
      }
      if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text).catch(legacy);
      return legacy();
    },

    /* Muat library hanya saat dibutuhkan */
    loadScript: function (src) {
      return once(src, function () { const s = document.createElement('script'); s.src = src; return s; });
    },
    loadCSS: function (href) {
      return once(href, function () { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; return l; });
    }
  };
})(window);
