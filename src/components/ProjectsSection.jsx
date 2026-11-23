import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextReveal } from './ExperienceTimeline';
import LazyVideo from './LazyVideo';
import { play } from '../lib/sound';
import { PROJECTS } from '../lib/projects';

gsap.registerPlugin(ScrollTrigger);

const TOTAL = PROJECTS.length;

/* A screenshot that shows an "open" affordance on hover and opens full screen. */
function ZoomButton({ src, alt, onOpen }) {
  return (
    <button
      type="button"
      className="zoomable"
      data-hover
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(src, alt);
      }}
      aria-label={`Open ${alt} full screen`}
    >
      <img src={src} alt={alt} />
      <span className="zoom-badge" aria-hidden="true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
        <span>open</span>
      </span>
    </button>
  );
}

export default function ProjectsSection() {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);

  const sectionRef = useRef(null);
  const stRef = useRef(null);
  const activeRef = useRef(0);
  const touchRef = useRef(null);
  const zoomRef = useRef(null);

  /* ── Pinned deck ─────────────────────────────────────── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const deckContainer = section.querySelector('.deck-container');
      const cards = gsap.utils.toArray('.deck-card');
      if (!cards.length) return;

      cards.forEach((card, i) => {
        gsap.set(card, {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transformOrigin: 'left center',
          scale: i > 0 ? 1 - i * 0.03 : 1,
          rotationZ: i * 2.5,
          y: i * 25,
          x: i * 15,
          zIndex: cards.length - i,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: deckContainer || section,
          start: 'top top',
          end: `+=${(cards.length - 1) * 100}%`,
          pin: true,
          // A one-second scrub stacked on top of Lenis's glide kept the deck
          // drifting for ~2.4s after the wheel stopped, which read as lag right
          // at the Experience -> Projects handoff.
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const next = Math.round(self.progress * (cards.length - 1));
            if (next !== activeRef.current) {
              activeRef.current = next;
              setActive(next);
              play('whoosh');
            }
          },
        },
      });

      cards.forEach((card, i) => {
        if (i >= cards.length - 1) return;
        tl.to(card, { rotationY: -110, scale: 0.9, x: '-4vw', ease: 'power2.inOut', duration: 1 }, i);
        for (let j = i + 1; j < cards.length; j++) {
          const depth = j - i - 1;
          tl.to(
            cards[j],
            {
              scale: depth > 0 ? 1 - depth * 0.03 : 1,
              rotationZ: depth * 2.5,
              y: depth * 25,
              x: depth * 15,
              ease: 'power2.inOut',
              duration: 1,
            },
            i
          );
        }
      });

      stRef.current = tl.scrollTrigger;
    }, section);

    ScrollTrigger.refresh();
    return () => {
      ctx.revert();
      stRef.current = null;
    };
  }, []);

  /* ── Navigation ──────────────────────────────────────── */
  const goTo = useCallback((i) => {
    const st = stRef.current;
    const clamped = Math.max(0, Math.min(TOTAL - 1, i));
    if (!st) return;
    const target = st.start + ((st.end - st.start) * clamped) / Math.max(1, TOTAL - 1) + 2;
    if (window.lenis) window.lenis.scrollTo(target, { duration: 1 });
    else window.scrollTo({ top: target, behavior: 'smooth' });
    play('click');
  }, []);

  /* ── Full-screen screenshot viewer ───────────────────── */
  const openZoom = useCallback((src, alt) => {
    zoomRef.current = { src, alt };
    setZoom({ src, alt });
    play('click');
  }, []);

  const closeZoom = useCallback(() => {
    zoomRef.current = null;
    setZoom(null);
  }, []);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeZoom();
    };
    window.addEventListener('keydown', onKeyDown);
    window.lenis?.stop?.();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.lenis?.start?.();
      document.body.style.overflow = prevOverflow;
    };
  }, [zoom, closeZoom]);

  useEffect(() => {
    const onKey = (e) => {
      const el = sectionRef.current;
      if (!el || zoomRef.current) return;
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4;
      if (!inView) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(activeRef.current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    touchRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    goTo(activeRef.current + (dx < 0 ? 1 : -1));
  };

  return (
    <>
      <div ref={sectionRef} id="work" style={{ width: '100%' }}>
        <section style={{ position: 'relative', paddingTop: '44px', paddingLeft: '48px', paddingRight: '48px', paddingBottom: '20px' }}>
          <span className="typewriter-terminal-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>
            &gt;_ work.dir
          </span>

          <div className="projects-header-row">
            <h2
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(3rem,6vw,5rem)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 0.95,
                color: 'var(--text)',
              }}
            >
              <TextReveal delay={0.05}>Selected</TextReveal>
              <br />
              <em>
                <TextReveal delay={0.1}>Projects</TextReveal>
              </em>
            </h2>

            <div className="projects-toolbar">
              {(
                <div className="deck-dots">
                  {PROJECTS.map((p, i) => (
                    <button
                      key={p.idx}
                      type="button"
                      className={`deck-dot ${i === active ? 'active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Show ${p.name}`}
                      data-sound="tick"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="deck-container">
            <div className="deck-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              {PROJECTS.map((p, i) => (
                <div
                  key={p.idx}
                  className={`deck-card${active === i ? ' is-active' : ''}`}
                  style={{ backgroundColor: p.color }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    gsap.to(e.currentTarget.querySelector('.deck-card-inner'), {
                      rotateY: x * 12,
                      rotateX: -y * 12,
                      duration: 0.5,
                      ease: 'power2.out',
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget.querySelector('.deck-card-inner'), {
                      rotateY: 0,
                      rotateX: 0,
                      duration: 0.8,
                      ease: 'power2.out',
                    });
                  }}
                >
                  <span className="deck-pop" aria-hidden="true">POP!</span>
                  <div className="deck-card-inner">
                    <div className="deck-card-header">
                      <div style={{ maxWidth: '750px' }}>
                        <h3
                          style={{
                            fontFamily: 'var(--serif)',
                            fontSize: 'clamp(1.8rem, 3vw, 3.5rem)',
                            fontWeight: 800,
                            letterSpacing: '-0.05em',
                            lineHeight: 1,
                            color: '#fff',
                          }}
                        >
                          {p.name}
                        </h3>
                        <p
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: '0.9rem',
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.5,
                            marginTop: '1rem',
                            maxWidth: '95%',
                          }}
                        >
                          {p.meta}
                        </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                color: '#fff',
                                fontSize: '0.75rem',
                                fontFamily: 'var(--mono)',
                                border: '1px solid rgba(255,255,255,0.2)',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                          {p.github && (
                            <a
                              href={p.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-hover
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 20px',
                                backgroundColor: '#111',
                                color: '#fff',
                                borderRadius: '100px',
                                fontFamily: 'var(--mono)',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'background 0.3s, transform 0.3s',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--accent)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#111';
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                              </svg>
                              Repository
                            </a>
                          )}
                          {p.liveUrl && (
                            <a
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              data-hover
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 20px',
                                backgroundColor: 'rgba(255,255,255,0.12)',
                                color: '#fff',
                                borderRadius: '100px',
                                fontFamily: 'var(--mono)',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'transform 0.3s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              Live ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="mono" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
                        ({p.idx})
                      </div>
                    </div>

                    <div className="deck-bottom-section">
                      <div className="quote-column">
                        <p
                          style={{
                            fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                            lineHeight: 1.5,
                            fontFamily: 'var(--sans)',
                          }}
                        >
                          {p.quote}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                            }}
                          >
                            {p.icon ? (
                              <img
                                src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${p.icon}`}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : null}
                          </div>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--sans)' }}>
                              {p.quoteAuthor}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: 'var(--mono)' }}>
                              {p.quoteRole}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="landscape-mockup-wrapper">
                        <div className="mockup-main">
                          {p.mainVideo ? (
                            <LazyVideo
                              src={p.mainVideo}
                              poster={p.poster}
                              active={active === i}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                            />
                          ) : p.mainImg ? (
                            <ZoomButton src={p.mainImg} alt={`${p.name} screenshot`} onOpen={openZoom} />
                          ) : (
                            <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                              [ Main Media ]
                            </span>
                          )}
                        </div>
                        <div className="landscape-side-images">
                          <div className="mockup-side">
                            {p.sideImg1 ? (
                              <ZoomButton src={p.sideImg1} alt={`${p.name} detail 1`} onOpen={openZoom} />
                            ) : (
                              <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                [ Side 1 ]
                              </span>
                            )}
                          </div>
                          <div className="mockup-side">
                            {p.sideImg2 ? (
                              <ZoomButton src={p.sideImg2} alt={`${p.name} detail 2`} onOpen={openZoom} />
                            ) : (
                              <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                [ Side 2 ]
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {zoom &&
        createPortal(
          <div className="zoom-overlay" role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={closeZoom}>
            <img className="zoom-image" src={zoom.src} alt={zoom.alt} onClick={(e) => e.stopPropagation()} />
            <button type="button" className="zoom-close" onClick={closeZoom} aria-label="Close full screen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <span className="zoom-caption">{zoom.alt}</span>
          </div>,
          document.body
        )}

    </>
  );
}
