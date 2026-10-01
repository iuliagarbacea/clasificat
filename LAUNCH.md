# Host kit — lista de lansare (Faza 3, 22.09.2026)

Site-ul este gata de publicat în `site/`. Nimic nu este live. Fiecare rând de mai jos este fie un
lucru pe care îl face Iulia (conturi, bani, semnături), fie un lucru pe care îl fac eu după ce ea
îmi dă un ID sau un răspuns.

## A. Blocante juridice și fiscale (înainte de orice vânzare)
- [ ] **Avocat, o oră** — întrebările din PHASE0.md §Lawyer. Livrabile: OK pe modelul „instrument de
      completare”, formulările de pe site, `termeni.html`, `confidentialitate.html`. Apoi șterg
      bannerul „DRAFT” din cele două pagini. (Iulia alege avocatul; eu trimit brief-ul.)
- [~] **Contabil** — **CAEN închis 23.09** (cod softuri existent, fără filing ONRC). **MoR încă neconfirmat**: a răspuns cu regula B2C RO, nu cu modelul revânzător. Re-întrebare redactată 23.09 cu clauza 5.3 din termenii Lemon Squeezy. Ea trimite.
      (CAEN nu mai e blocant.)
- [ ] **VERIFICARI.md** — V3 (formular cod special TVA), V5 (e-Factura PF), V8 (aviz vs. AGA) închise
      și textul ghidului corectat; apoi `node build/build-ghid.js`.

## B. Conturi și bani (Iulia; nu pot crea conturi)
- [x] **Nume + domeniu .ro** — **clasificat.ro cumpărat 22.09.2026** (brand „Clasificat”). Opțional, de rezervă/redirect: dosarregimhotelier.ro. Vechile candidate: dosarclasificare.ro,
      clasificaresitur.ro, gazdalegal.ro, kitgazda.ro. Verifică disponibilitatea la ROTLD sau un
      registrar (~50 lei/an). Recomandarea mea: **dosarclasificare.ro**.
- [~] **Lemon Squeezy** — **cont creat 24.09, store `clasificat.lemonsqueezy.com` în verificare la LS**; de confirmat după aprobare: valuta RON, descriptor, License keys, apoi checkout URL + product ID în `config.js`. Confirmat 23.09 ca platformă (D-HK-05, Paddle eliminat: nu suportă RON). Cont pe SRL, store **cu valuta RON**, **descriptor de extras `CLASIFICAT.RO`**, un produs „Kit clasificare” 299 lei, **License keys ON**
      (1 activare, fără expirare), pagina de confirmare = `https://DOMENIU/app/`. Îmi dai:
      link-ul de checkout și product ID → le pun în `site/config.js`.
      KYC-ul lor cere datele firmei și IBAN; durează 1–3 zile.
- [ ] **Găzduire** — Cloudflare Pages (gratuit): proiect nou, upload direct din folderul `site/`
      (fără git) sau conectat la un repo. Domeniul se leagă din același panou. Alternativ Netlify.
- [ ] **E-mail de suport** — hello@digitalsage.ro există? Dacă nu, alias în Google Workspace.

## C. Ce fac eu după B
- [ ] `config.js`: ~~domain~~ (pus), checkoutUrl, lsProductId, CUI/J/adresa sediului.
- [x] `robots.txt`, `sitemap.xml`: clasificat.ro (22.09).
- [ ] Test de plată real cu cheie reală (Lemon Squeezy are „test mode”): cumpăr, primesc cheia, o
      introduc pe site, se deblochează aplicația și paginile din kit. Verific pe telefon.
- [ ] Șterg acceptarea cheilor `TEST-` din `gate.js`? Nu e nevoie: funcționează doar pe localhost.
- [ ] Google Search Console: verific domeniul, trimit sitemap-ul, urmăresc interogările din
      PHASE0.md §Demand check. Fără Analytics și fără cookie-uri.

## D. Lansare în două trepte
1. **Ghidul liber + pagina produsului cu „În curând”** — poate merge live imediat după A (avocat) și
   B (domeniu, găzduire), înainte de Lemon Squeezy. Începe indexarea. Butonul trimite un e-mail.
2. **Vânzarea** — după cheia Lemon Squeezy și după **autorizația provizorie a Iuliei** (decizia D-HK-04).

## E. După lansare (ritm)
- La 2 săptămâni: stare cod unic SITUR → pagina 07 + e-mail cumpărătorilor dacă se schimbă.
- La fiecare modificare de norme: versiunea din `config.js` → `contentVersion`, rebuild ghid.
- Suport: doar scris, 2 zile lucrătoare. Fiecare întrebare repetată devine un rând în FAQ.
- La 60 de zile: 5 vânzări = continuăm; sub 5 cu paginile indexate = regândim canalul.

