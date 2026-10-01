// Construiește paginile ghidului (site/ghid/*.html) din content/*.md. Rulat manual: node build/build-ghid.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'content'), OUT = path.join(ROOT, 'site', 'ghid');

// updated = data ultimei verificări a conținutului (apare sub titlu); faq = întrebări redate ca <details> (și ca FAQPage de build-seo.js).
const PAGES = [
  { file: '01-eligibilitate.md', slug: 'eligibilitate', title: 'Ești eligibil? Ce tip de structură ai?', free: true, updated: '24.09.2026', desc: 'Cine poate clasifica camere de închiriat ca persoană fizică, limita de 7 camere, casă sau apartament, dovada construcției legale.',
    faq: [
      ['Câte camere pot închiria ca persoană fizică?', 'Cel mult 7 camere și 14 locuri în total, adunate pe toate proprietățile tale. De la 8 camere în sus ai nevoie de PFA sau SRL și de alt tip de structură.'],
      ['Am două apartamente în orașe diferite. Se adună?', 'Da. Limita de 7 camere se socotește pe persoană, nu pe imobil. Fiecare imobil primește însă propriul certificat.'],
      ['Pot clasifica o pensiune sau o vilă ca persoană fizică?', 'Nu. „Pensiune”, „vilă” și „casă de vacanță” sunt tipuri rezervate operatorilor economici. Ca persoană fizică tipul este „apartamente sau camere de închiriat în locuințe familiale”.'],
      ['Certificatul de clasificare expiră?', 'Nu. Are valabilitate nelimitată, dar se poate retrage dacă la un control nu mai sunt îndeplinite criteriile categoriei.'],
      ['Nu am autorizație de construire. Pot depune?', 'Nu încă. Ai nevoie de una dintre: autorizație de construire, certificat de atestare a edificării de la Primărie sau construcția intabulată în cartea funciară. Rezolvă asta înainte de orice altceva.'],
    ] },
  { file: '02-criterii-stele.md', slug: 'criterii-stele', title: 'Criteriile pe stele (Anexa 10)', free: false, desc: 'Lista completă a criteriilor pentru 1, 2 și 3 stele la camere și apartamente de închiriat, după Ordinul 948/2026.' },
  { file: '03-dosar-casa.md', slug: 'dosar-casa', title: 'Dosarul pentru o casă individuală', free: false, desc: 'Documentele pe sloturile din SITUR, ipoteca și greșelile care întorc dosarul la o casă fără pereți comuni.' },
  { file: '04-dosar-apartament.md', slug: 'dosar-apartament', title: 'Dosarul pentru un apartament în bloc', free: false, desc: 'Avizul asociației, acordul vecinilor cu pereți comuni și declarația de enumerare.' },
  { file: '05-depunere-situr.md', slug: 'depunere-situr', title: 'Depunerea: ROeID, SITUR pas cu pas și ce urmează', free: false, desc: 'Cont SITUR cu ROeID, cei 7 pași ai solicitării cu fiecare câmp, sloturile de încărcare, termene legale și practică, vizita de verificare.' },
  { file: '06-fiscal.md', slug: 'fiscal', title: 'Fiscal: impozit, CASS, TVA pe comision, facturi', free: false, desc: 'Regimul fiscal 2026 pentru cel mult 7 camere: 7% efectiv, CASS, codul special de TVA, declarația unică, casa de marcat.' },
  { file: '07-cod-unic-situr.md', slug: 'cod-unic-situr', title: 'Codul unic SITUR: stare', free: true, updated: '22.09.2026', desc: 'Stadiul generării codului unic SITUR cerut de platforme din 20.05.2026 și ce poți face acum.',
    faq: [
      ['Pot cere codul unic SITUR fără certificat de clasificare?', 'Nu. Codul se emite doar pentru o unitate deja clasificată. Certificatul este pasul de dinainte și singurul pe care îl poți face acum.'],
      ['Booking sau Airbnb îmi închid anunțul dacă nu am cod?', 'La 22.09.2026 nicio platformă nu începuse dezactivarea în România; ambele au legat-o de integrarea tehnică cu SITUR. Vei primi e-mail de la platformă cu termenul de completare.'],
      ['Codul unic SITUR este același lucru cu certificatul de clasificare?', 'Nu. Certificatul confirmă tipul unității și categoria de stele; codul este numărul de înregistrare pe care îl afișezi în anunț, cerut de Regulamentul UE 2024/1028 din 20.05.2026.'],
    ] },
];

