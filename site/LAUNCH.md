
## Redesign vizual (23.09.2026)
Stiluri noi în `site/styles.css`, font Manrope self-hosted (`site/fonts/`, inclus în upload). Landing restructurat (hero, bandă cifre, icoane, footer pe 3 coloane); restul paginilor și template-ul ghidului au footerul și meniul nou. La orice upload viitor: folderul `site/` întreg, inclusiv `fonts/`.

## Fluxul SITUR real (24.09.2026)
Capturile din cererea Iuliei (#113476) arată că SITUR generează cererea și fișa la pasul 6. Aplicația livrează acum „Foaia de completare SITUR” (pași 1–7 + sloturile de la pasul 7) și declarațiile; cererea/fișa rămân doar pentru depunere pe hârtie. Ghid 01/03/04/05, landing, paginile libere, llms.txt, JSON-LD (build-seo.js) rescrise. Întrebări deschise pentru Iulia în PHASE0.md §Fluxul real SITUR. Zip: `clasificat-site-2026-09-24-v5.zip` (include și UX-ul din aplicație: pași în ordinea SITUR, butoane „copiază” în foaie, previzualizarea rândurilor SITUR la camere).
Dev server: `build/dev-serve.js [port]` acceptă portul ca argument; launch.json are și `host-kit-app-8788` pentru când 8787 e ocupat de altă sesiune.

## Upload 24.09.2026 (v5) — parțial: sub-folderele nu au ajuns
Zip-ul făcut cu Compress-Archive (PowerShell) are căi cu „\”; Pages a pus `app\app.js` ca fișier la rădăcină, iar `/app/` și `/ghid/` au rămas vechi (verificat cu md5 live vs. local). De acum zip-ul se face cu `node build/make-zip.js <nume>` (căi cu „/”, testat cu unzip + diff). Ordine completă: `build-ghid.js` → `build-seo.js` → `bump-assets.js` → `make-zip.js`. La upload, verificare: `curl -s https://clasificat.ro/app/ | grep rules.js` trebuie să arate `?v=` nou.

## 24.09.2026 (seara): capturi SITUR în ghid + pasul „Ce urmează”
- `build/png-redact.js <folder>`: taie bara de adresă și acoperă numele/numărul solicitării din cele 10 capturi (sursa: `prt scrns SITUR cerere.docx`) → `site/ghid/img/situr-*.png` (1,3 MB total). Pagina 05 le include cu `![legendă](/ghid/img/…)` (suport nou în build-ghid.js, `<figure class="shot">`).
- Aplicația are pasul 8 „Ce urmează”: 8 etape bifabile cu dată, nr. solicitării, avertisment când termenul legal (30/90/15 zile) e depășit. Stare în `track` din `hostkit.dosar.v1`.
- Zip: `clasificat-site-2026-09-24-v8.zip`.

## Trecere mobil (24.09.2026, seara)
Audit la 375 px (pane-ul nu coboară sub 444, iframe-ul e blocat de X-Frame-Options; măsurat cu viewport emulat 375). Ghidul și paginile libere: fără overflow. Aplicația: camerele devin carduri sub 600 px (etichete din `data-l`), previzualizarea SITUR derulează în `.tscroll`, foaia derulează în interiorul `.doc` (font 11pt, semnături pe verticală), `fieldset { min-width:0 }` (altfel pagina derula lateral). Zip: `clasificat-site-2026-09-24-v9.zip`.
