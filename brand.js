// PROTOTYPE ONLY: trying other brands across the site before one is final. "As it is" (violet, the violet gradient bar, Inter) is the default and is never changed by this.
//   ?brand=dusty    Dusty violet, from the palette explorer (2026-11-24): what it changes is all in brand-dusty.css
//   ?brand=seal     the seal on hanji (2026-11-24, declined, kept as a record): brand-seal.css
//   ?brand=current  back to "As it is"
// The choice is remembered on this computer, so it stays on as you go between pages (only when the page is open on its own: the side-by-side
// in brand-compare.html sets each half in its address and remembers nothing). It runs in the head, before anything is drawn, so the page never shows the other colours first.
(() => {
  const KEY = 'cys-brand', BRANDS = ['seal', 'dusty', 'current'], asked = new URLSearchParams(location.search).get('brand'), alone = window.top === window;
  let brand = BRANDS.includes(asked) ? asked : null;
  try { if (brand && alone) localStorage.setItem(KEY, brand); if (!brand) brand = localStorage.getItem(KEY); } catch (e) {}
  window.brandReady = Promise.resolve();
  if (brand !== 'seal' && brand !== 'dusty') return;
  document.documentElement.dataset.brand = brand;
  const icon = document.querySelector('link[rel="icon"]');
  if (brand === 'dusty') { if (icon) icon.href = 'assets/logo-dusty.svg'; return; }      // the same face as now: only the colours change
  // the seal: the seal is the tab icon, and Hahmlet, a Korean-designed serif, sets the sentence. Pages that measure their words wait for it.
  if (icon) icon.href = 'assets/seal.svg';
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Hahmlet:wght@400..600&display=swap';
  window.brandReady = new Promise((ok) => { l.onload = l.onerror = ok; })
    .then(() => document.fonts ? document.fonts.load('500 18px "Hahmlet"').catch(() => {}) : null);
  document.head.append(l);
})();