const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g, (m, c) => '<code>' + c.replace(/templates\/[\w-]+\.md/, 'document generat de aplicație') + '</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/VERIFICARI\.md/g, 'lista de verificări');
  return s;
}
function md(src) {
  const lines = src.split(/\r?\n/);
  let out = [], i = 0;
  const para = [];
  const flush = () => { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para.length = 0; } };
  while (i < lines.length) {
    const l = lines[i];
    if (/^#\s/.test(l)) { flush(); i++; continue; } // titlul H1 vine din PAGES
    if (/^##\s/.test(l)) { flush(); out.push('<h2>' + inline(l.replace(/^##\s+/, '')) + '</h2>'); i++; continue; }
    if (/^>\s?/.test(l)) { flush(); const b = []; while (i < lines.length && /^>\s?/.test(lines[i])) { b.push(lines[i].replace(/^>\s?/, '')); i++; } out.push('<blockquote>' + inline(b.join(' ')) + '</blockquote>'); continue; }
    // captură de ecran: ![legendă](/ghid/img/x.png) pe o linie proprie → <figure class="shot">
    if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(l)) { flush(); const m = l.match(/^!\[([^\]]*)\]\(([^)]+)\)/); out.push('<figure class="shot"><img src="' + m[2] + '" alt="' + esc(m[1]) + '" loading="lazy"><figcaption>' + inline(m[1]) + '</figcaption></figure>'); i++; continue; }
    if (/^\|/.test(l)) {
      flush(); const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      const head = cells(rows[0]); const body = rows.slice(1).filter(r => !/^\|\s*:?-+/.test(r));
      const align = (rows[1] || '').replace(/^\||\|$/g, '').split('|').map(c => /^\s*:-+:\s*$/.test(c) ? ' class="c"' : '');
      out.push('<table><thead><tr>' + head.map((h, k) => '<th' + (align[k] || '') + '>' + inline(h) + '</th>').join('') + '</tr></thead><tbody>' +
        body.map(r => '<tr>' + cells(r).map((c, k) => '<td' + (align[k] || '') + '>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    if (/^(-|\d+\.)\s/.test(l)) {
      flush(); const ordered = /^\d+\./.test(l); const items = [];
      while (i < lines.length && /^(-|\d+\.)\s/.test(lines[i])) {
        let it = lines[i].replace(/^(-|\d+\.)\s+/, ''); i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i])) { it += ' ' + lines[i].trim(); i++; }
        items.push('<li>' + inline(it) + '</li>');
      }
      out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>')); continue;
    }
    if (/^\*[^*]+\*$/.test(l.trim())) { flush(); out.push('<p class="muted"><em>' + inline(l.trim().slice(1, -1)) + '</em></p>'); i++; continue; }
    if (!l.trim()) { flush(); i++; continue; }
    para.push(l.trim()); i++;
  }
  flush();
  return out.join('\n');
}

function page(p, body, all) {
  const nav = all.map(q => `<li><a href="/ghid/${q.slug}.html"${q.slug === p.slug ? ' class="cur"' : ''}>${esc(q.title)}</a>${q.free ? '' : ' <span class="lock" title="conținut din kit">●</span>'}</li>`).join('');
  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} — ghid clasificare camere de închiriat</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png">
<link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/styles.css?v=202610011106">
<script src="/config.js?v=202610011106"></script>
${p.free ? '' : '<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">\n<script src="/gate.js?v=202610011106"></script>'}
</head>
<body class="ghid${p.free ? '' : ' gated'}">
<header class="top" data-nosnippet><a class="brand" href="/"><img src="/favicon.svg" alt="" width="26" height="26"> Clasificat</a><nav aria-label="Meniu">
  <a href="/ghid/">Ghid</a>
  <a href="/app/">Aplicația</a>
  <a href="/#gratuit">Gratuit</a>
  <a href="/#pret">Kitul</a>
  <a href="/#eligibil" class="cta">Verifică eligibilitatea</a>
