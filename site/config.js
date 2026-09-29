// Configurația site-ului. Singurul fișier de editat la lansare.
window.SITE = {
  name: 'Clasificat',                    // brand: clasificat.ro (cumpărat 22.09.2026)
  domain: 'https://clasificat.ro',       // domeniul final, fără slash la sfârșit
  email: 'contact@digitalsage.ro',       // adresa de suport (doar scris)
  price: '299 lei',
  company: {
    name: 'Digital SAGE IT Consulting SRL',
    cui: '',                             // de completat înainte de treapta 2 (termeni)
    reg: '',
    address: '',
  },
  // Lemon Squeezy — se completează după crearea contului și a produsului
  checkoutUrl: '',       // ex. https://STORE.lemonsqueezy.com/buy/xxxxxxxx-xxxx-....
  lsProductId: '',       // ex. 123456 — dacă e gol, nu se verifică produsul, doar validitatea cheii
  gateDays: 30,          // la câte zile se re-verifică online cheia de licență
  contentVersion: 'Anexa 10 / Ordin 948/2026 · 22.09.2026',
};
