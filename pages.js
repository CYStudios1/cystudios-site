// CYStudios: what the Services, About and Contact pages share. The sentence that turns as the page goes by, the parts that rise into view, and the print plates.
document.documentElement.classList.add('js');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v)), smooth = (v) => v * v * (3 - 2 * v);
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// the menu's hover: each page name gets a copy that rolls in from below (for the eye only), and the logo is drawn in the words' own colour so it can turn violet (see .rw and .logo in pages.css)
document.querySelectorAll('.nav .pages a').forEach((a) => { const t = a.textContent.trim(); a.innerHTML = '<span class="rw"><span>' + t + '</span><span aria-hidden="true">' + t + '</span></span>'; });
document.querySelectorAll('.nav img.logo').forEach((im) => { const s = document.createElement('span'); s.className = 'logo'; s.setAttribute('aria-hidden', 'true'); im.replaceWith(s); });
// the page you are on turns into place, in our violet, a moment after the page opens, so the turn is seen (see .nav .pages a.on in pages.css)
document.querySelectorAll('.nav .pages a[aria-current="page"]').forEach((a) => setTimeout(() => requestAnimationFrame(() => a.classList.add('on')), REDUCED ? 0 : 350));

// where the bar ends, so what rides under it (the sentence on a phone) and where a jump lands can sit just below it
function measureBar() {
  const nav = $('.nav'); if (!nav) return;
  // the words sit at the foot of the window now: nothing is in the way at the top (--bar-h), and --bar-b is the room they take at the foot
  // they stand down the left side on a wide window (nothing in the way at the top or the foot), and sit along the foot on a narrower one
  const r = nav.getBoundingClientRect(), side = r.height > innerHeight / 2, low = !side && r.top > innerHeight / 2;
  document.documentElement.style.setProperty('--bar-h', `${side || low ? 0 : 2 * Math.round(r.bottom / 2)}px`);      // even, for the 2/4 grid
  document.documentElement.style.setProperty('--bar-b', `${low ? 2 * Math.round((innerHeight - r.top) / 2) : 0}px`);
}
measureBar(); addEventListener('resize', measureBar);

