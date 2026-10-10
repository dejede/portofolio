/* booking.html - ringkasan booking, DP, kirim WhatsApp, salin nomor rekening */
(function () {
  'use strict';

  const MIN_DP = 300000;
  const WHATSAPP_NUMBER = '6285236578999';
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const $ = function (id) { return document.getElementById(id); };
  const rupiah = DJ.rupiah;

  const clientName = $('clientName');
  const date = $('bookingDate');
  const area = $('area');
  const days = $('days');
  const dpOption = $('dpOption');
  const customDP = $('customDP');
  const remainingInfo = $('remainingInfo');

  const sum = {
    pkg: $('sumPackage'), date: $('sumDate'), area: $('sumArea'), days: $('sumDays'),
    pkgPrice: $('sumPackagePrice'), extra: $('sumExtra'), total: $('sumTotal')
  };

  /* Keranjang dari halaman pristlist */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('dejedeCart')) || []; } catch (e) { cart = []; }
  if (!Array.isArray(cart)) cart = [];

  /* ===== UTILITAS ===== */
  function formatRibuan(value) {
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function formatTanggal(str) {
    if (!str) return '-';
    const d = new Date(str + 'T00:00:00');
    return HARI[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
  }

  function packageTotal() {
    return cart.reduce(function (total, item) { return total + item.price; }, 0);
  }

  function customAmount() {
    return parseInt(customDP.value.replace(/\D/g, '') || 0);
  }

  /* ===== RINGKASAN ===== */
  function updateSummary() {
    const pkgTotal = packageTotal();
    const extraTotal = parseInt(area.value || 0) + parseInt(days.value || 0);
    const grandTotal = pkgTotal + extraTotal;

    let dpAmount;
    if (dpOption.value === 'custom') {
      dpAmount = customAmount();
      remainingInfo.innerHTML = (dpAmount > 0 && dpAmount < MIN_DP)
        ? '<span class="warn-red">Minimal DP ' + rupiah(MIN_DP) + '</span>'
        : 'Sisa Pelunasan: <strong>' + rupiah(grandTotal - dpAmount) + '</strong>';
    } else {
      dpAmount = Math.round(grandTotal * parseInt(dpOption.value) / 100);
      remainingInfo.innerHTML = 'Sisa Pelunasan: <strong>' + rupiah(grandTotal - dpAmount) + '</strong>';
    }

    sum.pkg.textContent = cart.length === 0 ? 'Belum ada paket dipilih' : cart.map(function (p) { return p.name; }).join(', ');
    sum.date.textContent = formatTanggal(date.value);
    sum.area.textContent = area.options[area.selectedIndex].text;
    sum.days.textContent = days.options[days.selectedIndex].text;
    sum.pkgPrice.textContent = rupiah(pkgTotal);
    sum.extra.textContent = rupiah(extraTotal);
    sum.total.textContent = rupiah(dpAmount);
  }

  /* ===== KIRIM WHATSAPP ===== */
  function sendWhatsApp() {
    if (!clientName.value || !date.value || cart.length === 0) {
      return DJ.alert('Harap lengkapi Nama, Tanggal, dan Keranjang terlebih dahulu.');
    }

    const pkgTotal = packageTotal();
    const extraTotal = parseInt(area.value || 0) + parseInt(days.value || 0);
    const grandTotal = pkgTotal + extraTotal;

    let dpAmount;
    if (dpOption.value === 'custom') {
      dpAmount = customAmount();
      if (dpAmount < MIN_DP) return DJ.alert('DP minimal ' + rupiah(MIN_DP));
    } else {
      dpAmount = Math.round(grandTotal * parseInt(dpOption.value) / 100);
    }

    const message = `Halo *DEJEDE* 👋
Berikut adalah detail pesanan :
━━━━━━━━━━━━━━━━━━━━━━
👤 *NAMA CLIENT:* ${clientName.value}
📅 *TANGGAL:* ${formatTanggal(date.value)}
📍 *WILAYAH:* ${area.options[area.selectedIndex].text}
⏳ *DURASI:* ${days.options[days.selectedIndex].text}
📋 *DETAIL PAKET:*
${cart.map(function (p) { return `- ${p.name} (${rupiah(p.price)})`; }).join('\n')}
💰 *RINCIAN BIAYA:*
• Total Paket: ${rupiah(pkgTotal)}
• Tambahan: ${rupiah(extraTotal)}
━━━━━━━━━━━━━━━━━━━━━━
🔥 *GRAND TOTAL: ${rupiah(grandTotal)}*
💳 *JUMLAH BAYAR (DP): ${rupiah(dpAmount)}*
📉 *SISA PELUNASAN: ${rupiah(grandTotal - dpAmount)}*

🏦 *INFO PEMBAYARAN:*
• *BRI:* 6320-01-003835-533
• *DANA/SHOPEEPAY:* 085236578999
• *A/N:* Adi Sofianto / Dejede

⚠️ *CATATAN PENTING:*
Jika data booking sudah sesuai, silakan 
transfer DP minimal Rp300.000
atau pelunasan maksimal 1x24 jam
untuk mengamankan jadwal. 
Mohon kirimkan bukti transfer segera. 
Terima kasih telah mempercayakan dokumentasi 
kepada *DEJEDE*. Semoga acara Anda lancar 
tanpa kendala. Amin. 🙏✨
#DejedePhotography`;

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
    try { localStorage.removeItem('dejedeCart'); } catch (e) { /* abaikan */ }
  }

  /* ===== SALIN NOMOR REKENING ===== */
  function copyText(elementId, btn) {
    const el = $(elementId);
    if (!el) { DJ.alert('Element tidak ditemukan: ' + elementId); return; }

    const text = el.textContent.trim();
    DJ.copy(text)
      .then(function () {
        if (btn) {
          const label = btn.dataset.label || (btn.dataset.label = btn.textContent);
          btn.textContent = 'Tersalin!';
          btn.classList.add('copied');
          setTimeout(function () { btn.textContent = label; btn.classList.remove('copied'); }, 1500);
        }
        DJ.alert('✅ Berhasil disalin: ' + text);
      })
      .catch(function () { DJ.alert('❌ Gagal copy'); });
  }

  /* ===== EVENT ===== */
  customDP.addEventListener('input', function () {
    this.value = formatRibuan(this.value);
    updateSummary();
  });

  dpOption.addEventListener('change', function () {
    customDP.hidden = this.value !== 'custom';
    if (this.value !== 'custom') customDP.value = '';
    updateSummary();
  });

  [area, days, date].forEach(function (el) { el.addEventListener('change', updateSummary); });
  $('sendWA').addEventListener('click', sendWhatsApp);

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () { copyText(btn.dataset.copy, btn); });
  });

  updateSummary();
})();
