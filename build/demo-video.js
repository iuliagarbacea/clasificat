// Înregistrează un video demo al produsului (pentru Lemon Squeezy, parteneri, pagina de vânzare).
// Rulează: node build/demo-video.js            → demo/clasificat-demo.webm (1280×720, ~3 min)
//          node build/demo-video.js --dry      → fără video, doar capturi PNG în demo/dry/ (verifică fluxul)
// Paginile publice se filmează de pe clasificat.ro; poarta de licență și aplicația de pe localhost
// (același cod; pe localhost cheile TEST- sunt acceptate, așa se poate arăta deblocarea fără o cheie reală).
// Folosește Playwright-ul din Documents/drupal-qa (Chrome instalat). Video-ul cere ffmpeg-ul Playwright:
// `npx playwright install ffmpeg` din drupal-qa, o singură dată.
'use strict';
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const QA = path.join(process.env.USERPROFILE || 'C:/Users/Iulia', 'Documents', 'drupal-qa');
const { chromium } = require(path.join(QA, 'node_modules', 'playwright'));

const DRY = process.argv.includes('--dry');
const LIVE = 'https://clasificat.ro';
const PORT = 8791, LOCAL = 'http://localhost:' + PORT;
const OUT = path.join(__dirname, '..', 'demo');
const W = 1280, H = 720;

