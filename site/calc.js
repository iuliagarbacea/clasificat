// Calculul fiscal 2026 pentru persoane fizice (≤7 camere): o singură formulă, folosită de calculatorul
// gratuit (/impozit-regim-hotelier.html) și de pagina fiscală din kit (/ghid/fiscal.html, „Cifrele tale”).
// Cifrele rămân în browser (localStorage). Nimic nu pleacă pe rețea.
(function () {
  const KEY = 'hostkit.calc.v1';
  const DEF = { brut: 36000, com: 15, alte: 0, forf: 30, cota: 10, smin: 4050, cass: 10, tva: 21 };
  const lei = x => Number(x || 0).toLocaleString('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' lei';
  function compute(i) {
    const brut = +i.brut || 0, com = brut * (+i.com || 0) / 100, forf = (+i.forf || 0) / 100, cota = (+i.cota || 0) / 100;
    const smin = +i.smin || 0, cassc = (+i.cass || 0) / 100, tvap = (+i.tva || 0) / 100;
    const net = brut * (1 - forf), imp = net * cota, baza = net + (+i.alte || 0);
    let prag = 0; if (baza > 24 * smin) prag = 24; else if (baza > 12 * smin) prag = 12; else if (baza > 6 * smin) prag = 6;
    const cassv = prag * smin * cassc, tvav = com * tvap;
    const ramane = brut - com - imp - cassv - tvav;
    return { brut, com, imp, cassv, tvav, ramane, prag, efectiv: cota * (1 - forf) * 100, pct: brut ? ramane / brut * 100 : 0 };
  }
  function load() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } }
  function save(i) { try { localStorage.setItem(KEY, JSON.stringify(Object.assign(i, { at: Date.now() }))); } catch (e) { } }
  function has() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  window.HKCALC = { KEY, DEF, lei, compute, load, save, has };

  // Pe pagina fiscală din kit: rezumatul cifrelor introduse în calculatorul gratuit.
  document.querySelectorAll('[data-calc-summary]').forEach(el => {
    if (!has()) return;
    const i = load(), r = compute(i);
    el.hidden = false;
    el.innerHTML = '<h3>Cifrele tale din calculator</h3>' +
      '<table><tr><td>Încasări brute</td><td class="n">' + lei(r.brut) + '</td></tr>' +
      '<tr><td>Comision platformă (' + i.com + '%) + TVA ' + i.tva + '% pe comision</td><td class="n">−' + lei(r.com + r.tvav) + '</td></tr>' +
      '<tr><td>Impozit pe venit (' + r.efectiv.toFixed(1) + '% efectiv)</td><td class="n">−' + lei(r.imp) + '</td></tr>' +
      '<tr><td>CASS' + (r.prag ? ' (pragul de ' + r.prag + ' salarii minime)' : ' (sub prag, 0)') + '</td><td class="n">−' + lei(r.cassv) + '</td></tr>' +
      '<tr class="total"><td>Îți rămâne pe an</td><td class="n">' + lei(r.ramane) + '</td></tr></table>' +
      '<p>Mai jos: unde se declară fiecare rând, termenele și exemplul complet. <a href="/impozit-regim-hotelier.html">Schimbă cifrele</a>.</p>';
  });
})();
