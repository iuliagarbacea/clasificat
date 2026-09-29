// Umple pe fiecare pagină datele din config.js și activează poarta pe paginile marcate .gated.
(function () {
  const c = window.SITE || {};
  document.querySelectorAll('[data-company]').forEach(e => e.textContent = (c.company && c.company.name) || '');
  document.querySelectorAll('[data-version]').forEach(e => e.textContent = c.contentVersion || '');
  document.querySelectorAll('[data-price]').forEach(e => e.textContent = c.price || '');
  document.querySelectorAll('[data-mail]').forEach(e => { e.textContent = c.email || ''; e.href = 'mailto:' + (c.email || ''); });
  document.querySelectorAll('[data-buy]').forEach(e => {
    if (c.checkoutUrl) { e.href = c.checkoutUrl; }
    else { e.href = 'mailto:' + (c.email || '') + '?subject=Kit%20clasificare'; e.textContent = e.dataset.soon || 'În curând — scrie-ne'; e.classList.add('soon'); }
  });
  if (document.body.classList.contains('gated') && window.Gate) {
    document.body.classList.add('locked');
    window.Gate.require().then(ok => { if (ok) document.body.classList.remove('locked'); });
    document.addEventListener('gate:open', () => document.body.classList.remove('locked'));
  }
})();
