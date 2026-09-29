// Wizard — stare, pași, validare, generare. Fără dependențe. Datele rămân în browser (localStorage).
(function () {
  const KEY = 'hostkit.dosar.v1';
  const R = window.RULES, T = window.TPL;

  // Ordinea urmează pașii din SITUR (1 date PF, 2 proprietar/coproprietar, 4 structură, 5 camere, 6–7 documente),
  // ca să completezi aici în aceeași ordine în care tastezi acolo. Pasul 3 din SITUR (tip operațiune) e mereu „clasificare”.
  const STEPS = [
    { id: 'elig', label: 'Eligibilitate', situr: 'înainte de SITUR' },
    { id: 'titular', label: 'Titular', situr: 'SITUR pasul 1' },
    { id: 'coprop', label: 'Coproprietar', situr: 'SITUR pasul 2' },
    { id: 'unit', label: 'Imobil', situr: 'SITUR pasul 4' },
    { id: 'checks', label: 'Criterii pe stele', situr: 'pentru vizită' },
    { id: 'rooms', label: 'Camere și categorie', situr: 'SITUR pasul 5' },
    { id: 'apt', label: 'Bloc: asociație și vecini', onlyApt: true, situr: 'SITUR pasul 7' },
    { id: 'docs', label: 'Documente', situr: 'SITUR pașii 6–7' },
    { id: 'urm', label: 'Ce urmează', situr: 'după depunere' },
  ];

  // Etapele de după completare, cu termenele legale (Normele metodologice după Ordinul 948/2026). Se bifează cu data.
  const TRACK = [
    { id: 'semnat', t: 'Cererea și fișa descărcate din SITUR (pasul 6), semnate olograf, scanate', h: 'Nu le modifica de mână; o greșeală se corectează din pașii 4–5 și se regenerează.' },
    { id: 'incarcat', t: 'Toate anexele încărcate la pasul 7, câte un fișier pe slot', h: 'Lista sloturilor e în foaia de completare.' },
    { id: 'trimis', t: 'Solicitarea trimisă („Finalizează activitatea”)', h: 'Notează numărul solicitării (#…) din „Solicitările mele”. De aici curg termenele.', nr: true },
    { id: 'notificare', t: 'Notificare de completare primită (dacă vine)', h: 'Legal în 5 zile lucrătoare; ai 3 luni să răspunzi, dar răspunde în aceeași săptămână: dosarul stă pe loc între timp.', opt: true },
    { id: 'autorizatie', t: 'Autorizația provizorie de funcționare primită', h: 'Legal în cel mult 30 de zile de la dosarul complet; în practică 1–3 luni. De acum poți publica anunțul și primi turiști.', legal: 30, from: 'trimis' },
    { id: 'vizita', t: 'Vizita de verificare făcută', h: 'În cel mult 90 de zile de la autorizația provizorie. Pregătește: actele în original, camerele ca în fișă, numerele pe uși, fișa de ocupare începută, lista de criterii (pasul 5).', legal: 90, from: 'autorizatie' },
    { id: 'remediat', t: 'Deficiențele minore de la vizită remediate (dacă au fost)', h: 'Cel mult 15 zile lucrătoare (art. 8 alin. 4).', opt: true },
    { id: 'certificat', t: 'Certificatul de clasificare primit', h: 'Îl afișezi la loc vizibil în unitate. Codul unic SITUR pentru platforme: pagina 07 din ghid.', legal: 15, from: 'vizita' },
  ];

  const blank = () => ({
    step: 0,
    path: '', rooms_ok: '', proof: '', prefill: null, editElig: false,
    titular: { nume: '', cetatenie: 'român', domiciliu: '', ci_tip: 'C.I.', ci_serie: '', ci_numar: '', cnp: '', telefon: '', email: '' },
    unit: { denumire: '', judet: '', localitate: '', adresa: '', cod_postal: '', alte_info: '', facil: {}, cf_numar: '', cf_localitate: '', cadastral: '', descriere: '', teren_imprejmuit: false, web: '', masa: 'nu', facilitati: '', ipoteca: false, mod: 'intreg', tip_ap: 'Apartament cu dormitor/dormitoare' },
    rooms: [{ nr: '1', beds: '2', bath: 'propriu', surface: '', tip: 'Cameră cu 2 locuri' }],
    cat: 0, checks: {}, checksBy: { 3: {}, 2: {}, 1: {} }, checksTab: 3,
    coprop: { exista: false, nume: '', cetatenie: 'român', domiciliu: '', act_tip: 'C.I.', act_serie: '', act_numar: '', cnp: '', cota_titular: '1/2', cota_coprop: '1/2', administrare: 'comun', venituri: 'egale' },
    apt: { numar: '', etaj: '', scara: '', asoc_denumire: '', asoc_adresa: '', asoc_cif: '', presedinte: '', membri: [], vecini: [] },
    data: today(),
    track: { nr: '', items: {} },
  });
  const parseRo = s => { const m = String(s || '').trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/); return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null; };
  const daysBetween = (a, b) => Math.floor((b - a) / 86400000);

  function today() { const d = new Date(); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear(); }

  let S = load();
  // Bifele de autoverificare sunt pe categorie (3/2/1 stele); dosarele mai vechi aveau o singură listă, pe categoria aleasă.
  if (!S.checksBy) S.checksBy = { 3: {}, 2: {}, 1: {} };
  [3, 2, 1].forEach(c => { if (!S.checksBy[c]) S.checksBy[c] = {}; });
  if (S.checks && Object.keys(S.checks).length && S.cat && !Object.keys(S.checksBy[S.cat]).length) S.checksBy[S.cat] = S.checks;
  if (!S.checksTab) S.checksTab = Number(S.cat) || 3;
  // Preia răspunsurile date în verificarea de eligibilitate de pe site (elig.js), dacă dosarul nu a fost început.
  (function prefill() {
    if (S.path || S.rooms_ok || S.proof) return;
    let e = null; try { e = JSON.parse(localStorage.getItem('hostkit.elig.v1') || 'null'); } catch (x) { }
    const q = new URLSearchParams(location.search).get('drum');
    if (!e && !q) return;
    if (e) {
      if (e.rooms) S.rooms_ok = e.rooms === 'many' ? 'nu' : 'da';
      if (e.type) S.path = e.type === 'flat' ? 'apartament' : 'casa';
      if (e.proof === 'no') S.proof = 'none';
    }
    if (q === 'casa' || q === 'apartament') S.path = q;
    S.prefill = { rooms_ok: !!S.rooms_ok, path: !!S.path };
    save();
  })();
  // Preia datele proprietarului scrise în modelul gratuit de acord vecini (acord-vecini.html), dacă sunt goale aici.
  (function prefillTool() {
    let t = null; try { t = JSON.parse(localStorage.getItem('hostkit.tool.v1') || 'null'); } catch (x) { }
    if (!t || (!t.nume && !t.ap && !t.adresa && !t.denumire)) return;
    let took = 0;
    if (t.nume && !S.titular.nume) { S.titular.nume = t.nume; took++; }
    if (t.ap && !S.apt.numar) { S.apt.numar = t.ap; took++; }
    if (t.adresa && !S.unit.adresa) { S.unit.adresa = t.adresa; took++; }
    if (t.denumire && !S.unit.denumire) { S.unit.denumire = t.denumire; took++; }
    if (took && !S.path) S.path = 'apartament';
    if (took) save();
  })();
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) return Object.assign(blank(), s); } catch (e) { } return blank(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

  const $ = sel => document.querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const set = (obj, path, v) => { const ks = path.split('.'); const last = ks.pop(); const o = ks.reduce((o, k) => (o[k] = o[k] || {}), obj); o[last] = v; };

  function visibleSteps() { return STEPS.filter(s => !s.onlyApt || S.path === 'apartament'); }
  function stepIndex(id) { return visibleSteps().findIndex(s => s.id === id); }

  // ---------- field helpers ----------
  function field(path, label, opts = {}) {
    const v = get(S, path);
    const type = opts.type || 'text';
    const hint = opts.hint ? `<span class="hint">${esc(opts.hint)}</span>` : '';
    if (opts.select) {
      return `<label class="f"><span>${esc(label)}</span><select data-path="${path}">${opts.select.map(([val, txt]) => `<option value="${esc(val)}" ${val === v ? 'selected' : ''}>${esc(txt)}</option>`).join('')}</select>${hint}</label>`;
    }
    return `<label class="f"><span>${esc(label)}</span><input type="${type}" data-path="${path}" value="${esc(v)}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ''} ${opts.req ? 'data-req="1"' : ''}>${hint}</label>`;
  }
  function radio(path, options, name) {
    const v = get(S, path);
    return `<div class="radios">${options.map(([val, txt, sub]) => `<label><input type="radio" name="${name}" data-path="${path}" value="${esc(val)}" ${v === val ? 'checked' : ''}><span>${esc(txt)}${sub ? `<br><small style="color:var(--muted)">${esc(sub)}</small>` : ''}</span></label>`).join('')}</div>`;
  }

  // ---------- steps ----------
  const VIEWS = {
    elig() {
      const stop = S.rooms_ok === 'nu' ? `<div class="note stop">Peste 7 camere nu se poate ca persoană fizică. Ai nevoie de PFA sau SRL și de alt tip de structură. Kitul se oprește aici.</div>` : '';
      const proofWarn = S.proof === 'none' ? `<div class="note err">Fără dovada legalității construcției dosarul se blochează. Obține întâi certificatul de atestare a edificării (Primărie) sau intabularea construcției (OCPI), apoi revino. Poți continua completarea, dar nu depune.</div>` : '';
      const pf = S.prefill && !S.editElig ? S.prefill : null;
      const known = (legend, txt) => `<fieldset class="prefilled"><legend>${legend}</legend><div class="prefilled-row"><span>✓ ${esc(txt)}</span><button type="button" class="link" data-edit-elig>Schimbă</button></div></fieldset>`;
      const roomsQ = pf && pf.rooms_ok && S.rooms_ok ? known('Câte camere de dormit închiriezi?', S.rooms_ok === 'da' ? 'Cel mult 7 camere / 14 locuri' : '8 sau mai multe') + stop
        : `<fieldset><legend>Câte camere de dormit închiriezi, adunat pe toate proprietățile?</legend>${radio('rooms_ok', [['da', 'Cel mult 7 camere / 14 locuri'], ['nu', '8 sau mai multe']], 'rooms_ok')}${stop}</fieldset>`;
      const pathQ = pf && pf.path && S.path ? known('Ce este imobilul?', S.path === 'apartament' ? 'Apartament în bloc sau imobil cu pereți comuni' : 'Casă individuală, fără pereți comuni')
        : `<fieldset><legend>Ce este imobilul?</legend>${radio('path', [['casa', 'Casă individuală', 'fără pereți comuni cu alți proprietari, fără asociație'], ['apartament', 'Apartament în bloc sau imobil cu pereți comuni', 'ai nevoie de avizul asociației și acordul vecinilor']], 'path')}</fieldset>`;
      const lead = pf ? `<p class="lead">Am preluat răspunsurile date pe site. Verifică-le, alege dovada construcției și continuă.</p>` : `<p class="lead">Trei întrebări. Răspunsurile aleg drumul și documentele.</p>`;
      return `<h1>Ești eligibil?</h1>${lead}
      ${roomsQ}
      ${pathQ}
      <fieldset><legend>Ce dovadă ai că imobilul este construit legal?</legend>${radio('proof', [['autorizatie', 'Autorizație de construire'], ['atestare', 'Certificat de atestare a edificării construcției'], ['cf', 'Extras de carte funciară cu construcția intabulată'], ['none', 'Niciuna încă']], 'proof')}${proofWarn}</fieldset>`;
    },
    titular() {
      return `<h1>Titularul cererii</h1><p class="lead">O singură persoană semnează tot. Aceleași date le tastezi la pasul 1 din SITUR și apar în declarații.</p>
      <fieldset><legend>Identitate</legend><div class="grid">
      ${field('titular.nume', 'Nume și prenume (ca în CI)', { req: 1 })}
      ${field('titular.cnp', 'CNP', { req: 1, hint: '13 cifre' })}
      ${field('titular.ci_tip', 'Tip act', { select: [['C.I.', 'Carte de identitate'], ['CEI', 'Carte electronică de identitate (fără adresă)'], ['Pașaport', 'Pașaport']] })}
      ${field('titular.ci_serie', 'Seria', { req: 1 })}
      ${field('titular.ci_numar', 'Numărul', { req: 1 })}
      ${field('titular.cetatenie', 'Cetățenie')}
      </div></fieldset>
      <fieldset><legend>Domiciliu și contact</legend><div class="grid">
      ${field('titular.domiciliu', 'Domiciliul (ca în CI)', { req: 1, ph: 'București, str. …, nr. …, sector …' })}
      ${field('titular.telefon', 'Telefon mobil', { type: 'tel', req: 1 })}
      ${field('titular.email', 'E-mail', { type: 'email', req: 1 })}
      </div></fieldset>`;
    },
    unit() {
      return `<h1>Imobilul și unitatea</h1><p class="lead">Adresa se copiază literal din extrasul de carte funciară. Orice diferență întoarce dosarul.</p>
      <fieldset><legend>Unitatea de cazare</legend><div class="grid">
      ${field('unit.denumire', 'Denumirea unității', { req: 1, hint: 'fără cuvântul de tip (vilă, casă, pensiune, apartament): SITUR îl respinge' })}
      ${field('unit.web', 'Pagina web sau social media a unității', { hint: 'cerută la toate categoriile din iulie 2026' })}
      </div>${/\b(vila|vilă|casa|casă|pensiune|pensiunea|apartament|apartamentul|hotel|cabana|cabană)\b/i.test(S.unit.denumire || '') ? '<div class="note warn">Denumirea conține un cuvânt de tip. În SITUR pui varianta fără el; pe Booking/Airbnb numele poate rămâne.</div>' : ''}</fieldset>
      <fieldset><legend>Adresa (din extrasul CF)</legend><div class="grid">
      ${field('unit.judet', 'Județul', { req: 1 })}
      ${field('unit.localitate', 'Localitatea', { req: 1, ph: 'sat, comuna' })}
      ${field('unit.adresa', 'Strada și numărul' + (S.path === 'apartament' ? ', bloc' : ''), { req: 1 })}
      ${field('unit.cod_postal', 'Cod poștal')}
      ${field('unit.alte_info', 'Alte informații de adresă', { ph: 'punct, drum, reper: ce nu încape în stradă și număr', hint: 'ajunge în SITUR la pasul 4, câmpul „Alte informații, dacă este cazul”, împreună cu nr. CF și nr. cadastral' })}
      </div></fieldset>
      <fieldset><legend>Descrierea spațiului</legend><div class="grid">
      ${field('unit.masa', 'Spațiu amenajat pentru pregătirea și servirea mesei', { select: [['nu', 'Nu'], ['da', 'Da (bucătărie sau chicinetă pentru turiști)']] })}
      </div>
      <p class="hint" style="margin:10px 0 4px"><b>Facilități.</b> Bifează doar ce există azi; textul intră în SITUR la „Facilități”, iar inspectorul le verifică la vizită.</p>
      ${[[3, 'Cerute la 3 stele'], [0, 'Cerute la toate categoriile'], [-1, 'Opționale, dacă există']].map(([g, title]) => {
        const items = R.FACILITIES.filter(f => g === 3 ? (f.req && f.req.length === 1 && f.req[0] === 3) : g === 0 ? (f.req && f.req.length === 3) : !f.req);
        return `<div class="facil"><div class="facil-t">${title}</div><div class="grid">${items.map(f => `<div class="check"><input type="checkbox" data-path="unit.facil.${f.id}" ${S.unit.facil && S.unit.facil[f.id] ? 'checked' : ''}><span>${esc(f.t)}</span></div>`).join('')}</div></div>`;
      }).join('')}
      <div class="grid" style="margin-top:8px">${field('unit.facilitati', 'Alte facilități (text liber)', { ph: 'saună, loc de joacă, bicicletе', hint: 'se adaugă după bife' })}</div>
      ${Number(S.cat) === 3 && !(S.unit.facil && S.unit.facil.parcare) ? '<div class="note warn">Ceri 3 stele: parcarea trebuie bifată și trebuie să existe.</div>' : ''}<div class="check"><input type="checkbox" data-path="unit.ipoteca" ${S.unit.ipoteca ? 'checked' : ''}><span>Imobilul are ipotecă (credit imobiliar)</span></div>
      ${S.unit.ipoteca ? '<div class="note warn">SITUR cere acordul creditorului ipotecar pentru închirierea în regim hotelier, la „Alte documente”. Cere-l băncii în scris acum; este actul care durează cel mai mult.</div>' : ''}</fieldset>
      <fieldset><legend>Carte funciară</legend><div class="grid">
      ${field('unit.cf_numar', 'Nr. carte funciară', { req: 1 })}
      ${field('unit.cf_localitate', 'UAT-ul cărții funciare', { ph: 'comuna sau orașul din extrasul CF' })}
      ${field('unit.cadastral', 'Nr. cadastral', { ph: '12345-C1' })}
      ${field('unit.descriere', 'Descrierea construcției din CF', { ph: 'casă de locuit P+M, cum scrie în CF' })}
      </div>${S.path === 'casa' ? `<div class="check"><input type="checkbox" data-path="unit.teren_imprejmuit" ${S.unit.teren_imprejmuit ? 'checked' : ''}><span>Terenul este împrejmuit (se menționează în declarație)</span></div>` : ''}</fieldset>`;
    },
    rooms() {
      const apt = S.path === 'apartament', whole = apt && (S.unit.mod || 'intreg') === 'intreg';
      // data-l = eticheta afișată pe ecrane înguste, unde fiecare cameră devine un card (vezi styles.css, max-width 600px)
      const rows = S.rooms.map((r, i) => `<tr>
        <td class="num" data-l="Nr. de ordine"><input type="text" data-room="${i}" data-k="nr" value="${esc(r.nr)}"></td>
        <td data-l="Locuri"><select data-room="${i}" data-k="beds">${[1, 2, 3, 4].map(b => `<option value="${b}" ${String(r.beds) === String(b) ? 'selected' : ''}>${b}</option>`).join('')}</select></td>
        <td data-l="Grup sanitar"><select data-room="${i}" data-k="bath"><option value="propriu" ${r.bath === 'propriu' ? 'selected' : ''}>propriu</option><option value="comun" ${r.bath === 'comun' ? 'selected' : ''}>comun</option></select></td>
        <td class="num" data-l="mp"><input type="number" step="0.1" min="0" data-room="${i}" data-k="surface" value="${esc(r.surface)}"></td>
        ${whole ? '' : `<td data-l="Tip spațiu (SITUR)"><select data-room="${i}" data-k="tip"><option value="" ${!R.typeOf(r) ? 'selected' : ''}>alege…</option>${R.SPACE_TYPES.map(t => `<option value="${esc(t)}" ${R.typeOf(r) === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></td>`}
        <td class="act"><button type="button" class="small secondary" data-del="${i}">șterge</button></td></tr>`).join('');
      const tot = R.totals(S.rooms);
      const bigRooms = !whole && S.rooms.some(r => Number(r.beds) >= 3);
      const modQ = apt ? `<fieldset><legend>Cum închiriezi apartamentul?</legend>${radio('unit.mod', [['intreg', 'Întreg, ca o singură unitate', 'în SITUR: un singur rând la pasul 5'], ['camere', 'Camere separate, fiecare cu turiștii ei', 'în SITUR: un rând pe tip de cameră']], 'unit_mod')}
        ${whole ? `<div class="grid" style="margin-top:8px">${field('unit.tip_ap', 'Tip spațiu în SITUR', { select: R.WHOLE_TYPES.map(t => [t, t]) })}</div>` : ''}</fieldset>` : '';
      const limit = (tot.rooms > R.LIMIT_ROOMS || tot.beds > R.LIMIT_BEDS) ? `<div class="note err">Depășești limita de ${R.LIMIT_ROOMS} camere / ${R.LIMIT_BEDS} locuri pentru persoane fizice.</div>` : '';
      const hasCommon = S.rooms.some(r => r.bath === 'comun');
      const cards = [3, 2, 1].map(c => {
        const fails = R.evaluate(S.rooms, c);
        const cl = R.CHECKS.filter(x => x.c.includes(c) && (!x.apartmentOnly || apt) && (!x.onlyIfCommon || hasCommon)), done = cl.filter(x => (S.checksBy[c] || {})[x.id]).length;
        const bif = `<li class="${done === cl.length ? 'ok' : 'miss'}">criterii bifate la pasul anterior: ${done} din ${cl.length}</li>`;
        return `<div class="cat ${fails.length ? 'fail' : 'pass'}"><h3>${c} ${c === 1 ? 'stea' : 'stele'} ${fails.length ? '' : '✓'}</h3><ul>${fails.length ? fails.map(x => `<li>${esc(x)}</li>`).join('') : '<li>criteriile numerice (locuri, mp, băi) sunt îndeplinite</li>'}${bif}</ul></div>`;
      }).join('');
      return `<h1>Camerele și categoria</h1><p class="lead">Treci fiecare cameră de dormit pe care o închiriezi. <b>Locuri</b> = câte persoane pot dormi în ea (un pat dublu = 2). <b>mp</b> = suprafața măsurată în interior. <b>Nr. de ordine</b> = numărul pe care îl pui pe ușă.${whole ? ' Camerele servesc la verificarea criteriilor; în SITUR apartamentul închiriat întreg apare ca un singur rând, îl vezi mai jos.' : ''}</p>
      ${modQ}
      <fieldset><legend>Camere</legend>
      <table class="rooms"><tr><th>Nr. de ordine</th><th>Locuri</th><th>Grup sanitar</th><th>mp</th>${whole ? '' : '<th>Tip spațiu (SITUR)</th>'}<th></th></tr>${rows}</table>
      <p><button type="button" class="small secondary" id="add-room">+ adaugă cameră</button> &nbsp; Total: ${tot.rooms} camere / ${tot.beds} locuri</p>${limit}
      ${bigRooms ? '<div class="note warn">SITUR nu are „Cameră cu 3 locuri” sau „cu 4 locuri”. La camerele cu 3–4 locuri am pus „Suită”; numărul real de locuri se trece separat, la „Număr locuri total spațiu”, și aplicația îl pune acolo. Poți alege alt tip dacă spațiul e altceva.</div>' : ''}</fieldset>
      <fieldset><legend>Așa vor arăta rândurile tale în SITUR (pasul 5)</legend>
      <p class="hint" style="margin:0 0 8px">${whole ? 'În SITUR, la pasul 5, apeși „+” o singură dată, completezi rândul de mai jos și dai „Salvează înregistrare”. La acest tip de spațiu SITUR nu cere grupul sanitar.' : 'În SITUR, la pasul 5, apeși „+” pentru fiecare rând de mai jos, completezi valorile și dai „Salvează înregistrare”. Un rând înseamnă un tip de spațiu cu același grup sanitar, nu o cameră: camerele la fel se adună pe același rând.'}</p>
      <div class="tscroll"><table class="rooms situr"><tr><th>Categoria</th><th>Tip spațiu</th>${whole ? '' : '<th>Grup sanitar</th>'}<th>Nr. spații</th><th>Nr. locuri total</th>${whole && S.unit.tip_ap === 'Apartament cu dormitor/dormitoare' ? '<th>Nr. dormitoare</th>' : ''}<th>Nr. de ordine</th></tr>
      ${R.siturRows(S).map(g => `<tr><td>${S.cat ? S.cat + ' ' + (Number(S.cat) === 1 ? 'stea' : 'stele') : '<span class="hint">alegi mai jos</span>'}</td><td>${esc(g.tip)}</td>${whole ? '' : `<td>${esc(g.bath)}</td>`}<td>${g.nrs.length}</td><td>${g.beds}</td>${g.dormitoare != null ? `<td>${g.dormitoare}</td>` : ''}<td>${esc(g.nrs.join(', '))}</td></tr>`).join('')}
      </table></div></fieldset>
      <fieldset><legend>Ce categorie poți cere (verificare pe Anexa 10)</legend><div class="cat-summary">${cards}</div>
      <p style="margin-top:12px">Categoria pe care o ceri: ${radio('cat', [[3, '3 stele'], [2, '2 stele'], [1, '1 stea']], 'cat')}</p>
      ${S.cat && R.evaluate(S.rooms, Number(S.cat)).length ? `<div class="note warn">Categoria aleasă are criterii neîndeplinite (vezi mai sus). Ori rezolvi, ori scoți camera din listă, ori ceri categoria inferioară. Poți continua, dar inspectorul va constata același lucru.</div>` : ''}
      </fieldset>`;
    },
    checks() {
      const apt = S.path === 'apartament', hasCommon = S.rooms.some(r => r.bath === 'comun');
      const listFor = c => R.CHECKS.filter(x => x.c.includes(c) && (!x.apartmentOnly || apt) && (!x.onlyIfCommon || hasCommon));
      const tab = [3, 2, 1].includes(Number(S.checksTab)) ? Number(S.checksTab) : 3;
      const tabs = [3, 2, 1].map(c => { const l = listFor(c), n = l.filter(x => S.checksBy[c][x.id]).length; return `<button type="button" class="ctab ${c === tab ? 'active' : ''}" data-ctab="${c}">${c} ${c === 1 ? 'stea' : 'stele'}<small>${n}/${l.length} bifate</small></button>`; }).join('');
      const list = listFor(tab), missing = list.filter(x => !S.checksBy[tab][x.id]);
      return `<h1>Criteriile pe stele</h1><p class="lead">Aceeași listă o are inspectorul la vizită. Vezi ce cere fiecare categorie, bifează ce există azi, apoi alegi categoria la pasul următor.</p>
      <div class="ctabs">${tabs}</div>
      <fieldset>${list.map(c => `<div class="check"><input type="checkbox" data-check="${c.id}" ${S.checksBy[tab][c.id] ? 'checked' : ''}><span>${esc(c.t)}</span></div>`).join('')}</fieldset>
      ${missing.length ? `<div class="note warn">La ${tab} ${tab === 1 ? 'stea' : 'stele'}: ${missing.length} ${missing.length === 1 ? 'criteriu nebifat' : 'criterii nebifate'}. Nu blochează documentele, dar inspectorul le va căuta.</div>` : `<div class="note ok">Toate criteriile pentru ${tab} ${tab === 1 ? 'stea' : 'stele'} sunt bifate.</div>`}`;
    },
    coprop() {
      const c = S.coprop;
      return `<h1>Coproprietar</h1><p class="lead">Dacă imobilul este și al altcuiva (soț/soție, frate), acea persoană semnează un acord și îi atașezi copia CI.</p>
      <fieldset><div class="check"><input type="checkbox" data-path="coprop.exista" ${c.exista ? 'checked' : ''}><span>Imobilul are un alt coproprietar</span></div></fieldset>
      ${c.exista ? `<fieldset><legend>Datele coproprietarului</legend><div class="grid">
      ${field('coprop.nume', 'Nume și prenume', { req: 1 })}
      ${field('coprop.cnp', 'CNP', { req: 1 })}
      ${field('coprop.cetatenie', 'Cetățenie')}
      ${field('coprop.act_tip', 'Tip act', { select: [['C.I.', 'Carte de identitate'], ['Certificat de înregistrare', 'Certificat de înregistrare (cetățean UE)'], ['Pașaport', 'Pașaport']] })}
      ${field('coprop.act_serie', 'Seria')}
      ${field('coprop.act_numar', 'Numărul', { req: 1 })}
      ${field('coprop.domiciliu', 'Domiciliul', { req: 1 })}
      ${field('coprop.cota_titular', 'Cota titularului', { ph: '1/2' })}
      ${field('coprop.cota_coprop', 'Cota coproprietarului', { ph: '1/2' })}
      ${field('coprop.administrare', 'Cine administrează activitatea', { select: [['comun', 'În comun, ambii coproprietari'], ['titular', 'Doar titularul']] })}
      ${field('coprop.venituri', 'Cum se împart veniturile', { select: [['egale', 'În cote egale'], ['cote', 'În cotele de proprietate'], ['titular', 'Integral titularului']] })}
      </div><div class="note warn">Împărțirea veniturilor are consecințe fiscale (fiecare declară partea lui). Dacă nu ești sigură, alege „integral titularului” și clarifică cu contabilul.</div></fieldset>` : ''}`;
    },
    apt() {
      const a = S.apt;
      const vec = (a.vecini || []).map((v, i) => `<div class="neighbour"><div class="grid">
        ${field(`apt.vecini.${i}.pozitie`, 'Poziție', { select: [['stanga', 'Stânga (același etaj)'], ['dreapta', 'Dreapta (același etaj)'], ['sus', 'Deasupra'], ['jos', 'Dedesubt'], ['alta', 'Altă poziție']] })}
        ${v.pozitie === 'alta' ? field(`apt.vecini.${i}.pozitie_alta`, 'Descrie poziția') : ''}
        ${field(`apt.vecini.${i}.ap`, 'Apartament nr.', { req: 1 })}
        ${field(`apt.vecini.${i}.nume`, 'Proprietar (nume și prenume)', { req: 1 })}
        ${field(`apt.vecini.${i}.domiciliu`, 'Domiciliul (de regulă același bloc)')}
        ${field(`apt.vecini.${i}.ci_serie`, 'CI seria')}
        ${field(`apt.vecini.${i}.ci_numar`, 'CI numărul')}
        ${field(`apt.vecini.${i}.acord`, 'Ai acordul semnat?', { select: [['da', 'Da'], ['nu', 'Nu (explică)']] })}
        ${v.acord === 'nu' ? field(`apt.vecini.${i}.motiv`, 'Motivul', { ph: 'apartament nelocuit; proprietar plecat din țară' }) : ''}
        </div><p><button type="button" class="small secondary" data-delv="${i}">șterge vecinul</button></p></div>`).join('');
      return `<h1>Bloc: asociația și vecinii</h1><p class="lead">Regula este peretele comun: stânga, dreapta, deasupra, dedesubt. Fiecare vecin primește propriul acord de semnat.</p>
      <fieldset><legend>Apartamentul</legend><div class="grid">${field('apt.numar', 'Apartament nr.', { req: 1 })}${field('apt.etaj', 'Etaj')}${field('apt.scara', 'Scara')}</div></fieldset>
      <fieldset><legend>Asociația de proprietari</legend><div class="grid">
      ${field('apt.asoc_denumire', 'Denumirea asociației', { req: 1 })}
      ${field('apt.asoc_adresa', 'Sediul asociației', { req: 1 })}
      ${field('apt.asoc_cif', 'CIF asociație')}
      ${field('apt.presedinte', 'Președinte (nume)', { req: 1 })}
      ${field('apt.membri_txt', 'Membri comitet executiv care semnează (opțional, separați cu virgulă)')}
      </div></fieldset>
      <fieldset><legend>Vecinii cu pereți comuni</legend>${vec}<button type="button" class="small secondary" id="add-vecin">+ adaugă vecin</button>
      ${(a.vecini || []).length === 0 ? '<div class="note warn">Un apartament în bloc are aproape întotdeauna cel puțin doi vecini cu pereți comuni.</div>' : ''}</fieldset>`;
    },
    docs() {
      const probs = validateAll();
      const apt = S.path === 'apartament';
      const list = [
        ['doc-situr', 'Foaia de completare SITUR', 'ce tastezi la fiecare pas și ce încarci în fiecare slot; pentru tine, nu se depune'],
      ];
      if (!apt) list.push(['doc-decl-pereti', 'Declarație: fără pereți comuni, fără asociație', 'semnată de titular; intră în două sloturi la pasul 7']);
      if (S.coprop.exista) list.push(['doc-acord-coprop', 'Declarație de acord a coproprietarilor', 'semnată de ambii; slotul „acordul celuilalt proprietar”']);
      if (apt) {
        list.push(['doc-aviz', 'Aviz al comitetului executiv al asociației', 'de dus la președinte, semnat, ștampilat']);
        (S.apt.vecini || []).forEach((v, i) => list.push([`doc-vecin-${i}`, `Acord vecin: ap. ${v.ap || '?'} · ${v.nume || '?'}`, 'semnat de vecin']));
        list.push(['doc-enumerare', 'Declarație: enumerarea apartamentelor învecinate', 'semnată de titular; slotul „declarație că toți proprietarii cu pereți comuni au fost de acord”']);
      }
      const paper = [
        ['doc-cerere', 'Cerere standardizată (Anexa 3¹)', 'doar pentru depunere pe hârtie; online o generează SITUR la pasul 6'],
        ['doc-fisa', 'Fișa standardizată (Anexa 4)', 'doar pentru depunere pe hârtie; online o generează SITUR la pasul 6'],
      ];
      const li = ([id, t, d]) => `<li><div><div class="t">${esc(t)}</div><div class="d">${esc(d)}</div></div><div><button type="button" class="small secondary" data-view="${id}">vezi</button> <button type="button" class="small primary" data-print="${id}">salvează PDF</button></div></li>`;
      return `<h1>Documentele</h1>
      <p class="lead">Cererea și fișa <b>le generează SITUR</b> la pasul 6, din ce tastezi la pașii 4 și 5; le semnezi și le încarci la pasul 7. Aici primești restul: foaia cu valorile exacte de tastat și declarațiile pe care SITUR nu le face.</p>
      <div class="note ok">Cel mai simplu: deschide SITUR într-o fereastră alături, apasă „vezi” la foaia de completare și folosește butoanele <b>copiază</b> de lângă fiecare valoare; lipești în câmpul din SITUR.</div>
      ${probs.length ? `<div class="note err"><b>Câmpuri lipsă:</b> ${probs.map(esc).join(' · ')}. Documentele se generează cu spații punctate acolo unde lipsesc date.</div>` : `<div class="note ok">Toate câmpurile obligatorii sunt completate.</div>`}
      <fieldset><legend>Data de pe documente</legend><div class="grid">${field('data', 'Data (zz.ll.aaaa)', { hint: 'aceeași pe toate; o poți lăsa goală și completa de mână' })}</div></fieldset>
      <ul class="doclist">${list.map(li).join('')}</ul>
      <div class="allbar"><div><b>Toate documentele de mai sus într-un singur PDF</b><br><span class="hint">fiecare document începe pe pagină nouă; bun de tipărit și semnat dintr-o dată. Pentru SITUR încarci fișierele separate de mai sus, câte unul pe slot.</span></div><button type="button" class="primary" data-print="all">Salvează toate (PDF)</button></div>
      <fieldset style="margin-top:16px"><legend>Doar dacă depui pe hârtie (poștă), nu prin SITUR</legend><ul class="doclist">${paper.map(li).join('')}</ul></fieldset>
      <p class="lead" style="margin-top:14px">„Salvează PDF” deschide dialogul de tipărire al browserului; alege „Salvează ca PDF”. Fiecare document iese ca fișier separat, câte unul pe slot în SITUR.</p>`;
    },
  };

  VIEWS.urm = function () {
    const it = S.track.items || {}, now = new Date();
    const done = TRACK.filter(x => it[x.id] && it[x.id].done).length;
    const rows = TRACK.map(x => {
      const st = it[x.id] || {};
      let status = '';
      if (!st.done && x.legal && x.from && it[x.from] && it[x.from].done && parseRo(it[x.from].date)) {
        const d = daysBetween(parseRo(it[x.from].date), now);
        status = d > x.legal ? `<span class="note warn" style="display:inline-block;padding:4px 8px;margin:6px 0 0">${d} zile de la etapa anterioară; termenul legal este ${x.legal}. Întreabă direcția prin „Mesaje” din SITUR.</span>`
          : `<span class="hint">${d} ${d === 1 ? 'zi' : 'zile'} de la etapa anterioară; termen legal ${x.legal} zile.</span>`;
      }
      return `<div class="track ${st.done ? 'done' : ''}"><label class="check" style="align-items:flex-start"><input type="checkbox" data-track-done="${x.id}" ${st.done ? 'checked' : ''}><span><b>${esc(x.t)}</b>${x.opt ? ' <span class="hint">(dacă e cazul)</span>' : ''}<br><span class="hint">${esc(x.h)}</span>${status ? '<br>' + status : ''}</span></label>
        <div class="grid" style="margin:4px 0 0 28px"><label class="f"><span>Data (zz.ll.aaaa)</span><input type="text" data-track-date="${x.id}" value="${esc(st.date || '')}" placeholder="${today()}"></label>${x.nr ? field('track.nr', 'Nr. solicitării SITUR', { ph: '#113476' }) : ''}</div></div>`;
    }).join('');
    return `<h1>Ce urmează</h1><p class="lead">Dosarul durează 1–3 luni. Bifează fiecare etapă cu data ei; aplicația ține minte și îți spune când un termen legal a fost depășit. ${done}/${TRACK.length} etape.</p>
      <fieldset>${rows}</fieldset>
      <div class="note ok">Cu autorizația provizorie poți primi turiști legal. Nu deschide anunțul înainte de ea, dar nici nu aștepta certificatul definitiv.</div>`;
  };

  function validateAll() {
    const p = [];
    const req = (path, label) => { if (!String(get(S, path) || '').trim()) p.push(label); };
    req('titular.nume', 'nume titular'); req('titular.cnp', 'CNP'); req('titular.ci_serie', 'serie CI'); req('titular.ci_numar', 'număr CI'); req('titular.domiciliu', 'domiciliu'); req('titular.telefon', 'telefon'); req('titular.email', 'e-mail');
    req('unit.denumire', 'denumire unitate'); req('unit.judet', 'județ'); req('unit.localitate', 'localitate'); req('unit.adresa', 'adresă'); req('unit.cf_numar', 'nr. CF');
    if (!S.cat) p.push('categoria');
    if (!S.path) p.push('tipul imobilului');
    S.rooms.forEach((r, i) => { if (!r.nr) p.push('nr. camera ' + (i + 1)); if (!r.surface) p.push('mp camera ' + (r.nr || i + 1)); });
    if (S.coprop.exista) { req('coprop.nume', 'nume coproprietar'); req('coprop.cnp', 'CNP coproprietar'); req('coprop.domiciliu', 'domiciliu coproprietar'); }
    if (S.path === 'apartament') { req('apt.numar', 'nr. apartament'); req('apt.asoc_denumire', 'asociație'); req('apt.presedinte', 'președinte'); (S.apt.vecini || []).forEach((v, i) => { if (!v.ap || !v.nume) p.push('vecin ' + (i + 1)); }); }
    return p;
  }

  // ---------- render ----------
  function render() {
    const vs = visibleSteps();
    if (S.step >= vs.length) S.step = vs.length - 1;
    const cur = vs[S.step];
    $('#steps').innerHTML = vs.map((s, i) => `<button type="button" data-step="${i}" class="${i === S.step ? 'active' : ''} ${i < S.step ? 'done' : ''}">${i + 1}. ${esc(s.label)}<small>${esc(s.situr || '')}</small></button>`).join('');
    const body = VIEWS[cur.id]();
    const nav = `<div class="actions"><div>${S.step > 0 ? '<button type="button" class="secondary" id="prev">← Înapoi</button>' : ''}</div><div>${S.step < vs.length - 1 ? '<button type="button" class="primary" id="next">Continuă →</button>' : ''}</div></div>`;
    $('#main').innerHTML = body + nav;
    renderDocs();
    bind();
    window.scrollTo(0, 0);
  }

  function renderDocs() {
    const box = $('#docs');
    if (visibleSteps()[S.step].id !== 'docs') { box.hidden = true; box.innerHTML = ''; return; }
    S.apt.membri = (S.apt.membri_txt || '').split(',').map(s => s.trim()).filter(Boolean);
    let html = T.situr(S);
    if (S.path !== 'apartament') html += T.declFaraPereti(S);
    if (S.coprop.exista) html += T.acordCoproprietari(S);
    if (S.path === 'apartament') { html += T.avizAsociatie(S); (S.apt.vecini || []).forEach((v, i) => html += T.acordVecin(S, v, i)); html += T.declEnumerare(S); }
    html += T.cerere(S) + T.fisa(S);
    box.innerHTML = html;
    box.hidden = false;
    // butoanele „copiază” din foaia de completare: valoarea intră în clipboard, o lipești în câmpul din SITUR
    box.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.copy;
      const done = () => { b.classList.add('done'); b.textContent = 'copiat ✓'; setTimeout(() => { b.classList.remove('done'); b.textContent = 'copiază'; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, () => fallback(v, done)); else fallback(v, done);
    }));
    function fallback(v, done) { const t = document.createElement('textarea'); t.value = v; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { } t.remove(); }
  }

  function bind() {
    document.querySelectorAll('[data-path]').forEach(el => {
      const h = () => {
        const path = el.dataset.path;
        let v = el.type === 'checkbox' ? el.checked : el.value;
        if (path === 'cat') v = Number(v);
        set(S, path, v); save();
        if (el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') render();
      };
      el.addEventListener('change', h);
      if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox') el.addEventListener('input', () => { set(S, el.dataset.path, el.value); save(); });
    });
    document.querySelectorAll('[data-room]').forEach(el => el.addEventListener('change', () => {
      const r = S.rooms[+el.dataset.room]; r[el.dataset.k] = el.value;
      // tipul SITUR urmează numărul de locuri cât timp e unul „Cameră cu …” sau gol; „Suită” etc. rămân alese de om
      if (el.dataset.k === 'beds' && (!r.tip || /^(Cameră cu|Suită)/.test(r.tip))) r.tip = R.defaultType(r.beds);
      save(); render();
    }));
    document.querySelectorAll('[data-del]').forEach(el => el.addEventListener('click', () => { S.rooms.splice(+el.dataset.del, 1); save(); render(); }));
    const add = $('#add-room'); if (add) add.addEventListener('click', () => { S.rooms.push({ nr: String(S.rooms.length + 1), beds: '2', bath: 'propriu', surface: '', tip: 'Cameră cu 2 locuri' }); save(); render(); });
    document.querySelectorAll('[data-check]').forEach(el => el.addEventListener('change', () => { const c = Number(S.checksTab) || 3; S.checksBy[c][el.dataset.check] = el.checked; S.checks = S.checksBy[Number(S.cat) || c]; save(); render(); }));
    document.querySelectorAll('[data-ctab]').forEach(el => el.addEventListener('click', () => { S.checksTab = Number(el.dataset.ctab); save(); render(); }));
    document.querySelectorAll('[data-track-done]').forEach(el => el.addEventListener('change', () => { const id = el.dataset.trackDone, it = (S.track.items[id] = S.track.items[id] || {}); it.done = el.checked; if (el.checked && !it.date) it.date = today(); save(); render(); }));
    document.querySelectorAll('[data-track-date]').forEach(el => { const h = () => { const id = el.dataset.trackDate, it = (S.track.items[id] = S.track.items[id] || {}); it.date = el.value; save(); }; el.addEventListener('input', h); el.addEventListener('change', () => { h(); render(); }); });
    const av = $('#add-vecin'); if (av) av.addEventListener('click', () => { S.apt.vecini.push({ pozitie: 'stanga', ap: '', nume: '', domiciliu: '', ci_serie: '', ci_numar: '', acord: 'da', motiv: '' }); save(); render(); });
    document.querySelectorAll('[data-delv]').forEach(el => el.addEventListener('click', () => { S.apt.vecini.splice(+el.dataset.delv, 1); save(); render(); }));
    document.querySelectorAll('[data-edit-elig]').forEach(el => el.addEventListener('click', () => { S.editElig = true; save(); render(); }));
    document.querySelectorAll('[data-step]').forEach(el => el.addEventListener('click', () => { S.step = +el.dataset.step; save(); render(); }));
    const n = $('#next'); if (n) n.addEventListener('click', () => { S.step++; save(); render(); });
    const p = $('#prev'); if (p) p.addEventListener('click', () => { S.step--; save(); render(); });
    document.querySelectorAll('[data-view]').forEach(el => el.addEventListener('click', () => { const d = document.getElementById(el.dataset.view); if (d) d.scrollIntoView({ behavior: 'smooth' }); }));
    document.querySelectorAll('[data-print]').forEach(el => el.addEventListener('click', () => printDoc(el.dataset.print)));
  }

  function printDoc(id) {
    const paper = d => /^doc-(cerere|fisa)$/.test(d.id); // cererea și fișa sunt doar pentru hârtie; nu intră în „toate”
    document.querySelectorAll('.doc').forEach(d => d.classList.toggle('printing', id === 'all' ? !paper(d) : d.id === id));
    document.body.setAttribute('data-print', id);
    const done = () => { document.body.removeAttribute('data-print'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
  }

  // ---------- top actions ----------
  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'dosar-clasificare.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#file-import').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try { S = Object.assign(blank(), JSON.parse(r.result)); save(); render(); } catch (err) { alert('Fișierul nu este o copie validă.'); } }; r.readAsText(f);
  });
  $('#btn-reset').addEventListener('click', () => { if (confirm('Ștergi toate datele introduse? Nu se poate anula.')) { S = blank(); save(); render(); } });

  render();
})();