</nav></header>
<div class="wrap two">
  <aside><h3>Ghidul</h3><ul class="toc">${nav}</ul><p class="muted small">● = pagină din kit</p></aside>
  <main class="prose">
    <h1>${esc(p.title)}</h1>
    ${p.updated ? `<p class="meta">Actualizat la <time datetime="${p.updated.split('.').reverse().join('-')}">${p.updated}</time> · după Normele metodologice modificate prin Ordinul 948/2026 · persoane fizice, cel mult 7 camere</p>` : ''}
    ${p.slug === 'fiscal' ? '<div class="calc-summary" data-calc-summary hidden></div>' : ''}
    ${p.slug === 'eligibilitate' ? '<div data-elig><p class="muted">Răspunde la cele trei întrebări de mai jos.</p></div>' : ''}
    ${body}
    ${p.faq ? `<section class="faq">
<h2>Întrebări frecvente</h2>
${p.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${inline(a)}</p></details>`).join('\n')}
</section>` : ''}
    <p class="muted small">Versiune conținut: <span data-version></span>. Informații generale, nu consultanță juridică sau fiscală. Verifică situația ta cu un specialist dacă ai dubii.</p>
  </main>
</div>
<footer class="foot"><div class="foot-in">
  <div class="foot-brand"><span><img src="/favicon.svg" alt="" width="22" height="22"> Clasificat</span><p>Actele pentru certificatul de clasificare în regim hotelier, generate de tine, ca persoană fizică.</p></div>
  <nav class="foot-links" aria-label="Subsol"><b>Pe site</b><a href="/ghid/">Ghidul</a><a href="/app/">Aplicația</a><a href="/acord-vecini.html">Acord vecini, model</a><a href="/impozit-regim-hotelier.html">Calculator impozit</a><a href="/acte-necesare-regim-hotelier.html">Acte necesare</a></nav>
  <div class="foot-co"><b>Contact</b><span data-company></span><br><a data-mail href="#"></a></div>
</div></footer>
<script src="/site.js?v=202610011106"></script>
${p.slug === 'fiscal' ? '<script src="/calc.js?v=202610011106"></script>' : ''}
${p.slug === 'eligibilitate' ? '<script src="/elig.js?v=202610011106"></script>' : ''}
</body>
</html>`;
}

fs.mkdirSync(OUT, { recursive: true });
PAGES.forEach(p => {
  const src = fs.readFileSync(path.join(SRC, p.file), 'utf8');
  fs.writeFileSync(path.join(OUT, p.slug + '.html'), page(p, md(src), PAGES));
});
const idx = `<!DOCTYPE html>
<html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ghid: clasificarea camerelor de închiriat ca persoană fizică</title>
<meta name="description" content="Ghid pas cu pas pentru certificatul de clasificare turistică (SITUR) la camere și apartamente de închiriat, persoane fizice, după normele din iulie 2026.">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png">
<link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/styles.css?v=202610011106"><script src="/config.js?v=202610011106"></script></head>
<body class="ghid"><header class="top" data-nosnippet><a class="brand" href="/"><img src="/favicon.svg" alt="" width="26" height="26"> Clasificat</a><nav aria-label="Meniu">
  <a href="/ghid/" class="cur">Ghid</a>
  <a href="/app/">Aplicația</a>
  <a href="/#gratuit">Gratuit</a>
  <a href="/#pret">Kitul</a>
  <a href="/#eligibil" class="cta">Verifică eligibilitatea</a>
</nav></header>
<div class="wrap"><main class="prose"><h1>Ghidul, pagină cu pagină</h1>
<p class="lead">Două pagini sunt libere. Restul, împreună cu aplicația care generează documentele, fac parte din kit.</p>
<ol class="pages">${PAGES.map(p => `<li><a href="/ghid/${p.slug}.html">${esc(p.title)}</a>${p.free ? ' <span class="tag">liber</span>' : ' <span class="tag lock">kit</span>'}<br><span class="muted small">${esc(p.desc)}</span></li>`).join('')}</ol>
</main></div>
<footer class="foot"><div class="foot-in">
  <div class="foot-brand"><span><img src="/favicon.svg" alt="" width="22" height="22"> Clasificat</span><p>Actele pentru certificatul de clasificare în regim hotelier, generate de tine, ca persoană fizică.</p></div>
  <nav class="foot-links" aria-label="Subsol"><b>Pe site</b><a href="/ghid/">Ghidul</a><a href="/app/">Aplicația</a><a href="/acord-vecini.html">Acord vecini, model</a><a href="/impozit-regim-hotelier.html">Calculator impozit</a><a href="/acte-necesare-regim-hotelier.html">Acte necesare</a></nav>
  <div class="foot-co"><b>Contact</b><span data-company></span><br><a data-mail href="#"></a></div>
</div></footer>
<script src="/site.js?v=202610011106"></script></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), idx);
console.log('ghid: ' + PAGES.length + ' pagini + index → ' + OUT);
