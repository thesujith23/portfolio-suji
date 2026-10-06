import ThreeSlide from './ThreeSlide';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValueEvent } from 'framer-motion';


// ── Scroll-Linked Character
const ScrollChar = ({ char, progress, dist, maxDist, autoPlay, delay, isInView }) => {
  const startRange = maxDist === 0 ? 0 : (dist / maxDist) * 0.6;
  const endRange = Math.min(1, startRange + 0.4);
  const yScroll = useTransform(progress, [startRange, endRange], ['-120%', '0%']);
  const opacityScroll = useTransform(progress, [startRange, endRange], [0, 1]);
  return (
    <motion.span
      style={autoPlay ? { display: 'inline-block' } : { display: 'inline-block', y: yScroll, opacity: opacityScroll }}
      initial={autoPlay ? { y: '-120%', opacity: 0 } : {}}
      animate={autoPlay && isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: delay + dist * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      {char}
    </motion.span>
  );
};

const TextReveal = ({ children, className = '', autoPlay = false, delay = 0 }) => {
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
    period: 'Apr 2026 – Present',
    type: 'Work Experience',
    title: 'Software Engineer',
    org: 'Trikon Software Labs',
    shortDesc: 'Real-time AI voice platform & AI appointment booking.',
    color: '#f97316',
    accent: '#ea580c',
    icon: '💼',
    tags: ['Pipecat', 'Python', 'Supabase', 'Codex'],
    fullDesc: [
      'Developed a real-time, model-agnostic conversational AI backend using Pipecat and FastAPI, integrated with multiple STT, TTS, and LLM providers via WebSockets.',
      'Streamlined daily development with an AI-first workflow, used Codex CLI for implementation, Plan Mode to scope tasks before coding, and the Grill-Me skill to stress-test designs and surface edge cases early, reducing rework.',
      'VoiceAgentDoctor — Built a custom diagnostic skill to analyze and optimize real-time voice-agent latency, interruptions, and STT–LLM–TTS performance using Pipecat.'
    ],
    achievement: 'AI Voice Platform',
    side: 'left',
    gapMonths: 0,
  },
  {
    id: 2,
    period: 'Aug 2025',
    type: 'Education',
    title: 'Master of Computer Applications',
    org: 'NMAM Institute of Technology',
    shortDesc: 'Advanced software engineering & full-stack tech.',
    color: '#22d3ee',
    accent: '#0891b2',
    icon: '🏫',
    tags: ['Computer Science', 'Web Tech', 'Data Structures'],
    fullDesc: 'Focused on advanced software engineering, data structures, and full-stack web technologies.',
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
    shortDesc: 'Foundation in CS and database management.',
    color: '#ec4899',
    accent: '#db2777',
    icon: '🎓',
    tags: ['Programming', 'Databases', 'Networking'],
    fullDesc: 'Foundation in computer science, programming languages, and database management.',
    achievement: 'Graduation',
    side: 'left',
    gapMonths: 0,
  },
];

// ── Creative Experience Popup
function ExperiencePopup({ exp, onClose }) {
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
            className="fixed top-0 right-0 h-full z-[9991] flex flex-col"
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
                    {exp.type} · {exp.period}
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

            {/* Close button */}
            <motion.button
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
function ExperienceCard({ exp, onOpen }) {
  return (
    <motion.div
      className="timeline-content cursor-pointer select-none"
      initial={{ opacity: 0, scale: 0.1, y: 50, filter: 'hue-rotate(90deg)' }}
      whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'hue-rotate(0deg)' }}
      viewport={{ once: true, margin: '-45% 0px -45% 0px' }}
      transition={{ type: 'spring', damping: 8, stiffness: 300, mass: 0.5 }}
      whileHover={{
        scale: 1.05, y: -4,
        boxShadow: `0 16px 40px ${exp.color}25`,
        borderColor: `${exp.color}50`,
      }}
      onClick={() => onOpen(exp)}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Color accent bar on left edge */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{ background: `linear-gradient(180deg, ${exp.accent}, ${exp.color})` }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      />

      <div className="pl-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="mono text-orange" style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            {exp.period}
          </div>
          <span
            className="font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider shrink-0"
            style={{ background: `${exp.color}15`, color: exp.color, border: `1px solid ${exp.color}30` }}
          >
            {exp.type}
          </span>
        </div>

        <h3 style={{ marginBottom: '0.25rem', fontFamily: 'Oswald, sans-serif' }}>{exp.title}</h3>
        <p className="mono text-blue">{exp.org}</p>
        <p className="desc">{exp.shortDesc}</p>

        {/* Click hint */}
        <motion.div
          className="flex items-center gap-1 mt-2 font-mono text-[10px] uppercase tracking-widest"
          style={{ color: exp.color, opacity: 0.6 }}
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          click to expand →
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Component
const ExperienceTimeline = () => {
  const [activeExp, setActiveExp] = useState(null);
  const timelineRef = useRef(null);

  const { scrollYProgress: timelineScroll } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });

  // Playful Children's Slide Path
  let slidePath = `M 100 0`;
  for (let i = 1; i <= 60; i++) {
    const t = i / 60;
    // Sweeping curves like a playground slide
    const x = 100 + Math.sin(t * Math.PI * 3.5) * 65; 
    slidePath += ` L ${x} ${t * 1000}`;
  }
  const pikaLeft = useTransform(timelineScroll, (t) => `calc(50% + ${Math.sin(t * Math.PI * 3.5) * 32.5}%)`);
  const dogOpacity = useTransform(timelineScroll, [0.9, 1], [1, 0]);

  const [pikaMessage, setPikaMessage] = useState('Work Experience');

  useMotionValueEvent(timelineScroll, "change", (latest) => {
    if (latest < 0.05) {
      setPikaMessage(''); 
    } else if (latest < 0.3) {
      setPikaMessage('Work'); // Trikon
    } else if (latest < 0.5) {
      setPikaMessage('Education (MCA)'); // NMAM
    } else if (latest < 0.7) {
      setPikaMessage('Work'); // Intern 1
    } else if (latest < 0.9) {
      setPikaMessage('Work'); // Intern 2
    } else {
      setPikaMessage('Education (BCA)'); // BCA
    }
  });

  useEffect(() => {
    if (pikaMessage) {
      window.dispatchEvent(new CustomEvent('pika-speak', { detail: { section: '💼', msg: pikaMessage } }));
    }
  }, [pikaMessage]);

  return (
    <>
      <ExperiencePopup exp={activeExp} onClose={() => setActiveExp(null)} />

      <section id="education" className="section">
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
            <h2 style={{ marginTop: '0.5rem' }}>
              <TextReveal delay={0.05}>Experience</TextReveal>
            </h2>
            <motion.p
              className="font-mono text-xs mt-2"
              style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              click any card for full details
            </motion.p>
          </div>

          <div className="timeline-container" ref={timelineRef}>
            <ThreeSlide />

            {/* Invisible target for global PikaPet (sliding down the curvy slide) */}
            <motion.div 
              id="timeline-pika-target" 
              style={{ 
                position: 'absolute',
                left: pikaLeft,
                top: useTransform(timelineScroll, [0, 1], ['0%', '100%']), 
                x: '-50%',
                width: '0px',
                height: '0px'
              }} 
            />

            {/* Experience Cards */}
            {experiences.map((exp, i) => (
              <div
                key={exp.id}
                className={`timeline-item ${exp.side}`}
                style={{ marginTop: i === 0 ? '100px' : `${Math.max(40, exp.gapMonths * 12)}px` }}
              >
                <ExperienceCard exp={exp} onOpen={setActiveExp} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ExperienceTimeline;
