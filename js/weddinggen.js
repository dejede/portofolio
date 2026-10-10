/* weddinggen.html - generator caption post pernikahan
   Membutuhkan: assets/vendors.js (vendorData) & assets/quotes.js (quoteData) */
(function () {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const opens = quoteData.opens;
  const closes = quoteData.closes;

  const VENDOR_LISTS = {
    vendor_decor_list: vendorData.decor,
    vendor_mua_list: vendorData.mua,
    vendor_henna_list: vendorData.henna,
    vendor_hairdoo_list: vendorData.hairdoo,
    vendor_mc_list: vendorData.mc,
    vendor_support_list: vendorData.support,
    vendor_entertainment_list: vendorData.entertainment
  };

  const VENDOR_LABELS = [
    ['Dekorasi', 'vendor_decor_list'],
    ['MUA', 'vendor_mua_list'],
    ['Henna', 'vendor_henna_list'],
    ['Hairdo', 'vendor_hairdoo_list'],
    ['MC', 'vendor_mc_list'],
    ['Support', 'vendor_support_list'],
    ['Entertainment', 'vendor_entertainment_list']
  ];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function setup() {
    Object.keys(VENDOR_LISTS).forEach(function (id) {
      const el = $(id);
      if (!el) return;
      const frag = document.createDocumentFragment();
      VENDOR_LISTS[id].forEach(function (v) {
        const label = document.createElement('label');
        label.className = 'v-item';
        label.innerHTML = '<input type="checkbox" value="' + DJ.escape(v.ig) + '"> ' + DJ.escape(v.name);
        frag.appendChild(label);
      });
      el.appendChild(frag);
    });

    const openSel = $('open_custom');
    const closeSel = $('close_custom');
    opens.forEach(function (l) { openSel.add(new Option(l, l)); });
    closes.forEach(function (l) { closeSel.add(new Option(l, l)); });
  }

  function checkedValues(id) {
    return Array.from($(id).querySelectorAll('input:checked')).map(function (c) { return c.value; }).join(', ');
  }

  function generate() {
    const n1 = $('name1').value || '[Nama]';
    const n2 = $('name2').value || '[Nama]';
    const loc = $('location').value || '[Lokasi]';
    const tpl = $('template').value;
    const insta = $('insta').value;
    const dStr = DJ.dateID($('date').value) || '[Tanggal]';

    const vList = VENDOR_LABELS
      .map(function (x) { return { l: x[0], v: checkedValues(x[1]) }; })
      .filter(function (x) { return x.v !== ''; })
      .map(function (x) { return x.l + ': ' + x.v; });

    const vBlock = vList.length > 0 ? '\n\nVendor:\n' + vList.join('\n') : '';
    const op = $('open_custom').value || rand(opens);
    const cl = $('close_custom').value || rand(closes);

    const msg = tpl === 'carousel' ? '\nSwipe untuk momen penuh cinta.\n'
              : tpl === 'reels' ? '\nWedding Highlight Video.\n'
              : '\n';

    const res = op + '\n\nPernikahan ' + n1 + ' & ' + n2 + '\n📍 ' + loc + '\n📅 ' + dStr + '\n' + msg +
      '\nCaptured by ' + insta + '\nJl. Kampung Renteng - Purorejo - Tempursari - Lumajang | 085236578999' +
      vBlock + '\n\n' + cl;

    $('preview').textContent = res.trim();
  }

  setup();

  $('generate').addEventListener('click', generate);

  $('copy').addEventListener('click', function () {
    DJ.copy($('preview').textContent)
      .then(function () { DJ.alert('Caption tersalin!'); })
      .catch(function () { DJ.alert('Gagal menyalin caption.'); });
  });

  $('randomize').addEventListener('click', function () {
    $('open_custom').value = '';
    $('close_custom').value = '';
    generate();
  });

  $('download').addEventListener('click', function () {
    const blob = new Blob([$('preview').textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'caption-dejede.txt';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
})();