## Structura livrabilului
```
host-kit/
  content/        sursa ghidului (markdown) + șabloane + VERIFICARI.md
  build/          build-ghid.js (md → html), dev-serve.js (server local)
  site/           ce se publică: index.html, ghid/, app/, termeni, confidențialitate, config.js, gate.js
  PHASE0.md       cercetare, decizii D-HK-xx, întrebări avocat/contabil
  LAUNCH.md       acest fișier
```

## Adăugat 22.09 (seara): pagini libere ca magnet
- `site/acord-vecini.html` — model acord vecini, generat din același șablon ca aplicația.
- `site/impozit-regim-hotelier.html` — calculator impozit/CASS/TVA comision 2026.
- Ambele în sitemap și pe landing („Gratuit, fără cont”). Intră în treapta 1 de lansare.
- Vocabular pentru orice text nou: „regim hotelier”, „acte necesare”, „persoană fizică”. Nu „SITUR”
  în titluri (nimeni nu caută așa), doar în text.

## Treapta 1 — folderul `site/` pregătit (22.09.2026)
- Ghid rebuilt; `_redirects` (www → apex, 301) și `_headers` (nosniff, DENY framing, referrer,
  permissions, CSP cu connect-src doar api.lemonsqueezy.com; noindex pe /app/ și paginile legale).
- Link-urile către Termeni/Confidențialitate scoase din footer (landing, ghid, unelte gratuite).
  Paginile există, `noindex`, nelinkate; revin în footer după validarea avocatului (treapta 2).
- `config.js`: CUI/J/adresă goale până la treapta 2. Fără placeholder-e în site/.
- CSP testat local (dev-serve aplică `_headers`): landing, unelte, ghid liber, gate + apel real
  la API-ul Lemon Squeezy (răspuns „license_key not found”) — toate fără erori de CSP.
- Upload: Cloudflare Pages → Create project → Upload assets → folderul `site/` întreg (inclusiv
  `_redirects`, `_headers`, `app/`). Apoi Custom domains → clasificat.ro + www.

## LIVE (treapta 1, temporar): https://clasificat.pages.dev — 22.09.2026
Verificat live: CSP + X-Frame-Options servite, ghid liber 200, /app/ noindex, robots OK, unelte
gratuite funcționează, gate refuză TEST- în afara localhost și ajunge la API-ul Lemon Squeezy,
fără scroll orizontal pe mobil. Cloudflare Pages servește /termeni.html ca /termeni (redirect), deci
regula X-Robots-Tag a fost adăugată și pentru forma fără .html; pagina are oricum meta noindex.
Polish local (intră la următorul upload): titlu hero 28px pe mobil.
Pași rămași: nameservere Cloudflare la registrar → Custom domains clasificat.ro + www.
- **22.09.2026, seara: https://clasificat.ro LIVE** (apex + www). Observație: www nu redirecționează
  la apex prin `_redirects`; soluție simplă: Cloudflare → clasificat.ro → Rules → Redirect Rules →
  template „Redirect from WWW to root” → Deploy. Apoi: Google Search Console (proprietate de tip
  domeniu, verificare prin TXT în DNS-ul Cloudflare), trimis `sitemap.xml`.
- www → apex: Redirect Rule activă și verificată (22.09, seara). Cloudflare servește URL-urile fără
  `.html`; sitemap-ul a fost trecut pe forma fără extensie (intră la următorul upload).

## 23.09.2026 — favicon + snippet (de urcat: al doilea upload)
- Google afișa glob generic (fără favicon) și „GhidAplicațiaKitul” (linkurile din meniu lipite +
  meta description prea lungă, ignorată). Făcut: `favicon.svg` (stea albă pe verde, colțuri
  rotunjite) + `icon-48/192/512.png`, `apple-touch-icon.png` (Chrome headless, scale 1), link-uri
  `<link rel=icon>` pe toate paginile + aplicație, logo mic lângă „Clasificat” în header, meniul cu
  spații și `data-nosnippet`, description landing 155 caractere. Plus fix-urile din coadă (hero
  mobil, sitemap fără .html, noindex pe URL-urile legale fără extensie).
- Upload: Cloudflare → Workers & Pages → clasificat → **Create deployment** → drag folderul `site/`.
  Google reia favicon-ul la următoarea recrawlare (zile–săptămâni); se poate grăbi din Search
  Console → URL inspection → Request indexing pe pagina principală.

