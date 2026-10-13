/* schedulegen.html - generator rundown acara
   Membutuhkan: assets/vendors.js (vendorData). html2canvas dimuat saat tombol "Simpan JPG" ditekan. */
(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const HTML2CANVAS = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  const LOGO_URL = 'https://raw.githubusercontent.com/dejede/portofolio/main/images/logo.png';
  const EMPTY_TIME = '--.-- WIB';

  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'];

  const THEMES = {
    green: { bg: '#f4f7f2', border: '#798e6d', accent: '#3e5241', light: '#c3d5ba', footerBg: '#e6eee2' },
    gold:  { bg: '#faf8f2', border: '#b0935a', accent: '#7a6435', light: '#e3d5b8', footerBg: '#f2ece0' },
    blue:  { bg: '#f2f6fa', border: '#5a82b0', accent: '#354e7a', light: '#b8cde3', footerBg: '#e0e8f2' },
    rose:  { bg: '#faf2f5', border: '#b05a7e', accent: '#7a3551', light: '#e3b8c9', footerBg: '#f2e0e7' }
  };

  const VENDOR_BOXES = {
    v_decor: 'decor',
    v_mua: 'mua',
    v_hairdoo: 'hairdoo',
    v_henna: 'henna',
    v_mc: 'mc'
  };

  /* ===== TANGGAL: "Senin 22 Agustus 2026" ===== */
  function fullDate(s) {
    if (!s) return '';
    const p = s.split('-');
    if (p.length !== 3) return '';
    const d = new Date(+p[0], +p[1] - 1, +p[2]); /* lokal, hindari geser zona waktu */
    if (isNaN(d.getTime())) return '';
    return HARI[d.getDay()] + ' ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  /* ===== GOOGLE MAPS ===== */
  function parseCoords(url) {
    if (!url) return null;
    const pats = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
      /[?&](?:q|query|ll|destination)=(-?\d+\.\d+)(?:,|%2C)\s*(-?\d+\.\d+)/i
    ];
    for (let i = 0; i < pats.length; i++) {
      const m = url.match(pats[i]);
      if (m) return { lat: m[1], lng: m[2] };
    }
    return null;
  }

  /* nama tempat dari link Google Maps lengkap (/maps/place/Nama+Tempat/ atau ?q=Nama) */
  function placeNameFromLink(url) {
    if (!url) return '';
    let m = url.match(/\/maps\/place\/([^/@?]+)/);
    if (!m) m = url.match(/[?&](?:q|query)=([^&]+)/);
    if (!m) return '';
    try {
      const name = decodeURIComponent(m[1].replace(/\+/g, ' ')).trim();
      return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(name) ? '' : name; /* abaikan jika hanya koordinat */
    } catch (e) { return ''; }
  }

  /* link yang dibagikan: link tempel > pin koordinat > pencarian teks lokasi */
  function mapsShareUrl() {
    const link = $('mapsLink').value.trim();
    if (link) return link;
    const loc = $('lokasi').value.trim();
    return loc ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc) : '';
  }

  /* isi otomatis Lokasi Utama dari koordinat (OpenStreetMap Nominatim, tanpa API key) */
  let lastGeoKey = '';
  function fillLocationFromCoords(c) {
    if (!c || $('lokasi').value.trim()) return;           /* jangan timpa yang sudah diketik */
    const key = c.lat + ',' + c.lng;
    if (key === lastGeoKey) return;
    lastGeoKey = key;

    fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&accept-language=id&lat=' +
      encodeURIComponent(c.lat) + '&lon=' + encodeURIComponent(c.lng))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || $('lokasi').value.trim()) return;
        const a = d.address || {};
        const parts = [
          d.name && d.name !== (a.road || '') ? d.name : '',
          a.village || a.hamlet || a.suburb || a.neighbourhood,
          a.city_district || a.municipality,
          a.county || a.city || a.town,
          a.state
        ].filter(Boolean);
        const uniq = parts.filter(function (p, i) { return parts.indexOf(p) === i; });
        if (!uniq.length) return;
        $('lokasi').value = uniq.join(', ');
        updateMap();
      })
      .catch(function () { lastGeoKey = ''; /* gagal: biarkan kosong, isi manual */ });
  }

  function updateMap() {
    const box = $('mapBox');
    const frame = $('mapFrame');
    const open = $('mapOpen');
    const link = $('mapsLink').value.trim();
    const loc = $('lokasi').value.trim();
    const c = parseCoords(link);
    const q = c ? (c.lat + ',' + c.lng) : loc;
    if (c) fillLocationFromCoords(c);

    if (!q) { box.hidden = true; frame.removeAttribute('src'); return; }

    const src = 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
    if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
    open.href = mapsShareUrl();
    box.hidden = false;
  }

  function debounce(fn, ms) {
    let t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  function useMyLocation() {
    if (!navigator.geolocation) { DJ.alert('Browser tidak mendukung lokasi.'); return; }
    const btn = $('btnMyLoc');
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(function (pos) {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      $('mapsLink').value = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      btn.disabled = false;
      updateMap();
    }, function () {
      btn.disabled = false;
      DJ.alert('Gagal mengambil lokasi. Izinkan akses lokasi atau tempel link Google Maps.');
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  /* ===== UI ===== */
  function toggleHari2() {
    const on = $('toggle2Hari').checked;
    $('tanggal2Container').hidden = !on;
    $('rundownTable').classList.toggle('hide-hari', !on);
  }

  function initVendors() {
    Object.keys(VENDOR_BOXES).forEach(function (boxId) {
      const box = $(boxId);
      const options = box && box.querySelector('.v-options');
      if (!options) return;

      const frag = document.createDocumentFragment();
      vendorData[VENDOR_BOXES[boxId]].forEach(function (v) {
        const item = document.createElement('div');
        item.className = 'v-item';
        item.innerHTML = '<input type="checkbox" value="' + DJ.escape(v.ig) + '"> ' + DJ.escape(v.name);
        frag.appendChild(item);
      });
      options.innerHTML = '';
      options.appendChild(frag);

      /* satu listener per kategori (event delegation) */
      options.addEventListener('click', function (e) {
        const item = e.target.closest('.v-item');
        if (!item) return;
        const cb = item.querySelector('input');
        if (e.target !== cb) cb.checked = !cb.checked;
        item.classList.toggle('active', cb.checked);
      });
    });
  }

  /* ===== KOLOM HARI: dropdown 1 / 2, rata tengah ===== */
  const hariStyle = document.createElement('style');
  hariStyle.textContent =
    '#rundownTable th.col-hari,#rundownTable td.cell-hari{text-align:center;vertical-align:middle;}' +
    '#rundownTable td.cell-hari{padding-left:4px;padding-right:4px;}' +
    '#rundownTable .sel-hari{display:block;width:auto;min-width:52px;margin:0 auto;padding:6px 8px;' +
      'text-align:center;text-align-last:center;font-weight:700;border-radius:8px;cursor:pointer;}' +
    '#rundownTable.hide-hari .col-hari{display:none;}';
  document.head.appendChild(hariStyle);

  function dayCellHTML(value) {
    return '<select class="sel-hari" aria-label="Pilih hari">' +
      '<option value="1"' + (value !== '2' ? ' selected' : '') + '>1</option>' +
      '<option value="2"' + (value === '2' ? ' selected' : '') + '>2</option>' +
      '</select>';
  }

  /* ubah sel Hari bawaan (teks "1") menjadi dropdown */
  function initDayCells() {
    document.querySelectorAll('#rundownTable tbody tr').forEach(function (tr) {
      const td = tr.querySelector('td');
      if (!td || td.querySelector('select')) return;
      const value = td.textContent.trim() === '2' ? '2' : '1';
      td.className = 'col-hari cell-hari';
      td.removeAttribute('contenteditable');
      td.innerHTML = dayCellHTML(value);
    });
  }

  function addRow() {
    /* baris baru mengikuti hari baris terakhir (praktis untuk acara 2 hari) */
    const last = document.querySelector('#rundownTable tbody tr:last-child .sel-hari');
    const hari = last ? last.value : '1';

    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="col-hari cell-hari">' + dayCellHTML(hari) + '</td>' +
      '<td contenteditable="true">' + EMPTY_TIME + '</td>' +
      '<td contenteditable="true">...</td>' +
      '<td><button type="button" class="btn-del" aria-label="Hapus baris">×</button></td>';
    document.querySelector('#rundownTable tbody').appendChild(tr);
  }

  function getSelected(id) {
    const checked = document.querySelectorAll('#' + id + ' input:checked');
    return Array.from(checked).map(function (c) { return c.value; }).join(', ') || '-';
  }

  function readRows() {
    const rows = [];
    const is2Hari = $('toggle2Hari').checked;
    document.querySelectorAll('#rundownTable tbody tr').forEach(function (tr) {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 3) return;
      const waktu = tds[1].innerText;
      if (waktu === EMPTY_TIME) return;
      const sel = tds[0].querySelector('select');
      let hari = sel ? sel.value : tds[0].innerText.trim();
      if (!is2Hari) hari = '1'; /* acara 1 hari: semua baris masuk hari 1 */
      rows.push({ hari: hari, waktu: waktu, kegiatan: tds[2].innerText });
    });
    return rows;
  }

  /* ===== PREVIEW ===== */
  function generate() {
    const t = THEMES[$('temaAcara').value] || THEMES.green;
    const jenis = $('jenisAcara').value;
    const nama = DJ.escape($('pengantin').value || 'Subject');
    const ig = DJ.escape($('igSubject').value);
    const is2Hari = $('toggle2Hari').checked;
    const lokasi = $('lokasi').value.trim();
    const tgl1 = fullDate($('tanggal').value);
    const tgl2 = is2Hari ? fullDate($('tanggal2').value) : '';

    let hari1 = '', hari2 = '';
    readRows().forEach(function (r) {
      const html =
        '<div style="display:flex; margin-bottom:8px; border-bottom:1px solid #f2f2f2; padding-bottom:5px; align-items: baseline;">' +
          '<b style="min-width:75px; color:' + t.accent + '; font-size:13px;">' + DJ.escape(r.waktu) + '</b>' +
          '<span style="font-size:13px;">: ' + DJ.escape(r.kegiatan) + '</span>' +
        '</div>';
      if (r.hari === '2') hari2 += html; else hari1 += html;
    });

    /* judul hari (2 hari): "Hari 1" + tanggal lengkap di sisi kanan */
    const dayTitle = function (label, date, top) {
      return '<div style="display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:4px; ' +
        'background:' + t.footerBg + '; border-left:4px solid ' + t.accent + '; padding:6px 10px; border-radius:4px; ' +
        (top ? 'margin-top:22px; ' : '') + 'margin-bottom:10px;">' +
        '<span style="color:' + t.accent + '; font-size:15px; font-weight:800;">' + label + '</span>' +
        (date ? '<span style="color:' + t.accent + '; font-size:12px; font-weight:600;">' + DJ.escape(date) + '</span>' : '') +
        '</div>';
    };
    const jadwal = is2Hari
      ? (hari1 ? dayTitle('Hari 1', tgl1, false) + hari1 : '') + (hari2 ? dayTitle('Hari 2', tgl2, !!hari1) + hari2 : '')
      : hari1;

    /* chip tanggal di header */
    const chip = function (text) {
      return '<div style="display:inline-block; margin:3px; padding:5px 14px; border:1px solid ' + t.border + '; ' +
        'border-radius:999px; background:' + t.footerBg + '; color:' + t.accent + '; font-size:12px; font-weight:700;">' +
        DJ.escape(text) + '</div>';
    };
    let dateBlock = '';
    if (is2Hari) {
      if (tgl1) dateBlock += chip('Hari 1 · ' + tgl1);
      if (tgl2) dateBlock += chip('Hari 2 · ' + tgl2);
    } else if (tgl1) {
      dateBlock = chip(tgl1);
    }
    if (dateBlock) dateBlock = '<div style="margin-top:12px;">' + dateBlock + '</div>';

    /* blok lokasi di gambar/preview: hanya NAMA lokasi (link Maps hanya untuk teks WhatsApp) */
    const lokasiName = lokasi || placeNameFromLink($('mapsLink').value.trim());
    let lokasiBlock = '';
    if (lokasiName) {
      lokasiBlock =
        '<div style="margin:16px 0 4px; padding:10px 12px; background:' + t.footerBg + '; border:1px solid ' + t.light + '; border-radius:8px; text-align:center;">' +
          '<b style="color:' + t.accent + '; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">Lokasi</b>' +
          '<div style="font-size:13px; color:#222; line-height:1.4;">' + DJ.escape(lokasiName) + '</div>' +
        '</div>';
    }

    const pill = function (label, id) {
      return '<div style="background:' + t.light + '; color:' + t.accent + '; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:600;">' +
        label + ': ' + DJ.escape(getSelected(id)) + '</div>';
    };

    $('previewArea').innerHTML =
      '<div id="captureArea" style="display:block; width:100%; max-width:500px; margin:0 auto; padding:15px; background:' + t.bg + '; font-family:\'Plus Jakarta Sans\', sans-serif; box-sizing:border-box;">' +
        '<div style="background:white; padding:25px; border:1px solid ' + t.border + '; position:relative; box-sizing:border-box;">' +
          '<div style="position:absolute; top:8px; left:8px; right:8px; bottom:8px; border:1px solid ' + t.light + '; pointer-events:none;"></div>' +

          '<div style="display:flex; align-items:center; justify-content:center; gap:8px; background:' + t.accent + '; color:white; padding:6px 12px; border-radius:8px; font-weight:700; font-size:11px; text-transform:uppercase; width:fit-content; margin:0 auto 16px; flex-wrap:wrap;">' +
            '<img src="' + LOGO_URL + '" width="25" height="25" crossorigin="anonymous" alt="Logo">' +
            '<span>DEJEDE | 085236578999</span>' +
          '</div>' +

          '<div style="text-align:center; margin-bottom:12px;">' +
            '<h2 style="color:' + t.accent + '; border-bottom:2px solid ' + t.border + '; display:inline-block; padding-bottom:5px; margin-top:0; font-size:18px;">RUNDOWN ' + DJ.escape(jenis.toUpperCase()) + '</h2>' +
            '<div style="font-size:22px; font-weight:800; margin-top:10px; color:#222;">' + nama + '</div>' +
            (ig ? '<div style="font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; margin-top:5px; color:' + t.border + ';"><span>Instagram: ' + ig + '</span></div>' : '') +
            dateBlock +
          '</div>' +

          lokasiBlock +

          '<div style="margin:20px 0;">' + jadwal + '</div>' +

          '<div style="border-top:1px solid ' + t.border + '; padding-top:15px; margin-top:10px;">' +
            '<b style="color:' + t.accent + '; font-size:11px; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Team Vendors:</b>' +
            '<div style="display:flex; flex-wrap:wrap; gap:6px;">' +
              pill('DEKOR', 'v_decor') + pill('MUA', 'v_mua') + pill('MC', 'v_mc') +
            '</div>' +
          '</div>' +

          '<div style="margin-top:20px; text-align:center; font-size:10px; color:' + t.accent + '; opacity:0.8; padding-top:10px; border-top:1px solid ' + t.footerBg + ';">' +
            'Terima kasih telah mempercayakan momen berharga Anda kepada <b style="color:' + t.accent + ';">DEJEDE</b>.<br>Semoga acara berjalan lancar, penuh berkah, dan berkesan. Aamiin.' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ===== EKSPOR ===== */
  /* Nama file: JENISACARA_NAMAKLIEN_TANGGAL_DEJEDE.jpg */
  function slug(str) {
    return String(str || '')
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /* "2026-08-22" -> "22Agustus2026" */
  function compactDate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
    if (!m) return '';
    return (+m[3]) + BULAN[+m[2] - 1] + m[1];
  }

  function buildFileName() {
    const jenis = slug($('jenisAcara').value).toUpperCase() || 'ACARA';
    const nama = (slug($('pengantin').value) || 'Klien').toUpperCase();
    let tgl = compactDate($('tanggal').value);
    if (!tgl) {
      const n = new Date();
      tgl = n.getDate() + BULAN[n.getMonth()] + n.getFullYear();
    }
    if ($('toggle2Hari').checked) {
      const t2 = compactDate($('tanggal2').value);
      if (t2) tgl += '-' + t2;
    }
    return jenis + '_' + nama + '_' + tgl + '_DEJEDE.jpg';
  }

  /* Lebar tetap ala desktop saat ekspor, agar hasil JPG sama di HP maupun PC */
  const EXPORT_WIDTH = 500;

  function downloadJPEG() {
    const target = $('captureArea');
    if (!target || target.innerHTML.trim() === '') {
      DJ.alert("Silakan klik tombol 'Lihat Preview' terlebih dahulu!");
      return;
    }

    /* klon di luar layar dengan lebar tetap, supaya tidak ikut menyempit di layar HP */
    const stage = document.createElement('div');
    stage.style.cssText = 'position:fixed; left:-10000px; top:0; width:' + EXPORT_WIDTH + 'px; pointer-events:none;';
    const clone = target.cloneNode(true);
    clone.removeAttribute('id');
    clone.style.width = EXPORT_WIDTH + 'px';
    clone.style.maxWidth = EXPORT_WIDTH + 'px';
    clone.style.margin = '0';
    stage.appendChild(clone);
    document.body.appendChild(stage);

    const cleanup = function () { if (stage.parentNode) stage.parentNode.removeChild(stage); };
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

    Promise.all([DJ.loadScript(HTML2CANVAS), fontsReady])
      .then(function () {
        /* useCORS wajib agar logo dari GitHub bisa diproses; windowWidth meniru layar desktop */
        return html2canvas(clone, {
          scale: 2,
          backgroundColor: null,
          useCORS: true,
          width: EXPORT_WIDTH,
          windowWidth: 1024,
          scrollX: 0,
          scrollY: 0
        });
      })
      .then(function (canvas) {
        cleanup();
        const link = document.createElement('a');
        link.download = buildFileName();
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      })
      .catch(function (err) {
        cleanup();
        console.error('Gagal download:', err);
        DJ.alert('Gagal menyimpan JPG. Pastikan koneksi internet aktif untuk memuat logo.');
      });
  }

  function getWAContent() {
    const jenis = $('jenisAcara').value;
    const nama = $('pengantin').value || 'Subject';
    const ig = $('igSubject').value || '-';
    const tgl1 = fullDate($('tanggal').value);
    const tgl2 = fullDate($('tanggal2').value);
    const loc = $('lokasi').value || 'Lokasi';
    const mapsUrl = mapsShareUrl();
    const is2Hari = $('toggle2Hari').checked;

    let hari1 = '', hari2 = '';
    readRows().forEach(function (r) {
      const line = '* ' + r.waktu + ' : ' + r.kegiatan + '\n';
      if (r.hari === '2') hari2 += line; else hari1 += line;
    });

    let tanggalTxt;
    if (is2Hari) {
      tanggalTxt = '📅 Hari 1: ' + (tgl1 || '-') + '\n📅 Hari 2: ' + (tgl2 || '-');
    } else {
      tanggalTxt = '📅 ' + (tgl1 || '-');
    }

    const jadwal = is2Hari
      ? '*HARI 1' + (tgl1 ? ' - ' + tgl1 : '') + '*\n' + hari1 + '\n' +
        (hari2 ? '*HARI 2' + (tgl2 ? ' - ' + tgl2 : '') + '*\n' + hari2 : '')
      : hari1;

    return '*RUNDOWN ' + jenis.toUpperCase() + '*\n*' + nama + '*\n📸 IG: ' + ig +
      '\n\n' + tanggalTxt + '\n📍 ' + loc +
      (mapsUrl ? '\n🗺️ Google Maps: ' + mapsUrl : '') +
      '\n\n' + jadwal + '\n*VENDORS:*\n- DEKOR: ' + getSelected('v_decor') +
      '\n- MUA: ' + getSelected('v_mua') + '\n- MC: ' + getSelected('v_mc') +
      '\n\nBy Dejede | 085236578999';
  }

  function copyText() {
    DJ.copy(getWAContent())
      .then(function () { DJ.alert('Teks Rundown Berhasil Disalin!'); })
      .catch(function () { DJ.alert('Gagal menyalin teks.'); });
  }

  function shareWA() {
    window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(getWAContent()), '_blank', 'noopener');
  }

  /* ===== NAMA KLIEN: huruf pertama tiap kata otomatis kapital ===== */
  function titleCase(str) {
    return str.toLowerCase().replace(/(^|[\s\-\/&.(])(\p{L})/gu, function (m, sep, ch) {
      return sep + ch.toUpperCase();
    });
  }

  function initNameCase() {
    const input = $('pengantin');

    input.addEventListener('input', function (e) {
      if (e.isComposing) return;
      const fixed = titleCase(input.value);
      if (fixed === input.value) return;
      const pos = input.selectionStart;                 /* panjang teks tidak berubah, kursor aman */
      input.value = fixed;
      try { input.setSelectionRange(pos, pos); } catch (err) { /* abaikan */ }
    });

    input.addEventListener('blur', function () {
      input.value = titleCase(input.value.replace(/\s+/g, ' ').trim());
    });
  }

  /* ===== INIT ===== */
  initVendors();
  initNameCase();
  $('rundownTable').classList.add('hide-hari');
  initDayCells();

  $('toggle2Hari').addEventListener('change', toggleHari2);
  $('addRow').addEventListener('click', addRow);
  $('btnPreview').addEventListener('click', generate);
  $('btnJpg').addEventListener('click', downloadJPEG);
  $('btnCopy').addEventListener('click', copyText);
  $('btnWA').addEventListener('click', shareWA);
  $('temaAcara').addEventListener('change', generate);

  /* Google Maps */
  const refreshMap = debounce(updateMap, 700);
  $('lokasi').addEventListener('input', refreshMap);
  $('mapsLink').addEventListener('input', refreshMap);
  $('btnMyLoc').addEventListener('click', useMyLocation);

  /* tombol hapus baris (termasuk baris yang ditambah lewat addRow) */
  $('rundownTable').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-del');
    if (btn) btn.closest('tr').remove();
  });
})();
