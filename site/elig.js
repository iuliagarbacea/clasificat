// Verificarea de eligibilitate (3 întrebări, verdict pe loc). Randează în orice <div data-elig>.
// Regulile: content/01-eligibilitate.md (Normele metodologice, Ordin 948/2026). Nimic nu pleacă din browser.
(function () {
  const Q = [
    { k: 'rooms', t: 'Câte camere de dormit închiriezi, adunat pe toate proprietățile tale?', h: 'Se numără pe persoană, nu pe imobil.',
      o: [['ok', 'Cel mult 7'], ['many', '8 sau mai multe']] },
    { k: 'type', t: 'Ce este imobilul?', h: '„Casă de vacanță”, „vilă”, „pensiune” sunt tipuri rezervate firmelor; ca persoană fizică alegi doar dintre cele două de mai jos.',
      o: [['house', 'Casă individuală, fără pereți comuni cu alți proprietari și fără asociație'], ['flat', 'Apartament în bloc sau orice imobil cu pereți comuni ori asociație de proprietari']] },
    { k: 'proof', t: 'Ai dovada că imobilul este construit legal?', h: 'Una dintre: autorizație de construire, certificat de atestare a edificării sau extras de carte funciară cu construcția intabulată.',
      o: [['yes', 'Da, am una dintre ele'], ['no', 'Nu sau nu știu']] }
  ];
  const V = {
    many: { c: 'stop', h: 'Nu ca persoană fizică.', p: 'De la 8 camere în sus ai nevoie de PFA sau SRL și de alt tip de structură (pensiune, vilă). Kitul nu acoperă cazul acesta.',
      l: [] },
    noproof: { c: 'warn', h: 'Nu încă. Rezolvă întâi dovada construcției.', p: 'Ești în limita legii, dar fără dovada construcției legale dosarul se blochează; este cel mai frecvent motiv de dosar întors la casele de vacanță. Ceri certificatul de atestare a edificării la Primărie sau intabulezi construcția la OCPI, apoi revii aici.',
      l: [['/ghid/eligibilitate.html', 'Ce este dovada construcției legale'], ['/acte-necesare-regim-hotelier.html', 'Lista completă de acte']] },
    house: { c: 'ok', h: 'Da. Drumul „casă”.', p: 'Poți depune ca persoană fizică. Poți închiria toată casa ca o singură unitate; în acte rămâne „camere de închiriat în locuință familială”, cu camerele numerotate. În loc de avizul asociației depui o declarație pe propria răspundere că nu ai pereți comuni.',
      l: [['/#pret', 'Ia kitul'], ['/acte-necesare-regim-hotelier.html', 'Actele necesare, gratuit']] },
    flat: { c: 'ok', h: 'Da. Drumul „apartament”.', p: 'Poți depune ca persoană fizică. În plus față de casă ai nevoie de avizul comitetului executiv al asociației și de acordul scris al vecinilor cu pereți comuni (stânga, dreapta, deasupra, dedesubt).',
      l: [['/#pret', 'Ia kitul'], ['/acte-necesare-regim-hotelier.html', 'Actele necesare, gratuit']] }
  };
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function render(root, idx) {
    const id = 'elig' + idx;
    root.innerHTML = '<div class="elig">' + Q.map((q, i) =>
      '<fieldset class="elig-q" data-k="' + q.k + '"><legend><span class="n">' + (i + 1) + '</span>' + esc(q.t) + '</legend>' +
      '<p class="hint">' + esc(q.h) + '</p><div class="opts">' +
      q.o.map(o => '<label><input type="radio" name="' + id + q.k + '" value="' + o[0] + '"><span>' + esc(o[1]) + '</span></label>').join('') +
      '</div></fieldset>').join('') +
      '<div class="elig-v" hidden aria-live="polite"></div></div>';
    const ans = {}, out = root.querySelector('.elig-v');
    root.addEventListener('change', e => {
      if (e.target.type !== 'radio') return;
      ans[e.target.closest('.elig-q').dataset.k] = e.target.value;
      const key = ans.rooms === 'many' ? 'many' : (ans.rooms && ans.type && ans.proof) ? (ans.proof === 'no' ? 'noproof' : ans.type) : null;
      if (!key) { out.hidden = true; return; }
      const v = V[key];
      try { localStorage.setItem("hostkit.elig.v1", JSON.stringify({ rooms: ans.rooms || "", type: ans.type || "", proof: ans.proof || "", at: Date.now() })); } catch (e) { }
      out.className = 'elig-v ' + v.c; out.hidden = false;
      out.innerHTML = '<strong>' + esc(v.h) + '</strong><p>' + esc(v.p) + '</p>' +
        (v.l.length ? '<div class="links">' + v.l.map(l => l[0] === '/#pret'
          ? '<a href="/#pret" class="kit">' + esc(l[1]) + ((window.SITE || {}).price ? ', ' + esc(window.SITE.price) : '') + '<span class="arr">→</span></a>'
          : '<a href="' + l[0] + '"' + (l[1].indexOf('(kit)') > 0 ? ' class="kit"' : '') + '>' + esc(l[1]) + '</a>').join('') + '</div>' : '') +
        (v.c === 'ok' ? '<p class="keep">Răspunsurile rămân în browserul tău. Aplicația din kit pornește direct de la ele, nu le mai ceri o dată.</p>' : '');
      if (root.getBoundingClientRect().bottom > innerHeight) out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  document.querySelectorAll('[data-elig]').forEach(render);
})();