## 23.09.2026 — 5 pagini SEO libere — LIVE (al treilea upload, făcut de co-founder din Chrome, zip cu căi „/”)
Câte o pagină pe clusterele din autocomplete (PHASE0 §Demand check), fiecare cu kitbox + legături încrucișate:
`acte-necesare-regim-hotelier`, `certificat-clasificare-online`, `cat-costa-certificat-clasificare`,
`regim-hotelier-fara-certificat`, `certificat-clasificare-booking-airbnb`. Adăugate în `sitemap.xml` și ca
listă sub „Gratuit, fără cont” pe landing. Verificat local: 200, linkuri interne OK, fără scroll orizontal la 375 px.
Fapte noi verificate 23.09: amendă 40.000–50.000 lei (HG 1267/2010, interdicția în OG 58/1998 art. 28);
extras CF 20 lei ePay / 25 lei ghișeu / gratuit pe MyEterra cu ROeID pentru proprietar; DAC7.
După upload: Search Console → Sitemaps → retrimite; URL inspection → Request indexing pe fiecare.
- 23.09.2026: Search Console — sitemap retrimis (6 → 11 URL-uri la următoarea citire), Request indexing pe toate cele 5 pagini noi (făcut de co-founder din Chrome). Verificăm interogările la începutul lui octombrie.

## 23.09.2026 — vizibilitate în răspunsurile AI (ChatGPT, Claude, Perplexity, Google AI) — zip v3, de urcat
Constatare: motoarele AI citează paginile care rankează și din care se poate extrage direct un răspuns. Perplexity la 23.09
cita contabilul.manager, situr.gov.ro, edirect.e-guvernare.ro, realtrust, dollo (cu erori: „valabil 5 ani”, „taxă 200 lei”).
Crawlerele AI (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Bingbot) primeau deja 200 pe clasificat.ro; robots.txt OK.
Făcut:
- **`build/build-seo.js`** (nou) — injectează în `<head>` pe cele 11 pagini publice: canonical (forma fără `.html`),
  `robots max-snippet:-1`, Open Graph, JSON-LD (Organization + WebSite + BreadcrumbList + Article + FAQPage din `<details>`;
  pe landing Product 299 RON cu `availability: PreOrder`). Regenerează `sitemap.xml` cu `<lastmod>`.
  **Ordinea de build de acum: `node build/build-ghid.js && node build/build-seo.js`.** Datele `published`/`modified`
  per pagină sunt în tabelul PAGES din script: la orice modificare reală de conținut, actualizează `modified` acolo.
- Pe cele 8 pagini libere + 2 pagini de ghid libere: rând „Actualizat la 23.09.2026 · Ordinul 948/2026” sub titlu
  (`p.meta`), H2-uri reformulate ca întrebări, secțiune „Întrebări frecvente” (`<details>`) pe fiecare; pe
  `acte-necesare` și o casetă „Pe scurt” (`div.answer`) cu lista actelor. Stiluri noi `.meta`, `.answer` în `styles.css`.
- Ghid: `build-ghid.js` are acum câmpurile `updated` și `faq` per pagină (redate ca meta + FAQ). Titlurile din
  `content/07-cod-unic-situr.md` reformulate ca întrebări.
- **`site/llms.txt`** (nou): descriere, fapte de bază, lista paginilor libere, produsul. Standard emergent, cost zero.
- Bing Webmaster Tools: **Iulia a adăugat clasificat.ro pe 23.09** (ChatGPT caută prin Bing). De făcut acolo: Sitemaps →
  trimite `https://clasificat.ro/sitemap.xml`; IndexNow → cheia; în Cloudflare → Caching → „Crawler Hints” ON.
  Raportul „AI Performance (beta)” din Bing WT arată citările în Copilot/ChatGPT când vor apărea.
