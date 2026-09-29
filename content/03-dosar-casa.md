# 03 — Dosarul pentru o casă individuală

## Ce conține dosarul (pe sloturile din SITUR)

SITUR are câte un slot pentru fiecare act (pagina 05, pasul 7). Două dintre ele le generează chiar
SITUR; restul le aduci tu sau le face aplicația din kit.

1. **Cererea standardizată** (Anexa 3¹, formularul pentru persoane fizice). **O generează SITUR** la
   pasul 6 din datele tastate la pasul 4: titular, denumirea unității (fără cuvântul de tip),
   „camere de închiriat în locuință familială”, categoria (stele), adresa, telefon și e-mail. O
   descarci, o semnezi de mână, o scanezi, o încarci. Aplicația din kit îți dă dinainte foaia de
   completare cu exact aceste valori.
2. **Fișa standardizată** (Anexa 4): încadrarea nominală a camerelor. **O generează SITUR** din
   tabelul de la pasul 5: pentru fiecare tip de cameră (1, 2, 3 sau 4 locuri), grup sanitar propriu
   sau comun, câte camere, câte locuri, numerele de ordine. Totalul locurilor este capacitatea pe
   care o declari pe platforme. Semnată, scanată, încărcată.
3. **Copia actului de identitate** al titularului. Dacă ai carte de identitate electronică fără
   adresă, atașezi și certificatul de domiciliu.
4. **Actul de proprietate** (vânzare-cumpărare, donație, moștenire) și **extrasul de carte funciară**
   cu adresa administrativă exactă, într-un singur PDF (slotul „dreptul de proprietate și adresa
   unității”). Extras recent, de cel mult 30 de zile, de pe ancpi.ro.
5. **Dovada legalității construcției**: autorizație de construire sau certificat de atestare a
   edificării; extrasul CF cu construcția intabulată este acceptat ca alternativă.
6. **Declarația pe propria răspundere** că imobilul nu are pereți comuni cu alți proprietari și nu
   există asociație de proprietari. Ține locul avizului de asociație și al acordului vecinilor
   cerute la apartamente; SITUR are două sloturi pentru ele (acordul asociației/vecinilor și
   declarația că toți vecinii au fost de acord), iar la casă încarci aceeași declarație în ambele.
   Cu mențiunea art. 326 Cod penal. Șablon: `templates/declaratie-fara-pereti-comuni.md`.
7. **Acordul coproprietarilor**, dacă imobilul nu este doar al tău (ai bifat „coproprietar” la
   pasul 2). Șablon: `templates/acord-coproprietari.md`. Atașează și copia CI a coproprietarului, în
   slotul ei.
8. **Acordul creditorului ipotecar**, dacă imobilul are ipotecă. Îl dă banca, la cerere scrisă; se
   încarcă la „Alte documente”. Cere-l primul, pentru că durează cel mai mult.

## Cerințe noi din iulie 2026, de bifat înainte de a cere categoria
Din Ordinul 948/2026 (Anexa 10), la **toate** categoriile:
- acces la internet în unitate;
- o pagină web sau de social media a unității, cu informații și poze actuale și locația (anunțul de
  pe Booking sau Airbnb nu ține loc);
- două prosoape de dimensiuni diferite de persoană, cuier și noptiere în fiecare cameră.

Doar la **3 stele**, în plus:
- baie proprie în fiecare cameră declarată;
- maximum 3 locuri pe cameră (camerele de 4 locuri nu se admit la 3 stele);
- televizor LCD de minimum 80 cm, cu acces TV sau internet, în fiecare cameră;
- posibilitate de parcare.

Dacă una lipsește, ceri 2 stele sau scoți camera respectivă din fișă. Lista completă: pagina 02.

## Greșeli care întorc dosarul
- Adresa din cerere diferă de cea din extrasul CF (sat vs. comună, „str.” vs. „aleea”, numărul
  poștal). Copiază adresa din CF literal.
- Numărul de locuri din fișă nu corespunde cu paturile reale. Un pat dublu înseamnă 2 locuri;
  canapeaua extensibilă nu se numără decât dacă o declari ca loc.
- Categoria 3 stele cerută cu o cameră fără baie proprie.
- Lipsa dovezii de construcție legală. Vezi pagina 01.
- Cererea semnată de un coproprietar, fișa de altul. Un singur titular semnează tot.
- Denumirea unității conține cuvântul de tip („Vila…”, „Casa…”, „Pensiunea…”). SITUR o respinge la
  pasul 4; numele de pe Booking poate rămâne, în cerere pui varianta fără tip.
- Ipotecă neanunțată: lipsește acordul băncii la „Alte documente”.

## Cum arată, concret
Casă P+1 cu 3 dormitoare, două cu baie proprie și unul cu baie comună. La 3 stele nu trece (camera
fără baie proprie). Opțiuni: ceri 2 stele pentru toată unitatea, sau ceri 3 stele doar pentru cele
două camere cu baie și nu declari a treia. Kitul îți arată această alegere în momentul în care
completezi camerele. În SITUR asta înseamnă, la pasul 5, un rând „Cameră cu 2 locuri, grup sanitar
propriu, 2 spații, 4 locuri, nr. de ordine 1, 2” și, dacă declari și a treia la 2 stele, un al
doilea rând cu categoria lui.
