import ThreeSlide from './ThreeSlide';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion, useScroll, useTransform, useSpring, useInView, AnimatePresence,
} from 'framer-motion';
import { play } from '../lib/sound';
import SlideRider from './SlideRider';


// ── Scroll-Linked Character
const ScrollChar = ({ char, progress, dist, maxDist, autoPlay, delay, isInView }) => {
  const startRange = maxDist === 0 ? 0 : (dist / maxDist) * 0.6;
  const endRange = Math.min(1, startRange + 0.4);
  const yScroll = useTransform(progress, [startRange, endRange], ['-40%', '0%']);
  const opacityScroll = useTransform(progress, [startRange, endRange], [0.15, 1]);
  return (
    <motion.span
      style={autoPlay ? { display: 'inline-block' } : { display: 'inline-block', y: yScroll, opacity: opacityScroll }}
      initial={autoPlay ? { y: '-40%', opacity: 0 } : {}}
      animate={autoPlay && isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.9, delay: delay + dist * 0.02, ease: [0.22, 1, 0.36, 1] }}
    >
      {char}
    </motion.span>
  );
};

export const TextReveal = ({ children, className = '', autoPlay = false, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 95%', 'center center'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 25, restDelta: 0.001 });
  let text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children);
  const words = text.split(' ');
  const totalChars = words.join('').length;
  const midIndex = Math.floor((totalChars - 1) / 2);
  const maxDist = Math.max(midIndex, totalChars - 1 - midIndex);
  let charCount = 0;
  return (
    <span ref={ref} className={className} style={{ display: 'inline-flex', flexWrap: 'wrap', columnGap: '0.25em' }}>
      {words.map((word, wIdx) => (
        <span key={wIdx} style={{ display: 'inline-flex', overflow: 'hidden', paddingBottom: '0.15em', marginBottom: '-0.15em' }}>
          {word.split('').map((char, cIdx) => {
            const currentIdx = charCount++;
            const dist = Math.abs(currentIdx - midIndex);
            return <ScrollChar key={cIdx} char={char} progress={smoothProgress} dist={dist} maxDist={maxDist} autoPlay={autoPlay} delay={delay} isInView={isInView} />;
          })}
        </span>
      ))}
    </span>
  );
};

