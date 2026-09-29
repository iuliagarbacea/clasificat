# Registru de facturi + fișă de ocupare (un singur tabel)

Coloanele de mai jos devin foaia de calcul livrată în kit (o linie per rezervare). Acoperă simultan
registrul de facturi (serie, număr, sumă) și fișa de ocupare a capacității de cazare (cine, când,
câte locuri).

| Coloană | Exemplu | De ce |
|---|---|---|
| serie | DLH | seria facturii, aleasă de titular |
| numar | 0001 | crescător, fără goluri |
| data_factura | 2026-10-03 | data emiterii |
| platforma | Booking / Airbnb / direct | sursa rezervării |
| cod_rezervare | 4321.987.654 | trasabilitate față de platformă |
| turist_nume | (din rezervare) | fișa de ocupare |
| turist_tara | IT | fișa de ocupare |
| check_in | 2026-10-01 | fișa de ocupare |
| check_out | 2026-10-04 | fișa de ocupare |
| nopti | 3 | calculat |
| camere_ocupate | 1,2 | numerele din Anexa 4 |
| locuri_ocupate | 4 | capacitate folosită |
| suma_bruta_ron | 900,00 | baza facturii și a impozitului |
| comision_ron | 135,00 | din factura platformei |
| tva_comision_ron | 28,35 | 21% × comision, plătit prin 301 |
| incasat_net_ron | 765,00 | brut − comision |
| observatii | storno / anulare | — |

Reguli: o linie per rezervare, storno cu semn minus pe o linie nouă; nu se șterge nimic. Totalul
anual din `suma_bruta_ron` este venitul brut din declarația unică.
