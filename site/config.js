// Configurația site-ului. Singurul fișier de editat la lansare.
window.SITE = {
  name: 'Clasificat',                    // brand: clasificat.ro (cumpărat 22.09.2026)
  domain: 'https://clasificat.ro',       // domeniul final, fără slash la sfârșit
  email: 'hello@digitalsage.ro',       // adresa de suport (doar scris)
  price: '299 lei',
  company: {
    name: 'Digital SAGE IT Consulting SRL',
    cui: '',                             // de completat înainte de treapta 2 (termeni)
    reg: '',
    address: '',
  },
  // Lemon Squeezy — se completează după crearea contului și a produsului
  // Link de checkout (produs 1399407, publicat 30.09.2026). GOL până la lansare: cât e gol, butoanele
  // „Ia kitul” trimit e-mail. La lansare: https://clasificat.lemonsqueezy.com/checkout/buy/077c80e2-4aee-472c-a634-11655209500a
  checkoutUrl: '',
  lsProductId: '1399407', // „Kit clasificare regim hotelier”, Lemon Squeezy, 30.09.2026
  gateDays: 30,          // la câte zile se re-verifică online cheia de licență
  contentVersion: 'Anexa 10 / Ordin 948/2026 · 22.09.2026',
};