// 🐕 Pixel Dog
export const PixelPikachu = ({ isRunning = false }) => (
  <svg viewBox="0 0 32 32" width="64" height="64" className={isRunning ? 'pika-running' : 'pika-idle'} style={{ filter: 'drop-shadow(0 6px 18px rgba(255,204,0,0.45))' }}>
    <style>{`
      .pika-running .leg-fl { animation: run-fl 0.4s infinite linear; transform-origin: 9px 20px; }
      .pika-running .leg-fr { animation: run-fr 0.4s infinite linear; transform-origin: 20px 20px; }
      .pika-running .leg-bl { animation: run-bl 0.4s infinite linear; transform-origin: 11px 20px; }
      .pika-running .leg-br { animation: run-br 0.4s infinite linear; transform-origin: 18px 20px; }
      .pika-running .tail { animation: wag 0.15s infinite alternate ease-in-out; transform-origin: 4px 14px; }
      .pika-running .tongue { animation: pant 0.15s infinite alternate ease-in-out; transform-origin: 16px 11px; }
      @keyframes run-fl { 0%{transform:rotate(0deg)} 25%{transform:rotate(30deg)} 50%{transform:rotate(0deg)} 75%{transform:rotate(-30deg)} 100%{transform:rotate(0deg)} }
      @keyframes run-fr { 0%{transform:rotate(0deg)} 25%{transform:rotate(-30deg)} 50%{transform:rotate(0deg)} 75%{transform:rotate(30deg)} 100%{transform:rotate(0deg)} }
      @keyframes run-bl { 0%{transform:rotate(0deg)} 25%{transform:rotate(-30deg)} 50%{transform:rotate(0deg)} 75%{transform:rotate(30deg)} 100%{transform:rotate(0deg)} }
      @keyframes run-br { 0%{transform:rotate(0deg)} 25%{transform:rotate(30deg)} 50%{transform:rotate(0deg)} 75%{transform:rotate(-30deg)} 100%{transform:rotate(0deg)} }
      @keyframes wag { 0%{transform:rotate(-15deg)} 100%{transform:rotate(15deg)} }
      @keyframes pant { 0%{transform:scaleY(1)} 100%{transform:scaleY(1.5)} }
      .pika-idle .tail { animation: wag-slow 1s infinite alternate ease-in-out; transform-origin: 4px 14px; }
      @keyframes wag-slow { 0%{transform:rotate(-5deg)} 100%{transform:rotate(5deg)} }
    `}</style>
    {/* Ears */}
    <rect x="4" y="2" width="2" height="4" fill="#222" />
    <rect x="3" y="6" width="3" height="4" fill="#FFCC00" />
    <rect x="25" y="2" width="2" height="4" fill="#222" />
    <rect x="25" y="6" width="3" height="4" fill="#FFCC00" />
    {/* Tail */}
    <g className="tail">
      <rect x="1" y="9" width="4" height="2" fill="#FFCC00" />
      <rect x="0" y="11" width="3" height="3" fill="#FFCC00" />
      <rect x="3" y="14" width="4" height="3" fill="#8B4513" />
    </g>
    {/* Body */}
    <rect x="6" y="9" width="18" height="11" fill="#FFCC00" />
    <rect x="7" y="20" width="16" height="2" fill="#FFCC00" />
    {/* Cheeks */}
    <rect x="7" y="13" width="2" height="2" fill="#FF0000" />
    <rect x="21" y="13" width="2" height="2" fill="#FF0000" />
    {/* Eyes */}
    <rect x="10" y="11" width="2" height="2" fill="#222" />
    <rect x="18" y="11" width="2" height="2" fill="#222" />
    <rect x="11" y="11" width="1" height="1" fill="#FFF" />
    <rect x="19" y="11" width="1" height="1" fill="#FFF" />
    {/* Nose and Mouth */}
    <rect x="14" y="13" width="2" height="1" fill="#222" />
    <g className="tongue"><rect x="14" y="14" width="2" height="2" fill="#ff6b8a" /></g>
    {/* Legs */}
    <g className="leg-bl"><rect x="9" y="20" width="3" height="4" fill="#FFCC00" /></g>
    <g className="leg-br"><rect x="17" y="20" width="3" height="4" fill="#FFCC00" /></g>
    <g className="leg-fl"><rect x="11" y="20" width="3" height="4" fill="#FFCC00" /></g>
    <g className="leg-fr"><rect x="15" y="20" width="3" height="4" fill="#FFCC00" /></g>
  </svg>
);

