// Injectează în <head> al paginilor publice: canonical, robots, Open Graph și JSON-LD
// (Article + BreadcrumbList + FAQPage din <details>; pe prima pagină Organization + WebSite +
// Product + FAQPage). Regenerează și site/sitemap.xml cu <lastmod>.
// Idempotent: blocul dintre <!-- seo --> și <!-- /seo --> se înlocuiește la fiecare rulare.
// Rulat manual, DUPĂ build-ghid.js:  node build/build-ghid.js && node build/build-seo.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SITE_DIR = path.join(ROOT, 'site');
const SITE = 'https://clasificat.ro';

const ORG = {
  '@type': 'Organization', '@id': SITE + '/#org',
  name: 'Clasificat', legalName: 'Digital SAGE IT Consulting SRL', url: SITE + '/',
  logo: { '@type': 'ImageObject', url: SITE + '/icon-512.png', width: 512, height: 512 },
  email: 'contact@digitalsage.ro', areaServed: 'RO', knowsLanguage: 'ro',
};

// published = prima publicare; modified = ultima modificare de conținut (actualizează la fiecare schimbare reală).
const PAGES = [
  { file: 'index.html', path: '/', type: 'home', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'acte-necesare-regim-hotelier.html', path: '/acte-necesare-regim-hotelier', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'certificat-clasificare-online.html', path: '/certificat-clasificare-online', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'cat-costa-certificat-clasificare.html', path: '/cat-costa-certificat-clasificare', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'regim-hotelier-fara-certificat.html', path: '/regim-hotelier-fara-certificat', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'certificat-clasificare-booking-airbnb.html', path: '/certificat-clasificare-booking-airbnb', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'acord-vecini.html', path: '/acord-vecini', published: '2026-09-22', modified: '2026-09-24' },
  { file: 'impozit-regim-hotelier.html', path: '/impozit-regim-hotelier', published: '2026-09-22', modified: '2026-09-23' },
  { file: 'ghid/index.html', path: '/ghid/', type: 'collection', published: '2026-09-22', modified: '2026-09-24', crumb: ['Ghid'] },
  { file: 'ghid/eligibilitate.html', path: '/ghid/eligibilitate', published: '2026-09-22', modified: '2026-09-24', crumb: ['Ghid'] },
  { file: 'ghid/cod-unic-situr.html', path: '/ghid/cod-unic-situr', published: '2026-09-22', modified: '2026-09-22', crumb: ['Ghid'] },
];

const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const unesc = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ');
const text = s => unesc(strip(s));
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const pick = (html, re) => { const m = html.match(re); return m ? m[1] : ''; };

function faqFrom(html) {
  const out = [];
  const re = /<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
  let m; while ((m = re.exec(html))) out.push({ '@type': 'Question', name: text(m[1]), acceptedAnswer: { '@type': 'Answer', text: text(m[2]) } });
  return out;
}

function jsonld(p, html) {
  const url = SITE + p.path;
  const title = text(pick(html, /<title>([\s\S]*?)<\/title>/));
  const desc = unesc(pick(html, /<meta name="description" content="([^"]*)"/));
  const h1 = text(pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/)) || title;
  const faq = faqFrom(html);
  const graph = [ORG, { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: 'Clasificat', inLanguage: 'ro', publisher: { '@id': ORG['@id'] } }];

  const crumbs = [{ name: 'Acasă', item: SITE + '/' }];
  if (p.crumb && p.path !== '/ghid/') crumbs.push({ name: p.crumb[0], item: SITE + '/ghid/' });
  if (p.path !== '/') crumbs.push({ name: h1, item: url });
  graph.push({ '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) });

  if (p.type === 'home') {
    graph.push({
      '@type': 'Product', '@id': SITE + '/#kit', name: 'Kitul Clasificat: dosarul de clasificare pentru regim hotelier, persoană fizică',
      description: "Aplicație care verifică camerele pe criteriile de stele, dă foaia de completare pentru SITUR (ce tastezi la fiecare pas, ce încarci în fiecare slot) și generează declarațiile și acordurile pentru certificatul de clasificare la camere și apartamente de închiriat, cel mult 7 camere, plus ghidul de depunere și kitul fiscal.",
      brand: { '@type': 'Brand', name: 'Clasificat' }, category: 'Documente și ghid de conformitate pentru închiriere în regim hotelier',
      audience: { '@type': 'PeopleAudience', audienceType: 'persoane fizice care închiriază pe Booking sau Airbnb în România' },
      offers: { '@type': 'Offer', url: SITE + '/#pret', price: '299', priceCurrency: 'RON', availability: 'https://schema.org/PreOrder', seller: { '@id': ORG['@id'] } }, // la lansare: InStock
    });
  } else if (p.type === 'collection') {
    graph.push({ '@type': 'CollectionPage', '@id': url + '#page', url, name: h1, headline: h1, description: desc, inLanguage: 'ro', isPartOf: { '@id': SITE + '/#site' }, datePublished: p.published, dateModified: p.modified, publisher: { '@id': ORG['@id'] } });
  } else {
    graph.push({
      '@type': 'Article', '@id': url + '#article', mainEntityOfPage: url, url, headline: h1, description: desc, inLanguage: 'ro',
      datePublished: p.published, dateModified: p.modified, author: { '@id': ORG['@id'] }, publisher: { '@id': ORG['@id'] },
      isAccessibleForFree: true, isPartOf: { '@id': SITE + '/#site' },
      about: [{ '@type': 'Thing', name: 'certificat de clasificare' }, { '@type': 'Thing', name: 'regim hotelier' }, { '@type': 'Thing', name: 'SITUR' }],
      image: SITE + '/icon-512.png',
    });
  }
  if (faq.length) graph.push({ '@type': 'FAQPage', '@id': url + '#faq', mainEntity: faq });
  return { '@context': 'https://schema.org', '@graph': graph };
}

function headBlock(p, html) {
  const url = SITE + p.path;
  const title = text(pick(html, /<title>([\s\S]*?)<\/title>/));
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const ld = JSON.stringify(jsonld(p, html)).replace(/</g, '\\u003c');
  return `<!-- seo -->
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
<meta property="og:locale" content="ro_RO">
<meta property="og:type" content="${p.type === 'home' ? 'website' : 'article'}">
<meta property="og:site_name" content="Clasificat">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${SITE}/icon-512.png">
${p.type === 'home' ? '' : `<meta property="article:published_time" content="${p.published}">
<meta property="article:modified_time" content="${p.modified}">
`}<meta name="twitter:card" content="summary">
<script type="application/ld+json">${ld}</script>
<!-- /seo -->`;
}

let n = 0;
PAGES.forEach(p => {
  const f = path.join(SITE_DIR, p.file);
  let html = fs.readFileSync(f, 'utf8');
  const block = headBlock(p, html);
  if (/<!-- seo -->[\s\S]*?<!-- \/seo -->/.test(html)) html = html.replace(/<!-- seo -->[\s\S]*?<!-- \/seo -->/, block);
  else html = html.replace(/<\/head>/, block + '\n</head>');
  fs.writeFileSync(f, html); n++;
});

const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url><loc>${SITE}${p.path}</loc><lastmod>${p.modified}</lastmod></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(SITE_DIR, 'sitemap.xml'), sm);
console.log('seo: ' + n + ' pagini cu canonical/OG/JSON-LD; sitemap.xml cu lastmod (' + PAGES.length + ' URL-uri)');