La lansare (treapta 2): în `build-seo.js`, Product `availability` → `https://schema.org/InStock`, apoi rebuild + upload.
Sondaj lunar (co-founder): cele 5 interogări de bază pe Perplexity / ChatGPT / Google AI, cine e citat. Primul: 23.10.2026.
**Paginile din kit (02–06) — decizie Iulia 23.09: noindex acum, poartă reală înainte de prima vânzare.**
Făcut: `<meta name="robots" content="noindex,nofollow,noarchive,nosnippet">` în template pentru paginile `free: false`
(build-ghid.js) + `X-Robots-Tag: noindex, nofollow` în `_headers` pentru cele 5 URL-uri, cu și fără `.html`. Textul
rămâne în HTML (doar blurat cu CSS) până la poarta reală: încărcarea conținutului după validarea cheii. **De făcut înainte
de treapta 2.** Intră în zip v3.
- **LIVE v3 — 23.09.2026, seara, upload făcut de co-founder din Chrome (Claude in Chrome, Create deployment, zip).** Verificat live:
  X-Robots-Tag noindex + meta noindex pe cele 5 pagini din kit (cu și fără .html); cele 11 pagini libere 200, fără noindex, cu canonical
  și JSON-LD; llms.txt 200 text/plain; sitemap cu 11 lastmod; rând „Actualizat” + FAQ pe pagini. Rămân la Iulia: Bing → Sitemaps,
  IndexNow; Cloudflare → Crawler Hints. Search Console: retrimite sitemap-ul (lastmod nou).

## Versiuni pe CSS/JS (24.09.2026)
Cloudflare Pages servește CSS/JS cu `max-age=14400`; după un upload, un vizitator poate vedea HTML nou cu CSS vechi (s-a întâmplat pe 24.09: widgetul de eligibilitate a apărut nestilizat). De aceea toate referințele au `?v=<timestamp>`, puse de `build/bump-assets.js`. **Ordinea de build, întotdeauna:**
`node build/build-ghid.js && node build/build-seo.js && node build/bump-assets.js`, apoi **`git add -A && git commit && git push`** — Cloudflare Pages (proiectul `clasificat-site`) publică automat din GitHub (din 29.09.2026). Zip-ul (`make-zip.js`) e doar rezervă.

## Legături între pagini (24.09.2026)
Chei localStorage, toate pe clasificat.ro, nimic pe server: `hostkit.elig.v1` (verificarea de eligibilitate → aplicație), `hostkit.tool.v1` (acord vecini → aplicație), `hostkit.dosar.v1` (aplicația → acord vecini), `hostkit.calc.v1` (calculator → pagina fiscală). Dacă se schimbă structura dosarului, verifică `prefill`/`prefillTool` din `app/app.js` și scriptul din `acord-vecini.html`.

## 30.09.2026 — produsul Lemon Squeezy există (creat de co-founder din Chrome)
- Store live (KYC trecut), valuta **RON** confirmată în formularul de preț. Produs **1399407 „Kit clasificare regim hotelier”**,
  299 RON, single payment, categorie fiscală „Digital Goods or Services”, fără fișiere, **License keys ON** (lungime nelimitată,
  1 activare), **ascuns de pe storefront** (clasificat.lemonsqueezy.com nu-l listează; se cumpără doar prin link).
- **Checkout:** `https://clasificat.lemonsqueezy.com/checkout/buy/077c80e2-4aee-472c-a634-11655209500a` (verificat: 302 → coș).
  **NU e în `config.js`** — cât `checkoutUrl` e gol, butoanele „Ia kitul” trimit e-mail (site.js). Se pune la treapta 2.
- Modal de confirmare + e-mail de chitanță în română; butonul „Deschide kitul” → `clasificat.ro/app/?key=[license_key]`
  (variabilă documentată de LS). `gate.js` citește `?key=`, o scoate din URL (replaceState), o validează și o salvează;
  cheie invalidă → poarta apare precompletată cu mesajul API-ului. Testat local (TEST- și cheie inexistentă).
- `config.js`: `lsProductId = 1399407` (poarta refuză chei ale altui produs).
- Rămân în LS (Iulia): descriptor de extras `CLASIFICAT.RO` (Settings → General), numele store-ului „Clasificat” în loc de
  numele SRL (apare pe checkout și în e-mail), o cumpărare în **test mode** ca să vedem e-mailul și cheia reală.
- Test de plată real: după treapta 2, cu cardul ei, apoi refund din LS.
- **Test mode are produsele lui (30.09, confirmat în docs LS).** Produs de test **1400036**, aceleași setări, publicat.
  **Checkout de test:** `https://clasificat.lemonsqueezy.com/checkout/buy/bb770a77-3e29-42b1-ad22-d4d48808f34b`
  (card 4242 4242 4242 4242, orice dată viitoare, orice CVC). Cheia de test are `meta.product_id = 1400036`, deci poarta de pe
  clasificat.ro o refuză („Cheia aparține altui produs”) — normal; testul local se face cu `lsProductId` schimbat temporar.
  Butonul de confirmare duce la clasificat.ro/app/?key=… → pe site-ul live cheia de test va fi refuzată cu același mesaj.
