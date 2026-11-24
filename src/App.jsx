import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './index.css';

import ExperienceTimeline, { TextReveal } from './components/ExperienceTimeline';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import SoundToggle from './components/SoundToggle';
import PikaSprite from './components/PikaSprite';
import { attachGlobalSounds, play, playChirp, unlockAudio } from './lib/sound';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
/* â•â•â•â•â•â•â•â• CURSOR â•â•â•â•â•â•â•â• */
function Cursor() {
  const dotRef = useRef(null);
  const symbolRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const sym = symbolRef.current;
    let x = 0, y = 0, tx = 0, ty = 0;
    let currentHover = null;
    let reqId;

    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!reqId) reqId = requestAnimationFrame(tick);
    };
    const tick = () => {
      x += (tx - x) * 0.15; y += (ty - y) * 0.15;
      if (dot) { dot.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`; }
      if (sym) { sym.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`; }
      // Once the dot has caught up there is nothing left to draw — stop the loop.
      if (Math.abs(tx - x) < 0.08 && Math.abs(ty - y) < 0.08) { reqId = 0; return; }
      reqId = requestAnimationFrame(tick);
    };

    const over = (e) => {
      const target = e.target.closest('a,button,[data-hover]');
      if (target === currentHover) return;

      currentHover = target;
      if (target) {
        dot?.classList.add('expand');
        const symbol = target.getAttribute('data-symbol');
        if (symbol && sym) {
          sym.innerHTML = symbol;
          sym.classList.add('visible');
          dot?.classList.add('hide');
        } else {
          if (sym) { sym.innerHTML = ''; sym.classList.remove('visible'); }
          dot?.classList.remove('hide');
        }
      }
    };

    const out = (e) => {
      const target = e.relatedTarget?.closest('a,button,[data-hover]');
      if (target) return;

      currentHover = null;
      if (dot) {
        dot.classList.remove('expand');
        dot.classList.remove('hide');
      }
      if (sym) {
        sym.classList.remove('visible');
        sym.innerHTML = '';
      }
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    reqId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      cancelAnimationFrame(reqId);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-symbol" ref={symbolRef} />
    </>
  );
}

/* â•â•â•â•â•â•â•â• LOADER â•â•â•â•â•â•â•â• */
function Loader({ onDone }) {
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(wrapRef.current, {
          yPercent: -100, duration: 0.7, ease: 'power3.inOut',
          onComplete: onDone,
        });
      },
    });

    tl.to(barRef.current, {
      scaleX: 1, duration: 1.1, ease: 'power1.inOut',
    });

    // Counter
    const obj = { val: 0 };
    let lastTick = -10;
    tl.to(obj, {
      val: 100, duration: 1.1, ease: 'power1.inOut',
      onUpdate: () => {
        const val = Math.round(obj.val);
        if (counterRef.current) counterRef.current.textContent = val;
        if (val !== lastTick && val % 10 === 0) {
          lastTick = val;
          play('tick');
        }
      },
    }, 0);
  }, [onDone]);

  return (
    <div className="loader" ref={wrapRef}>
      <div className="loader-counter" ref={counterRef}>0</div>
      <div className="loader-bar-track"><div className="loader-bar" ref={barRef} /></div>
      <div className="loader-text">Loading Experience</div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â• MAGNETIC â•â•â•â•â•â•â•â• */

function Magnetic({ children, strength = 0.4, className, style }) {
  const magneticRef = useRef(null);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      xTo(x * strength);
      yTo(y * strength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div ref={magneticRef} className={className} style={{ display: 'inline-flex', ...style }}>
      {children}
    </div>
  );
}

/* ════════ NAV ════════ */
function Nav() {
  const [time, setTime] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight * 0.95);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    if (window.lenis) {
      window.lenis.scrollTo(targetId, { offset: -80 });
    } else {
      document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`nav ${isScrolled ? 'nav-scrolled' : ''}`}>
      <a href="#home" className="nav-brand" onClick={(e) => handleLinkClick(e, '#home')}>Sujith.</a>
      <div className="nav-links">
        {['About', 'Skills', 'Work', 'Contact'].map(l => {
          const targetId = `#${l.toLowerCase()}`;
          return (
            <Magnetic key={l}>
              <a href={targetId} className="nav-link" onClick={(e) => handleLinkClick(e, targetId)}>
                {l}
              </a>
            </Magnetic>
          );
        })}
      </div>
      <span className="nav-time">{time} IST</span>
    </nav>
  );
}

