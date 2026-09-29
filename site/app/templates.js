// Generatoare de documente. Primesc starea (d) și întorc HTML pentru o secțiune .doc.
// Formularele Anexa 3¹ și Anexa 4 reproduc textul oficial; declarațiile urmează șabloanele din content/templates.
window.TPL = (function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const f = (v, w) => v ? '<span class="field">' + esc(v) + '</span>' : '<span class="field">' + '.'.repeat(w || 18) + '</span>';
  const cb = on => '<span class="cb">' + (on ? '☒' : '☐') + '</span>';
  const tipStructura = d => d.path === 'apartament' ? 'apartament de închiriat în locuință familială' : 'camere de închiriat în locuință familială';
  const genderName = d => (d.titular.nume || '').trim();
  const dataDoc = d => d.data || '';

  function adresaCompleta(d) {
    const u = d.unit;
    const parts = [];
    if (u.localitate) parts.push(u.localitate);
    if (u.adresa) parts.push(u.adresa);
    if (u.judet) parts.push('județul ' + u.judet);
    return parts.join(', ');
  }

  function cerere(d) {
    const t = d.titular, u = d.unit;
    const apt = d.path === 'apartament';
    const coprop = d.coprop && d.coprop.exista;
    return `
<section class="doc" id="doc-cerere">
  <p class="right small">Anexa nr. 3<sup>1</sup><br>la normele metodologice</p>
  <h1>CERERE STANDARDIZATĂ</h1>
  <p class="sub">pentru obținerea certificatului de clasificare de către operatorii economici persoane fizice</p>
  <p>În temeiul prevederilor art. 4, alin. (1) din Hotărârea Guvernului nr. 1267/2010 privind eliberarea certificatelor de clasificare, a licențelor și brevetelor de turism, cu modificările și completările ulterioare,</p>
  <p>Subsemnatul(a) ${f(t.nume, 30)}, C.N.P. ${f(t.cnp, 16)}, act de identitate ${f(t.ci_tip || 'C.I.', 6)} seria ${f(t.ci_serie, 4)} nr. ${f(t.ci_numar, 8)}, în calitate de proprietar, solicit acordul pentru începerea activității, introducerea în circuitul turistic și eliberarea certificatului/certificatelor de clasificare pentru:</p>
  <p>Denumirea unității: ${f(u.denumire, 30)}<br>
  Tipul de unitate: ${f(tipStructura(d), 30)}<br>
  Categoria de clasificare: ${f(d.cat ? d.cat + ' stele' : '', 8)}<br>
  Adresă unitate/unități: ${f(adresaCompleta(d), 50)}<br>
  Date de contact unitate/unități: telefon ${f(t.telefon, 12)}, fax ......................, e-mail ${f(t.email, 24)}, web ${f(u.web, 24)}</p>
  <p>Conducerea operativă este asigurată de: ${f(t.nume, 30)}, telefon mobil ${f(t.telefon, 12)}</p>
  <p>Atașez prezentei cereri următoarele documente (Se bifează cu x):</p>
  <ol>
    <li>Copia actului de identitate ${cb(true)}</li>
    <li>Fișa standardizată privind încadrarea spațiilor structurii/structurilor de cazare ${cb(true)}</li>
    <li>Copia actului de proprietate asupra imobilului, după caz ${cb(true)}</li>
    <li>Copia act de identitate și acordul coproprietarilor, după caz ${cb(!!coprop)}</li>
    <li>Avizul scris al comitetului executiv al asociației de locatari și acordul scris al proprietarilor direct afectați cu care se învecinează, pe plan orizontal și vertical, cu spațiul pentru care se solicită clasificare, după caz, din care să rezulte activitățile ce urmează a fi desfășurate în structura de primire turistică respectivă ${cb(apt)}</li>
  </ol>
  <p class="small">Declar pe propria răspundere că am luat cunoștință de prevederile Hotărârii Guvernului nr. 1267/2010 privind eliberarea certificatelor de clasificare, a licențelor și brevetelor de turism, cu modificările și completările ulterioare, precum și de prevederile Normelor metodologice de aplicare ale acesteia și consider că sunt îndeplinite în totalitate condițiile și criteriile prevăzute în Normele metodologice privind eliberarea certificatelor de clasificare a structurilor de primire turistice cu funcțiuni de cazare și alimentație publică, a licențelor și brevetelor de turism, aprobate prin Ordinul președintelui Autorității Naționale pentru Turism nr. 65/2013, cu modificările și completările ulterioare, pentru structura/structurile de primire turistică/e nominalizată/e mai sus, condiții și criterii pe care mă oblig să le respect pe toată durata funcționării, pentru tipul și categoria de clasificare menționate în prezenta cerere și pentru structura înscrisă în formularele-tip ale fișei/fișelor privind încadrarea spațiilor de cazare anexate acesteia. În cazul în care se constată contrariul celor declarate, voi suporta consecințele și înțeleg să-mi fie aplicate reglementările legale în vigoare.</p>
  <p class="small">De asemenea, prin prezenta îmi exprim acordul cu privire la utilizarea și prelucrarea datelor cu caracter personal, conform Regulamentului (UE) 2016/679 al Parlamentului European și al Consiliului din 27 aprilie 2016 privind protecția persoanelor fizice în ceea ce privește prelucrarea datelor cu caracter personal și privind libera circulație a acestor date, de către instituția publică centrală responsabilă în domeniul turismului.</p>
  <div class="sig"><div>Data: ${f(dataDoc(d), 14)}</div><div>Semnătura ______________________</div></div>
</section>`;
  }

  function fisa(d) {
    const u = d.unit;
    const cat = d.cat || '';
    // aceleași rânduri ca la pasul 5 din SITUR (tip spațiu din lista SITUR; apartament întreg = un rând)
    const trs = window.RULES.siturRows(d).map(g => `<tr><td>${esc(g.tip)}${g.dormitoare != null ? ' (' + g.dormitoare + ' dormitoare)' : ''}</td><td>${g.bath ? 'grup sanitar ' + esc(g.bath) : '—'}</td><td class="c">${g.nrs.length}</td><td class="c">${g.beds}</td><td>${esc(g.nrs.join(', '))}</td></tr>`);
    const tot = window.RULES.totals(d.rooms);
    return `
<section class="doc" id="doc-fisa">
  <p class="right small">ANEXA nr. 4<br>la normele metodologice</p>
  <h1>FIȘĂ STANDARDIZATĂ</h1>
  <p class="sub">privind încadrarea nominală a spațiilor de cazare pe categorii și tipuri</p>
  <p><b>Tipul de unitate:</b> ${esc(tipStructura(d))}<br>
  <b>Denumirea unității:</b> ${esc(u.denumire)}<br>
  <b>Situată în:</b> ${esc([u.localitate, u.judet ? 'județul ' + u.judet : ''].filter(Boolean).join(', '))}<br>
  <b>Adresa:</b> ${esc(u.adresa)}</p>
  <p><b>A. STRUCTURI DE CAZARE</b></p>
  <table>
    <tr><th rowspan="2">Categoria de clasificare</th><th colspan="5">Structura spațiilor de cazare conform ANEXEI la Normele metodologice</th></tr>
    <tr><th>Tip spațiu</th><th>Grup sanitar (propriu / comun)</th><th>Nr. spații</th><th>Nr. locuri</th><th>Nr. de ordine al spațiilor de cazare</th></tr>
    <tr><td rowspan="${trs.length + 1}" style="text-align:center">${esc(cat)} stele</td>${trs[0].slice(4)}
    ${trs.slice(1).join('\n    ')}
    <tr><td colspan="1"><b>Total categoria ${esc(cat)} stele</b></td><td class="c"><b>${trs.length && d.path === 'apartament' && (d.unit.mod || 'intreg') === 'intreg' ? 1 : tot.rooms}</b></td><td class="c"><b>${tot.beds}</b></td><td></td></tr>
    <tr><td colspan="3"><b>TOTAL GENERAL</b></td><td class="c"><b>${trs.length && d.path === 'apartament' && (d.unit.mod || 'intreg') === 'intreg' ? 1 : tot.rooms}</b></td><td class="c"><b>${tot.beds}</b></td><td></td></tr>
  </table>
  <p><b>B. CRITERII ȘI SERVICII SUPLIMENTARE</b> îndeplinite/asigurate în vederea obținerii certificatului de clasificare, inclusiv în funcție de numărul de locuri și tipurile de cazare oferite:</p>
  <p>${cb(true)} a) cazare fără mic dejun; &nbsp; ${cb(false)} b) cazare cu mic dejun; &nbsp; ${cb(false)} c) cazare cu demipensiune; &nbsp; ${cb(false)} d) cazare cu pensiune completă; &nbsp; ${cb(false)} e) cazare cu all-inclusive.</p>
  <p class="small">I. Structuri de primire turistice cu funcțiuni de alimentație publică amplasate în perimetrul structurii de primire turistice cu funcțiuni de cazare: nu este cazul.<br>
  II. Cerințe suplimentare îndeplinite (recepție, hol recepție, cameră bagaje, cameră valori; frizerie-coafură, spălătorie, parcare; telefonie, lift): ${esc(d.checks && d.checks.parcare ? 'parcare' : 'nu este cazul')}.</p>
  <div class="sig"><div>Numele și prenumele: ${esc(genderName(d))}<br>Data: ${esc(dataDoc(d))}</div><div>Semnătura ______________________</div></div>
</section>`;
  }

  function identitate(p, prefixCalitate) {
    return `Subsemnatul(a) <b>${esc(p.nume)}</b>, cetățean ${esc(p.cetatenie || 'român')}, domiciliat(ă) în ${esc(p.domiciliu)}, posesor(oare) al/a ${esc(p.ci_tip || p.act_tip || 'C.I.')} seria ${esc(p.ci_serie || p.act_serie)} nr. ${esc(p.ci_numar || p.act_numar)}, CNP ${esc(p.cnp)}`;
  }

  function imobil(d, form) {
    const u = d.unit;
    let s = `${form === 'acc' ? 'imobilul' : 'imobilului'} situat în ${esc(adresaCompleta(d))}`;
    if (u.cf_numar) s += `, înscris în Cartea Funciară nr. ${esc(u.cf_numar)} ${esc(u.cf_localitate || '')}`;
    if (u.cadastral) s += `, nr. cadastral ${esc(u.cadastral)}`;
    if (u.descriere) s += ` (${esc(u.descriere)})`;
    return s;
  }

  function declFaraPereti(d) {
    const t = d.titular, c = d.coprop || {};
    return `
<section class="doc" id="doc-decl-pereti">
  <h1>DECLARAȚIE PE PROPRIA RĂSPUNDERE</h1>
  <p class="sub">privind acordul proprietarilor cu pereți comuni</p>
  <p>${identitate(t)}, în calitate de ${c.exista ? 'coproprietar' : 'proprietar'} și titular al cererii de clasificare pentru structura de primire turistică de tipul „${esc(tipStructura(d))}”, sub denumirea „${esc(d.unit.denumire)}”, a ${imobil(d)},</p>
  <p>declar pe propria răspundere următoarele:</p>
  <ol>
    <li>Imobilul în care se desfășoară activitatea de cazare este o construcție individuală, de sine stătătoare, amplasată pe teren proprietate privată${d.unit.teren_imprejmuit ? ' împrejmuit' : ''}, și nu are pereți comuni, pe orizontală sau pe verticală, cu niciun alt imobil aparținând altor proprietari.</li>
    <li>Imobilul nu face parte dintr-un condominiu și nu există asociație de proprietari constituită pentru acesta.</li>
    <li>În consecință, nu există proprietari ai unor spații învecinate cu pereți comuni al căror acord să fie necesar pentru desfășurarea activității de cazare turistică, cerința privind acordul proprietarilor direct afectați fiind astfel îndeplinită.</li>
    ${c.exista ? `<li>Celălalt coproprietar al imobilului, ${esc(c.nume)}, și-a exprimat acordul expres pentru desfășurarea activității de cazare turistică, prin declarația de acord a coproprietarilor anexată prezentei cereri.</li>` : ''}
  </ol>
  <p>Dau prezenta declarație cunoscând prevederile art. 326 din Codul penal privind falsul în declarații.</p>
  <div class="sig"><div>Data: ${esc(dataDoc(d))}<br>${esc(t.nume)}</div><div>Semnătura ______________________</div></div>
</section>`;
  }

  function acordCoproprietari(d) {
    const t = d.titular, c = d.coprop;
    const adm = { comun: 'în comun de ambii coproprietari', titular: 'de către titular' }[c.administrare] || 'în comun de ambii coproprietari';
    const ven = { egale: 'în cote egale', cote: 'în cotele de proprietate', titular: 'integral titularului' }[c.venituri] || 'în cote egale';
    return `
<section class="doc" id="doc-acord-coprop">
  <h1>DECLARAȚIE DE ACORD A COPROPRIETARILOR</h1>
  <p>${identitate(t)}, și</p>
  <p>${identitate(c)},</p>
  <p>în calitate de coproprietari, în cote de ${esc(c.cota_titular || '1/2')} și respectiv ${esc(c.cota_coprop || '1/2')}, ai ${imobil(d)}, declarăm prin prezenta, de comun acord, următoarele:</p>
  <ol>
    <li>Suntem de acord ca în imobilul menționat să se desfășoare activitatea de cazare turistică de tipul „${esc(tipStructura(d))}”, sub denumirea „${esc(d.unit.denumire)}”, pe întreaga durată de valabilitate a certificatului de clasificare.</li>
    <li>Certificatul de clasificare turistică se solicită și se obține de către ${esc(t.nume)}, în calitate de titular, cu acordul expres al ${esc(c.nume)}. Desemnarea unui singur titular decurge exclusiv din procedura de clasificare și nu afectează drepturile coproprietarilor asupra activității și veniturilor.</li>
    <li>Activitatea de cazare este administrată ${adm}, cu dreptul de a gestiona rezervările, de a încasa plățile de la turiști și de a reprezenta unitatea în relația cu aceștia și cu platformele de rezervare.</li>
    <li>Veniturile obținute din activitatea de cazare se cuvin coproprietarilor ${ven}. Fiecare coproprietar își declară și își fiscalizează partea de venit care îi revine, potrivit Codului fiscal.</li>
  </ol>
  <p>Dăm prezenta declarație cunoscând prevederile art. 326 din Codul penal privind falsul în declarații.</p>
  <p>Data: ${esc(dataDoc(d))}</p>
  <div class="sig"><div>${esc(t.nume)}<br>Semnătura ______________________</div><div>${esc(c.nume)}<br>Semnătura ______________________</div></div>
</section>`;
  }

  function avizAsociatie(d) {
    const a = d.apt, t = d.titular, tot = window.RULES.totals(d.rooms);
    const membri = (a.membri || []).filter(Boolean).map(m => `<div style="margin-top:14px">Membru comitet executiv: ${esc(m)} &nbsp;&nbsp; Semnătura ______________________</div>`).join('');
    const asocName = /^asocia/i.test((a.asoc_denumire || '').trim()) ? esc(a.asoc_denumire) : 'Asociația de Proprietari ' + esc(a.asoc_denumire);
    return `
<section class="doc" id="doc-aviz">
  <h1>AVIZ</h1>
  <p class="sub">al comitetului executiv al Asociației de Proprietari</p>
  <p><b>${asocName}</b>, cu sediul în ${esc(a.asoc_adresa)}${a.asoc_cif ? ', CIF ' + esc(a.asoc_cif) : ''}, reprezentată prin comitetul executiv,</p>
  <p>având în vedere cererea doamnei/domnului <b>${esc(t.nume)}</b>, proprietar(ă) al/a apartamentului nr. ${esc(a.numar)}${a.etaj ? ', etaj ' + esc(a.etaj) : ''}${a.scara ? ', scara ' + esc(a.scara) : ''}, din ${imobil(d, 'acc')},</p>
  <p>în temeiul art. 4 alin. (1<sup>1</sup>) din Normele metodologice aprobate prin Ordinul ANT nr. 65/2013, cu modificările și completările ulterioare,</p>
  <p style="text-align:center"><b>AVIZEAZĂ FAVORABIL</b></p>
  <p>desfășurarea în apartamentul menționat a activității de cazare turistică de tipul „apartamente sau camere de închiriat în locuințe familiale”, sub denumirea „${esc(d.unit.denumire)}”, cu o capacitate de ${tot.rooms} ${tot.rooms === 1 ? 'cameră' : 'camere'} / ${tot.beds} ${tot.beds === 1 ? 'loc' : 'locuri'}, fără servicii de alimentație publică.</p>
  <p>Proprietarul se obligă să respecte regulamentul asociației, orele de liniște și să răspundă pentru eventualele daune produse de turiști în spațiile comune.</p>
  <p>Prezentul aviz se eliberează pentru a servi la obținerea certificatului de clasificare turistică.</p>
  <p>Data: ${esc(dataDoc(d))}</p>
  <div>Președinte: ${esc(a.presedinte)} &nbsp;&nbsp; Semnătura ______________________</div>
  ${membri}
  <p style="margin-top:14px">Ștampila asociației (dacă există)</p>
</section>`;
  }

  function acordVecin(d, v, i) {
    const a = d.apt, t = d.titular;
    const poz = { stanga: 'la același etaj, în stânga', dreapta: 'la același etaj, în dreapta', sus: 'la etajul superior', jos: 'la etajul inferior', alta: v.pozitie_alta || '' }[v.pozitie] || '';
    return `
<section class="doc" id="doc-vecin-${i}">
  <h1>ACORD</h1>
  <p class="sub">al proprietarului direct afectat (vecin cu pereți comuni)</p>
  <p>Subsemnatul(a) <b>${f(v.nume, 30)}</b>, domiciliat(ă) în ${f(v.domiciliu, 40)}, posesor(oare) al/a C.I. seria ${f(v.ci_serie, 4)} nr. ${f(v.ci_numar, 8)}, în calitate de proprietar(ă) al/a apartamentului nr. <b>${f(v.ap, 4)}</b>, situat ${esc(poz)} față de apartamentul nr. ${f(a.numar, 4)} din imobilul de la adresa ${f(adresaCompleta(d), 40)},</p>
  <p>declar că <b>sunt de acord</b> ca în apartamentul nr. ${esc(a.numar)}, proprietatea doamnei/domnului ${esc(t.nume)}, să se desfășoare activitatea de cazare turistică de tipul „apartamente sau camere de închiriat în locuințe familiale”, sub denumirea „${esc(d.unit.denumire)}”, fără servicii de alimentație publică.</p>
  <p>Am luat cunoștință că prezentul acord este necesar pentru obținerea certificatului de clasificare turistică și că proprietarul răspunde pentru comportamentul turiștilor cazați.</p>
  <div class="sig"><div>Data: ${esc(dataDoc(d))}<br>${esc(v.nume)}</div><div>Semnătura ______________________</div></div>
</section>`;
  }

  function declEnumerare(d) {
    const a = d.apt, t = d.titular;
    const pozTxt = { stanga: 'stânga', dreapta: 'dreapta', sus: 'deasupra', jos: 'dedesubt', alta: 'alta' };
    const rows = (a.vecini || []).map(v => `<tr><td>${esc(v.pozitie === 'alta' ? (v.pozitie_alta || 'alta') : pozTxt[v.pozitie] || '')}</td><td>${esc(v.ap)}</td><td>${esc(v.nume)}</td><td>${v.acord === 'nu' ? 'nu — ' + esc(v.motiv || '') : 'da'}</td></tr>`).join('');
    return `
<section class="doc" id="doc-enumerare">
  <h1>DECLARAȚIE PE PROPRIA RĂSPUNDERE</h1>
  <p class="sub">privind apartamentele învecinate</p>
  <p>${identitate(t)}, în calitate de proprietar(ă) și titular al cererii de clasificare pentru apartamentul nr. ${esc(a.numar)}${a.etaj ? ', etaj ' + esc(a.etaj) : ''}${a.scara ? ', scara ' + esc(a.scara) : ''}, din ${imobil(d, 'acc')}, sub denumirea „${esc(d.unit.denumire)}”,</p>
  <p>declar pe propria răspundere că apartamentul se învecinează, prin pereți comuni, cu următoarele apartamente:</p>
  <table><tr><th>Poziție</th><th>Apartament nr.</th><th>Proprietar</th><th>Acord atașat</th></tr>${rows}</table>
  <p>și că nu există alți proprietari direct afectați, pe orizontală sau pe verticală, în afara celor enumerați mai sus.</p>
  <p>Dau prezenta declarație cunoscând prevederile art. 326 din Codul penal privind falsul în declarații.</p>
  <div class="sig"><div>Data: ${esc(dataDoc(d))}<br>${esc(t.nume)}</div><div>Semnătura ______________________</div></div>
</section>`;
  }

  // Foaia de completare SITUR: valorile de tastat la fiecare pas al solicitării online
  // (se.situr.gov.ro, demersul „apartamente sau camere de închiriat fără alimentație”, 7 pași, flux verificat 24.09.2026)
  // și ce fișier intră în fiecare slot de la pasul 7. Cererea și fișa le generează SITUR la pasul 6.
  const TYPE_WORD = /\b(vila|vilă|casa|casă|pensiune|pensiunea|apartament|apartamentul|hotel|cabana|cabană|camere|garsoniera|garsonieră)\b/i;
  function situr(d) {
    const t = d.titular, u = d.unit, apt = d.path === 'apartament', coprop = d.coprop && d.coprop.exista;
    const cat = d.cat ? d.cat + ' ' + (d.cat === 1 ? 'stea' : 'stele') : '';
    // v = valoarea brută (se escapează aici); copy=false pentru valorile care nu se tastează (dropdown, instrucțiuni)
    const cp = v => `<button type="button" class="copy" data-copy="${esc(v)}">copiază</button>`;
    const row = (k, v, note, copy = true) => `<tr><td style="width:38%">${k}</td><td><b>${v ? esc(v) : '<span class="field">' + '.'.repeat(24) + '</span>'}</b>${v && copy ? cp(v) : ''}${note ? `<br><span class="small">${note}</span>` : ''}</td></tr>`;
    const nameWarn = TYPE_WORD.test(u.denumire || '') ? 'Atenție: SITUR cere ca denumirea să nu conțină tipul structurii (vilă, casă, pensiune, apartament). Scoate cuvântul respectiv aici; pe platformă poate rămâne.' : 'fără cuvântul de tip: vilă, casă, pensiune, apartament';
    // pasul 5: grupare pe (locuri, baie), ca în fișă; se copiază doar ce se tastează (nr. spații, locuri, nr. de ordine)
    const cell = v => `<td class="c">${esc(v)}${cp(String(v))}</td>`;
    const whole = apt && (u.mod || 'intreg') === 'intreg', withDorm = whole && (u.tip_ap || 'Apartament cu dormitor/dormitoare') === 'Apartament cu dormitor/dormitoare';
    const rows5 = window.RULES.siturRows(d).map(g => `<tr><td>${esc(cat)}</td><td>${esc(g.tip)}</td>${whole ? '' : `<td>${esc(g.bath)}</td>`}${cell(g.nrs.length)}${cell(g.beds)}${g.dormitoare != null ? cell(g.dormitoare) : ''}${cell(g.nrs.join(', '))}</tr>`).join('');
    const tot = window.RULES.totals(d.rooms);
    const proof = { autorizatie: 'autorizația de construire', atestare: 'certificatul de atestare a edificării construcției', cf: 'extrasul de carte funciară cu construcția intabulată' }[d.proof] || 'dovada legalității construcției';
    const vecini = (d.apt.vecini || []);
    const slots = [
      ['Cerere standardizată pentru obținerea certificatului de clasificare', 'PDF-ul generat de SITUR la pasul 6, semnat olograf, scanat', true],
      ['Fișă standardizată privind încadrarea nominală a spațiilor de cazare', 'PDF-ul generat de SITUR la pasul 6, semnat olograf, scanat', true],
      ['Carte de identitate', 'copia CI a titularului' + (t.ci_tip === 'CEI' ? ' + certificatul de domiciliu (CI electronică fără adresă)' : ''), true],
      ['Acordul asociației de locatari/proprietari și acordul proprietarilor cu pereți comuni; în lipsa asociației, declarație pe propria răspundere (art. 326 CP)',
        apt ? 'avizul asociației (generat aici) + acordurile vecinilor (generate aici, câte unul de vecin)' + (vecini.length > 1 ? '; dacă slotul primește un singur fișier, le pui într-un PDF sau restul la „Alte documente”' : '') : 'declarația „fără pereți comuni, fără asociație” (generată aici)', true],
      ['Documentul din care rezultă dreptul de proprietate și adresa unității', 'actul de proprietate + extrasul CF recent (max. 30 zile), într-un PDF', true],
    ];
    if (coprop) {
      slots.push(['Acordul celuilalt/celorlalți proprietar/i pentru închirierea în scop turistic', 'declarația de acord a coproprietarilor (generată aici), semnată de ambii', true]);
      slots.push(['Copie după cartea de identitate a coproprietarului', 'copia CI ' + esc(d.coprop.nume || 'a coproprietarului'), true]);
    } else {
      slots.push(['Acordul celuilalt proprietar / CI coproprietar', 'nu apar dacă ai bifat „proprietar unic” la pasul 2', false]);
    }
    slots.push(['Declarație pe propria răspundere (art. 326 CP) că toți proprietarii cu pereți comuni și-au exprimat acordul', apt ? 'declarația de enumerare a apartamentelor învecinate (generată aici)' : 'aceeași declarație „fără pereți comuni” (o conține și pe asta)', true]);
    slots.push(['Documente din care reiese legalitatea construcției', proof, true]);
    slots.push(['Alte documente', (u.ipoteca ? '<b>acordul creditorului ipotecar</b> pentru închirierea în regim hotelier (îl ceri băncii, în scris)' : 'nimic, dacă imobilul nu are ipotecă') + (apt && vecini.length > 1 ? '; acordurile de vecini care nu au încăput mai sus' : ''), !!u.ipoteca]);
    return `
<section class="doc" id="doc-situr">
  <h1>FOAIA DE COMPLETARE SITUR</h1>
  <p class="sub">${esc(u.denumire)} · ${esc(adresaCompleta(d))} · drumul „${apt ? 'apartament în bloc' : 'casă individuală'}”</p>
  <p class="small">se.situr.gov.ro → cont persoană fizică (ROeID) → <b>Clasificare structuri de cazare și alimentație publică</b> → <b>Structură de cazare de tip apartamente sau camere de închiriat fără alimentație</b> → „Începe solicitarea online”. Valorile de mai jos se tastează în ordinea pașilor din SITUR. Pentru tine; nu se depune.</p>
  <p class="small screen-only">Ține SITUR deschis într-o fereastră alături: „copiază” pune valoarea în clipboard, tu o lipești în câmp. Valorile fără buton se aleg din listă sau se bifează.</p>

  <p><b>Pasul 1 · Date persoană fizică</b></p>
  <table>
    ${row('Nume și prenume (ca în CI)', t.nume)}
    ${row('CNP', t.cnp)}
    ${row('Act de identitate', [t.ci_tip, t.ci_serie, t.ci_numar].filter(Boolean).join(' '))}
    ${row('Domiciliu', t.domiciliu)}
  </table>

  <p><b>Pasul 2 · Proprietar sau coproprietar</b></p>
  <table>${row('Sunt proprietar/coproprietar al structurii', coprop ? 'coproprietar' : 'proprietar unic', coprop ? 'bifa deschide sloturile pentru acordul și CI-ul coproprietarului la pasul 7' : '', false)}</table>

  <p><b>Pasul 3 · Tip operațiune</b></p>
  <table>${row('Tipul de operațiune', 'clasificare', 'reclasificare, schimbare titular și modificare fișă anexă sunt pentru mai târziu', false)}</table>

  <p><b>Pasul 4 · Date structură cazare</b></p>
  <table>
    ${row('Tip structură', apt ? 'apartament de închiriat (în locuință familială)' : 'camere de închiriat (în locuință familială)', 'din listă', false)}
    ${row('Denumire structură cazare', u.denumire, nameWarn)}
    ${row('Categorie clasificare (stele)', cat, 'din listă', false)}
    ${row('Spațiu special amenajat pentru pregătirea și servirea mesei', u.masa === 'da' ? 'Da' : 'Nu', '', false)}
    ${row('Tip cazare', 'cazare fără mic dejun', 'bifă', false)}
    ${row('Facilități', window.RULES.facilitiesText(u), d.cat === 3 && !/parc/i.test(window.RULES.facilitiesText(u)) ? 'la 3 stele trebuie să apară parcarea' : '')}
    ${row('Telefon', t.telefon)}
    ${row('Email', t.email)}
    ${row('Adresă web', u.web, 'pagina unității sau de social media, cerută din iulie 2026')}
    ${row('Județ', u.judet, 'din listă', false)}
    ${row('Localitate', u.localitate, 'din listă', false)}
    ${row('Strada, număr' + (apt ? ', bloc, scară, etaj, apartament' : ''), [u.adresa, apt && d.apt.scara ? 'sc. ' + d.apt.scara : '', apt && d.apt.etaj ? 'et. ' + d.apt.etaj : '', apt && d.apt.numar ? 'ap. ' + d.apt.numar : ''].filter(Boolean).join(', '), 'strada din listă (are și satele) sau alegi de pe hartă cu „Selectează pe hartă”')}
    ${row('Cod poștal', u.cod_postal)}
    ${row('Alte informații, dacă este cazul', [u.cf_numar ? 'CF nr. ' + u.cf_numar + (u.cf_localitate ? ' ' + u.cf_localitate : '') : '', u.cadastral ? 'nr. cadastral ' + u.cadastral : '', u.alte_info].filter(Boolean).join('; '))}
    ${row('Selectează pe hartă', 'pune pinul pe imobil', '', false)}
  </table>

  <p><b>Pasul 5 · Detalii structură cazare</b> (butonul „+”, ${apt && (u.mod || 'intreg') === 'intreg' ? 'un singur rând pentru apartamentul întreg' : 'un rând pe tip de cameră'}, „Salvează înregistrare”; tipul și grupul sanitar se aleg din listă)</p>
  <table>
    <tr><th>Categoria de clasificare</th><th>Tip spațiu</th>${whole ? '' : '<th>Grup sanitar</th>'}<th>Nr. spații</th><th>Număr locuri total spațiu</th>${withDorm ? '<th>Nr. dormitoare</th>' : ''}<th>Nr. de ordine al spațiilor</th></tr>
    ${rows5}
    <tr><td colspan="${whole ? 2 : 3}"><b>Total</b></td><td class="c"><b>${whole ? 1 : tot.rooms}</b></td><td class="c"><b>${tot.beds}</b></td>${withDorm ? '<td></td>' : ''}<td></td></tr>
  </table>
  <p class="small">${whole ? 'Apartamentul întreg este un singur rând; la acest tip SITUR nu cere grupul sanitar. ' : 'Numerele de ordine sunt cele pe care le pui pe uși; inspectorul le verifică. '}Totalul locurilor este capacitatea pe care o declari pe platforme.</p>

  <p><b>Pasul 6 · Descarcă documente</b></p>
  <p>SITUR generează <b>Cererea standardizată</b> și <b>Fișa standardizată</b> din pașii 4–5. Le descarci, le citești (o greșeală se corectează întorcându-te la pasul 4 sau 5, nu de mână), le semnezi olograf, le scanezi.</p>

  <p><b>Pasul 7 · Anexe</b> · un fișier pe slot, PDF sau imagine</p>
  <table><tr><th>Slot în SITUR</th><th>Ce încarci</th><th>Gata</th></tr>
  ${slots.map(([s, w, req]) => `<tr><td>${s}${req ? ' <b>*</b>' : ''}</td><td>${w}</td><td style="text-align:center">${req ? '☐' : '—'}</td></tr>`).join('')}
  </table>
  <p class="small">Apoi <b>Finalizează activitatea</b>. Ce urmează: notificare de completare (5 zile lucrătoare; ai 3 luni să răspunzi) → autorizație provizorie (legal 30 zile) → vizită de verificare (în 90 zile) → certificat. Cu autorizația provizorie poți primi turiști.</p>
</section>`;
  }

  return { cerere, fisa, declFaraPereti, acordCoproprietari, avizAsociatie, acordVecin, declEnumerare, situr, adresaCompleta };
})();
