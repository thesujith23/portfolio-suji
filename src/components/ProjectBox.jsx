import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '../lib/projects';
import { play } from '../lib/sound';

gsap.registerPlugin(ScrollTrigger);

const N = PROJECTS.length;

/* ── Carton geometry (ported 1:1 from the reference) ──────
   A 0×0 anchor carries the perspective; `.pbox3` is the 800×260 floor
   centred on it. Cards are 224×304 planes hinged on their own bottom edge,
   laid on their side (rotateZ(-90deg)) and stood up (rotateX(-90deg)), so
   each faces right like a record in a crate. The front wall is painted
   after them so their feet sit down inside the box, exactly like the
   reference carton. */
const FLOOR_W = 800;
const FLOOR_H = 260;
const CARD_W = 224;
const CARD_H = 304;
const STEP = 111;

/* Cards stand perpendicular to the row, so the run along the crate is just
   the gaps between them. Each card's plane is centred on the crate depth,
   which projects to the right of its slot, so the centred run is pulled back
   by that projection offset to read as centred inside the carton. */
const SPAN = (N - 1) * STEP;
const START = (FLOOR_W - SPAN) / 2 - 150;

const CARDS = PROJECTS.map((_, i) => ({ left: START + i * STEP, top: -174 }));

/* The single headline figure printed on each card face. */
const BIG = ['MERN', 'RAG', 'AI', 'MERN', 'CRUD', 'ML'];

/* One line under the figure, kept short enough to read sideways. */
const LINES = [
  'QR to kitchen, live',
  'cited answers from PDFs',
  'pose-tracked workouts',
  'spend, mapped monthly',
  'inventory end to end',
  'meals that fit you',
];

const SHOT_LABELS = ['Main screen', 'In detail', 'Closer look'];

/* Hex mix helper: the card faces must stay opaque on browsers that do not
   support color-mix (older iOS/Android), so the tints are computed here. */
const mix = (hex, target, amount) => {
  const parse = (value) => {
    const clean = value.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    if (full.length !== 6) return null;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };
  const a = parse(hex);
  const b = parse(target);
  if (!a || !b) return hex;
  const out = a.map((channel, i) => Math.round(channel + (b[i] - channel) * amount));
  return `rgb(${out[0]}, ${out[1]}, ${out[2]})`;
};

const skin = (color) => ({
  '--bg': `radial-gradient(120% 80% at 15% 0%, ${mix(color, '#ffffff', 0.42)} 0%, transparent 55%), radial-gradient(90% 70% at 100% 100%, ${mix(color, '#000000', 0.3)} 0%, transparent 62%), linear-gradient(165deg, ${mix(color, '#ffffff', 0.12)}, ${color})`,
  '--glow': color,
  '--c': color,
});

const cardArt = (project) => project.mainImg || project.poster || project.sideImg1 || null;

const sheetShots = (project) =>
  [...new Set([project.mainImg || project.poster, project.sideImg1, project.sideImg2].filter(Boolean))];

/* The little address pill in the case-study stage's browser chrome. */
const hostOf = (project) => {
  const url = project.liveUrl || project.github;
  if (!url) return 'case study';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'case study';
  }
};

/* ── Ink layer ──────────────────────────────────────────
   Every decorative stroke is an inline path with pathLength="1", so a single
   dasharray/dashoffset pair draws it on open. Nothing here is an asset. */
function InkRule() {
  return (
    <svg className="pbox-ink" viewBox="0 0 600 8" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M2 4.6C70 1.9 150 6.3 250 3.9 350 1.5 470 6 598 4.2" />
    </svg>
  );
}

function Doodles() {
  return (
    <span className="pbox-case-doodles" aria-hidden="true">
      {/* Curved arrow from the copy down to the two buttons. */}
      <svg className="pbox-doodle pbox-doodle-arrow" viewBox="0 0 120 96">
        <path pathLength="1" d="M8 10c32 8 58 26 70 52" />
        <path d="M62 50l16 14 6-20" />
      </svg>
      {/* Loose squiggle in the open right-hand space. */}
      <svg className="pbox-doodle pbox-doodle-squiggle" viewBox="0 0 84 36">
        <path pathLength="1" d="M4 24c8-15 17 11 25-2s16 9 24-4 14 6 27-1" />
      </svg>
    </span>
  );
}