// ---------- the sentence. Each part of the page carries its own words (data-first, data-rest), and they sit on two small wheels like the ones on home:
// the first words on one, the rest on the other, turning together. The rest of the sentence shows its neighbours above and below, a third as strong and out of focus;
// the first words show only at the front. The full stop follows the end of whatever is on the line.
// Where the page is (v) comes from how far down you have read: as the top of a part comes past the middle line, the wheel turns to it.
(function sentence() {
  const parts = $$('[data-first]'); if (!parts.length) return;
  const line = $('#line'), lead = $('#lead'), roll = $('#roll'), tail = $('#tail'), measure = $('#measure'), col = $('.say-col');
  const STEP = 16 * Math.PI / 180, GLIDE = 11.5;
  const E = parts.map((el) => {
    const a = document.createElement('span'); a.className = 'say'; a.textContent = el.dataset.first; lead.append(a);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'name'; b.tabIndex = -1; b.textContent = el.dataset.rest; roll.append(b);
    b.onclick = () => el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    return { el, a, b, first: el.dataset.first, rest: el.dataset.rest };
  });
  const widths = new Map(), widthOf = (t) => { if (!widths.has(t)) { measure.textContent = t; widths.set(t, measure.getBoundingClientRect().width); } return widths.get(t); };
  let lh = 20, pitch = 28, R = 100, rollX = 0, strip = false, v = -0.85, goal = 0, last = performance.now(), running = false;
  function layout() {
    widths.clear(); strip = innerWidth <= 999;
    E.forEach((e) => { e.rest = strip && e.el.dataset.short ? e.el.dataset.short : e.el.dataset.rest; e.b.textContent = e.rest; });      // under the bar on a phone there is one line's width, so a long sentence may say it shorter
    const cs = getComputedStyle(line), fs = parseFloat(cs.fontSize), gap = fs * 0.27; lh = parseFloat(cs.lineHeight);
    pitch = 2 * Math.round(fs * (strip ? 1.45 : 0.75)); R = pitch / STEP;      // under the bar there is room for one line, so the neighbours sit just out of sight and roll in as it turns
    const leadW = Math.max(...E.map((e) => widthOf(e.first))), restW = Math.max(...E.map((e) => widthOf(e.rest))), tailW = widthOf('.');
    rollX = leadW + gap; lead.style.width = `${leadW}px`; roll.style.left = `${rollX}px`;
    document.documentElement.style.setProperty('--sent-w', `${Math.ceil(leadW + gap + restW + gap + tailW + 8)}px`);
    goal = where(); kick();
  }
  function where() {
    const ref = strip ? col.getBoundingClientRect().bottom + (innerHeight - col.getBoundingClientRect().bottom) * 0.3 : innerHeight * 0.5, Z = innerHeight * 0.1;
    let p = 0;
    for (let i = 1; i < E.length; i++) p += smooth(clamp((Z - (E[i].el.getBoundingClientRect().top - ref)) / (2 * Z), 0, 1));
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) p = E.length - 1;      // at the very bottom the last part is on the line, however short it is
    return p;
  }
  function render() {
    E.forEach((e, k) => {
      const d = k - v, far = Math.abs(d), turn = d * STEP, away = 1 - Math.cos(turn), small = 1 - 0.24 * away;
      const edge = clamp((4.6 - far) / 1.7, 0, 1), soft = Math.pow(clamp(far - 0.55, 0, 4), 1.3) * 0.6;
      const t = `translateY(${(Math.sin(turn) * R).toFixed(2)}px) scale(${small.toFixed(4)}, ${(small * Math.cos(turn)).toFixed(4)})`;
      e.b.style.transform = t; e.b.style.filter = soft > 0.05 ? `blur(${soft.toFixed(2)}px)` : 'none';
      e.b.style.opacity = ((far < 0.5 ? 1 - far * 1.2 : 0.3 + 0.1 * Math.cos(turn)) * edge).toFixed(3);
      e.b.style.pointerEvents = far < 0.5 || edge < 0.3 ? 'none' : '';
      e.a.style.transform = t; e.a.style.opacity = clamp(1 - far * 1.3, 0, 1).toFixed(3);
    });
    const i0 = clamp(Math.floor(v), 0, E.length - 1), i1 = clamp(i0 + 1, 0, E.length - 1), fr = smooth(clamp(v - i0, 0, 1));
    tail.style.transform = `translateX(${(rollX + widthOf(E[i0].rest) * (1 - fr) + widthOf(E[i1].rest) * fr).toFixed(2)}px)`;
    tail.style.opacity = v < -0.3 ? 0 : 1;
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    v = REDUCED ? goal : v + (goal - v) * (1 - Math.exp(-dt * GLIDE));
    if (Math.abs(goal - v) < 0.0006) v = goal;
    render();
    if (v !== goal) requestAnimationFrame(frame); else running = false;
  }
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
  addEventListener('scroll', () => { goal = where(); kick(); }, { passive: true });
  addEventListener('resize', layout);
  // On arrival the sentence turns up into place from below, as the home page's wheel does. (Fonts first, so the widths are right.)
  const start = () => { layout(); if (REDUCED) v = goal; render(); kick(); };
  Promise.all([window.brandReady, document.fonts && document.fonts.ready]).then(start, start);      // the seal brand's serif, when it is on, has to be here before the words are measured
})();

// ---------- the parts of each section rise into view one after another, once
(function rise() {
  const els = $$('.rise'); if (!els.length) return;
  if (!('IntersectionObserver' in window) || REDUCED) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
})();

// ---------- a print plate: a picture still to come, set in the same 45 degree screen of round dots as the rest of the site (the loading screen, the grid in All Work).
// The dots swell where the tone is darker. For a plate with no picture yet, the tone is a soft field, darker toward the foot, so it reads as a printed blank, not as a photograph.
function printPlate(cv) {
  const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
  if (!w || !h) return;
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d'), cell = 4.6 * dpr, seed = +(cv.dataset.seed || 1);
  const css = getComputedStyle(cv), ink = css.getPropertyValue('--plate-ink').trim() || css.getPropertyValue('--ink').trim() || '#171C0C';      // our ink, unless the brand prints pictures still to come in another colour
  g.clearRect(0, 0, w, h); g.fillStyle = ink;
  const c = Math.SQRT1_2, n = Math.ceil((w + h) / cell) + 2;
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = (i - j) * c * cell + w / 2, y = (i + j) * c * cell + h / 2;      // a square grid turned 45 degrees
    if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
    const u = x / w, vv = y / h, dx = u - 0.5, dy = vv - (0.42 + 0.06 * Math.sin(seed));
    let t = 0.02 + 0.26 * vv * vv + 0.12 * Math.exp(-(dx * dx * 6 + dy * dy * 5)) + 0.05 * Math.sin(u * 3.1 + seed) * Math.cos(vv * 2.3 + seed * 1.7);
    t = clamp(t, 0, 0.6);
    const rad = cell * 0.5 * Math.sqrt(t) * 1.15;
    if (rad < 0.3 * dpr) continue;
    g.globalAlpha = 0.42; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
  }
}
function printPlates() { $$('canvas.plate').forEach(printPlate); }
if ($('canvas.plate')) { printPlates(); let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(printPlates, 120); }); }
