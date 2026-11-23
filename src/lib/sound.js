/* ════════════════════════════════════════════════════════════
   SOUND ENGINE — everything is synthesized in the browser.
   No audio assets required (the Pikachu chirp reuses the mp3).
   ════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'sujith-sound-muted';
const MAX_VOICES = 12;

let ctx = null;
let master = null;
let noiseBuf = null;
let unlocked = false;
let muted = false;
let voices = 0;
const listeners = new Set();
const lastAt = Object.create(null);

if (typeof window !== 'undefined') {
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    muted = false;
  }
}

/* ── State ─────────────────────────────────────────────── */

export function isMuted() {
  return muted;
}

export function subscribeSound(fn) {
  listeners.add(fn);
  fn(muted);
  return () => listeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(muted);
    } catch {
      /* listener errors must not break audio */
    }
  });
}

export function setMuted(next) {
  muted = Boolean(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
  } catch {
    /* private mode — ignore */
  }
  emit();
}

export function toggleMuted() {
  const next = !muted;
  setMuted(next);
  if (!next) play('pop');
}

/* ── Context lifecycle ─────────────────────────────────── */

export function unlockAudio() {
  if (typeof window === 'undefined') return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ctx) {
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
      return;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  unlocked = true;
}

function getNoise() {
  if (!ctx) return null;
  if (!noiseBuf) {
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

function track(node) {
  voices++;
  node.addEventListener('ended', () => {
    voices = Math.max(0, voices - 1);
    try {
      node.disconnect();
    } catch {
      /* already gone */
    }
  });
}

/* ── Primitives ────────────────────────────────────────── */

function tone({ type = 'sine', from = 440, to = from, dur = 0.12, gain = 0.04, delay = 0 } = {}) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(20, from), t0);
  if (to !== from) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
  }
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + Math.min(0.012, dur * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
  track(osc);
}

function noise({ dur = 0.2, gain = 0.05, from = 800, to = 3000, q = 1, delay = 0 } = {}) {
  if (!ctx || !master) return;
  const buf = getNoise();
  if (!buf) return;
  const t0 = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(60, to), t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + Math.min(0.05, dur * 0.4));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
  track(src);
}

/* ── Recipes ───────────────────────────────────────────── */
/* throttle = minimum ms between two plays of the same sound */

const RECIPES = {
  hover: {
    throttle: 70,
    fn: ({ v, r }) => tone({ type: 'sine', from: 1180 * r, to: 880 * r, dur: 0.045, gain: 0.016 * v }),
  },
  click: {
    throttle: 45,
    fn: ({ v, r }) => {
      tone({ type: 'triangle', from: 640 * r, to: 380 * r, dur: 0.075, gain: 0.05 * v });
      tone({ type: 'square', from: 1280 * r, to: 900 * r, dur: 0.03, gain: 0.012 * v });
    },
  },
  type: {
    throttle: 30,
    fn: ({ v, r }) => {
      // Two transients: a crisp key-top tick plus a low body thock.
      noise({ dur: 0.026, gain: 0.2 * v, from: 2700 * r, to: 1200 * r, q: 1.2 });
      noise({ dur: 0.055, gain: 0.09 * v, from: 480 * r, to: 240 * r, q: 0.85 });
      tone({ type: 'triangle', from: 540 * r, to: 300 * r, dur: 0.032, gain: 0.03 * v });
    },
  },
  whoosh: {
    throttle: 180,
    fn: ({ v }) => noise({ dur: 0.5, gain: 0.055 * v, from: 300, to: 2800, q: 1.8 }),
  },
  open: {
    throttle: 120,
    fn: ({ v }) => {
      tone({ from: 300, to: 780, dur: 0.18, gain: 0.045 * v });
      noise({ dur: 0.18, gain: 0.02 * v, from: 700, to: 2400 });
    },
  },
  close: {
    throttle: 120,
    fn: ({ v }) => tone({ from: 720, to: 260, dur: 0.2, gain: 0.04 * v }),
  },
  tick: {
    throttle: 40,
    fn: ({ v }) => tone({ type: 'square', from: 1650, to: 1500, dur: 0.02, gain: 0.013 * v }),
  },
  zap: {
    throttle: 260,
    fn: ({ v }) => {
      tone({ type: 'sawtooth', from: 90, to: 1300, dur: 0.22, gain: 0.045 * v });
      noise({ dur: 0.25, gain: 0.045 * v, from: 1200, to: 500, q: 0.8 });
    },
  },
  sparkle: {
    throttle: 200,
    fn: ({ v }) => {
      [1046, 1318, 1568, 2093].forEach((f, i) =>
        tone({ from: f, to: f, dur: 0.12, gain: 0.018 * v, delay: i * 0.05 })
      );
    },
  },
  pop: {
    throttle: 55,
    fn: ({ v, r }) => tone({ from: 520 * r, to: 860 * r, dur: 0.06, gain: 0.03 * v }),
  },
  success: {
    throttle: 400,
    fn: ({ v }) => {
      [523, 659, 784].forEach((f, i) => tone({ from: f, to: f, dur: 0.2, gain: 0.022 * v, delay: i * 0.07 }));
    },
  },
};

