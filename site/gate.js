// Poarta de acces pentru conținutul plătit. Cheia de licență vine de la Lemon Squeezy (merchant of
// record). Validarea se face din browser, direct la API-ul lor public de licențe; nu avem server.
// Pe localhost, cheile care încep cu TEST- sunt acceptate (doar pentru dezvoltare).
window.Gate = (function () {
  const KEY = 'hostkit.license';
  const API = 'https://api.lemonsqueezy.com/v1/licenses/validate';
  const cfg = () => window.SITE || {};
  const isLocal = () => /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function stored() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function store(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  function fresh(s) { return s && s.validatedAt && (Date.now() - s.validatedAt) < (cfg().gateDays || 30) * 864e5; }

  async function validate(key) {
    key = (key || '').trim();
    if (!key) return { ok: false, msg: 'Introdu cheia de licență din e-mailul de confirmare.' };
    if (isLocal() && key.startsWith('TEST-')) return { ok: true, dev: true };
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'license_key=' + encodeURIComponent(key) });
      const data = await res.json();
      if (!data.valid) return { ok: false, msg: data.error || 'Cheia nu este validă.' };
      const pid = cfg().lsProductId;
      if (pid && data.meta && String(data.meta.product_id) !== String(pid)) return { ok: false, msg: 'Cheia aparține altui produs.' };
      if (data.license_key && data.license_key.status === 'disabled') return { ok: false, msg: 'Cheia a fost dezactivată. Scrie-ne.' };
      return { ok: true };
    } catch (e) {
      const s = stored();
      if (s && s.key === key) return { ok: true, offline: true };
      return { ok: false, msg: 'Nu am putut verifica cheia (fără conexiune?). Încearcă din nou.' };
    }
  }

  function overlay() {
    const c = cfg();
    const el = document.createElement('div');
    el.id = 'gate';
    el.innerHTML = `
      <style>
        #gate{position:fixed;inset:0;background:#f6f5f1;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;font:500 16px/1.5 "Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#172420}
        #gate .box{background:#fff;border:1px solid #dedcd5;border-radius:12px;max-width:460px;width:100%;padding:24px}
        #gate h2{margin:0 0 6px;font-size:22px;font-weight:800;letter-spacing:-.015em}
        #gate p{margin:0 0 12px;color:#6b6a66}
        #gate input{width:100%;padding:10px;border:1px solid #dedcd5;border-radius:8px;font:inherit;margin:6px 0 10px}
        #gate button{background:#1f5f4a;color:#fff;border:0;border-radius:999px;padding:11px 20px;font:inherit;font-weight:700;cursor:pointer}
        #gate .msg{color:#9b2a20;min-height:22px;font-size:14px}
        #gate a{color:#1f5f4a}
        #gate .alt{margin-top:14px;font-size:14px}
      </style>
      <div class="box">
        <h2>Acces cu cheia de licență</h2>
        <p>Cheia este în e-mailul de confirmare a plății. O introduci o singură dată pe acest browser.</p>
        <input type="text" id="gate-key" placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" autocomplete="off">
        <button type="button" id="gate-go">Deblochează</button>
        <div class="msg" id="gate-msg"></div>
        <div class="alt">Nu ai cheie? ${c.checkoutUrl ? `<a href="${c.checkoutUrl}">Cumpără kitul (${c.price || ''})</a>` : `<a href="/">Vezi pagina produsului</a>`} · Probleme? <a href="mailto:${c.email || ''}">${c.email || ''}</a></div>
      </div>`;
    document.body.appendChild(el);
    const go = async () => {
      const key = document.getElementById('gate-key').value;
      const msg = document.getElementById('gate-msg');
      msg.textContent = 'Verific…';
      const r = await validate(key);
      if (r.ok) { store({ key: key.trim(), validatedAt: r.dev || r.offline ? (stored() || {}).validatedAt || Date.now() : Date.now() }); el.remove(); document.dispatchEvent(new Event('gate:open')); }
      else msg.textContent = r.msg;
    };
    document.getElementById('gate-go').addEventListener('click', go);
    document.getElementById('gate-key').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  async function require() {
    const s = stored();
    if (fresh(s)) return true;
    if (s && s.key) {
      const r = await validate(s.key);
      if (r.ok) { store({ key: s.key, validatedAt: Date.now() }); return true; }
    }
    overlay();
    return false;
  }

  return { require, validate, stored };
})();
