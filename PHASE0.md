# Host kit — Phase 0 (22.09.2026)

Working name only. Product: self-serve kit for persoane fizice (≤7 camere) renting on Booking/Airbnb —
classification dossier (SITUR) + filing guide + fiscal kit. Sold by Digital SAGE IT Consulting SRL,
299 lei, one SKU. Approved by Iulia 22.09.2026: (1) sell via SRL through a merchant of record,
(2) one paid lawyer hour before launch, (3) launch gate = her own autorizație provizorie.

## Findings

### Cod unic SITUR — still not generatable (as of the latest public source, 12.06.2026)
- Legal obligation since 20.05.2026 (Reg. UE 2024/1028 + OG 6/2026); SITUR generation "în implementare".
- se.situr.gov.ro CMS page (checked 22.09.2026) lists only: clasificări online, declarații agenții,
  catalog structuri autorizate, sesizări. Nothing about cod unic / număr de înregistrare.
- Platforms have NOT started delisting; automatic deactivation is announced for after API integration.
- Product consequence: the kit sells the certificate (prerequisite for the code) and ships a
  "when the code goes live" page that we update. Recheck SITUR every 2 weeks; log here.

### Competitive landscape (self-serve gap confirmed)
- Done-for-you consultants: rentoro.ro, certificatdeclasificare.ro, clasificareturistica.ro,
  turism-expert.ro, autorizatii-turism.ro (1.000–7.500 RON), plus property managers (ByChoice,
  Credos, ImoStefan, Super Gazde) who classify as a hook for management contracts.
- Free content: fiscalitatea.ro (Rentrop & Straton) complete guide, renzi.ro (accounting blog),
  startupcafe, profit.ro, avocatnet (paywalled). Nobody sells generated documents or a wizard.
- Certificate itself is free from the ministry → our price competes only with the consultant's fee
  and the host's fear. Message: "same documents, your name, one evening, 299 lei".

### Demand check
- No Keyword Planner access from here; no volume numbers. Real signal = a free guide page indexed
  early (Phase 1 output) and Search Console. Queries to watch:
  clasificare camere de inchiriat persoana fizica · certificat clasificare airbnb · cod situr ·
  cod unic situr booking · acte necesare clasificare apartament regim hotelier · situr cont
  persoana fizica · roeid situr · fisa de ocupare cazare · cod special tva booking 301 390 ·
  declaratie unica inchiriere turistica 7 camere.
- Proxy signal already visible: 6+ national outlets ran the 20.05.2026 story; consultants added
  dedicated PF pages in 2025–2026; avocatnet paywalled it in Feb 2026.

## Lawyer — one paid hour, question list
1. Document assembly: a web tool that fills the ministry's standard forms (Anexa 3 cerere, Anexa 4
   fișă) and generates declarations from the user's own answers — is this outside "consultanță
   juridică / redactare de acte" reserved to lawyers under Legea 51/1995 art. 3? What wording on
   the site keeps it so (e.g. "instrument de completare", "model", "informativ")?
2. Our own templates: declarație pe propria răspundere (fără pereți comuni / fără asociație),
   acord coproprietar, acord vecini, acord asociație — can we sell them as models? Any mandatory
   mentions (art. 326 CP reference, date/signature blocks)?
