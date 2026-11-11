/* Portfolio engine */
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- Engineering grid + floating code glyphs ---------- */
const cvs = $('#bg'), sc = cvs.getContext('2d');
let W, H, glyphs = [];
const TOKENS = ['</>', '{}', ';', '++', '=>', '&&', 'int', 'void', '()', '//', '::', '*', '#include', '[]'];

function seedGlyphs() {
  W = cvs.width = innerWidth; H = cvs.height = innerHeight;
  glyphs = [];
  const n = Math.min(50, Math.round(W * H / 35000));
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    glyphs.push({
      t: TOKENS[Math.random() * TOKENS.length | 0],
      x: Math.random() * W,
      y: Math.random() * H,
      size: 10 + Math.random() * 14,
      v: .12 + Math.random() * .25,          /* Upward movement speed */
      sway: Math.random() * Math.PI * 2,
      swayAmt: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      alpha: .10 + Math.random() * .15,      /* Transparency */
      color: r < .5 ? '143,163,176' : r < .85 ? '77,227,184' : '255,180,84'
    });
  }
}
function drawGlyphsStatic() {
  sc.clearRect(0, 0, W, H);
  for (const g of glyphs) {
    sc.font = `500 ${g.size}px "JetBrains Mono", monospace`;
    sc.fillStyle = `rgba(${g.color},${g.alpha})`;
    sc.fillText(g.t, g.x, g.y);
  }
}
function glyphLoop(t) {
  sc.clearRect(0, 0, W, H);
  for (const g of glyphs) {
    g.y -= g.v;
    if (g.y < -30) { g.y = H + 30; g.x = Math.random() * W; }
    const x = g.x + Math.sin(t * .0004 + g.sway) * g.swayAmt;
    const a = g.alpha * (.7 + .3 * Math.sin(t * .0008 + g.phase));
    sc.font = `500 ${g.size}px "JetBrains Mono", monospace`;
    sc.fillStyle = `rgba(${g.color},${a})`;
    sc.fillText(g.t, x, g.y);
  }
  requestAnimationFrame(glyphLoop);
}
seedGlyphs();
RM ? drawGlyphsStatic() : requestAnimationFrame(glyphLoop);
addEventListener('resize', () => { seedGlyphs(); if (RM) drawGlyphsStatic(); });

/* ---------- Scramble-decode title ---------- */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
function scramble(el) {
  const final = el.dataset.text || el.textContent;
  if (RM) { el.textContent = final; return; }
  const len = final.length, t0 = performance.now(), dur = 1100;
  (function frame(now) {
    const p = Math.min(1, (now - t0) / dur);
    const reveal = Math.floor(p * len);
    let out = final.slice(0, reveal);
    for (let i = reveal; i < len; i++)
      out += final[i] === ' ' ? ' ' : GLYPHS[Math.random() * GLYPHS.length | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame); else el.textContent = final;
  })(t0);
}
const heroName = $('#heroName');
heroName.dataset.text = heroName.textContent;
setTimeout(() => scramble(heroName), 350);

/* ---------- Typing roles ---------- */
const roles = ['Computer Engineering Student', 'C++ Apprentice',
               'Web Developer in Training', 'Bug Hunter & Problem Solver'];
const roleEl = $('#roleText');
if (RM) roleEl.textContent = roles[0];
else {
  let ri = 0, ci = 0, del = false;
  (function type() {
    const cur = roles[ri];
    roleEl.textContent = cur.slice(0, ci);
    if (!del) { ci++; if (ci > cur.length) { del = true; return setTimeout(type, 1700); } }
    else { ci--; if (ci === 0) { del = false; ri = (ri + 1) % roles.length; } }
    setTimeout(type, del ? 26 : 58);
  })();
}

/* ---------- Planet + tech ring ---------- */
const scene = $('#scene'), tiltEl = $('#tilt');
const chips = $$('.chip');
const rings = $$('.ring, .ring2');
const SQUISH = 0.34, AUTO = RM ? 0 : 0.055;
let spin = 14, vel = 0, dragging = false, lastX = 0;