// ── Experience data
const experiences = [
  {
    id: 1,
    period: 'Apr 2026 – Oct 2026',
    type: 'Work Experience',
    title: 'Software Engineer',
    org: 'Trikon Software Labs',
    shortDesc: 'Model-agnostic voice AI: Pipecat, FastAPI, WebSockets.',
    color: '#f97316',
    accent: '#ea580c',
    icon: '💼',
    tags: ['Pipecat', 'FastAPI', 'WebSockets', 'Next.js'],
    fullDesc: [
      'Built a real-time, model-agnostic conversational AI backend with Pipecat and FastAPI — multiple STT, TTS and LLM providers plus a Gemini speech-to-speech model, all streamed over WebSockets.',
      'Shipped the React/Next.js frontend for live voice sessions: real-time audio streaming, session management and clean interruption handling.',
      'Built VoiceAgentDoctor, a custom diagnostic skill that profiles live calls and tunes latency, interruptions and STT–LLM–TTS performance.',
      'Worked AI-first day to day — Codex CLI, Claude, Plan Mode, MCP and custom skills — scoping before coding and stress-testing designs early to cut rework.'
    ],
    achievement: 'Real-Time Voice AI',
    side: 'left',
    gapMonths: 0,
  },
  {
    id: 2,
    period: 'Aug 2025',
    type: 'Education',
    title: 'Master of Computer Applications',
    org: 'NMAM Institute of Technology',
    shortDesc: 'MCA — software engineering, data structures, full-stack web.',
    color: '#22d3ee',
    accent: '#0891b2',
    icon: '🏫',
    tags: ['Software Engineering', 'Data Structures', 'Full-Stack Web'],
    fullDesc: 'Master of Computer Applications, completed Aug 2025. Coursework centred on advanced software engineering, data structures and algorithms, and full-stack web technologies — the base I now build production Python, Node.js and React systems on.',
    achievement: 'Post Graduation',
    side: 'right',
    gapMonths: 8,
  },
  {
    id: 3,
    period: 'Jan 2025 – Mar 2025',
    type: 'Work Experience',
    title: 'Web App Dev Intern',
    org: 'MBL Technologies Pvt Ltd',
    shortDesc: 'Full-featured animal trust care platform.',
    color: '#34d399',
    accent: '#059669',
    icon: '💻',
    tags: ['React.js', 'State Management', 'REST APIs'],
    fullDesc: 'Built "Asare," a full-featured animal trust care platform using React.js. Reduced component re-renders by 20% through structured state management and integrated multiple third-party APIs.',
    achievement: 'Performance Optimization',
    side: 'left',
    gapMonths: 8,
  },
  {
    id: 4,
    period: 'Mar 2023 – Aug 2023',
    type: 'Work Experience',
    title: 'Software Dev Intern',
    org: 'Accolade Tech Solutions Pvt Ltd',
    shortDesc: 'Internal web applications using .NET and C#.',
    color: '#a78bfa',
    accent: '#7c3aed',
    icon: '⚙️',
    tags: ['.NET', 'C#', 'SQL Server', 'Backend'],
    fullDesc: 'Developed internal web applications using .NET and C#, delivering secure backend services. Optimized SQL Server schemas, reducing average query execution time by ~30%.',
    achievement: 'Query Optimization',
    side: 'right',
    gapMonths: 16,
  },
  {
    id: 5,
    period: 'July 2023',
    type: 'Education',
    title: 'Bachelor of Computer Applications',
    org: 'SDM College of Business Management',
    shortDesc: 'BCA — programming, SQL databases and computer networks.',
    color: '#ec4899',
    accent: '#db2777',
    icon: '🎓',
    tags: ['Java & C#', 'SQL Databases', 'Networking'],
    fullDesc: 'Bachelor of Computer Applications, completed Jul 2023. Covered programming fundamentals, relational databases and SQL, computer networks and business software — the groundwork for the .NET and SQL Server work that followed.',
    achievement: 'Graduation',
    side: 'left',
    gapMonths: 0,
  },
];

