/* schedulegen.html - generator rundown acara
   Membutuhkan: assets/vendors.js (vendorData). html2canvas dimuat saat tombol "Simpan JPG" ditekan. */
(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const HTML2CANVAS = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  const LOGO_URL = 'https://raw.githubusercontent.com/dejede/portofolio/main/images/logo.png';
  const EMPTY_TIME = '--.-- WIB';

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

  const dateID = function (s) { return DJ.dateID(s) || '-'; };

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

  function addRow() {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td contenteditable="true">1</td><td contenteditable="true">' + EMPTY_TIME +
      '</td><td contenteditable="true">...</td>' +
      '<td><button type="button" class="btn-del" aria-label="Hapus baris">×</button></td>';
    document.querySelector('#rundownTable tbody').appendChild(tr);
  }

  function getSelected(id) {
    const checked = document.querySelectorAll('#' + id + ' input:checked');
    return Array.from(checked).map(function (c) { return c.value; }).join(', ') || '-';
  }

  function readRows() {
    const rows = [];
    document.querySelectorAll('#rundownTable tbody tr').forEach(function (tr) {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 3) return;
      const waktu = tds[1].innerText;
      if (waktu === EMPTY_TIME) return;
      rows.push({ hari: tds[0].innerText.trim(), waktu: waktu, kegiatan: tds[2].innerText });
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

    let hari1 = '', hari2 = '';
    readRows().forEach(function (r) {
      const html =
        '<div style="display:flex; margin-bottom:8px; border-bottom:1px solid #f2f2f2; padding-bottom:5px; align-items: baseline;">' +
          '<b style="min-width:75px; color:' + t.accent + '; font-size:13px;">' + DJ.escape(r.waktu) + '</b>' +
          '<span style="font-size:13px;">: ' + DJ.escape(r.kegiatan) + '</span>' +
        '</div>';
      if (r.hari === '2') hari2 += html; else hari1 += html;
    });

    const dayTitle = function (label, top) {
      return '<h3 style="color:' + t.accent + '; font-size:16px; ' + (top ? 'margin-top:20px; ' : '') + 'margin-bottom:10px;">' + label + '</h3>';
    };
    const jadwal = is2Hari
      ? (hari1 ? dayTitle('Hari 1', false) + hari1 : '') + (hari2 ? dayTitle('Hari 2', true) + hari2 : '')
      : hari1;

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

          '<div style="text-align:center; margin-bottom:20px;">' +
            '<h2 style="color:' + t.accent + '; border-bottom:2px solid ' + t.border + '; display:inline-block; padding-bottom:5px; margin-top:0; font-size:18px;">RUNDOWN ' + DJ.escape(jenis.toUpperCase()) + '</h2>' +
            '<div style="font-size:22px; font-weight:800; margin-top:10px; color:#222;">' + nama + '</div>' +
            (ig ? '<div style="font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px; margin-top:5px; color:' + t.border + ';"><span>Instagram: ' + ig + '</span></div>' : '') +
          '</div>' +

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
  function downloadJPEG() {
    const target = $('captureArea');
    if (!target || target.innerHTML.trim() === '') {
      DJ.alert("Silakan klik tombol 'Lihat Preview' terlebih dahulu!");
      return;
    }

    DJ.loadScript(HTML2CANVAS)
      .then(function () {
        /* useCORS wajib agar logo dari GitHub bisa diproses */
        return html2canvas(target, { scale: 2, backgroundColor: null, useCORS: true });
      })
      .then(function (canvas) {
        const link = document.createElement('a');
        link.download = 'Rundown-Dejede.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
      })
      .catch(function (err) {
        console.error('Gagal download:', err);
        DJ.alert('Gagal menyimpan JPG. Pastikan koneksi internet aktif untuk memuat logo.');
      });
  }

  function getWAContent() {
    const jenis = $('jenisAcara').value;
    const nama = $('pengantin').value || 'Subject';
    const ig = $('igSubject').value || '-';
    const tgl1 = dateID($('tanggal').value);
    const tgl2 = dateID($('tanggal2').value);
    const loc = $('lokasi').value || 'Lokasi';
    const is2Hari = $('toggle2Hari').checked;

    let hari1 = '', hari2 = '';
    readRows().forEach(function (r) {
      const line = '* ' + r.waktu + ' : ' + r.kegiatan + '\n';
      if (r.hari === '2') hari2 += line; else hari1 += line;
    });

    const jadwal = is2Hari
      ? '*HARI 1*\n' + hari1 + '\n' + (hari2 ? '*HARI 2*\n' + hari2 : '')
      : hari1;

    return '*RUNDOWN ' + jenis.toUpperCase() + '*\n*' + nama + '*\n📸 IG: ' + ig +
      '\n\n📅 ' + tgl1 + (tgl2 !== '-' ? ' & ' + tgl2 : '') + '\n📍 ' + loc +
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

  /* ===== INIT ===== */
  initVendors();
  $('rundownTable').classList.add('hide-hari');

  $('toggle2Hari').addEventListener('change', toggleHari2);
  $('addRow').addEventListener('click', addRow);
  $('btnPreview').addEventListener('click', generate);
  $('btnJpg').addEventListener('click', downloadJPEG);
  $('btnCopy').addEventListener('click', copyText);
  $('btnWA').addEventListener('click', shareWA);
  $('temaAcara').addEventListener('change', generate);

  /* tombol hapus baris (termasuk baris yang ditambah lewat addRow) */
  $('rundownTable').addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-del');
    if (btn) btn.closest('tr').remove();
  });
})();
