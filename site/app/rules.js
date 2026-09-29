// Reguli din Anexa nr. 10 la Normele metodologice (Ordin 948/2026) — apartamente și camere de
// închiriat, persoane fizice. Sursa: MO 559 bis / 08.07.2026. Versiune: 22.09.2026.
window.RULES = (function () {
  const LIMIT_ROOMS = 7, LIMIT_BEDS = 14;

  // suprafață minimă (mp) pe număr de locuri, pe categorie; null = nu se admite
  const MIN_SURFACE = {
    3: { 1: 10, 2: 12, 3: 17, 4: null },
    2: { 1: 10, 2: 11, 3: 15, 4: 17 },
    1: { 1: 10, 2: 11, 3: 13, 4: 16 },
  };
  const MAX_BEDS = { 3: 3, 2: 4, 1: 4 };

  // criterii ne-numerice, pentru autoverificare (id, text, categorii la care se cer)
  const CHECKS = [
    { id: 'cladire', t: 'Clădirea este în stare bună, cu aspect corespunzător', c: [3, 2, 1] },
    { id: 'acces', t: 'Căile de acces și spațiile înconjurătoare sunt întreținute', c: [3, 2, 1] },
    { id: 'parcare', t: 'Există posibilitate de parcare auto', c: [3] },
    { id: 'intrare', t: 'Fiecare cameră de dormit are intrare separată', c: [3, 2, 1] },
    { id: 'apa', t: 'Apă caldă și rece la grupurile sanitare', c: [3, 2, 1] },
    { id: 'incalzire', t: 'Încălzire admisă de normele PSI', c: [3, 2, 1] },
    { id: 'electric', t: 'Instalație electrică', c: [3, 2, 1] },
    { id: 'lift', t: 'Camerele situate peste etajul 4 sunt deservite de lift (sau nu e cazul)', c: [3, 2, 1] },
    { id: 'gs_comun', t: 'Grupul sanitar comun este exclusiv pentru turiști, minimum 1 WC la 8 locuri', c: [2, 1], onlyIfCommon: true },
    { id: 'mobilier', t: 'Mobilier de bună calitate, în stil uniform', c: [3] },
    { id: 'pat', t: 'Pat cu saltea și salteluță de protecție, în fiecare cameră', c: [3, 2, 1] },
    { id: 'masa', t: 'Masă și scaune în fiecare cameră', c: [3, 2, 1] },
    { id: 'dulap', t: 'Dulap sau spațiu pentru haine, în folosința exclusivă a turiștilor', c: [3, 2, 1] },
    { id: 'oglinda', t: 'Oglindă', c: [3, 2, 1] },
    { id: 'cuier', t: 'Cuier', c: [3, 2, 1] },
    { id: 'noptiere', t: 'Noptiere sau piese similare', c: [3, 2, 1] },
    { id: 'veioze', t: 'Veioze sau aplice la capătul patului', c: [3, 2] },
    { id: 'pilota', t: 'Pilotă (sau similar) cu cearșaf, cearșaf de pat', c: [3, 2, 1] },
    { id: 'perna', t: 'Pernă mare înfățată de persoană, cu husă de protecție', c: [3, 2, 1] },
    { id: 'prosoape', t: 'Două prosoape de dimensiuni diferite de persoană', c: [3, 2, 1] },
    { id: 'perdele', t: 'Perdele, draperii sau alt mijloc de obturare a luminii', c: [3, 2, 1] },
    { id: 'insecte', t: 'Mijloace de protecție împotriva insectelor', c: [3, 2, 1] },
    { id: 'frigider', t: 'Frigider sau minibar în cameră (nu se cere în dormitoarele din apartamente și garsoniere)', c: [3] },
    { id: 'tv', t: 'Televizor LCD de minimum 80 cm, cu acces TV sau internet, în fiecare cameră', c: [3] },
    { id: 'internet', t: 'Acces la internet', c: [3, 2, 1] },
    { id: 'online', t: 'Unitatea are website sau pagină de social media cu informații și imagini actuale și locația', c: [3, 2, 1] },
    { id: 'suf_canapea', t: 'Sufragerie: canapea pentru 2–3 persoane', c: [3, 2, 1], apartmentOnly: true },
    { id: 'suf_masa', t: 'Sufragerie: masă sau măsuță', c: [3, 2, 1], apartmentOnly: true },
    { id: 'suf_fotolii', t: 'Sufragerie: fotolii, demifotolii sau scaune', c: [3, 2], apartmentOnly: true },
    { id: 'suf_taburete', t: 'Sufragerie: taburete', c: [1], apartmentOnly: true },
    { id: 'suf_frigider', t: 'Sufragerie: frigider sau minibar', c: [3], apartmentOnly: true },
    { id: 'suf_tv', t: 'Sufragerie: televizor cu acces TV sau internet', c: [3, 2, 1], apartmentOnly: true },
  ];

  // Evaluează camerele pentru o categorie. rooms: [{nr, beds, bath:'propriu'|'comun', surface}]
  function evaluate(rooms, cat) {
    const fails = [];
    rooms.forEach(r => {
      const who = 'Camera ' + (r.nr || '?');
      const beds = Number(r.beds) || 0, s = Number(r.surface) || 0;
      if (beds < 1) { fails.push(who + ': numărul de locuri lipsește'); return; }
      if (beds > MAX_BEDS[cat]) { fails.push(who + ': ' + beds + ' locuri, maximum ' + MAX_BEDS[cat] + ' la ' + cat + ' stele'); return; }
      const min = MIN_SURFACE[cat][beds];
      if (min === null || min === undefined) { fails.push(who + ': camerele cu ' + beds + ' locuri nu se admit la ' + cat + ' stele'); return; }
      if (s && s < min) fails.push(who + ': ' + s + ' mp, minimum ' + min + ' mp pentru ' + beds + ' locuri');
      if (!s) fails.push(who + ': suprafața lipsește (minimum ' + min + ' mp)');
      if (cat === 3 && r.bath !== 'propriu') fails.push(who + ': la 3 stele fiecare cameră are baie proprie');
    });
    return fails;
  }

  function totals(rooms) {
    return {
      rooms: rooms.length,
      beds: rooms.reduce((a, r) => a + (Number(r.beds) || 0), 0),
    };
  }

  // „Tip spațiu” din SITUR (pasul 5), lista completă văzută pe 24.09.2026. Nu există „Cameră cu 3/4 locuri”:
  // numărul real de locuri se trece separat, la „Număr locuri total spațiu”.
  const SPACE_TYPES = ['Cameră cu 1 loc', 'Cameră cu 2 locuri', 'Suită', 'Garsonieră', 'Apartament cu dormitor/dormitoare', 'Duplex'];
  const WHOLE_TYPES = ['Garsonieră', 'Apartament cu dormitor/dormitoare', 'Duplex'];
  const defaultType = beds => (Number(beds) === 1 ? 'Cameră cu 1 loc' : Number(beds) === 2 ? 'Cameră cu 2 locuri' : Number(beds) >= 3 ? 'Suită' : ''); // 3+ locuri → Suită (ipoteza Iuliei, 24.09; de confirmat pe un dosar real)
  const typeOf = r => r.tip || defaultType(r.beds);

  // Grupare ca în SITUR (pasul 5) și în fișă: un rând pe (tip spațiu, grup sanitar); locurile se adună, numerele de ordine se listează.
  function groupRooms(rooms) {
    const g = {};
    rooms.forEach(r => { const tip = typeOf(r) || '(alege tipul)'; const k = tip + '|' + (r.bath || ''); (g[k] = g[k] || { tip, bath: r.bath || '', beds: 0, nrs: [] }); g[k].beds += Number(r.beds) || 0; g[k].nrs.push(r.nr); });
    return Object.values(g).sort((a, b) => SPACE_TYPES.indexOf(a.tip) - SPACE_TYPES.indexOf(b.tip) || a.bath.localeCompare(b.bath));
  }
  // Rândurile pe care le tastezi la pasul 5: apartament închiriat întreg = un singur rând; altfel camerele grupate.
  // La Garsonieră / Apartament / Duplex SITUR nu cere grupul sanitar (bath = null); la Apartament cere „Nr. dormitoare” (capturi 24.09.2026).
  function siturRows(S) {
    if (S.path === 'apartament' && (S.unit.mod || 'intreg') === 'intreg') {
      const t = totals(S.rooms), tip = S.unit.tip_ap || 'Apartament cu dormitor/dormitoare';
      const row = { tip, bath: null, beds: t.beds, nrs: ['1'], whole: true };
      if (tip === 'Apartament cu dormitor/dormitoare') row.dormitoare = S.rooms.length;
      return [row];
    }
    return groupRooms(S.rooms);
  }

  // „Facilități” la SITUR pasul 4: bife pe categorii (req = categoriile la care Anexa 10 le cere) + text liber.
  const FACILITIES = [
    { id: 'internet', t: 'Internet (WiFi)', req: [3, 2, 1] },
    { id: 'incalzire', t: 'Încălzire', req: [3, 2, 1] },
    { id: 'apa_calda', t: 'Apă caldă', req: [3, 2, 1] },
    { id: 'parcare', t: 'Parcare', req: [3] },
    { id: 'tv', t: 'Televizor (la 3 stele: LCD minimum 80 cm, în fiecare cameră)', req: [3] },
    { id: 'frigider', t: 'Frigider sau minibar', req: [3] },
    { id: 'baie_proprie', t: 'Baie proprie în fiecare cameră', req: [3] },
    { id: 'aer', t: 'Aer condiționat' },
    { id: 'bucatarie', t: 'Bucătărie sau chicinetă pentru turiști' },
    { id: 'gradina', t: 'Grădină sau curte' },
    { id: 'terasa', t: 'Terasă sau balcon' },
    { id: 'gratar', t: 'Grătar' },
    { id: 'spalat', t: 'Mașină de spălat' },
    { id: 'copii', t: 'Pătuț sau facilități pentru copii' },
    { id: 'animale', t: 'Animale de companie acceptate' },
  ];
  // Textul care se tastează la „Facilități” în SITUR: bifele, apoi textul liber.
  function facilitiesText(u) {
    const on = FACILITIES.filter(f => u && u.facil && u.facil[f.id]).map(f => f.t.replace(/ \(.*\)$/, ''));
    if (u && u.facilitati) on.push(u.facilitati.trim());
    return on.filter(Boolean).join(', ');
  }

  return { FACILITIES, facilitiesText, LIMIT_ROOMS, LIMIT_BEDS, MIN_SURFACE, MAX_BEDS, CHECKS, SPACE_TYPES, WHOLE_TYPES, defaultType, typeOf, evaluate, totals, groupRooms, siturRows };
})();