/* â•â•â•â•â•â•â•â• HERO â•â•â•â•â•â•â•â• */
/* Old-school per-letter magnet: one <Magnetic> per character. */
const MagneticWord = ({ text, strength = 0.55 }) => (
  <>
    {text.split('').map((char, index) => (
      <Magnetic key={index} strength={strength} className="hero-magnet" style={{ verticalAlign: 'baseline' }}>
        <span
          className="piano-char"
          onClick={(event) => {
            play('pop', { rate: 0.85 + (index % 12) / 12 });
            const el = event.currentTarget;
            el.style.color = 'var(--accent)';
            window.setTimeout(() => {
              el.style.color = '';
            }, 260);
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      </Magnetic>
    ))}
  </>
);

function Hero({ ready = true }) {
  const ref = useRef(null);

  // Hide the lines immediately so nothing flashes while the loader wipes away.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el.querySelectorAll('.line-inner'), { yPercent: 120 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(el.querySelectorAll('.line-inner'), { yPercent: 120 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
    tl.fromTo(el.querySelector('.hero-pre span'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.5');
    tl.fromTo(el.querySelector('.hero-action'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
    // Cartoon pop on the letters once each line has landed.
    tl.fromTo(el.querySelectorAll('.piano-char'), { scale: 1.3, rotate: -6 }, { scale: 1, rotate: 0, duration: 0.5, stagger: 0.012, ease: 'back.out(2.2)' }, '-=0.9');
  }, [ready]);

  return (
    <section className="hero" id="home" ref={ref} style={{ position: 'relative' }}>
      <div className="hero-rays" aria-hidden="true" />
      <div className="hero-halftone" aria-hidden="true" />
      <span className="hero-burst" aria-hidden="true">Portfolio</span>
      <span className="hero-hire" aria-hidden="true">hire me</span>
      <svg className="hero-arrow" viewBox="0 0 140 136" fill="none" aria-hidden="true">
        <path className="hero-arrow-line" d="M10 10c16 52 42 72 80 84" />
        <path className="hero-arrow-head" d="M90 94l-20-9M90 94l-3-21" />
      </svg>
      <div className="hero-scroll" aria-hidden="true">
        <span className="hero-scroll-word">scroll</span>
        <span className="hero-scroll-chev" />
      </div>
      <div className="hero-pre" style={{ position: 'relative', zIndex: 1 }}><span style={{ opacity: 0 }}>Software Engineer — Full Stack Developer</span></div>
      <h1 className="hero-title" style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticWord text="Building" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span className="italic" style={{ whiteSpace: 'nowrap' }}><MagneticWord text="digital" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticWord text="experiences" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticWord text="that" strength={0.8} /></span>&nbsp;<span className="outline" id="matter-word" style={{ whiteSpace: 'nowrap' }}><MagneticWord text="matter" strength={0.8} /></span></span></span>
      </h1>

      <div className="hero-action" style={{ opacity: 0, position: 'absolute', bottom: '48px', right: '100px', zIndex: 10 }}>
        <Magnetic>
          <div className="resume-btn-wrap">
            <div className="resume-orbit">
              <span className="resume-orbit-dot"></span>
              <span className="resume-orbit-dot"></span>
              <span className="resume-orbit-dot"></span>
            </div>
            <a href="/Sujiiithh_Resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-btn-creative" data-hover>
              <span className="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </span>
              <span className="btn-label">Résumé</span>
            </a>
            <span className="resume-btn-tag">Résumé</span>
          </div>
        </Magnetic>
      </div>
    </section>
  );
}



/* â•â•â•â•â•â•â•â• ABOUT â•â•â•â•â•â•â•â• */
function About() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const charRefs = useRef([]);
  // Three milestones for the cartoon sidekick: 1 = a third typed, 2 = two
  // thirds, 3 = paragraph finished.
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);

  const content = [
    { text: "I'm " },
    { text: "Sujith,", highlight: true },
    { text: " a " },
    { text: "software engineer", highlight: true },
    { text: " building real-time " },
    { text: "voice AI backends", highlight: true },
    { text: ", secure " },
    { text: "REST APIs", highlight: true },
    { text: ", and " },
    { text: "MERN applications", highlight: true },
    { text: " with " },
    { text: "Python", highlight: true },
    { text: ", " },
    { text: "FastAPI", highlight: true },
    { text: ", " },
    { text: "React", highlight: true },
    { text: ", and " },
    { text: "Node.js", highlight: true },
    { text: ". I ship " },
    { text: "LLM integrations", highlight: true },
    { text: " and RAG pipelines, and I care about clean state, fast queries, and products people actually use. Currently looking for a " },
    { text: "product-focused", highlight: true },
    { text: " engineering team." },
  ];

  // Each character gets its own box so the scroll can pop it in, but a box is
  // an inline-block and browsers break lines between those — so characters are
  // grouped into word boxes that may never split. Spaces stay on their own.
  const words = [];
  let word = { chars: [] };
  let charIndex = 0;
  content.forEach((segment) => {
    for (const ch of segment.text) {
      if (ch === ' ') {
        if (word.chars.length) words.push(word);
        words.push({ space: true, chars: [{ ch: ' ', index: charIndex }] });
        charIndex += 1;
        word = { chars: [] };
        continue;
      }
      word.chars.push({ ch, highlight: Boolean(segment.highlight), index: charIndex });
      charIndex += 1;
    }
  });
  if (word.chars.length) words.push(word);

  /* Pinned typewriter: the section holds still while the paragraph types
     itself in step with the scroll, then the page moves on. */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const text = textRef.current;
    if (!section || !text) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = charRefs.current.filter(Boolean);
    if (!nodes.length) return;

    // Each red word gets a golden star burst the moment its last character
    // lands, so the highlights register as highlights.
    const starWords = [...text.querySelectorAll('.tw-word[data-hl]')].map((el) => {
      const chars = el.querySelectorAll('.typewriter-char');
      return { el, end: Number(chars[chars.length - 1].dataset.i) };
    });

    // Scrolling is often the first gesture on this page, so make sure the
    // audio context exists (or resumes) before the first character lands.
    unlockAudio();

    let typed = 0;
    let soundBudget = 0;

    section.classList.add('about-pinned');
    text.classList.add('is-typing');
    nodes.forEach((node) => node.classList.remove('is-on'));
    nodes[0].classList.add('is-last');

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${Math.round(nodes.length * 5)}`,
        pin: true,
        anticipatePin: 1,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const target = Math.round(self.progress * nodes.length);
          if (target === typed) return;
          const forward = target > typed;
          const from = Math.min(target, typed);
          const to = Math.max(target, typed);
          for (let i = from; i < to; i += 1) nodes[i].classList.toggle('is-on', forward);
          nodes[Math.max(0, typed - 1)].classList.remove('is-last');
          nodes[Math.max(0, target - 1)].classList.add('is-last');

          const step = Math.abs(target - typed);
          typed = target;

          for (const word of starWords) {
            if (target > word.end) word.el.classList.add('sparkled');
            else word.el.classList.remove('sparkled');
          }

          if (forward) {
            soundBudget += step;
            if (soundBudget >= 1) {
              soundBudget = 0;
              play('type', { volume: 0.95, rate: 0.9 + Math.random() * 0.2 });
            }
          }
          section.classList.toggle('about-done', target >= nodes.length);

          const nextStage = target >= nodes.length * 0.85
            ? 3
            : target > nodes.length * 0.55
              ? 2
              : target > nodes.length * 0.2
                ? 1
                : 0;
          if (nextStage !== stageRef.current) {
            stageRef.current = nextStage;
            setStage(nextStage);
          }
        },
      });
    }, section);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
      section.classList.remove('about-pinned', 'about-done');
      text.classList.remove('is-typing');
      starWords.forEach((word) => word.el.classList.remove('sparkled'));
    };
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about-label">
        <span className="typewriter-terminal-tag">&gt;_ about.md</span>
        About Me
        <span className="about-open-sticker" aria-hidden="true">open to work ★</span>
      </div>
      <div className="typewriter-container">
        <p className="about-text typewriter-text" ref={textRef}>
          {words.map((group, gi) =>
            group.space ? (
              <span
                key={`s${gi}`}
                ref={(el) => {
                  charRefs.current[group.chars[0].index] = el;
                }}
                className="typewriter-char tw-space"
              >
                {' '}
              </span>
            ) : (
              <span
                className="tw-word"
                key={`w${gi}`}
                data-hl={group.chars.some((char) => char.highlight) ? '' : undefined}
              >
                {group.chars.map((char) => (
                  <span
                    key={char.index}
                    data-i={char.index}
                    ref={(el) => {
                      charRefs.current[char.index] = el;
                    }}
                    className={`typewriter-char${char.highlight ? ' about-hl' : ''}`}
                  >
                    {char.ch}
                  </span>
                ))}
              </span>
            )
          )}
        </p>
      </div>

      {/* Sticker wall: an "open to work" sticker leads, then tag stickers and
          red stars pop in beside the paragraph as it types. Decorative —
          absolute, and hidden on smaller screens so the text keeps its
          full column. */}
      <div className="about-side" data-stage={stage} aria-hidden="true">
        <svg className="about-side-arrow" viewBox="0 0 120 80" fill="none">
          <path d="M110 8C82 10 44 18 18 40" />
          <path d="M18 40 36 34M18 40 29 54" />
        </svg>

        <div className="about-side-stack">
          {[
            { label: 'open to work', at: 1, tilt: -3.4, lead: true },
            { label: 'Node.js', at: 1, tilt: 2.2 },
            { label: 'React', at: 2, tilt: -2.4 },
            { label: 'Pipecat', at: 2, tilt: 2.8 },
            { label: 'FastAPI', at: 3, tilt: -2 },
            { label: 'Python', at: 3, tilt: 2.6 },
          ].map((chip, i) => (
            <span
              key={chip.label}
              className={`about-chip${chip.lead ? ' lead' : ''}${stage >= chip.at ? ' pop' : ''}`}
              style={{ '--tilt': `${chip.tilt}deg`, '--d': i }}
            >
              <i aria-hidden="true">★</i>
              {chip.label}
            </span>
          ))}
        </div>

        {[
          { cls: 's1', at: 1 },
          { cls: 's2', at: 2 },
          { cls: 's3', at: 2 },
          { cls: 's4', at: 3 },
        ].map((star) => (
          <span
            key={star.cls}
            className={`about-star ${star.cls}${stage >= star.at ? ' pop' : ''}`}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    </section>
  );
}

/* â•â•â•â•â•â•â•â• EXPERIENCE (HORIZONTAL SCROLL) â•â•â•â•â•â•â•â• */




/* ════════ CONTACT ════════ */
function Contact() {
  return (
    <section className="contact" id="contact">
      <span className="cartoon-sticker contact-sticker" aria-hidden="true">open to work ★</span>
      <div className="contact-eyebrow reveal-up">Get In Touch</div>
      <h2 className="contact-heading"><TextReveal delay={0.05}>Let's create</TextReveal><br /><TextReveal delay={0.1}>something</TextReveal> <em><TextReveal delay={0.15}>great</TextReveal></em></h2>
      <div className="contact-links reveal-up">
        <a href="mailto:sujith7344@gmail.com" className="contact-btn primary" data-hover>Email ↗</a>
        <a href="https://github.com/thesujith23" target="_blank" rel="noreferrer" className="contact-btn" data-hover>GitHub ↗</a>
        <a href="https://www.linkedin.com/in/sujith-s-625846397/" target="_blank" rel="noreferrer" className="contact-btn" data-hover>LinkedIn ↗</a>
      </div>
    </section>
  );
}

/* ════════ PIKACHU PET ════════ */
function PikaPet() {
  const petRef = useRef(null);
  const posRef = useRef((() => {
    if (typeof window === 'undefined') return { x: 300, y: 300 };
    // Start in a side lane, low on small screens, so it never lands on the copy.
    const narrow = window.innerWidth <= 768;
    return {
      x: window.innerWidth - (narrow ? 120 : 150),
      y: narrow ? window.innerHeight - 190 : window.innerHeight * 0.62,
    };
  })());
  const targetRef = useRef({ ...posRef.current });
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const draggingRef = useRef(false);
  const thrownRef = useRef(false);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 300, y: 300 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [frame, setFrame] = useState(0);
  const [petState, setPetState] = useState('idle');
  const [facingLeft, setFacingLeft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [bubble, setBubble] = useState({ section: '⚡', msg: 'Pika pika!', show: true });
  const [visible, setVisible] = useState(false);
  const [seated, setSeated] = useState(false);
  const [boarding, setBoarding] = useState(false);
  const [expression, setExpression] = useState('idle');
  const [action, setAction] = useState('');
  const nearSlideRef = useRef(false);
  const ridingRef = useRef(false);
  const lastMoveRef = useRef(Date.now());
  const onSlideRef = useRef(false);
  const wasRidingRef = useRef(false);
  const boardAtRef = useRef(0);
  const ridePhaseRef = useRef('gone');

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 1200);
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Random wander
    const wanderInterval = setInterval(() => {
      // Never wander while it is being dragged, riding, or near the chute.
      if (draggingRef.current || ridingRef.current || nearSlideRef.current) return;
      const pad = 70;
      const vw = window.innerWidth;
      // Keep to the side lanes so the pet never parks on top of the copy.
      const lane = Math.max(90, vw * 0.15);
      let newY = pad + Math.random() * (window.innerHeight - pad * 2);
      let newX = Math.random() < 0.5
        ? pad + Math.random() * lane
        : vw - pad - 60 - Math.random() * lane;

      if (window.innerWidth <= 768) {
        // Guide mobile user to tap timeline buttons if visible
        const indicators = document.querySelectorAll('.exp-hover-indicator');
        let guided = false;
        for (let i = 0; i < indicators.length; i++) {
          const rect = indicators[i].getBoundingClientRect();
          // Find the first indicator that is well within the screen
          if (rect.top > 100 && rect.bottom < window.innerHeight - 100) {
            newX = rect.left - 50;
            newY = rect.top - 10;
            guided = true;
            window.dispatchEvent(new CustomEvent('pika-speak', { detail: { section: '👆', msg: 'Tap to expand!' } }));
            break;
          }
        }

        if (!guided) {
          newY = window.innerHeight - 150 + Math.random() * 50; // Keep at bottom
        }
      }

      targetRef.current = { x: newX, y: newY };
    }, 3000 + Math.random() * 3000);

    // Section guide
    const sections = [
      { id: '#home', section: '⚡', msg: 'Pika pika! Welcome!' },
      { id: '#about', section: '👤', msg: 'About Sujith!' },
      { id: '#experience', section: '💼', msg: 'Work & Education!' },
      { id: '#work', section: '🚀', msg: 'These projects are so cool!' },
      { id: '#skills', section: '🔧', msg: 'Tech stack!' },
      { id: '#contact', section: '📬', msg: 'Say hello!' }
    ];
    const triggers = [];
    sections.forEach((sec) => {
      const el = document.querySelector(sec.id);
      if (el) {
        triggers.push(ScrollTrigger.create({
          trigger: el, start: 'top center', end: 'bottom center',
          onEnter: () => setBubble({ section: sec.section, msg: sec.msg, show: true }),
          onEnterBack: () => setBubble({ section: sec.section, msg: sec.msg, show: true }),
        }));
      }
    });

    const onPikaSpeak = (e) => {
      setBubble({ section: e.detail.section, msg: e.detail.msg, show: true });
    };
    window.addEventListener('pika-speak', onPikaSpeak);

    // Drag handlers
    const onDragMove = (e) => {
      if (!draggingRef.current) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      posRef.current.x = cx - dragOffsetRef.current.x;
      posRef.current.y = cy - dragOffsetRef.current.y;
      targetRef.current = { ...posRef.current };
      if (petRef.current) {
        petRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      }
    };
    const onDragEnd = (e) => {
      if (!draggingRef.current) return;
      const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const movedDist = Math.hypot(cx - dragStartRef.current.x, cy - dragStartRef.current.y);
      draggingRef.current = false;
      setIsDragging(false);
      targetRef.current = { ...posRef.current };
      lastMoveRef.current = Date.now();
      if (movedDist < 6) {
        setPetState('jumping');
        setExpression('happy');
        setAction('pounce');
        window.setTimeout(() => setExpression('idle'), 1300);
        window.setTimeout(() => setAction(''), 700);
        setBubble({ section: '\u26A1', msg: 'Pika pika!!', show: true });
        setTimeout(() => {
          setPetState('sparking');
          setTimeout(() => { setPetState('idle'); lastMoveRef.current = Date.now(); }, 600);
        }, 450);
      } else {
        thrownRef.current = true;
        setPetState('tumbling');
        setBubble({ section: '\u26A1', msg: 'Wheee!', show: true });
      }
    };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);

    // Main animation loop
    let walkFrame = 0;
    let fc = 0;
    window._zapping = false;
    window._lastZap = Date.now();

    // Cache the anchor elements once instead of querying them every frame.
    const els = {
      matter: document.querySelector('#matter-word'),
      path: document.querySelector('#pika-lightning-path'),
      coaster: document.querySelector('.exp-section'),
      seat: document.querySelector('#slide-seat'),
      book: document.querySelector('.resume-btn-wrap'),
    };
    // Reading layout every frame is what makes a fixed sprite feel laggy, so
    // the page anchors are measured ~11x a second and reused in between.
    const rectCache = { at: 0, matter: null, coaster: null, book: null };

    const loop = () => {
      const pos = posRef.current;

      if (draggingRef.current) {
        velocityRef.current.x = pos.x - lastPosRef.current.x;
        velocityRef.current.y = pos.y - lastPosRef.current.y;
        lastPosRef.current = { ...pos };
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (thrownRef.current) {
        pos.x += velocityRef.current.x;
        pos.y += velocityRef.current.y;
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;

        // Bounce off edges
        if (pos.x <= 10) { pos.x = 10; velocityRef.current.x *= -0.8; setFacingLeft(false); }
        if (pos.x >= window.innerWidth - 90) { pos.x = window.innerWidth - 90; velocityRef.current.x *= -0.8; setFacingLeft(true); }
        if (pos.y <= 10) { pos.y = 10; velocityRef.current.y *= -0.8; }
        if (pos.y >= window.innerHeight - 90) { pos.y = window.innerHeight - 90; velocityRef.current.y *= -0.8; }

        if (Math.hypot(velocityRef.current.x, velocityRef.current.y) < 0.8) {
          thrownRef.current = false;
          targetRef.current = { ...pos };
          setPetState('idle');
          setBubble({ section: '\u26A1', msg: 'Oof! That was fun!', show: true });
        }

        if (petRef.current) {
          petRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
        lastPosRef.current = { ...pos };
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const now = Date.now();
      if (!window._lastZap) window._lastZap = now;
      const matterEl = els.matter;
      const pathEl = els.path;

      const stamp = typeof performance !== 'undefined' ? performance.now() : now;
      if (!rectCache.at || stamp - rectCache.at > 90) {
        rectCache.at = stamp;
        rectCache.matter = matterEl ? matterEl.getBoundingClientRect() : null;
        rectCache.coaster = els.coaster ? els.coaster.getBoundingClientRect() : null;
        rectCache.book = els.book ? els.book.getBoundingClientRect() : null;
      }

      if (window._zapping) {
        const zapElapsed = Date.now() - window._lastZap;

        if (window._zapPhase === 'just-charging') {
          if (petRef.current) {
            petRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
          }
          rafRef.current = requestAnimationFrame(loop);
          return;
        }

        if (zapElapsed > 500 && window._zapPhase === 'charging') {
          window._zapPhase = 'shooting';
          if (pathEl) pathEl.style.opacity = 1;
          play('zap');
        }

        if (matterEl && pathEl && window._zapPhase === 'shooting') {
          const shootElapsed = zapElapsed - 500;
          let progress = Math.min(1, shootElapsed / 150); // Takes 150ms to shoot

          const rect = matterEl.getBoundingClientRect();
          const targetEndX = rect.left + rect.width / 2;
          const targetEndY = rect.top + rect.height / 2;
          const startX = pos.x + 45;
          const startY = pos.y + 45;

          const endX = startX + (targetEndX - startX) * progress;
          const endY = startY + (targetEndY - startY) * progress;

          let pathStr = `M ${startX} ${startY} `;
          const steps = 8;
          for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const px = startX + (endX - startX) * t + (Math.random() - 0.5) * (80 * progress);
            const py = startY + (endY - startY) * t + (Math.random() - 0.5) * (80 * progress);
            pathStr += `L ${px} ${py} `;
          }
          pathStr += `L ${endX} ${endY}`;
          pathEl.setAttribute('d', pathStr);

          if (progress >= 1 && !window._matterCharged) {
            window._matterCharged = true;
            matterEl.classList.add('matter-charged');
          }
        }
        if (petRef.current) {
          petRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Visible if its top is above the viewport bottom AND its bottom below the top.
      const isMatterVisible = Boolean(
        rectCache.matter && rectCache.matter.top < window.innerHeight && rectCache.matter.bottom > 0
      );

      const zapInterval = isMatterVisible ? 3000 : 10000;

      if (now - window._lastZap > zapInterval && !draggingRef.current && !thrownRef.current) {
        window._lastZap = now;
        window._zapping = true;

        if (isMatterVisible) {
          window._zapPhase = 'charging';
          window._matterCharged = false;

          playChirp(0.35);

          const rect = matterEl.getBoundingClientRect();
          setPetState(prev => prev !== 'sparking' ? 'sparking' : prev);
          setFacingLeft((rect.left + rect.width / 2) < pos.x + 45);

          if (pathEl) pathEl.style.opacity = 0;

          setTimeout(() => {
            if (pathEl) pathEl.style.opacity = 0;
            if (matterEl) matterEl.classList.remove('matter-charged');
            window._zapping = false;
            setPetState('idle');
            window._lastZap = Date.now();
          }, 1500);
        } else {
          window._zapPhase = 'just-charging';
          playChirp(0.35);
          setPetState(prev => prev !== 'sparking' ? 'sparking' : prev);

          setTimeout(() => {
            window._zapping = false;
            setPetState('idle');
            window._lastZap = Date.now();
          }, 500);
        }

        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const mouse = mouseRef.current;
      const distToMouse = Math.hypot(mouse.x - pos.x, mouse.y - pos.y);
      let followTarget = targetRef.current;
      let bookHovered = false;
      let timelineHovered = false;

      const seat = els.seat;
      const phase = seat?.dataset.phase || 'gone';
      ridePhaseRef.current = phase;

      // Is the chute on screen at all? While it is, the pet stays nearby.
      const cRect = rectCache.coaster;
      const slideOnScreen = Boolean(cRect && cRect.bottom > 0 && cRect.top < window.innerHeight);
      nearSlideRef.current = slideOnScreen;

      let seatPoint = null;
      // The rider publishes the seat in screen space every frame it runs, so
      // this side needs no layout read at all while riding the chute.
      const published = window.__pikaSeat;
      if (seat && phase !== 'gone' && published && published.phase !== 'gone') {
        // The seat anchor is where Pikachu's feet belong.
        if (published.y > -160 && published.y < window.innerHeight + 160) {
          seatPoint = { x: published.x - 29, y: published.y - 58 };
          followTarget = seatPoint;
          timelineHovered = true;
        }
      }

      if (!seatPoint) {
        ridingRef.current = false;
      } else if (ridingRef.current) {
        // A page jump should not drag the pet across the screen.
        if (Math.hypot(seatPoint.x - pos.x, seatPoint.y - pos.y) > 340) ridingRef.current = false;
      } else if (phase !== 'fall') {
        // It hurries to the chute and hops on when it arrives: no fading out,
        // no teleporting between sections.
        const dToSeat = Math.hypot(seatPoint.x - pos.x, seatPoint.y - pos.y);
        if (dToSeat <= 18) {
          ridingRef.current = true;
          boardAtRef.current = Date.now();
          setBoarding(true);
          window.setTimeout(() => setBoarding(false), 320);
          setAction('pounce');
          window.setTimeout(() => setAction(''), 700);
          playChirp(0.32);
          play('zap', { volume: 0.4 });
          setPetState('jumping');
        }
      }

      if (ridingRef.current) timelineHovered = true;

      const bookEl = els.book;

      const bookRect = rectCache.book;
      if (bookEl && bookRect && !timelineHovered) {
        if (mouse.x >= bookRect.left && mouse.x <= bookRect.right && mouse.y >= bookRect.top && mouse.y <= bookRect.bottom) {
          bookHovered = true;
          // Place Pikachu to the left of the book
          followTarget = { x: bookRect.left - 100, y: bookRect.bottom - 80 };
        }
      }

      if (window.innerWidth > 768 && !bookHovered && !timelineHovered && distToMouse < 180) {
        followTarget = { x: mouse.x - 40, y: mouse.y - 40 };
      }

      const dx = followTarget.x - pos.x;
      const dy = followTarget.y - pos.y;
      const dist = Math.hypot(dx, dy);

      onSlideRef.current = ridingRef.current;

      if (ridingRef.current && seatPoint) {
        // Welded to the seat: no spring, so it can never drift off the chute.
        pos.x = seatPoint.x;
        pos.y = seatPoint.y;
        setFacingLeft(false);
        setFrame(3);
        if (petRef.current) {
          petRef.current.style.setProperty('--slide-tilt', seat.dataset.tilt || '0deg');
        }

        wasRidingRef.current = true;

        if (phase === 'fall') {
          setSeated(false);
          setPetState('falling');
        } else if (phase === 'approach' || phase === 'rest') {
          setSeated(true);
          setPetState('idle');
        } else if (Date.now() - boardAtRef.current > 420) {
          setSeated(true);
          setPetState('riding');
        }
        lastMoveRef.current = Date.now();
      } else if (dist > 5) {
        if (wasRidingRef.current) {
          wasRidingRef.current = false;
          ridingRef.current = false;
          setSeated(false);
          playChirp(0.3);
        }
        let speed = (distToMouse < 150 || bookHovered) ? 1.8 : 2.5;
        // Headed for the chute? Get there quickly so it never trails behind.
        if (seatPoint) speed = 11;
        pos.x += (dx / dist) * speed;
        pos.y += (dy / dist) * speed;
        pos.x = Math.max(10, Math.min(window.innerWidth - 90, pos.x));
        pos.y = Math.max(10, Math.min(window.innerHeight - 90, pos.y));
        setFacingLeft(dx < 0);
        fc++;
        if (fc % 8 === 0) { walkFrame = walkFrame === 1 ? 2 : 1; setFrame(walkFrame); }
        setPetState('walking');
        lastMoveRef.current = Date.now();
      } else {
        setFrame(0);
        if (bookHovered) {
          setFacingLeft(false); // Make sure Pikachu faces the book (right)
          setPetState(prev => prev !== 'idle' ? 'idle' : prev);
        } else {
          const newState = Date.now() - lastMoveRef.current > 8000 ? 'sleeping' : 'idle';
          setPetState(prev => prev !== newState ? newState : prev);
        }
      }

      if (petRef.current) {
        petRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      }
      lastPosRef.current = { ...pos };
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      clearTimeout(showTimer);
      clearInterval(wanderInterval);
      cancelAnimationFrame(rafRef.current);
      triggers.forEach(t => t.kill());
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('pika-speak', onPikaSpeak);
    };
  }, []);

  // Random moods — blinking itself is pure CSS on the sprite.
  useEffect(() => {
    let nextTimer;
    let resetTimer;
    const schedule = () => {
      nextTimer = window.setTimeout(() => {
        const pool = ['happy', 'wink', 'love', 'derp', 'happy', 'idle'];
        setExpression(pool[Math.floor(Math.random() * pool.length)]);
        resetTimer = window.setTimeout(() => setExpression('idle'), 1900);
        schedule();
      }, 6500 + Math.random() * 6500);
    };
    schedule();
    return () => {
      window.clearTimeout(nextTimer);
      window.clearTimeout(resetTimer);
    };
  }, []);

  // Cat-like idle beats: loaf, head tilt, stretch, yawn.
  useEffect(() => {
    let nextTimer;
    let resetTimer;
    const schedule = () => {
      nextTimer = window.setTimeout(() => {
        const pool = ['loaf', 'tilt', 'stretch', 'yawn'];
        setAction(pool[Math.floor(Math.random() * pool.length)]);
        resetTimer = window.setTimeout(() => setAction(''), 1700);
        schedule();
      }, 9000 + Math.random() * 9000);
    };
    schedule();
    return () => {
      window.clearTimeout(nextTimer);
      window.clearTimeout(resetTimer);
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (onSlideRef.current) {
      window.dispatchEvent(new CustomEvent('pika-boost'));
      return;
    }
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    draggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: cx, y: cy };
    dragOffsetRef.current = { x: cx - posRef.current.x, y: cy - posRef.current.y };
    setPetState('idle');
    setExpression('shock');
    window.setTimeout(() => setExpression('idle'), 900);
    setBubble({ section: '\u26A1', msg: 'Pika~?!', show: true });
  };


  const cls = ['pika-pet', visible && 'visible', seated && 'seated', facingLeft && 'face-left', isDragging && 'dragging', boarding && 'boarding', petState === 'walking' && 'walking', petState === 'jumping' && 'jumping', petState === 'falling' && 'falling', petState === 'tumbling' && 'tumbling', petState === 'sparking' && 'sparking', petState === 'sleeping' && 'sleeping', petState === 'riding' && 'on-slide', action].filter(Boolean).join(' ');
  const sprCls = petState === 'sleeping' ? 'sleeping' : petState === 'walking' ? '' : petState === 'riding' ? 'seated' : 'idle';
  const shownExpression = petState === 'sleeping'
    ? 'sleepy'
    : isDragging || petState === 'sparking' || petState === 'falling'
      ? 'shock'
      : petState === 'riding'
        ? 'happy'
        : expression;

  return (
    <>
      <svg id="pika-lightning-svg" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9998, overflow: 'visible' }}>
        <path id="pika-lightning-path" fill="none" stroke="#FFD700" strokeWidth="3" filter="drop-shadow(0 0 8px #FFD700)" />
      </svg>
      <div className={cls} ref={petRef} style={{ transform: `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`, left: 0, top: 0 }} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
        <div className={`pika-bubble ${bubble.show ? 'show' : ''}`}>
          <span className="pika-bubble-section">{bubble.section}</span>{bubble.msg}
        </div>
        <div className="pika-zzz">zzZ</div>
        <div className={`pika-sprite ${sprCls}`} data-frame={frame}>
          <PikaSprite expression={shownExpression} />
          <div className="pika-shadow" />
        </div>
        <div className="pika-sparks">
          <div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" />
        </div>
        <div className="pika-dust" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </div>
    </>
  );
}







/* â•â•â•â•â•â•â•â• APP â•â•â•â•â•â•â•â• */
export default function App() {
  const [loaded, setLoaded] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('sujith-visited') === '1';
    } catch {
      return false;
    }
  });

  const handleLoaderDone = useCallback(() => {
    try {
      window.sessionStorage.setItem('sujith-visited', '1');
    } catch {
      /* private mode */
    }
    setLoaded(true);
  }, []);

  // One delegated listener for every click and hover sound.
  useEffect(() => attachGlobalSounds(), []);

  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis = null;
    let ticker = null;

    if (!reduceMotion) {
      // Slow, long glide on wheel; touch stays native, which is smoother on phones.
      lenis = new Lenis({
        // Duration mode (not lerp) so the glide takes the same wall-clock time
        // on a 60Hz laptop and a 120Hz screen instead of running twice as fast.
        duration: 2.05,
        easing: (t) => 1 - Math.pow(1 - t, 3.4),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWheel: true,
        syncTouch: false,
        mouseMultiplier: 0.78,
        touchMultiplier: 1.5,
        infinite: false,
      });
      window.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);

      ticker = (time) => { lenis.raf(time * 1000); };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }

    // Reveal observer
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach((el) => obs.observe(el));

    // Accent colour follows the section you are in.
    const accents = [
      ['#home', '#F62440', '246, 36, 64'],
      ['#about', '#F65540', '246, 85, 64'],
      ['#education', '#22D3EE', '34, 211, 238'],
      ['#work', '#A78BFA', '167, 139, 250'],
      ['#skills', '#F62440', '246, 36, 64'],
      ['#contact', '#F62440', '246, 36, 64'],
    ];
    const accentTriggers = accents
      .map(([selector, color, rgb]) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => {
            if (!self.isActive) return;
            root.style.setProperty('--accent', color);
            root.style.setProperty('--accent-rgb', rgb);
          },
        });
      })
      .filter(Boolean);

    return () => {
      if (ticker) gsap.ticker.remove(ticker);
      if (lenis) {
        lenis.destroy();
        if (window.lenis === lenis) window.lenis = null;
      }
      obs.disconnect();
      accentTriggers.forEach((t) => t.kill());
      root.style.setProperty('--accent', '#F62440');
      root.style.setProperty('--accent-rgb', '246, 36, 64');
    };
  }, [loaded]);

  return (
    <>
      <Cursor />
      <SoundToggle />
      {!loaded && <Loader onDone={handleLoaderDone} />}
      <Nav />
      <main>
        <Hero ready={loaded} />
        <About />
        <ExperienceTimeline />
        <ProjectsSection />
        <SkillsSection />
        <Contact />
      </main>
      <PikaPet />
      <footer className="footer">
        <span>Â© 2026 Sujith</span>
        <span>Designed & Built with React + GSAP</span>
        <a href="https://github.com/thesujith23" target="_blank" rel="noreferrer">github.com/thesujith23</a>
      </footer>
    </>
  );
}

