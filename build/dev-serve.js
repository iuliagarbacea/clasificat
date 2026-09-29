// Server static minimal pentru dezvoltare locală. Aplică și blocul "/*" din site/_headers ca să
// testăm CSP-ul înainte de upload. Nu face parte din produs.
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'site'), port = Number(process.argv[2]) || Number(process.env.PORT) || 8787;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
function globalHeaders() {
  const h = {};
  try {
    const lines = fs.readFileSync(path.join(root, '_headers'), 'utf8').split(/\r?\n/);
    let inGlobal = false;
    for (const l of lines) {
      if (!l.startsWith(' ')) { inGlobal = (l.trim() === '/*'); continue; }
      if (inGlobal) { const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
    }
  } catch (e) { }
  return h;
}
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, Object.assign({ 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }, globalHeaders()));
    res.end(data);
  });
}).listen(port, () => console.log('clasificat.ro dev on http://localhost:' + port + ' (with _headers)'));