// Date fictive pentru demo (nu sunt ale nimănui).
const D = {
  nume: 'Popescu Ana-Maria', cnp: '2850315123456', serie: 'PH', numar: '123456',
  domiciliu: 'București, str. Exemplu nr. 10, sector 3', telefon: '0722000000', email: 'ana.popescu@example.com',
  denumire: 'Lakeside Doftana', web: 'booking.com/lakeside-doftana', judet: 'Prahova', localitate: 'Valea Doftanei',
  adresa: 'str. Lacului nr. 12', cod: '107640', cf: '10234', cfLoc: 'Valea Doftanei', cad: '10234-C1', descr: 'casă de locuit P+M',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
let shot = 0;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (DRY) fs.mkdirSync(path.join(OUT, 'dry'), { recursive: true });

  const server = spawn(process.execPath, [path.join(__dirname, 'dev-serve.js'), String(PORT)], { stdio: 'ignore' });
  await sleep(800);

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, deviceScaleFactor: 1, locale: 'ro-RO',
    recordVideo: DRY ? undefined : { dir: OUT, size: { width: W, height: H } },
  });
  // Cursor vizibil + bandă de titlu (Playwright nu filmează cursorul).
  await ctx.addInitScript(() => {
    const add = () => {
      if (document.getElementById('__cur')) return;
      const s = document.createElement('style');
      s.textContent = `#__cur{position:fixed;z-index:2147483647;pointer-events:none;width:22px;height:22px;transform:translate(-3px,-2px);transition:transform .05s}
        #__cap{position:fixed;left:24px;bottom:22px;z-index:2147483646;pointer-events:none;background:rgba(23,36,32,.92);color:#fff;font:600 17px/1.3 Manrope,system-ui,sans-serif;padding:10px 16px;border-radius:10px;letter-spacing:.01em;opacity:0;transition:opacity .35s}
        #__cap.on{opacity:1}
        #__click{position:fixed;z-index:2147483646;pointer-events:none;width:36px;height:36px;border-radius:50%;border:3px solid #1f5f4a;transform:translate(-50%,-50%) scale(.3);opacity:0}
        #__click.go{animation:__pulse .45s ease-out}
        @keyframes __pulse{0%{transform:translate(-50%,-50%) scale(.3);opacity:.9}100%{transform:translate(-50%,-50%) scale(1.3);opacity:0}}`;
      document.head.appendChild(s);
      const c = document.createElement('div'); c.id = '__cur';
      c.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 3l14 8-6 1.5L16 20l-2.5 1-3-7.5L6 18z" fill="#fff" stroke="#172420" stroke-width="1.6" stroke-linejoin="round"/></svg>';
      const k = document.createElement('div'); k.id = '__click';
      const p = document.createElement('div'); p.id = '__cap';
      document.body.append(c, k, p);
      addEventListener('mousemove', e => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', e => { k.style.left = e.clientX + 'px'; k.style.top = e.clientY + 'px'; k.classList.remove('go'); void k.offsetWidth; k.classList.add('go'); }, true);
    };
    if (document.body) add(); else addEventListener('DOMContentLoaded', add);
  });
  const page = await ctx.newPage();

  // ---- helpers ----
  const cap = async (text, ms = 900) => { await page.evaluate(t => { const p = document.getElementById('__cap'); if (!p) return; p.textContent = t; p.classList.toggle('on', !!t); }, text); await sleep(ms); };
  const snap = async name => { if (DRY) await page.screenshot({ path: path.join(OUT, 'dry', String(++shot).padStart(2, '0') + '-' + name + '.png') }); };
  const go = async (url, ms = 1500) => { await page.goto(url, { waitUntil: 'networkidle' }); await page.mouse.move(W / 2, H / 2); await sleep(ms); };
  const scroll = async (px, ms = 1400) => { await page.evaluate(({ px, ms }) => new Promise(res => { const y0 = scrollY, t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k; scrollTo(0, y0 + px * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), { px, ms }); };
  const scrollTo = async (sel, ms = 1200) => { await page.evaluate(({ sel, ms }) => new Promise(res => { const el = document.querySelector(sel); if (!el) return res(); const y1 = scrollY + el.getBoundingClientRect().top - 90, y0 = scrollY, t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2 * k * k : -1 + (4 - 2 * k) * k; scrollTo(0, y0 + (y1 - y0) * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }), { sel, ms }); await sleep(300); };
  const moveTo = async (sel, opts = {}) => {
    const loc = page.locator(sel).first();
    await loc.scrollIntoViewIfNeeded(); await sleep(200);
    const b = await loc.boundingBox(); if (!b) throw new Error('no box: ' + sel);
    const x = b.x + (opts.dx != null ? opts.dx : Math.min(b.width / 2, 120)), y = b.y + b.height / 2;
    await page.mouse.move(x, y, { steps: 22 }); await sleep(opts.pause != null ? opts.pause : 250);
    return { x, y };
  };
  const click = async (sel, opts = {}) => { const { x, y } = await moveTo(sel, opts); await page.mouse.down(); await sleep(80); await page.mouse.up(); await sleep(opts.after != null ? opts.after : 600); };
  const type = async (sel, text, opts = {}) => { await click(sel, { after: 150 }); await page.keyboard.type(text, { delay: opts.delay || 38 }); await sleep(250); };
  const select = async (sel, value) => { await moveTo(sel); await page.selectOption(sel, value); await sleep(400); };

  // ================= 1. Landing (live) =================
  await go(LIVE + '/', 1800);
  await cap('clasificat.ro — self-serve kit for the Romanian tourism classification certificate', 2600);
  await snap('landing');
  await scroll(420, 1600); await sleep(900);
  await cap('', 200);
  await scrollTo('#eligibil', 1200);
  await cap('Free eligibility check, no account needed', 1200);
  await click('#eligibil input[value="ok"]', { after: 700 });
  await click('#eligibil input[value="house"]', { after: 700 });
  await click('#eligibil input[value="yes"]', { after: 900 });
  await sleep(1200);
  await scroll(220, 900); await sleep(1800);
  await snap('eligibility');
  await cap('', 200);
  await scrollTo('#pret', 1300);
  await cap('One product, 299 RON, single purchase, no subscription', 3000);
  await snap('price');
  await scrollTo('#gratuit', 1200);
  await cap('Free tools and guides stay open to everyone', 2200);
  await snap('free');
  await cap('', 100);

  // ================= 2. Free guide page (live) =================
  await go(LIVE + '/acte-necesare-regim-hotelier.html', 1400);
  await cap('Free guide: the documents the authority asks for', 1600);
  await scroll(700, 2200); await sleep(1000);
  await scroll(700, 2200); await sleep(1200);
  await snap('guide');
  await cap('', 100);

  // ================= 3. Licence gate (local, TEST key) =================
  await go(LOCAL + '/ghid/dosar-casa.html', 1200);
  await cap('Paid content: unlocked with the licence key from the Lemon Squeezy order e-mail', 1800);
  await snap('gate');
  await type('#gate-key', 'TEST-DEMO-KEY-2026', { delay: 45 });
  await sleep(500);
  await click('#gate-go', { after: 900 });
  await cap('Key validated against the Lemon Squeezy licence API; nothing else to do', 1800);
  await snap('unlocked');
  await scroll(600, 2000); await sleep(800);
  await scroll(700, 2000); await sleep(1000);
  await cap('', 100);

  // ================= 4. Wizard (local) =================
  await page.evaluate(() => { try { localStorage.removeItem('hostkit.dosar.v1'); localStorage.removeItem('hostkit.elig.v1'); } catch (e) { } });
  await go(LOCAL + '/app/', 1200);
  await cap('The wizard: answer once, it fills the filing sheet and every declaration', 2000);
  await snap('app-elig');
  await click('input[name="rooms_ok"][value="da"]', { after: 500 });
  await click('input[name="path"][value="casa"]', { after: 500 });
  await click('input[name="proof"][value="cf"]', { after: 700 });
  await click('#next');

  await cap('Step 2: the applicant (same data as SITUR step 1)', 1200);
  await type('[data-path="titular.nume"]', D.nume);
  await type('[data-path="titular.cnp"]', D.cnp, { delay: 30 });
  await type('[data-path="titular.ci_serie"]', D.serie);
  await type('[data-path="titular.ci_numar"]', D.numar);
  await type('[data-path="titular.domiciliu"]', D.domiciliu, { delay: 22 });
  await type('[data-path="titular.telefon"]', D.telefon, { delay: 30 });
  await type('[data-path="titular.email"]', D.email, { delay: 22 });
  await snap('app-titular');
  await cap('', 100);
  await click('#next');

  await cap('Step 3: co-owner (skipped in this demo)', 1500);
  await click('#next');

  await cap('Step 4: the property, copied from the land registry extract', 1200);
  await type('[data-path="unit.denumire"]', D.denumire);
  await type('[data-path="unit.web"]', D.web, { delay: 22 });
  await type('[data-path="unit.judet"]', D.judet);
  await type('[data-path="unit.localitate"]', D.localitate);
  await type('[data-path="unit.adresa"]', D.adresa);
  await type('[data-path="unit.cod_postal"]', D.cod, { delay: 30 });
  await select('[data-path="unit.masa"]', 'da');
  await scroll(320, 900);
  const facil = page.locator('input[type=checkbox][data-path^="unit.facil."]');
  const nf = Math.min(4, await facil.count());
  for (let i = 0; i < nf; i++) await click(`input[type=checkbox][data-path^="unit.facil."] >> nth=${i}`, { after: 350, dx: 10 });
  await type('[data-path="unit.cf_numar"]', D.cf, { delay: 30 });
  await type('[data-path="unit.cf_localitate"]', D.cfLoc);
  await type('[data-path="unit.cadastral"]', D.cad, { delay: 30 });
  await type('[data-path="unit.descriere"]', D.descr);
  await click('input[type=checkbox][data-path="unit.teren_imprejmuit"]', { after: 400, dx: 10 });
  await snap('app-unit');
  await cap('', 100);
  await click('#next');

  await cap('Step 5: the star criteria the inspector checks on site', 1200);
  const checks = page.locator('input[data-check]');
  const nc = Math.min(6, await checks.count());
  for (let i = 0; i < nc; i++) await click(`input[data-check] >> nth=${i}`, { after: 320, dx: 10 });
  await scroll(500, 1600); await sleep(800);
  await snap('app-checks');
  await cap('', 100);
  await click('#next');

  await cap('Step 6: rooms and requested category (SITUR step 5)', 1200);
  await type('[data-room="0"][data-k="surface"]', '18', { delay: 60 }); await page.keyboard.press('Tab'); await sleep(600);
  await click('#add-room', { after: 700 });
  await type('[data-room="1"][data-k="surface"]', '16', { delay: 60 }); await page.keyboard.press('Tab'); await sleep(600);
  await select('[data-room="1"][data-k="beds"]', '2');
  await click('input[name="cat"][value="3"]', { after: 900 });
  await snap('app-rooms');
  await cap('', 100);
  await click('#next');

  await cap('Step 7: the filing sheet and the declarations, generated on the spot', 2000);
  await snap('app-docs');
  await scroll(300, 1200); await sleep(700);
  await click('[data-view] >> nth=0', { after: 1600, dx: 20 });
  const copyBtn = page.locator('[data-copy]').first();
  if (await copyBtn.count()) { await click('[data-copy] >> nth=0', { after: 1000, dx: 20 }); await cap('“Copy” buttons paste each value straight into the SITUR portal form', 1600); }
  await scroll(800, 2200); await sleep(700);
  await scroll(900, 2400); await sleep(700);
  await cap('Print any document to PDF, sign, upload to SITUR', 1800);
  await scroll(900, 2400); await sleep(900);
  await cap('', 100);
  await click('#next');

  await cap('Step 8: what happens after filing, with the legal deadlines', 2200);
  await snap('app-urm');
  await scroll(400, 1600); await sleep(1500);
  await cap('', 100);

  // ================= 5. Outro (live) =================
  await go(LIVE + '/', 800);
  await scrollTo('#pret', 900);
  await cap('clasificat.ro · Digital SAGE IT Consulting SRL · digital product, instant delivery', 3200);
  await snap('outro');

  const video = page.video();
  await ctx.close();
  if (video) {
    const dest = path.join(OUT, 'clasificat-demo.webm');
    await video.saveAs(dest); await video.delete();
    console.log('video: ' + dest + ' (' + Math.round(fs.statSync(dest).size / 1024) + ' KB)');
  } else console.log('dry run done: ' + path.join(OUT, 'dry'));
  await browser.close();
  server.kill();
}

main().catch(e => { console.error(e); process.exit(1); });
