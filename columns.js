// CYStudios: the sideways pages, Services and Contact (2026-11-25): the page moving sideways, the columns opening when pressed, and the pictures (a site, or reels).
// Shared here so the two pages keep the same rules (moved out of services.html, as it was: before-shared-columns-services.html). Each page loads it after pages.js.
// ---------- Services: the sideways page, its columns opening when pressed, and their pictures
(function services() {
  const view = $('#view'), track = $('#track'), cols = $$('.sv-col'), where = $('#where'), root = document.documentElement;
  const phone = () => innerWidth <= 640;
  let x = 0, goal = 0, max = 0, last = performance.now(), open = null, drag = null;

  // ---------- the pictures (2026-11-25, the user: "the website being shown for 1 should never be the same as the one being shown on 3 same w the reels for 2 and 3").
  // Websites shows one of the nine sites we made and the two together show another, both picked afresh each visit, so no client is always the one shown and the two never match.
  // Social media shows two different reels, and the two together a reel of its own when there is a third; until then the second (the user: "for now u can also use this
  // for the site & feed"). A reel not here yet stands as a plate in our dots. (One site in both, and one reel in all three, before: before-distinct-pictures.html.)
  const SITES = [['07-beauty-one', 'Beauty One'], ['01-boyang', 'Boyang'], ['05-burgshaw', 'Burg & Shaw'], ['06-cafe-joie', 'Cafe Joie'], ['08-framer-site', 'Colorbridge'],
                 ['02-nakwon-catering', 'Nakwon Catering'], ['04-pj-beauty-supply', 'PJ Beauty Supply'], ['09-senshi', 'Senshi'], ['03-tofu-story', 'Tofu Story']];
  // each reel is its video if we have it, else a still from it: the VisiDAW reel (a light copy of the user's file); the Boyang reel on Instagram, as a frame captured from it
  // (2026-11-25, the user: "go to the link and take a screenshot of the cover photo and use it"; the cover itself has Instagram's play button printed on it, so a clean frame
  // from the same moment, "from Korea", stands for it). If its video is ever saved as reel-2.mp4, that is shown instead.
  const REELS = [['assets/social/reel.mp4', 'assets/social/reel.jpg'], ['assets/social/reel-2.jpg']];      // (put 'assets/social/reel-2.mp4' first in the second if its video is ever saved; asking for a file that is not there leaves an error in the browser's console)
  const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const sites = shuffle(SITES), siteFor = { websites: sites[0], both: sites[1] };      // two different sites
  const there = (src) => fetch(src, { method: 'HEAD' }).then((r) => r.ok).catch(() => false);
  const have = Promise.all(REELS.map(async (files) => { for (const f of files) if (await there(f)) return f; return null; })).then((l) => l.filter(Boolean));
  const reelsFor = have.then((ok) => ({ social: ok.slice(0, 2), both: [ok.find((src) => !ok.slice(0, 2).includes(src)) || ok[1]].filter(Boolean) }));
  $$('.sv-media').forEach((m) => {
    const col = m.closest('.sv-col').id; if (!m.hasAttribute('data-one-site') && !m.dataset.reels) return;      // (Contact's plates are its own)
    if (m.hasAttribute('data-one-site')) {
      const [file, name] = siteFor[col], box = document.createElement('span'), im = new Image(); box.className = 'site';
      im.src = 'assets/clips/' + file + '.jpg'; im.alt = 'A site we made, for ' + name; im.decoding = 'async'; im.draggable = false; box.append(im); m.append(box);
    }
    const boxes = [...Array(+m.dataset.reels || 0)].map(() => { const box = document.createElement('span'); box.className = 'reel'; box.setAttribute('aria-hidden', 'true'); m.append(box); return box; });
    reelsFor.then((pick) => boxes.forEach((box, i) => {
      const src = (pick[col] || [])[i]; if (!src) return;      // not here yet: the plate in our dots stands in its place
      if (/\.jpg$/.test(src)) { const im = new Image(); im.src = src; im.alt = ''; im.decoding = 'async'; im.draggable = false; box.append(im); return; }      // a still
      const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata'; v.poster = src.replace(/\.mp4$/, '.jpg'); v.src = src;      // light copies: 720px, no sound, as they play muted
      box.append(v); if (!REDUCED && !m.closest('.sv-col').classList.contains('open')) v.play().catch(() => {});
    }));
  });

  // sizes: a column about a fifth of the window (240 to 320px), the header about a third (400 to 560px), each to 4px; how far a column opens, never more than the window shows
  function sizes() {
    const W = innerWidth, rest = 4 * Math.round(clamp(W * 0.2, 240, 320) / 4), Wv = view.clientWidth;
    root.style.setProperty('--rest', `${rest}px`);
    root.style.setProperty('--intro', `${4 * Math.round(clamp(W * 0.34, 400, 560) / 4)}px`);
    cols.forEach((c) => c.style.setProperty('--more', `${4 * Math.floor(Math.min(+c.dataset.more || 576, Wv - rest - 64) / 4)}px`));
    fitDescs();
  }
  function fitDescs() { $$('.sv-desc').forEach((d) => { d.classList.remove('small'); if (d.scrollHeight > d.clientHeight + 1) d.classList.add('small'); }); }      // smaller if it would not fit above the name

  // ---------- opening a column: pressing it (or its name, with the keyboard) opens it, pressing it again closes it; one at a time. The page moves along, if it must,
  // so the whole of the open column is in view.
  function setOpen(col) {
    if (open === col) return; open = col;
    cols.forEach((c) => { const on = c === col; c.classList.toggle('open', on); c.querySelector('.sv-open').setAttribute('aria-expanded', on ? 'true' : 'false');
      c.querySelectorAll('video').forEach((v) => { if (on) v.pause(); else if (!REDUCED) v.play().catch(() => {}); }); });
    if (!col || phone()) return;
    const rest = parseFloat(getComputedStyle(root).getPropertyValue('--rest')), more = parseFloat(col.style.getPropertyValue('--more')) || 0;
    const left = $('.sv-intro').offsetWidth + cols.indexOf(col) * rest, right = left + rest + more, Wv = view.clientWidth;      // where it will stand once the one before has closed
    if (right - goal > Wv - 32) goal = right - Wv + 32;
    if (left - goal < 32) goal = Math.max(0, left - 32);
  }
  cols.forEach((col) => {
    col.addEventListener('click', (e) => {
      if (e.target.closest('a') || (drag && drag.moved)) return;
      if (open === col && e.target.closest('.sv-plans')) return;      // reading the cards, or writing the letter, does not close it
      setOpen(open === col ? null : col);
    });
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { const c = open; setOpen(null); c.querySelector('.sv-open').focus(); } });
  // Tab to a part out of view: the page moves along until it is in view, 32px clear of the edge (2026-11-26, a fix: the view is clipped now, so it cannot scroll by itself).
  // Only the keyboard moves it: coming back to this tab or window, the browser gives focus back to the column you last pressed, and that is not a move; nor is a click.
  let backTo = null; addEventListener('blur', (e) => { if (e.target === window) backTo = document.activeElement; });
  view.addEventListener('focusin', (e) => {
    const back = e.target === backTo; backTo = null;
    if (phone() || back || !e.target.matches(':focus-visible')) return;
    const r = e.target.getBoundingClientRect(), v = view.getBoundingClientRect(), pad = 32;
    if (r.right > v.right - pad) goal = clamp(x + r.right - (v.right - pad), 0, max);
    else if (r.left < v.left + pad) goal = clamp(x - (v.left + pad - r.left), 0, max);
  });

  // ---------- going sideways: the wheel (either way), a trackpad, dragging, and the arrow keys; it glides there, as the wall on home does
  view.addEventListener('wheel', (e) => {
    if (phone()) return;
    const deck = e.target.closest('.sv-col.open .sv-deck');      // over cards that do not all fit, the wheel reads them first
    if (deck && Math.abs(e.deltaY) > Math.abs(e.deltaX) && deck.scrollHeight > deck.clientHeight + 1) {
      const down = e.deltaY > 0, atEnd = down ? deck.scrollTop + deck.clientHeight >= deck.scrollHeight - 1 : deck.scrollTop <= 0;
      if (!atEnd) return;
    }
    e.preventDefault();
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 32 : 1);
    goal = clamp(clamp(goal, 0, max) + d, 0, max);
  }, { passive: false });
  view.addEventListener('pointerdown', (e) => { if (phone() || e.button !== 0 || e.target.closest('a, button, input, textarea, label')) return; drag = { x0: e.clientX, g0: clamp(goal, 0, max), moved: false, id: e.pointerId }; });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; view.setPointerCapture(e.pointerId); }
    if (drag.moved) { goal = clamp(drag.g0 - dx, 0, max); x = goal; }
  });
  addEventListener('pointerup', () => { if (drag) setTimeout(() => { drag = null; }, 0); });
  addEventListener('keydown', (e) => {
    if (phone() || e.target.closest('input, textarea')) return;
    const step = { ArrowRight: 120, ArrowLeft: -120, PageDown: view.clientWidth * 0.8, PageUp: -view.clientWidth * 0.8 }[e.key];
    if (e.key === 'Home') goal = 0; else if (e.key === 'End') goal = max; else if (step) goal = clamp(clamp(goal, 0, max) + step, 0, max); else return;
    e.preventDefault();
  });

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (phone()) { track.style.transform = ''; requestAnimationFrame(frame); return; }
    max = Math.max(0, track.scrollWidth - view.clientWidth);      // it changes as a column opens
    const to = clamp(goal, 0, max);
    x = REDUCED || (drag && drag.moved) ? to : x + (to - x) * (1 - Math.exp(-dt * 9)); if (Math.abs(to - x) < 0.3) x = to;
    const dpr = devicePixelRatio || 1; track.style.transform = `translate3d(${-Math.round(x * dpr) / dpr}px, 0, 0)`;
    const all = track.scrollWidth || 1; where.style.width = `${(view.clientWidth / all * 100).toFixed(2)}%`; where.style.left = `${(x / all * 100).toFixed(2)}%`;
    where.parentElement.style.visibility = max > 1 ? 'visible' : 'hidden';
    requestAnimationFrame(frame);
  }
  sizes(); addEventListener('resize', sizes);
  if (document.fonts) document.fonts.ready.then(fitDescs);
  requestAnimationFrame(frame);
})();
