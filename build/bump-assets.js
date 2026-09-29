// Pune ?v=<timestamp> pe toate referințele la CSS/JS din site/ (inclusiv /app/) și în template-ul din build-ghid.js.
// Motiv: Cloudflare Pages servește CSS/JS cu max-age=14400; fără versiune în URL, după un upload
// vizitatorii pot vedea HTML nou cu CSS vechi (văzut pe 24.09.2026). Rulat ULTIMUL:
//   node build/build-ghid.js && node build/build-seo.js && node build/bump-assets.js
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const d = new Date(), pad = n => String(n).padStart(2, '0');
const V = process.argv[2] || (d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()));
const ASSETS = 'styles\\.css|site\\.js|elig\\.js|calc\\.js|gate\\.js|config\\.js|rules\\.js|templates\\.js|app\\.js';
const re = new RegExp('((?:href|src)=["\'](?:/|/app/)?(?:' + ASSETS + '))(\\?v=[^"\']*)?(["\'])', 'g');
const reDyn = /(s\.src = ')(app\.js)(\?v=[^']*)?(')/g; // încărcarea dinamică din app/index.html
const files = [];
const walk = dir => fs.readdirSync(dir).forEach(f => { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) files.push(p); });
walk(path.join(ROOT, 'site'));
files.push(path.join(ROOT, 'build', 'build-ghid.js'));
let changed = 0;
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8');
  const t = s.replace(re, (m, a, old, q) => a + '?v=' + V + q).replace(reDyn, (m, a, b, old, q) => a + b + '?v=' + V + q);
  if (t !== s) { fs.writeFileSync(f, t); changed++; }
}
console.log('assets v=' + V + ' în ' + changed + ' fișiere');