// ── Creative Experience Popup
function ExperiencePopup({ exp, index, total, onClose, onStep }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Lock the page, wire keyboard controls, restore on close.
  useEffect(() => {
    if (!exp) return;

    const lenis = window.lenis;
    try {
      lenis?.stop();
    } catch {
      /* lenis does not exist under reduced motion */
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80);

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight') {
        onStep(1);
      } else if (event.key === 'ArrowLeft') {
        onStep(-1);
      } else if (event.key === 'Tab') {
        const nodes = panelRef.current?.querySelectorAll(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || !nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      try {
        lenis?.start();
      } catch {
        /* nothing to restore */
      }
    };
  }, [exp, onClose, onStep]);

  return (
    <AnimatePresence>
      {exp && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9990]"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel — slides in from right */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={exp.title + ' at ' + exp.org}
            className="fixed top-0 right-0 h-full z-[9991] flex flex-col exp-panel"
            style={{
              width: 'min(560px, 100vw)',
              background: '#080808',
              borderLeft: `1px solid ${exp.color}30`,
              overflowY: 'auto',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top accent bar */}
            <motion.div
              className="w-full h-1 shrink-0"
              style={{ background: `linear-gradient(90deg, ${exp.accent}, ${exp.color})` }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />

            {/* Header */}
            <div className="p-8 pb-0 shrink-0">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span
                    className="font-mono text-xs tracking-widest uppercase mb-2 block"
                    style={{ color: exp.color }}
                  >
                    {exp.type} · {exp.period} · {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
                  </span>
                  <h2
                    className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight text-white"
                    style={{ fontFamily: 'Oswald, sans-serif', color: '#ffffff' }}
                  >
                    {exp.title}
                  </h2>
                  <p className="font-mono text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {exp.org}
                  </p>
                </div>
                {/* Icon bubble */}
                <motion.div
                  className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: `${exp.color}15`, border: `1px solid ${exp.color}40` }}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {exp.icon}
                </motion.div>
              </div>

              {/* Achievement badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-mono text-xs font-bold uppercase tracking-wider mb-6"
                style={{ background: `${exp.color}15`, border: `1px solid ${exp.color}40`, color: exp.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: exp.color }}
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                {exp.achievement}
              </motion.div>
            </div>

            {/* Divider */}
            <div className="mx-8 h-px mb-6" style={{ background: `${exp.color}20` }} />

            {/* Body */}
            <div className="px-8 pb-8 flex flex-col gap-6 flex-1">
              {/* Full description */}
              {Array.isArray(exp.fullDesc) ? (
                <motion.ul
                  className="list-disc pl-5 text-sm md:text-base leading-relaxed flex flex-col gap-2"
                  style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'IBM Plex Mono, monospace' }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {exp.fullDesc.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  className="text-sm md:text-base leading-relaxed whitespace-pre-line"
                  style={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'IBM Plex Mono, monospace' }}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {exp.fullDesc}
                </motion.p>
              )}

              {/* Skills */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  // Technologies & Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="font-mono text-xs px-3 py-1 rounded-sm uppercase tracking-wide"
                      style={{ background: `${exp.color}12`, color: exp.color, border: `1px solid ${exp.color}30` }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Giant watermark number */}
              <div
                className="mt-auto pt-8 font-black select-none pointer-events-none"
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: '8rem',
                  lineHeight: 1,
                  color: `${exp.color}08`,
                  letterSpacing: '-0.05em',
                }}
              >
                0{exp.id}
              </div>
            </div>

            {/* Step through the timeline */}
            <div className="exp-popup-nav">
              <button type="button" onClick={() => onStep(-1)} disabled={index <= 0} data-sound="none">
                ← Prev
              </button>
              <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
              <button type="button" onClick={() => onStep(1)} disabled={index >= total - 1} data-sound="none">
                Next →
              </button>
            </div>

            {/* Close button */}
            <motion.button
              ref={closeRef}
              className="fixed top-6 right-6 z-[9992] w-10 h-10 flex items-center justify-center rounded-full font-mono text-lg font-bold"
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
              onClick={onClose}
              whileHover={{ scale: 1.1, color: '#fff', borderColor: exp.color }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✕
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Experience Card
function ExperienceCard({ exp, index, onOpen, onHover }) {
  // Cards sit at a slight angle each side so the zig-zag reads hand-placed.
  const base = exp.side === 'left' ? -1.4 : 1.1;

  return (
    <motion.div
      className="timeline-content sticker-card cursor-pointer select-none"
      style={{ '--exp-color': exp.color, '--exp-tint': exp.color + '1f' }}
      initial={{ opacity: 0, y: 46, scale: 0.92, rotate: base * 3.2 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotate: base }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 180, damping: 15, mass: 0.7 }}
      whileHover={{ y: -5, rotate: base * 0.55, scale: 1.015 }}
      whileTap={{ scale: 0.965, y: 0 }}
      onClick={() => onOpen(exp)}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      role="button"
      tabIndex={0}
      aria-label={`${exp.title} at ${exp.org}, ${exp.period} — open details`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(exp);
        }
      }}
    >
      <span className="sticker-tape" aria-hidden="true" />
      <span className="sticker-icon" aria-hidden="true">{exp.icon}</span>
      <span className="sticker-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>

      <div className="sticker-inner">
        <div className="sticker-meta">
          <span className="sticker-period">{exp.period}</span>
          <span className="sticker-type">{exp.type}</span>
        </div>

        <h3>{exp.title}</h3>
        <p className="sticker-org">{exp.org}</p>
        <p className="desc">{exp.shortDesc}</p>

        {Array.isArray(exp.tags) && exp.tags.length > 0 && (
          <div className="exp-tags">
            {exp.tags.map((tag) => (
              <span className="exp-tag" key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <span className="exp-card-hint">click to expand →</span>
      </div>
    </motion.div>
  );
}

// ── Main Component
const ExperienceTimeline = () => {
  const timelineRef = useRef(null);
  const railRef = useRef(null);
  const itemRefs = useRef([]);

  const [activeStop, setActiveStop] = useState(0);
  const [hoverStop, setHoverStop] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(null);

  const goToStop = useCallback((i) => {
    const idx = Math.max(0, Math.min(experiences.length - 1, i));
    setActiveStop(idx);
    play('tick');
    const el = itemRefs.current[idx];
    if (!el) return;
    if (window.lenis) window.lenis.scrollTo(el, { offset: -120 });
    else el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const openExp = useCallback((exp) => {
    setActiveIndex(experiences.findIndex((item) => item.id === exp.id));
    play('open');
  }, []);

  const closeExp = useCallback(() => {
    setActiveIndex(null);
    play('close');
  }, []);

  const stepExp = useCallback((dir) => {
    setActiveIndex((current) => {
      if (current === null) return current;
      const next = Math.max(0, Math.min(experiences.length - 1, current + dir));
      if (next !== current) play('tick');
      return next;
    });
  }, []);

  // Which card currently sits in the middle of the viewport.
  useEffect(() => {
    const els = itemRefs.current.filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = els.indexOf(entry.target);
          if (i >= 0) setActiveStop(i);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Pikachu tells the section what it is riding past.
  useEffect(() => {
    const exp = experiences[activeStop];
    if (!exp) return;
    window.dispatchEvent(
      new CustomEvent('pika-speak', {
        detail: { section: exp.icon, msg: `${exp.type} · ${exp.org}` },
      }),
    );
  }, [activeStop]);

  // Tap Pikachu while it rides -> push it to the next stop.
  useEffect(() => {
    const onBoost = () => {
      goToStop(Math.min(activeStop + 1, experiences.length - 1));
      play('whoosh');
      play('sparkle', { volume: 0.5 });
    };
    window.addEventListener('pika-boost', onBoost);
    return () => window.removeEventListener('pika-boost', onBoost);
  }, [activeStop, goToStop]);

  const activeExp = activeIndex === null ? null : experiences[activeIndex];

  return (
    <>
      <ExperiencePopup
        exp={activeExp}
        index={activeIndex ?? 0}
        total={experiences.length}
        onClose={closeExp}
        onStep={stepExp}
      />

      <section id="education" className="section exp-section">
        <div className="container relative">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <motion.span
              className="mono system-comment"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              // section.experience
            </motion.span>
            <h2 style={{ marginTop: '0.5rem', fontFamily: '"Oswald", sans-serif', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(3rem,6vw,5rem)' }}>
              <TextReveal delay={0.05}>Experience</TextReveal>
            </h2>
            <motion.p
              className="font-mono text-xs mt-2"
              style={{ color: 'var(--muted)', letterSpacing: '0.1em' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              ride the slide — click any card for full details
            </motion.p>
          </div>

          <div className="exp-rail-wrap">
            <div
              className="exp-rail"
              ref={railRef}
              tabIndex={0}
              role="group"
              aria-label="Experience stops — use the arrow keys to step through them"
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  goToStop(activeStop + 1);
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                  event.preventDefault();
                  goToStop(activeStop - 1);
                }
              }}
            >
              <span className="exp-rail-line" aria-hidden="true" />
              <span
                className="exp-rail-fill"
                aria-hidden="true"
                style={{
                  transform: `scaleY(${(activeStop + 1) / experiences.length})`,
                  background: experiences[activeStop]?.color,
                }}
              />
              {experiences.map((exp, i) => (
                <button
                  key={exp.id}
                  type="button"
                  className={`exp-rail-stop${i === activeStop ? ' active' : ''}`}
                  style={{ '--stop-color': exp.color }}
                  onClick={() => goToStop(i)}
                  aria-current={i === activeStop ? 'true' : 'false'}
                  aria-label={`${exp.title} at ${exp.org}, ${exp.period}`}
                  data-sound="none"
                >
                  <span className="exp-rail-dot" />
                  <span className="exp-rail-year">{(exp.period.match(/\d{4}/) || [''])[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="timeline-container" ref={timelineRef}>
            <ThreeSlide activeIndex={activeStop} hoverIndex={hoverStop} />

            <SlideRider containerRef={timelineRef} />

            {experiences.map((exp, i) => (
              <div
                key={exp.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className={`timeline-item ${exp.side}`}
                style={{ marginTop: i === 0 ? '100px' : `${Math.max(40, exp.gapMonths * 12)}px` }}
              >
                <ExperienceCard
                  exp={exp}
                  index={i}
                  onOpen={openExp}
                  onHover={(on) => setHoverStop(on ? i : -1)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ExperienceTimeline;
