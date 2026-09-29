// Pregătește capturile SITUR pentru ghid (pagina 05): taie bara de adresă a browserului (conține id-ul
// solicitării) și acoperă numele titularului și numărul solicitării. PNG 8-bit RGBA, neîntrețesut.
// Fără dependențe (zlib din Node). Rulat manual:
//   node build/png-redact.js "<folder cu image1..10.png>"      → site/ghid/img/situr-*.png
// Sursa: prt scrns SITUR cerere.docx (24.09.2026), cererea #113476 a Iuliei. Coordonate în pixeli.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const SRC = process.argv[2]; if (!SRC) { console.error('lipsește folderul sursă'); process.exit(1); }
const OUT = path.join(__dirname, '..', 'site', 'ghid', 'img'); fs.mkdirSync(OUT, { recursive: true });
const GREY = [226, 226, 226, 255];

// crop = rânduri tăiate de sus; rects = [x, y, w, h] în coordonatele imaginii ORIGINALE
const SPEC = [
  { in: 'image1.png', out: 'situr-0-meniu.png', crop: 60, rects: [] },
  { in: 'image2.png', out: 'situr-2-calitate.png', crop: 46, rects: [[1220, 50, 221, 56], [286, 145, 80, 28], [126, 271, 82, 28]] },
  { in: 'image3.png', out: 'situr-3-operatiune.png', crop: 46, rects: [[278, 46, 84, 28], [118, 173, 84, 28]] },
  { in: 'image4.png', out: 'situr-4-structura.png', crop: 40, rects: [[78, 36, 84, 26]] },
  { in: 'image5.png', out: 'situr-4-adresa.png', crop: 52, rects: [] },
  { in: 'image6.png', out: 'situr-5-rand.png', crop: 46, rects: [] },
  { in: 'image7.png', out: 'situr-5-tabel.png', crop: 46, rects: [[68, 78, 84, 28], [229, 125, 84, 28]] },
  { in: 'image8.png', out: 'situr-6-documente.png', crop: 46, rects: [[74, 173, 84, 28], [236, 48, 82, 28]] },
  { in: 'image9.png', out: 'situr-7-anexe-1.png', crop: 40, rects: [[96, 68, 84, 28]] },
  { in: 'image10.png', out: 'situr-7-anexe-2.png', crop: 46, rects: [] },
];

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = buf => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };

function decode(buf) {
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20), ct = buf[25];
  if (buf[24] !== 8 || ct !== 6 || buf[28] !== 0) throw new Error('doar PNG 8-bit RGBA neîntrețesut');
  let p = 8, idat = [];
  while (p < buf.length) { const l = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8); if (t === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + l)); p += 12 + l; }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = px.subarray(y * stride, (y + 1) * stride), prev = y ? px.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = prev ? prev[i] : 0, c = prev && i >= bpp ? prev[i - bpp] : 0, x = src[i];
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + b; else if (f === 3) v = x + ((a + b) >> 1);
      else { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      row[i] = v & 0xFF;
    }
  }
  return { w, h, px };
}
function encode(w, h, px) {
  const stride = w * 4, raw = Buffer.alloc(h * (stride + 1));
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 2; const row = px.subarray(y * stride, (y + 1) * stride), prev = y ? px.subarray((y - 1) * stride, y * stride) : null; for (let i = 0; i < stride; i++) raw[y * (stride + 1) + 1 + i] = (row[i] - (prev ? prev[i] : 0)) & 0xFF; }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

for (const s of SPEC) {
  const { w, h, px } = decode(fs.readFileSync(path.join(SRC, s.in)));
  for (const [x, y, rw, rh] of s.rects) for (let yy = y; yy < Math.min(h, y + rh); yy++) for (let xx = x; xx < Math.min(w, x + rw); xx++) px.set(GREY, (yy * w + xx) * 4);
  const h2 = h - s.crop, out = encode(w, h2, px.subarray(s.crop * w * 4));
  fs.writeFileSync(path.join(OUT, s.out), out);
  console.log(s.out, w + 'x' + h2, (out.length / 1024).toFixed(0) + ' KB');
}