/* ── Public play ───────────────────────────────────────── */

export function play(name, opts = {}) {
  if (muted || !unlocked || !ctx) return;
  const recipe = RECIPES[name];
  if (!recipe) return;
  if (voices > MAX_VOICES) return;

  const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (now - (lastAt[name] || 0) < recipe.throttle) return;
  lastAt[name] = now;

  // Browsers start a context suspended; nudge it on every play so the first
  // audible note arrives as soon as the page has a real gesture behind it.
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  try {
    recipe.fn({ v: opts.volume ?? 1, r: opts.rate ?? 1 });
  } catch {
    /* audio is decorative — never let it throw */
  }
}

/* Pikachu chirp — the one sound that uses an asset. */
let chirpEl = null;
let lastChirp = 0;

export function playChirp(volume = 0.4) {
  if (muted) return;
  const now = Date.now();
  if (now - lastChirp < 900) return;
  lastChirp = now;
  try {
    if (!chirpEl) {
      chirpEl = new Audio('/pikaa-pikaa.mp3');
      chirpEl.preload = 'auto';
    }
    chirpEl.currentTime = 0;
    chirpEl.volume = volume;
    const p = chirpEl.play();
    if (p?.catch) p.catch(() => {});
  } catch {
    /* autoplay blocked — ignore */
  }
}

/* ── Global delegation ─────────────────────────────────── */

const INTERACTIVE = 'a, button, [role="button"], [data-hover], summary, input, select, textarea';

/* Scrolling is the first gesture for most visitors: create/resume the context
   then, so the About typewriter is audible without a click first. */
if (typeof window !== 'undefined') {
  const unlockOnScroll = () => unlockAudio();
  window.addEventListener('wheel', unlockOnScroll, { passive: true });
  window.addEventListener('touchstart', unlockOnScroll, { passive: true });
}

export function attachGlobalSounds() {
  if (typeof window === 'undefined') return () => {};

  let lastHovered = null;
  let lastPointerDown = 0;

  const resolve = (target) => (target instanceof Element ? target.closest(INTERACTIVE) : null);

  const onPointerDown = (e) => {
    unlockAudio();
    const el = resolve(e.target);
    if (!el) return;
    if (el.dataset.sound === 'none') return;
    // React buttons also fire their own handlers; keep one blip per gesture.
    if (e.timeStamp - lastPointerDown < 30) return;
    lastPointerDown = e.timeStamp;
    play(el.dataset.sound || 'click');
  };

  const onPointerOver = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = resolve(e.target);
    if (el === lastHovered) return;
    lastHovered = el;
    if (!el || el.dataset.hoverSound === 'none') return;
    play('hover');
  };

  const onKeyDown = () => unlockAudio();

  window.addEventListener('pointerdown', onPointerDown, true);
  window.addEventListener('pointerover', onPointerOver, true);
  window.addEventListener('keydown', onKeyDown, true);

  return () => {
    window.removeEventListener('pointerdown', onPointerDown, true);
    window.removeEventListener('pointerover', onPointerOver, true);
    window.removeEventListener('keydown', onKeyDown, true);
  };
}