3. Terms of sale for a digital product B2C: right-of-withdrawal waiver for digital content delivered
   immediately (OUG 34/2014 art. 16 lit. m), refund policy wording, liability cap ("nu garantăm
   emiterea certificatului").
4. GDPR: no personal data leaves the browser; payment via merchant of record. Is a privacy notice
   enough, any DPO/ANSPDCP registration concern? Cookie banner needed if no analytics cookies?
5. Using "SITUR", "Ministerul Turismului" names descriptively on the site — any restriction?
6. Merchant of record model (Lemon Squeezy / Paddle sells to the consumer, remits to the SRL):
   anything in RO consumer law that still makes the SRL the seller of record?

## Accountant — additions to the pending email
- SRL will sell a B2C digital product through a merchant of record (Lemon Squeezy or Paddle).
  Confirm: the SRL invoices the platform (B2B, non-EU/EU reverse charge as applicable) per payout,
  and issues NO e-Factura B2C per end customer. Which TVA treatment applies per platform entity.
- Revenue line is new for the SRL: CAEN coverage — do we need to add a CAEN (e.g. 5829 / 6311 /
  4791 / 7022) via ONRC before the first sale? (Ironically an ONRC filing; note it.)
- Existing question stays: e-Factura for the PF host activity (Legea 88/2026 vs OG 6/2026).

## Decisions log
- D-HK-01 (22.09.2026) Idea approved over ONRC packs. Reason: demand forced by regulation, she is
  customer zero, half built already.
- D-HK-02 (22.09.2026) Scope v1 = persoană fizică only, two paths (house / apartment in bloc).
- D-HK-03 (22.09.2026) 299 lei, one SKU, merchant of record, static site, client-side wizard.
- D-HK-04 (22.09.2026) Launch gate: her provisional authorisation. Free guide page may go live earlier
  to start indexing (needs her approval at publish time).

## Open items
- [ ] Lawyer: pick one, book the hour (Iulia). I draft the brief from the list above.
- [x] Accountant email drafted 22.09 (8 questions, in chat); she sends.
- [ ] CAEN check before first sale.
- [ ] Domain/name: to decide in Phase 3; not blocking.
- [ ] SITUR cod unic status recheck: next 06.10.2026.

## Status 22.09.2026 (end of day)
- Phase 1 content: written, reviewed by Iulia. Open checks in content/VERIFICARI.md (V3, V5, V8, V9 blocking launch).
- Phase 2 wizard: built in app/ (static, client-side, 8 steps, both paths, per-document PDF via print).
  Tested with fictional data. Not yet tested on Iulia's real dossier — she does that as customer zero.
- Phase 3 next: name/domain, landing + guide pages, merchant of record, terms/privacy, delivery.

## Demand check — Google autocomplete (ro/RO, 22.09.2026)
Real suggestions, not guesses. Language finding: buyers say **„regim hotelier”**, not „camere de
închiriat”, and almost nobody types „SITUR” (it autocompletes to „situri arheologice”).
- Certificate intent: certificat de clasificare persoane fizice · … turistica persoana fizica ·
  … booking · … regim hotelier · … camere de inchiriat · … online · cum obtin certificat de clasificare
- Documents intent: acte necesare regim hotelier persoana fizica · acte necesare inchiriere apartament
  in regim hotelier persoana fizica · documente clasificare camere de inchiriat · acte necesare
  clasificare camere de inchiriat brașov (local intent exists)
- **Neighbour consent (a whole cluster):** acord vecini regim hotelier pdf / model / formular /
  cerere · formular acord vecini regim hotelier persoana fizica · refuz acord vecini regim hotelier ·
  regim hotelier fara acordul vecinilor
- Fiscal: impozit regim hotelier 2026 · taxe regim hotelier 2026 · tva regim hotelier 2026 · norma de
  venit regim hotelier 2026 · calcul impozit regim hotelier · factura regim hotelier persoana fizica ·
  factura airbnb persoana fizica
- Platform/code: cod unic situr · cod situr · booking cod de inregistrare · certificat clasificare airbnb
- Risk-seeking: regim hotelier fara certificat de clasificare
Actions taken: landing title/H1/meta rewritten around „regim hotelier” + „acte necesare”.
Recommended (not built): free page „Acord vecini regim hotelier — model PDF” as lead magnet (our
template, one field to fill, links to the kit for the rest); free „impozit regim hotelier 2026”
calculator page; sitemap entries for both.
- D-HK-05 (22.09.2026, proposed by co-founder, Iulia asked "why not SRL/PFA") v1 stays persoană
  fizică only. v2 = PFA/SRL for the same structure type (apartamente/camere de închiriat):
  operator-economic cerere, ONRC check replaces certificat constatator, verify REGES/qualification
  requirements; classification only, no fiscal kit (accountant territory). Trigger: after first
  sales. Pensiuni/vile: only on written demand from v2 buyers (consultant market, different annexes).

## MoR platform check (23.09.2026) — decision D-HK-05

Comparat Lemon Squeezy vs. Paddle pe criteriul care contează pentru un produs cu preț în lei:

| | Lemon Squeezy | Paddle |
|---|---|---|
| Afișează 299 lei la checkout | **Da** (RON = una din cele 130 valute de vânzare) | **Nu** — RON nu e în cele 33 de valute suportate; buyer-ul RO ar vedea ~60 EUR |
| Valuta în care se încasează efectiv | USD (conversie mid-market, fără comision de la ei) | valuta afișată |
| Comision | 5% + 0,50 $ | 5% + 0,50 $ |
| Payout către SRL din RO | bancar, RO pe lista suportată | doar EUR/GBP/USD prin transfer bancar |
| Verificare cont | mai ușoară | „Account verification" mai strictă; vânzător nou cu un singur SKU = risc de respingere |
| Entitate contractantă | Sold Through Link, LLC (f/k/a Lemon Squeezy LLC), Utah, SUA | Paddle.com Market Ltd (UK) |

**D-HK-05 (23.09.2026) — rămânem pe Lemon Squeezy.** Motiv: prețul afișat este punctul de decizie al
cumpărătorului; „299 lei" convertește, „€60" pe o pagină românească nu. Valuta de decontare (USD) este
o supărare post-cumpărare, care se dezamorsează cu descriptor de extras + o linie în FAQ. Comisionul
este identic, deci nu e un criteriu. Paddle nu mai e o alternativă de evaluat.

**De setat la deschiderea contului (nu după):**
- descriptor de extras = `CLASIFICAT.RO`, verificat la plata de test (altfel apare „SOLD THROUGH LINK LLC"
  pe extrasul unui cumpărător român → dispute „nu recunosc tranzacția");
- valuta magazinului = RON;
- linie în FAQ + pe pagina de mulțumire: suma poate apărea în dolari pe extras, banca poate adăuga
  comision de conversie (~2–3%). Nu lângă butonul de cumpărare.

**Clauza pentru contabil** (termeni Lemon Squeezy, cap. 5.3): acționează ca *„your non-exclusive
reseller of the Product via Lemon Squeezy Checkout"* și este *„responsible for all aspects of Sales Tax
as between you, Lemon Squeezy and Buyers"*.

## Fluxul real SITUR (24.09.2026, capturi din cererea Iuliei #113476) — decizia D-HK-06

Sursa: `prt scrns SITUR cerere.docx` (10 capturi). Demersul „Structură de cazare de tip apartamente
sau camere de închiriat fără alimentație” are 7 pași: (1) date PF, (2) proprietar unic / coproprietar,
(3) tip operațiune: clasificare / reclasificare / schimbare titular / modificare fișă anexă, (4) date
structură: tip, denumire (fără cuvântul de tip), stele, spațiu de pregătire a mesei Da/Nu, tip cazare
(fără / cu mic dejun), facilități text liber, telefon*, email*, web, adresă cu județ/localitate/stradă
din liste + număr/bloc/scară/etaj/ap/cod poștal + „alte informații” + hartă, (5) tabel spații: categorie
| tip spațiu (Suită, Cameră cu 2 locuri…) | grup sanitar | nr. spații | nr. locuri total | nr. de ordine,
(6) **SITUR generează cererea și fișa** din pașii 4–5 (se descarcă, se semnează olograf, se scanează),
(7) anexe, un slot per act: cerere*, fișă*, CI*, acordul asociației+vecinilor sau declarație art. 326*,
act de proprietate + adresă*, acordul celuilalt proprietar*, CI coproprietar*, declarație că toți
proprietarii cu pereți comuni au fost de acord*, legalitatea construcției*, alte documente (**ipotecă →
acordul creditorului ipotecar**). Apoi „Finalizează activitatea”.

**D-HK-06 (24.09.2026):** kitul nu mai vinde „generăm cererea și fișa” (le face SITUR). Livrabilul
aplicației devine: verificarea pe stele + **foaia de completare SITUR** (valorile de tastat la fiecare
pas, fișierul de încărcat în fiecare slot) + declarațiile/acordurile pe care SITUR nu le generează.
Cererea și fișa rămân în aplicație doar pentru depunerea pe hârtie. Site-ul, ghidul (01, 03, 04, 05),
llms.txt și JSON-LD rescrise pe această bază. Ipoteca adăugată ca a patra întrebare de eligibilitate.

**De confirmat cu Iulia (din cererea ei reală):**
1. ~~La casă, ce a încărcat în cele două sloturi de vecini/asociație?~~ **Confirmat 24.09 (Iulia):** aceeași
   declarație „fără pereți comuni, fără asociație” în ambele sloturi; SITUR a acceptat. Kitul spune exact asta.
2. ~~Sloturile de coproprietar apar și la „proprietar unic”?~~ **Confirmat 24.09 (Iulia): nu, dispar.**
   Foaia spune deja asta.
3. ~~Lista „Tip spațiu”?~~ **Confirmat 24.09 (Iulia, capturi):** Cameră cu 1 loc, Cameră cu 2 locuri, Suită,
   Garsonieră, Apartament cu dormitor/dormitoare, Duplex. Atât. Fără „cameră cu 3/4 locuri”. Câmpuri per tip:
   Cameră/Suită = grup sanitar + nr. spații + locuri + nr. ordine; Garsonieră/Duplex = fără grup sanitar;
   Apartament = fără grup sanitar, cu „Nr. dormitoare”. Ipoteza Iuliei: 3+ locuri → Suită, locurile la câmpul liber.
4. ~~Strada la Valea Doftanei?~~ **Confirmat 24.09 (Iulia): era în listă; harta e a doua cale de a alege adresa.**
5. Pasul 1 (primul „Date persoană fizică”): ce câmpuri are, preluate din ROeID sau tastate?
6. „Categoria de clasificare” per rând la pasul 5: a putut cere o singură categorie sau formularul
   forțează categoria de la pasul 4?

## Contabil — răspuns primit 23.09.2026 (Brîndușa Ionescu, Keez)
- **CAEN: închis.** „Aveți un cod CAEN de softuri și se potrivește cu ce vreți să vindeți." Nu se adaugă
  coduri la ONRC (ONRC refuză CAEN-uri suplimentare nefolosite). Sugestia de consultant juridic pentru
  CAEN = ignorată, nu se plătește un avocat pentru un cod deja deținut.
- **MoR: neînțeles / nerăspuns.** A răspuns cu regula B2C RO (factură cu TVA + e-Factura), care se aplică
  doar dacă SRL-ul facturează persoana fizică — nu este cazul în modelul MoR. Re-întrebare redactată
  23.09 (în chat), cu clauza 5.3 și întrebările: self-billing vs. factură proprie, D390 (non-UE), casă
  de marcat (card online, fără numerar).