function Sparkles() {
  return (
    <span className="pbox-case-sparkles" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M12 2.5l2 7.5 7.5 2-7.5 2-2 7.5-2-7.5L2.5 12 10 10z" /></svg>
      <svg viewBox="0 0 24 24"><path d="M12 5l1.4 5.1L18.5 12l-5.1 1.4L12 18.5l-1.4-5.1L5.5 12l5.1-1.9z" /></svg>
    </span>
  );
}

function GithubMark() {
  return (
    <svg className="pbox-btn-ico" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

export default function ProjectBox() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  /* Which card is lifted: set from the card itself or from its caption under
     the box, so both ends of the interaction light up together. */
  const [hoverIndex, setHoverIndex] = useState(null);
  /* Which screenshot the case-study stage is showing. */
  const [activeShot, setActiveShot] = useState(0);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const boxRef = useRef(null);
  /* Horizontal start of a swipe on the case-study stage. */
  const dragX = useRef(null);

  const setHot = useCallback((index) => setHoverIndex(index), []);
  const clearHot = useCallback(() => setHoverIndex(null), []);

  /* The lift cannot live on CSS :hover — raising a 3D plane moves it out from
     under the cursor, which cancels the hover and drops the card instantly.
     Nor can it be cleared by hit-testing under the pointer: the crate floor,
     the walls and the slot plane all sit in front of parts of the card, and
     the lift itself slides the card out of its own footprint. So the card
     stays up until the pointer leaves the stage or another card takes over. */

  const openProject = useCallback((index, el) => {
    if (el) triggerRef.current = el;
    setHoverIndex(null);
    setActiveIndex(index);
    setOpenIndex(index);
    setActiveShot(0);
    play('click');
  }, []);

  /* Phones have no hover: the first tap raises the card and shows its stack,
     a second tap opens the case study. Captions still open in one tap. */
  const handleCardClick = (index, event) => {
    /* Keep the click from reaching the stage's tap-to-dismiss handler. */
    event.stopPropagation();
    const phone = window.matchMedia('(max-width: 820px)').matches;
    if (phone && hoverIndex !== index) {
      setHot(index);
      play('hover');
      return;
    }
    openProject(index, event.currentTarget);
  };

  const closeProject = useCallback(() => {
    setOpenIndex(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger && typeof trigger.focus === 'function') trigger.focus();
    /* Focus would immediately re-light the card back on a phone; clear after
       the trigger's focus event has been delivered. */
    if (window.matchMedia('(max-width: 820px)').matches) {
      window.setTimeout(() => setHoverIndex(null), 0);
    }
    play('close');
  }, []);

  const stepProject = useCallback((dir) => {
    setActiveShot(0);
    setActiveIndex((current) => {
      if (current === null) return current;
      const next = (current + dir + N) % N;
      setOpenIndex(next);
      return next;
    });
    play('hover');
  }, []);

  /* Fit the projection: the carton is sized to the frame (0.62 at 1440px, so
     it reads as a real crate, not a thumbnail). `--k` goes on the stage so
     the caption row below can space itself from the scaled carton. */
  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return undefined;
    const fit = () => {
      const w = scene.clientWidth;
      /* Phones get the same carton, just scaled to the screen: the crate fills
         ~96% of the width, which lands a card at 26% of the crate — the exact
         desktop ratio — instead of the old 0.3 floor that made it a thumbnail. */
      const k = w <= 820
        ? Math.max(0.32, Math.min(0.58, (w - 18) / 1000))
        : Math.max(0.28, Math.min(0.56, (w - 80) / 2100));
      stage.style.setProperty('--k', k.toFixed(4));
      scene.style.height = `${Math.round(440 * (k / 0.4376))}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(scene);
    return () => ro.disconnect();
  }, []);

  /* Lid swings open, cards rise from below the floor — once, when the box
     first comes on screen. */
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    let riseTimer;
    const open = () => {
      box.classList.add('is-open');
      play('open', { volume: 0.8 });
      /* The lid swings over the crate for its first ~0.9s. The cards wait for
         it to clear vertical, so they rise out of the box instead of through
         the cap. */
      riseTimer = window.setTimeout(() => box.classList.add('is-risen'), 950);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      box.classList.add('is-open', 'is-risen');
      return undefined;
    }
    const trigger = ScrollTrigger.create({
      trigger: box,
      start: 'top 88%',
      once: true,
      onEnter: open,
    });
    return () => {
      window.clearTimeout(riseTimer);
      trigger.kill();
    };
  }, []);

  /* Esc closes, the page stays put behind the case study, arrow keys browse
     the crate, and focus goes back to the card that opened it. */
  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeProject();
      if (event.key === 'ArrowRight') stepProject(1);
      if (event.key === 'ArrowLeft') stepProject(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    window.lenis?.stop?.();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus?.();
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.lenis?.start?.();
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, closeProject, stepProject]);

  const active = activeIndex === null ? null : PROJECTS[activeIndex];
  const shots = active ? sheetShots(active) : [];

  /* One screenshot forward/back, used by the phone pager buttons and the
     swipe on the stage. Wraps, so a two-shot project just toggles. */
  const stepShot = (dir) => {
    if (shots.length < 2) return;
    setActiveShot((current) => (current + dir + shots.length) % shots.length);
  };

  const onStagePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    dragX.current = event.clientX;
  };
  const onStagePointerEnd = (event) => {
    const start = dragX.current;
    dragX.current = null;
    if (start === null) return;
    const dx = event.clientX - start;
    if (Math.abs(dx) < 40) return;
    stepShot(dx < 0 ? 1 : -1);
  };

  return (
    <>
      {/* The stage owns the pointer state for the whole crate + name list. */}
      <div
        className="pbox-stage"
        ref={stageRef}
        onPointerLeave={clearHot}
        onClick={clearHot}
      >
      <div className="pbox-scene" ref={sceneRef}>
        <div className="pbox-fit">
          <div className="pbox3" ref={boxRef} style={{ '--fw': `${FLOOR_W}px`, '--fh': `${FLOOR_H}px` }}>
            <div className="pbox-shadow" aria-hidden="true" />
            <div className="pbox-floor" aria-hidden="true" />

            <div className="pbox-wall pbox-wall-back" aria-hidden="true" />
            <div className="pbox-wall pbox-wall-left" aria-hidden="true" />

            <div className="pbox-lid" aria-hidden="true">
              <span className="pbox-stamp">Things I designed</span>
            </div>

            {PROJECTS.map((p, i) => (
              <div
                key={p.idx}
                className="pbox-slot"
                style={{ left: `${CARDS[i].left}px`, top: `${CARDS[i].top}px`, '--i': i }}
              >
                <button
                  type="button"
                  className={`pbox-wk${hoverIndex === i ? ' is-hot' : ''}`}
                  style={Object.assign({ width: `${CARD_W}px`, height: `${CARD_H}px` }, skin(p.color))}
                  data-hover
                  onClick={(event) => handleCardClick(i, event)}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'mouse') return;
                    if (hoverIndex !== i) play('hover');
                    setHot(i);
                  }}
                  onFocus={() => setHot(i)}
                  onBlur={clearHot}
                  aria-label={`${p.name}, open case study`}
                >
                  <span className="pbox-wk-top">
                    {cardArt(p) && (
                      <img className="pbox-wk-logo" src={cardArt(p)} alt="" loading="lazy" decoding="async" />
                    )}
                    <span className="pbox-wk-tag">{p.idx}</span>
                  </span>

                  <span className="pbox-wk-body">
                    <span className="pbox-hand">{p.name}</span>
                    <span className="pbox-big">{BIG[i]}</span>
                    <span className="pbox-sub">{LINES[i]}</span>
                  </span>

                  <span className="pbox-bk" aria-hidden="true">
                    <span className="pbox-bk-k">The stack</span>
                    <span className="pbox-bk-n">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span className="pbox-bk-row" key={tag}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <span>{tag}</span>
                        </span>
                      ))}
                    </span>
                    <span className="pbox-bk-go">Open case study <span aria-hidden="true">→</span></span>
                  </span>
                </button>
              </div>
            ))}

            {/* Painted after the cards, like the reference: these two walls
                hide the card feet and close the carton. */}
            <div className="pbox-wall pbox-wall-right" aria-hidden="true" />
            <div className="pbox-wall pbox-wall-front" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* The list under the crate, like the reference: number, name, stack.
          Hovering an entry lifts its card out of the box; clicking opens it. */}
      <ol className={`pbox-captions${hoverIndex !== null ? ' has-hot' : ''}`} aria-label="Projects in the crate">
        {PROJECTS.map((p, i) => (
          <li key={p.idx}>
            <button
              type="button"
              className={hoverIndex === i ? 'is-hot' : undefined}
              style={{ '--card-color': p.color }}
              data-hover
              onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') return;
                if (hoverIndex !== i) play('hover');
                setHot(i);
              }}
              onFocus={() => setHot(i)}
              onBlur={clearHot}
              onClick={(event) => openProject(i, event.currentTarget)}
            >
              <b className="pbox-cap-num">{p.idx}</b>
              <em className="pbox-cap-name">{p.name}</em>
              <span className="pbox-cap-sub">{p.tags.slice(0, 2).join(' · ')}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="pbox-tap-hint">Tap a card for its stack · tap again to open</p>
      </div>

      {createPortal(
        <div className={`pbox-case${openIndex !== null ? ' on' : ''}`} aria-hidden={openIndex === null}>
          <div className="pbox-case-scrim" onClick={closeProject} />

          {active && (
            <article
              key={active.idx}
              className="pbox-case-card"
              role="dialog"
              aria-modal="true"
              aria-label={`${active.name} case study`}
              tabIndex={-1}
              ref={panelRef}
              style={Object.assign({ '--pc': active.color }, skin(active.color))}
            >
              <div className="pbox-case-top">
                <span className="pbox-case-kicker">
                  <b>{active.idx}</b>
                  <span className="pbox-case-kicker-dash" aria-hidden="true">/</span>
                  {String(N).padStart(2, '0')} · Selected work
                </span>
                <button
                  type="button"
                  className="pbox-case-x"
                  onClick={closeProject}
                  aria-label="Close case study"
                  data-hover
                >
                  ×
                </button>
              </div>

              <div className="pbox-case-main">
                <header className="pbox-case-intro">
                  <Doodles />

                  <div className="pbox-case-intro-top">
                    <span className="pbox-case-chipwrap">
                      <svg className="pbox-case-ring" viewBox="0 0 72 72" aria-hidden="true">
                        <ellipse pathLength="1" cx="36" cy="36" rx="33" ry="27" transform="rotate(-6 36 36)" />
                      </svg>
                      <span className="pbox-case-chip">{active.idx}</span>
                    </span>
                    <span className="pbox-case-eyebrow">
                      <i aria-hidden="true" />
                      Case study
                    </span>
                  </div>

                  <h2 className="pbox-case-title">
                    {active.name}
                    <svg className="pbox-case-mark" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
                      <path pathLength="1" d="M3 11C62 4.6 154 3.4 297 7.4" />
                    </svg>
                  </h2>

                  <p className="pbox-case-tagline">{active.tagline}</p>
                  <p className="pbox-case-lead">{active.meta}</p>

                  <div className="pbox-case-bottom">
                  <div className="pbox-case-stack">
                    <InkRule />
                    <div className="pbox-case-stack-head">
                      <span className="pbox-case-label">Tech stack</span>
                      <Sparkles />
                    </div>
                    <ul className="pbox-case-chips">
                      {active.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>

                  <div className="pbox-case-highlights">
                    <span className="pbox-case-label">In the build</span>
                    <ul className="pbox-case-hl-list">
                      {active.highlights.map((item) => (
                        <li key={item}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pbox-case-links">
                    {active.liveUrl && (
                      <a
                        href={active.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pbox-case-btn"
                        data-hover
                      >
                        Live site <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {active.github && (
                      <a
                        href={active.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`pbox-case-btn${active.liveUrl ? ' ghost' : ''}`}
                        data-hover
                      >
                        <GithubMark /> GitHub <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                  </div>
                </header>

                <aside className="pbox-case-side">
                  <figure
                    className="pbox-case-stage"
                    onPointerDown={onStagePointerDown}
                    onPointerUp={onStagePointerEnd}
                    onPointerCancel={() => { dragX.current = null; }}
                    onPointerLeave={() => { dragX.current = null; }}
                  >
                    <span className="pbox-case-tape" aria-hidden="true" />
                    <span className="pbox-case-stage-badge" aria-hidden="true">
                      {active.idx}<i>/{String(N).padStart(2, '0')}</i>
                    </span>
                    <span className="pbox-case-chrome" aria-hidden="true">
                      <i /><i /><i />
                      <b>{hostOf(active)}</b>
                    </span>
                    {shots.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="pbox-case-pager prev"
                          onClick={() => stepShot(-1)}
                          aria-label="Previous screen"
                          data-hover
                        >
                          <span aria-hidden="true">‹</span>
                        </button>
                        <button
                          type="button"
                          className="pbox-case-pager next"
                          onClick={() => stepShot(1)}
                          aria-label="Next screen"
                          data-hover
                        >
                          <span aria-hidden="true">›</span>
                        </button>
                      </>
                    )}
                    <span className="pbox-case-shotbox">
                      <span
                        className="pbox-case-stage-wash"
                        aria-hidden="true"
                        style={{ backgroundImage: `url("${shots[activeShot]}")` }}
                      />
                      <img
                        src={shots[activeShot]}
                        alt={`${active.name} — screen ${activeShot + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <figcaption>
                      <b>{String(activeShot + 1).padStart(2, '0')}</b>
                      {SHOT_LABELS[activeShot] || 'Screen'}
                      <span className="pbox-case-stage-total">
                        {String(shots.length).padStart(2, '0')}
                      </span>
                    </figcaption>
                  </figure>

                  {shots.length > 1 && (
                    <div className="pbox-case-thumbs" role="group" aria-label={`${active.name} screenshots`}>
                      {shots.map((src, i) => (
                        <button
                          key={src}
                          type="button"
                          className="pbox-case-thumb"
                          aria-pressed={i === activeShot}
                          aria-label={`Show screen ${i + 1}`}
                          onClick={() => setActiveShot(i)}
                          data-hover
                        >
                          <img src={src} alt="" loading="lazy" decoding="async" />
                        </button>
                      ))}
                    </div>
                  )}

                  <blockquote className="pbox-case-quote">
                    {active.quote}
                    <cite className="pbox-case-cite">
                      {active.quoteAuthor} — {active.quoteRole}
                    </cite>
                  </blockquote>
                </aside>
              </div>

              <footer className="pbox-case-foot">
                <div className="pbox-case-dots" role="group" aria-label="Jump to project">
                  {PROJECTS.map((p, i) => (
                    <button
                      key={p.idx}
                      type="button"
                      className={i === activeIndex ? 'is-current' : undefined}
                      aria-current={i === activeIndex ? 'true' : undefined}
                      aria-label={`${p.idx} — ${p.name}`}
                      data-hover
                      onClick={() => {
                        setActiveIndex(i);
                        setOpenIndex(i);
                        setActiveShot(0);
                        play('hover');
                      }}
                    >
                      {p.idx}
                    </button>
                  ))}
                </div>
                <div className="pbox-case-nav">
                  <button type="button" onClick={() => stepProject(-1)} data-hover aria-label="Previous project">
                    ← Prev
                  </button>
                  <button type="button" onClick={() => stepProject(1)} data-hover aria-label="Next project">
                    Next case →
                  </button>
                </div>
              </footer>
            </article>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