function layoutScene() {
  const w = scene.clientWidth, h = scene.clientHeight;
  const cx = w / 2, cy = h / 2, R = w * 0.40;
  for (const el of rings) {
    const widen = el.classList.contains('ring2') ? 1.12 : 1;
    const rw = R * 2 * widen, rh = R * 2 * SQUISH * widen;
    el.style.width = rw + 'px'; el.style.height = rh + 'px';
    el.style.left = (cx - rw / 2) + 'px'; el.style.top = (cy - rh / 2) + 'px';
  }
  chips.forEach((chip, i) => {
    chip._ang = i * (360 / chips.length); chip._R = R; chip._cx = cx; chip._cy = cy;
  });
  drawOrbit();
}
function drawOrbit() {
  for (const chip of chips) {
    const a = (chip._ang + spin) * Math.PI / 180;
    const z = Math.cos(a);
    const sx = chip._cx + Math.sin(a) * chip._R;
    const sy = chip._cy + z * chip._R * SQUISH;
    const s = .68 + .32 * (z + 1) / 2;
    chip.style.transform = `translate(${sx}px,${sy}px) translate(-50%,-50%) scale(${s})`;
    chip.style.zIndex = Math.round((z + 1) * 20);
    chip.style.opacity = (.55 + .45 * (z + 1) / 2).toFixed(3);
    chip.style.filter = `brightness(${(.7 + .3 * (z + 1) / 2).toFixed(3)})`;
  }
}
/* drag / inertia / auto-spin */
scene.addEventListener('pointerdown', e => {
  dragging = true; vel = 0; lastX = e.clientX;
  scene.classList.add('grabbing');
  scene.setPointerCapture(e.pointerId);
});
scene.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX; lastX = e.clientX;
  spin += dx * .45; vel = dx * .45;
});
['pointerup', 'pointercancel'].forEach(ev =>
  scene.addEventListener(ev, () => { dragging = false; scene.classList.remove('grabbing'); }));
scene.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { spin -= 24; e.preventDefault(); }
  if (e.key === 'ArrowRight') { spin += 24; e.preventDefault(); }
});
/* hero parallax tilt */
let tx = 0, ty = 0, px = 0, py = 0;
const hero = $('#home');
if (!RM) hero.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const r = hero.getBoundingClientRect();
  tx = ((e.clientX - r.left) / r.width - .5) * 9;
  ty = ((e.clientY - r.top) / r.height - .5) * -7;
});
function orbitLoop() {
  if (!dragging) { vel *= .95; spin += vel + AUTO; }
  px += (tx - px) * .06; py += (ty - py) * .06;
  tiltEl.style.transform = `rotateY(${px}deg) rotateX(${py}deg)`;
  drawOrbit();
  requestAnimationFrame(orbitLoop);
}
layoutScene();
addEventListener('resize', layoutScene);
orbitLoop();

/* ---------- Scroll reveals + counters + bars ---------- */
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    e.target.querySelectorAll('.count').forEach(runCount);
    if (e.target.classList.contains('count')) runCount(e.target);
    io.unobserve(e.target);
  }
}, { threshold: .16 });
$$('.reveal, .mask, .skill').forEach(el => io.observe(el));

const counted = new Set();
function runCount(el) {
  if (counted.has(el)) return; counted.add(el);
  const to = +el.dataset.to, isPct = el.textContent.includes('%');
  if (RM) { el.textContent = to + (isPct ? '%' : ''); return; }
  const t0 = performance.now(), dur = 1100;
  (function f(t) {
    const p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(to * ease) + (isPct ? '%' : '');
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}

/* ---------- Nav: scrolled, progress, active, burger ---------- */
const nav = $('#nav'), prog = $('#progress');
addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 30);
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

const secObserver = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav-links a').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-40% 0px -55% 0px' });
['about', 'skills', 'projects', 'journey', 'contact'].forEach(id =>
  secObserver.observe(document.getElementById(id)));

const burger = $('#burger');
burger.addEventListener('click', () => document.body.classList.toggle('menu-open'));
$$('.nav-links a').forEach(a =>
  a.addEventListener('click', () => document.body.classList.remove('menu-open')));

/* ---------- Project card tilt ---------- */
if (!RM && matchMedia('(pointer:fine)').matches) {
  $$('.pcard').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - .5;
      const cy = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `translateY(-6px) rotateX(${cy * -4}deg) rotateY(${cx * 4}deg)`;
    });
    card.addEventListener('pointerleave', () => card.style.transform = '');
  });
}

/* ---------- Contact form (Formspree) ---------- */
const form = $('#contactForm'), note = $('#formNote');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.disabled = true; btn.textContent = 'TRANSMITTING…';
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      form.reset();
      btn.textContent = '✓ MESSAGE SENT';
      note.textContent = '// thanks! your message reached my inbox.';
      note.classList.add('ok');
    } else {
      const data = await res.json().catch(() => ({}));
      btn.textContent = 'SEND MESSAGE →';
      note.textContent = '// error: ' + (data.errors ? data.errors.map(x => x.message).join(', ') : 'something went wrong');
    }
  } catch {
    btn.textContent = 'SEND MESSAGE →';
    note.textContent = '// network error — check your connection';
  }
  setTimeout(() => { btn.disabled = false; btn.textContent = 'SEND MESSAGE →'; }, 4000);
});