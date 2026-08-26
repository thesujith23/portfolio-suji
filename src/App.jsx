import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

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

    const move = (e) => { tx = e.clientX; ty = e.clientY; };
    const tick = () => {
      x += (tx - x) * 0.15; y += (ty - y) * 0.15;
      if (dot) { dot.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`; }
      if (sym) { sym.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0)`; }
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
          yPercent: -100, duration: 1.2, ease: 'power3.inOut',
          onComplete: onDone,
        });
      },
    });

    tl.to(barRef.current, {
      scaleX: 1, duration: 4.5, ease: 'power1.inOut',
    });

    // Counter
    const obj = { val: 0 };
    tl.to(obj, {
      val: 100, duration: 4.5, ease: 'power1.inOut',
      onUpdate: () => {
        if (counterRef.current) counterRef.current.textContent = Math.round(obj.val);
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
let audioCtx;
const playHoverSound = () => {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.06);
  } catch (e) {
    // Ignore audio context errors if browser blocks it before interaction
  }
};

function Magnetic({ children, strength = 0.4 }) {
  const magneticRef = useRef(null);
  
  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;
    
    const xTo = gsap.quickTo(el, "x", {duration: 1, ease: "elastic.out(1, 0.3)"});
    const yTo = gsap.quickTo(el, "y", {duration: 1, ease: "elastic.out(1, 0.3)"});

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width/2);
      const y = clientY - (top + height/2);
      xTo(x * strength);
      yTo(y * strength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    const handleMouseEnter = () => {
      playHoverSound();
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div ref={magneticRef} style={{ display: 'inline-flex' }}>
      {children}
    </div>
  );
}

/* ════════ HERO CANVAS (CSS Aurora) ════════ */
function HeroCanvas() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
       <div className="aurora-blob aurora-1"></div>
       <div className="aurora-blob aurora-2"></div>
       <div className="aurora-blob aurora-3"></div>
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
        {['About','Skills','Work','Contact'].map(l => {
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
const MagneticText = ({ text, strength = 0.8 }) => {
  const triggerPiano = (e) => {
    const el = e.currentTarget;
    el.style.transform = 'translateY(-20px)';
    el.style.color = 'var(--accent)';
    setTimeout(() => {
      el.style.transform = 'translateY(0)';
      el.style.color = '';
    }, 200);
  };

  return (
    <>
      {text.split('').map((char, index) => {
        if (char === ' ') return <span key={index}>&nbsp;</span>;
        return (
          <Magnetic key={index} strength={strength}>
            <span 
              className="piano-char"
              style={{ display: 'inline-block', whiteSpace: 'pre', transition: 'transform 0.2s, color 0.2s' }}
              onTouchStart={triggerPiano}
              onClick={triggerPiano}
            >
              {char}
            </span>
          </Magnetic>
        );
      })}
    </>
  );
};

function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ delay: 2.6 });
    tl.fromTo(el.querySelectorAll('.line-inner'), { yPercent: 120 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
    tl.fromTo(el.querySelector('.hero-pre span'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.5');
    tl.fromTo(el.querySelector('.hero-action'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
  }, []);

  return (
    <section className="hero" id="home" ref={ref} style={{ position: 'relative' }}>
      <HeroCanvas />
      <div className="hero-pre" style={{ position: 'relative', zIndex: 1 }}><span style={{ opacity: 0 }}>Software Engineer — Full Stack Developer</span></div>
      <h1 className="hero-title" style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticText text="Building" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span className="italic" style={{ whiteSpace: 'nowrap' }}><MagneticText text="digital" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticText text="experiences" strength={0.8} /></span></span></span>
        <span className="line" style={{ paddingBottom: '10px' }}><span className="line-inner"><span style={{ whiteSpace: 'nowrap' }}><MagneticText text="that" strength={0.8} /></span>&nbsp;<span className="outline" id="matter-word" style={{ whiteSpace: 'nowrap' }}><MagneticText text="matter" strength={0.8} /></span></span></span>
      </h1>

      <div className="hero-action" style={{ opacity: 0, position: 'absolute', bottom: '48px', right: '100px', zIndex: 10 }}>
        <Magnetic>
          <div className="resume-btn-wrap">
            <div className="resume-orbit">
              <span className="resume-orbit-dot"></span>
              <span className="resume-orbit-dot"></span>
              <span className="resume-orbit-dot"></span>
            </div>
            <a href="/SujithResume.pdf" target="_blank" rel="noopener noreferrer" className="resume-btn-creative" data-hover>
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
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const cursorRef = useRef(null);

  const content = [
    { text: "I'm " },
    { text: "Sujith,", highlight: true },
    { text: " a " },
    { text: "software engineer", highlight: true },
    { text: " who transforms complex problems into elegant, production-ready web applications. I build with " },
    { text: "React, Next.js,", highlight: true },
    { text: " and " },
    { text: "Node.js", highlight: true },
    { text: " — creating " },
    { text: "AI-integrated", highlight: true },
    { text: " platforms, secure " },
    { text: "REST APIs,", highlight: true },
    { text: " and data-driven dashboards that deliver real business value. Currently seeking to contribute to a " },
    { text: "product-focused", highlight: true },
    { text: " engineering team." }
  ];

  useEffect(() => {
    // Only select elements that are actually in the document (avoids HMR/unmount bugs)
    const chars = charsRef.current.filter(c => c && c.isConnected);
    const cursor = cursorRef.current;
    const container = containerRef.current;
    if (!chars.length || !sectionRef.current || !container) return;

    // Set all chars dim initially
    gsap.set(chars, { opacity: 0.15, color: '#999999' });

    // Guaranteed 100% Sync logic: We calculate everything manually inside onUpdate.
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      end: 'bottom 40%',
      scrub: true, // Use 'true' to perfectly bind to Lenis smooth scroll instead of adding artificial lag
      onUpdate: (self) => {
        const progress = self.progress;
        const targetIdx = Math.min(Math.floor(progress * chars.length), chars.length - 1);
        
        // Update characters only if their state changes
        chars.forEach((char, i) => {
          let state = 0; // 0: untyped, 1: actively typing, 2: fully typed
          if (progress === 1 || i < targetIdx - 2) {
            state = 2;
          } else if (i <= targetIdx) {
            state = 1;
          } else {
            state = 0;
          }
          
          if (char.dataset.state != state) {
            char.dataset.state = state;
            if (state === 2) {
              char.style.opacity = '1';
              char.style.color = char.dataset.highlight === 'true' ? '#F62440' : '#1a1a1a';
              char.style.textShadow = 'none';
            } else if (state === 1) {
              char.style.opacity = '1';
              char.style.color = '#F62440';
              char.style.textShadow = '0 0 12px #F62440';
            } else {
              char.style.opacity = '0.15';
              char.style.color = '#999999';
              char.style.textShadow = 'none';
            }
          }
        });

        // Update cursor to match the exact same index
        const target = chars[targetIdx];
        if (target && cursor && container) {
          const charRect = target.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          cursor.style.left = `${charRect.right - containerRect.left + 2}px`;
          cursor.style.top = `${charRect.top - containerRect.top}px`;
          cursor.style.height = `${charRect.height}px`;
          cursor.style.opacity = (progress > 0 && progress < 1) ? '1' : '0';
        }
      },
    });

    return () => ScrollTrigger.getAll().forEach(st => st.kill());
  }, []);

  // Split content into characters, preserving spaces
  let charIdx = 0;
  const rendered = content.map((segment, si) => (
    <span key={si} className={segment.highlight ? 'highlight-segment' : ''}>
      {segment.text.split(' ').map((word, wi, arr) => (
        <span key={wi} className="typewriter-word">
          {word.split('').map((ch) => {
            const idx = charIdx++;
            return (
              <span
                key={idx}
                className="typewriter-char"
                data-highlight={segment.highlight ? 'true' : 'false'}
                ref={(el) => { charsRef.current[idx] = el; }}
              >
                {ch}
              </span>
            );
          })}
          {wi < arr.length - 1 && (
            <span
              className="typewriter-char"
              data-highlight={segment.highlight ? 'true' : 'false'}
              ref={(el) => { charsRef.current[charIdx++] = el; }}
            >
              {' '}
            </span>
          )}
        </span>
      ))}
    </span>
  ));

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about-label">
        <span className="typewriter-terminal-tag">&gt;_ about.md</span>
        About Me
      </div>
      <div className="typewriter-container" ref={containerRef}>
        <p className="about-text typewriter-text">
          {rendered}
          <span className="typewriter-cursor" ref={cursorRef} />
        </p>
      </div>

    </section>
  );
}

/* â•â•â•â•â•â•â•â• EXPERIENCE (HORIZONTAL SCROLL) â•â•â•â•â•â•â•â• */

/* â•â•â•â•â•â•â•â• PROJECTS (3D DECK) â•â•â•â•â•â•â•â• */
function ProjectsDeck() {
  const containerRef = useRef(null);
  const [zoomedMedia, setZoomedMedia] = useState(null);

  const projects = [
    {
      idx: '01', name: 'BodySync-AI',
      meta: 'Intelligent Pose Detection & Fitness Tracker. An AI fitness assistant that uses pose estimation for real-time exercise tracking, form feedback, and performance analytics.',
      tags: ['MediaPipe', 'OpenCV', 'Python', 'Flask'],
      color: '#3d2fa9',
      isMobile: false,
      github: 'https://github.com/thesujith23/BodySyncAI-Intelligent-Pose-Detection-and-Fitness-Tracker'
    },
    {
      idx: '02', name: 'Expense Tracker & Analytics',
      meta: 'Secure multi-user financial tracking with JWT auth, role-protected routes, and MongoDB aggregation-powered real-time analytics dashboard.',
      tags: ['MERN', 'Recharts', 'JWT', 'Aggregation'],
      color: '#ff3c34',
      isMobile: true,
      liveUrl: 'https://expense-tracker-and-financial-analy-five.vercel.app/',
      liveBtnColor: '#111111',
      liveBtnText: '#ffffff',
      liveBtnShadow: '0 4px 15px rgba(0,0,0,0.4)',
      liveBtnBorder: 'rgba(255,255,255,0.3)',
      github: 'https://github.com/thesujith23/Expense-Tracker-And-Financial-Analytics-Dashboard.git',
      mainVideo: '/exptrackvdo.mp4',
      sideImg1: '/exp1.png',
      sideImg2: '/exp2.png'
    },
    {
      idx: '03', name: 'Book Store Management',
      meta: 'Full CRUD inventory system with secure REST APIs, input validation, JWT authentication, and a responsive React UI with reusable components. Fully deployed via Vercel and Render.',
      tags: ['React (Vercel)', 'Node.js (Render)', 'MongoDB Atlas', 'JWT'],
      color: '#1a1a1a',
      isMobile: false,
      liveUrl: 'https://book-store-mgt.vercel.app/',
      github: 'https://github.com/thesujith23/Book-Store-Mgt.git',
      mainVideo: '/Bookvideo.mp4',
      sideImg1: '/book1.png',
      sideImg2: '/book2.png'
    },
    {
      idx: '04', name: 'TechHire — Job Portal',
      meta: 'Job portal with 20+ listings, real-time filtering, dynamic routing, file-upload flow. Deployed on Vercel with CI/CD, sub-2s loads via Next.js App Router.',
      tags: ['Next.js', 'Tailwind', 'Vercel', 'CI/CD'],
      color: '#0055ff',
      isMobile: false,
      live: true,
      github: 'https://github.com/thesujith23/HireReady-Ai.git'
    },
    {
      idx: '05', name: 'AI Food Recommendation',
      meta: 'A personalized smart food discovery platform that suggests optimal meals based on dietary preferences, health goals, and real-time nutritional analysis.',
      tags: ['React', 'Python', 'Machine Learning', 'API'],
      color: '#F97316',
      isMobile: false,
      github: 'https://github.com/thesujith23/FoodRecommend',
      mainVideo: '/foodrecmdvdo.mp4',
      sideImg1: '/food1.png',
      sideImg2: '/food2.png'
    }
  ];

  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;
    
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();
      mm.add("all", () => {
        const deckContainer = section.querySelector('.deck-container');
        const cards = gsap.utils.toArray('.deck-card');
        
        // Initial setup for the stack
        cards.forEach((card, i) => {
          gsap.set(card, {
            transformOrigin: 'left center',
            scale: i > 0 ? 1 - (i * 0.03) : 1,
            rotationZ: i * 2.5,
            y: i * 25,
            x: i * 15,
            zIndex: cards.length - i
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: deckContainer || section,
            start: "top top",
            end: `+=${(cards.length + 1) * 100}%`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        cards.forEach((card, i) => {
          if (i < cards.length - 1) {
            // Flip current card out to the left
            tl.to(card, {
              rotationY: -110,
              scale: 0.9,
              x: '-4vw',
              ease: "power2.inOut",
              duration: 1
            }, i);
            
            // Move remaining cards up the stack
            for (let j = i + 1; j < cards.length; j++) {
              let depth = j - i - 1;
              tl.to(cards[j], {
                scale: depth > 0 ? 1 - (depth * 0.03) : 1,
                rotationZ: depth * 2.5,
                y: depth * 25,
                x: depth * 15,
                ease: "power2.inOut",
                duration: 1
              }, i);
            }
          }
        });
        
        // Add a buffer at the end so the user can actually read the final card
        // before the section unpins and scrolls away
        tl.to({}, { duration: 1.5 });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={containerRef} id="work" style={{ width: '100%', backgroundColor: 'var(--bg-base)' }}>
        <section style={{ position: 'relative', paddingTop: '100px', paddingLeft: '48px', paddingRight: '48px', paddingBottom: '20px' }}>
          <div className="reveal-up">
            <span className="typewriter-terminal-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>&gt;_ work.dir</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95, color: 'var(--text)' }}>
              Selected<br/><em>Projects</em>
            </h2>
          </div>
        </section>

        <div className="deck-container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%', perspective: '2500px' }}>
          <div className="deck-viewport" style={{ position: 'relative', width: '90vw', maxWidth: '1100px', height: '80vh', transformStyle: 'preserve-3d', margin: '0 auto' }}>
          {projects.map((p, i) => (
            <div
              key={i}
              className="deck-card"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                gsap.to(e.currentTarget.querySelector('.deck-card-inner'), {
                  rotateY: x * 12,
                  rotateX: -y * 12,
                  duration: 0.5,
                  ease: "power2.out"
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget.querySelector('.deck-card-inner'), {
                  rotateY: 0,
                  rotateX: 0,
                  duration: 0.8,
                  ease: "power2.out"
                });
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: p.color,
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.3) 100%)',
                borderRadius: '40px',
                border: '1px solid rgba(255,255,255,0.15)',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                backfaceVisibility: 'hidden',
                willChange: 'transform'
              }}
            >
              <div 
                className="deck-card-inner" 
                style={{ 
                  padding: 'clamp(1.5rem, 3vw, 2.5rem)', 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem' }}>
                  <div style={{ maxWidth: '750px' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 3vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: '#fff' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginTop: '1rem', maxWidth: '95%' }}>
                      {p.meta}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap' }}>
                      {p.tags.map((t, j) => (
                        <span key={j} style={{ padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '0.75rem', fontFamily: 'var(--mono)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      {p.github && (
                        <div>
                          <a href={p.github} target="_blank" rel="noopener noreferrer" data-hover style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: '#111', color: '#fff', borderRadius: '100px', fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.3s, transform 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            View Repository
                          </a>
                        </div>
                      )}
                      {p.liveUrl && (
                        <div>
                          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" data-hover style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', backgroundColor: p.liveBtnColor || 'var(--accent)', color: p.liveBtnText || '#fff', borderRadius: '100px', fontFamily: 'var(--mono)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', border: `1px solid ${p.liveBtnBorder || 'var(--accent)'}`, transition: 'background 0.3s, transform 0.3s', boxShadow: p.liveBtnShadow || '0 4px 10px rgba(246, 36, 64, 0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            View Live Project
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)' }}>
                    ({p.idx})
                  </div>
                </div>

                <div className="deck-bottom-section" style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1, minHeight: 0 }}>
                  {p.isMobile ? (
                    <div className="mobile-mockup-wrapper" style={{ flex: 1, display: 'flex', gap: '1.5rem', height: '100%', justifyContent: 'flex-start' }}>
                      <div className="main-phone" style={{ height: '100%', aspectRatio: '9/18', backgroundColor: '#000', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: '0 0 0 2px #4a4a4a, 0 0 0 7px #111, 0 20px 50px rgba(0,0,0,0.6)', transform: 'scale(1.05)', zIndex: 2 }}>
                        {p.mainVideo ? (
                          <video src={p.mainVideo} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'video', src: p.mainVideo })} />
                        ) : p.mainImg ? (
                          <img src={p.mainImg} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.mainImg })} alt="Mobile app preview" />
                        ) : (
                          <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase' }}>[ Main UI ]</span>
                        )}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 30%)', zIndex: 5, pointerEvents: 'none' }}></div>
                      </div>
                      <div className="side-phones" style={{ display: 'flex', gap: '1.5rem', height: '90%', alignItems: 'center' }}>
                        <div style={{ height: '100%', aspectRatio: '9/18', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 0 1px #4a4a4a, 0 0 0 5px #111, 0 10px 25px rgba(0,0,0,0.5)', opacity: 0.9 }}>
                          {p.sideImg1 ? <img src={p.sideImg1} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.sideImg1 })} alt="Secondary view" /> : <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>[ Side UI ]</span>}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 35%)', zIndex: 5, pointerEvents: 'none' }}></div>
                        </div>
                        {p.sideImg2 && (
                          <div style={{ height: '100%', aspectRatio: '9/18', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 0 1px #4a4a4a, 0 0 0 5px #111, 0 10px 25px rgba(0,0,0,0.5)', opacity: 0.7, transform: 'scale(0.9)' }}>
                            <img src={p.sideImg2} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.sideImg2 })} alt="Third view" />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 35%)', zIndex: 5, pointerEvents: 'none' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="landscape-mockup-wrapper" style={{ flex: 1, display: 'flex', gap: '1rem', height: '100%', width: '100%' }}>
                      <div style={{ flex: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)' }}>
                        {p.mainVideo ? (
                          <video src={p.mainVideo} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'video', src: p.mainVideo })} />
                        ) : p.mainImg ? (
                          <img src={p.mainImg} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.mainImg })} alt="Desktop app view" />
                        ) : (
                          <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Main UI View or Video ]</span>
                        )}
                      </div>
                      <div className="landscape-side-images" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.sideImg1 ? <img src={p.sideImg1} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.sideImg1 })} alt="Feature view 1" /> : <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Image 1 ]</span>}
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.sideImg2 ? <img src={p.sideImg2} style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} data-hover data-symbol="<span style='font-size: 0.8rem; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.1em; color: white; background: rgba(0,0,0,0.8); padding: 8px 16px; border-radius: 100px; white-space: nowrap; border: 1px solid rgba(255,255,255,0.2);'>Click to View</span>" onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} onClick={() => setZoomedMedia({ type: 'img', src: p.sideImg2 })} alt="Feature view 2" /> : <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Image 2 ]</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {zoomedMedia && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(10px)' }}
          onClick={() => setZoomedMedia(null)}
        >
          {zoomedMedia.type === 'video' ? (
            <video src={zoomedMedia.src} autoPlay loop controls style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={zoomedMedia.src} style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', objectFit: 'contain' }} alt="Zoomed view" onClick={(e) => e.stopPropagation()} />
          )}
          <div style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '3rem', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 200, opacity: 0.7 }} onMouseEnter={(e) => e.currentTarget.style.opacity=1} onMouseLeave={(e) => e.currentTarget.style.opacity=0.7}>&times;</div>
        </div>
      )}
    </>
  );
}

/* â•â•â•â•â•â•â•â• SKILLS â•â•â•â•â•â•â•â• */
function Skills() {
  const getImg = (src, invert = false) => `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${src}" style="width: 100%; height: 100%; object-fit: contain; ${invert ? 'filter: invert(1);' : ''}" />`;

  const allSkills = [
    { name: 'React.js', featured: true, symbol: getImg('react/react-original.svg') }, 
    { name: 'Next.js', featured: true, symbol: getImg('nextjs/nextjs-original.svg', true) }, 
    { name: 'Node.js', featured: true, symbol: getImg('nodejs/nodejs-original.svg') },
    { name: 'MongoDB', symbol: getImg('mongodb/mongodb-original.svg') }, 
    { name: 'JavaScript (ES6+)', symbol: getImg('javascript/javascript-original.svg') }, 
    { name: 'Python', symbol: getImg('python/python-original.svg') }, 
    { name: 'Java', symbol: getImg('java/java-original.svg') },
    { name: 'Express.js', symbol: getImg('express/express-original.svg', true) }, 
    { name: 'Flask', symbol: getImg('flask/flask-original.svg', true) }, 
    { name: 'HTML5 / CSS3', symbol: getImg('html5/html5-original.svg') },
    { name: 'Tailwind CSS', symbol: getImg('tailwindcss/tailwindcss-original.svg') }, 
    { name: 'RESTful APIs', featured: true, symbol: getImg('json/json-original.svg') }, 
    { name: 'MySQL', symbol: getImg('mysql/mysql-original.svg') },
    { name: 'Supabase', symbol: getImg('supabase/supabase-original.svg') }, 
    { name: 'Xano', symbol: '✖️' }, 
    { name: 'Git / GitHub', symbol: getImg('github/github-original.svg', true) },
    { name: 'Retell AI', symbol: '🤖' }, 
    { name: 'Claude AI', symbol: '🧠' }, 
    { name: 'Plivo', symbol: '📞' },
    { name: 'nexHealth APIs', symbol: '🦷' }, 
    { name: 'OpenRouter', symbol: '🌐' }, 
    { name: 'MediaPipe', symbol: '👁️' },
    { name: 'Power BI', symbol: '📊' }, 
    { name: 'Recharts', symbol: '📈' }, 
    { name: 'Socket.io', symbol: getImg('socketio/socketio-original.svg', true) },
    { name: 'Vercel', symbol: getImg('vercel/vercel-original.svg', true) }, 
    { name: 'Bootstrap', symbol: getImg('bootstrap/bootstrap-original.svg') },
  ];

  return (
    <section className="skills" id="skills">
      <div className="skills-header">
        <h2 className="skills-title reveal-up">
          Tools &<br /><span className="accent">Technologies</span>
        </h2>
        <p className="skills-subtitle reveal-up">
          A curated set of languages, frameworks, and platforms I work with daily
        </p>
      </div>
      <div className="skills-orbit reveal-up">
        {allSkills.map((s, i) => (
          <span key={i} className={`skill-pill${s.featured ? ' featured' : ''}`} data-hover data-symbol={s.symbol} style={{ animationDelay: `${i * 30}ms` }}>
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ════════ EXPERIENCE & EDUCATION (TABBED EDITORIAL) ════════ */
function ExperienceEditorial() {
  const sectionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('experience');
  const [activeIdx, setActiveIdx] = useState(null);
  const contentRefs = useRef([]);
  const listWrapRef = useRef(null);

  const exps = [
    {
      num: '01',
      roleHtml: <>Software <span className="italic">Engineer</span></>,
      company: 'Trikon Software Labs',
      period: 'Apr 2026 – Present',
      desc: 'Architected a real-time AI voice platform using Next.js, React, and LiveKit. Built DigitizedHealth for AI appointment booking via Retell AI and nexHealth APIs. Integrated Plivo, Supabase, Xano, and Stitch.',
      tags: ['Next.js', 'Retell AI', 'Supabase', 'LiveKit', 'Xano'],
    },
    {
      num: '02',
      roleHtml: <>Web App Dev <span className="italic">Intern</span></>,
      company: 'MBL Technologies Pvt Ltd',
      period: 'Jan 2025 – Mar 2025',
      desc: 'Built "Asare," a full-featured animal trust care platform using React.js. Reduced component re-renders by 20% through structured state management and integrated multiple third-party APIs.',
      tags: ['React.js', 'State Management', 'REST APIs'],
    },
    {
      num: '03',
      roleHtml: <>Software Dev <span className="italic">Intern</span></>,
      company: 'Accolade Tech Solutions Pvt Ltd',
      period: 'Mar 2023 – Aug 2023',
      desc: 'Developed internal web applications using .NET and C#, delivering secure backend services. Optimized SQL Server schemas, reducing average query execution time by ~30%.',
      tags: ['.NET', 'C#', 'SQL Server', 'Backend'],
    },
  ];

  const edu = [
    {
      num: '01',
      roleHtml: <>Master of <span className="italic">Computer Applications</span></>,
      company: 'NMAM Institute of Technology',
      period: 'Aug 2025',
      desc: 'Focused on advanced software engineering, data structures, and full-stack web technologies.',
      tags: ['Computer Science', 'Web Tech', 'Data Structures'],
    },
    {
      num: '02',
      roleHtml: <>Bachelor of <span className="italic">Computer Applications</span></>,
      company: 'SDM College of Business Management',
      period: 'July 2023',
      desc: 'Foundation in computer science, programming languages, and database management.',
      tags: ['Programming', 'Databases', 'Networking'],
    }
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ctx = gsap.context(() => {
      gsap.fromTo('.exp-title-inner', 
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
          }
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  // Handle staggered entrance animation when activeTab changes
  useEffect(() => {
    if (!listWrapRef.current) return;
    const rows = listWrapRef.current.querySelectorAll('.exp-row');
    gsap.fromTo(rows, 
      { x: -40, opacity: 0 }, 
      { x: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' }
    );
    
    // Animate timeline line filling up
    gsap.fromTo('.exp-list-line-fill',
      { scaleY: 0 },
      { scaleY: 1, duration: 1.5, ease: 'power2.inOut', delay: 0.2 }
    );
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    
    const msg = tab === 'experience' ? 'Work history!' : 'Education history!';
    window.dispatchEvent(new CustomEvent('pika-speak', { detail: { section: '💼', msg } }));

    const rows = listWrapRef.current.querySelectorAll('.exp-row');
    
    // Animate out with stagger
    gsap.to(rows, {
      x: 40,
      opacity: 0,
      stagger: 0.05,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setActiveIdx(null); // Reset accordion
        setActiveTab(tab); // Changes state, triggers re-render and useEffect entrance
      }
    });
  };

  const handleMouseEnter = (idx) => {
    if (activeIdx === idx) return;
    if (activeIdx !== null && contentRefs.current[activeIdx]) {
      gsap.to(contentRefs.current[activeIdx], { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' });
    }
    gsap.fromTo(contentRefs.current[idx], 
      { height: 0, opacity: 0 }, 
      { height: 'auto', opacity: 1, duration: 0.6, ease: 'power3.inOut' }
    );
    setActiveIdx(idx);
  };

  const handleMouseLeaveList = () => {
    if (activeIdx !== null && contentRefs.current[activeIdx]) {
      gsap.to(contentRefs.current[activeIdx], { height: 0, opacity: 0, duration: 0.5, ease: 'power3.inOut' });
      setActiveIdx(null);
    }
  };

  const currentList = activeTab === 'experience' ? exps : edu;

  return (
    <section className="exp-editorial" id="experience" ref={sectionRef}>
      <div className="exp-bg-glow"></div>
      <div className="exp-header-top">
        <span className="typewriter-terminal-tag" style={{ background: 'transparent', borderColor: 'rgba(255,229,191,0.2)', color: 'var(--bg)' }}>{'>'}_ timeline.log</span>
        
        <div className="exp-tabs-pill">
          <div 
            className="exp-tab-highlighter" 
            style={{ 
              transform: `translateX(${activeTab === 'experience' ? '0%' : '100%'})` 
            }} 
          />
          {['experience', 'education'].map(tab => (
            <button 
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              data-hover
              className={`exp-tab-btn-pill ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'experience' ? 'WORK EXPERIENCE' : 'EDUCATION'}
            </button>
          ))}
        </div>
      </div>

      <div className="exp-list-container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="exp-list" onMouseLeave={handleMouseLeaveList} ref={listWrapRef} style={{ minHeight: '400px', position: 'relative' }}>
          <div className="exp-list-line">
            <div className="exp-list-line-fill"></div>
          </div>
        {currentList.map((item, i) => (
          <div 
            key={`${activeTab}-${i}`} 
            className={`exp-row ${activeIdx === i ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(i)}
            onClick={() => handleMouseEnter(i)}
            >
              <div className="exp-timeline-node">
                <div className="exp-timeline-dot-inner"></div>
              </div>

              <div className="exp-row-visible">
                <div className="exp-row-left">
                  <span className="exp-num">({item.num})</span>
                </div>
              
              <div className="exp-title-wrap">
                <h3 className="exp-title">
                  <span className="exp-title-inner">{item.roleHtml}</span>
                </h3>
              </div>
              
              <div className="exp-row-right">
                <span className="exp-period">{item.period}</span>
                <div className="exp-hover-indicator">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
              </div>
            </div>

            <div 
              className="exp-accordion-content" 
              ref={el => contentRefs.current[i] = el}
              style={{ height: 0, opacity: 0, overflow: 'hidden' }}
            >
              <div className="exp-accordion-inner creative-accordion">
                <div className="exp-acc-left">
                  <div className="exp-acc-company-large">{item.company}</div>
                </div>
                <div className="exp-acc-right">
                  <p className="exp-acc-desc">{item.desc}</p>
                  <div className="exp-acc-tags">
                    {item.tags.map((t, j) => <span key={j} className="creative-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

/* ════════ CONTACT ════════ */
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-eyebrow reveal-up">Get In Touch</div>
      <h2 className="contact-heading reveal-up">Let's create<br />something <em>great</em></h2>
      <div className="contact-links reveal-up">
        <a href="mailto:sujith7344@gmail.com" className="contact-btn primary" data-hover>Email ↗</a>
        <a href="https://github.com/thesujith23" target="_blank" rel="noreferrer" className="contact-btn" data-hover>GitHub ↗</a>
        <a href="tel:+918217615895" className="contact-btn" data-hover>Phone ↗</a>
      </div>
    </section>
  );
}
/* ════════ SOUND HELPERS ════════ */
const initAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!window.audioCtx && AudioContext) window.audioCtx = new AudioContext();
    if (window.audioCtx && window.audioCtx.state === 'suspended') window.audioCtx.resume();
  } catch(e) {}
};

const playChargeSound = () => {
  if (!window.audioCtx) return;
  try {
    const ctx = window.audioCtx;
    const osc = ctx.createOscillator();
    osc.type = 'square'; // 8-bit style
    
    const now = ctx.currentTime;
    // Classic retro power-up arpeggio (rising major chord)
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(277, now + 0.1);
    osc.frequency.setValueAtTime(330, now + 0.2);
    osc.frequency.setValueAtTime(440, now + 0.3);
    osc.frequency.setValueAtTime(554, now + 0.4);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
    gain.gain.setValueAtTime(0.05, now + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.5);
  } catch(e) {}
};

const playZapSound = () => {
  if (!window.audioCtx) return;
  try {
    const ctx = window.audioCtx;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'square';
    osc2.type = 'sawtooth';
    
    // Classic retro descending zap ("pew" sound)
    const now = ctx.currentTime;
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc1.start(); osc2.start();
    osc1.stop(now + 0.2); osc2.stop(now + 0.2);
  } catch(e) {}
};

/* ════════ PIKACHU PET ════════ */
function PikaPet() {
  const petRef = useRef(null);
  const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth - 120 : 300, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300 });
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
  const lastMoveRef = useRef(Date.now());

  useEffect(() => {
    // Unlock Audio Context on first interaction
    const unlock = () => { initAudio(); window.removeEventListener('click', unlock); window.removeEventListener('keydown', unlock); window.removeEventListener('touchstart', unlock); };
    window.addEventListener('click', unlock); window.addEventListener('keydown', unlock); window.addEventListener('touchstart', unlock);

    const showTimer = setTimeout(() => setVisible(true), 2500);
    const onMouse = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMouse, { passive: true });

    // Random wander
    const wanderInterval = setInterval(() => {
      if (draggingRef.current) return;
      const pad = 80;
      let newY = pad + Math.random() * (window.innerHeight - pad * 2);
      let newX = pad + Math.random() * (window.innerWidth - pad * 2);

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
      const matterEl = document.querySelector('#matter-word');
      const pathEl = document.querySelector('#pika-lightning-path');

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
            playZapSound();
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

      let isMatterVisible = false;
      if (matterEl) {
         const rect = matterEl.getBoundingClientRect();
         // Element is visible if its top is above the viewport bottom AND its bottom is below the viewport top.
         isMatterVisible = rect.top < window.innerHeight && rect.bottom > 0;
      }
      
      const zapInterval = isMatterVisible ? 3000 : 10000;

      if (now - window._lastZap > zapInterval && !draggingRef.current && !thrownRef.current) {
        window._lastZap = now;
        window._zapping = true;

        if (isMatterVisible) {
            window._zapPhase = 'charging';
            window._matterCharged = false;
            
            playChargeSound();

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
            playChargeSound();
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
      const bookEl = document.querySelector('.resume-btn-wrap');

      if (bookEl) {
        const rect = bookEl.getBoundingClientRect();
        if (mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
          bookHovered = true;
          // Place Pikachu to the left of the book
          followTarget = { x: rect.left - 100, y: rect.bottom - 80 };
        }
      }

      if (window.innerWidth > 768 && !bookHovered && distToMouse < 180) {
        followTarget = { x: mouse.x - 40, y: mouse.y - 40 };
      }

      const dx = followTarget.x - pos.x;
      const dy = followTarget.y - pos.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 5) {
        const speed = (distToMouse < 150 || bookHovered) ? 1.8 : 2.5;
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

  const handleMouseDown = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    draggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { x: cx, y: cy };
    dragOffsetRef.current = { x: cx - posRef.current.x, y: cy - posRef.current.y };
    setPetState('idle');
    setBubble({ section: '\u26A1', msg: 'Pika~?!', show: true });
  };


  const cls = ['pika-pet', visible && 'visible', facingLeft && 'face-left', isDragging && 'dragging', petState === 'jumping' && 'jumping', petState === 'tumbling' && 'tumbling', petState === 'sparking' && 'sparking', petState === 'sleeping' && 'sleeping'].filter(Boolean).join(' ');
  const sprCls = petState === 'sleeping' ? 'sleeping' : petState === 'walking' ? '' : 'idle';

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
          <div className="pika-body" />
          <div className="pika-shadow" />
        </div>
        <div className="pika-sparks">
          <div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" /><div className="pika-spark" />
        </div>
      </div>
    </>
  );
}







/* â•â•â•â•â•â•â•â• APP â•â•â•â•â•â•â•â• */
export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    
    const update = (time) => { lenis.raf(time * 1000); };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Reveal observer
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach((el) => obs.observe(el));

    return () => { 
      gsap.ticker.remove(update);
      lenis.destroy(); 
      obs.disconnect(); 
    };
  }, [loaded]);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Nav />
      <main>
        <Hero />
        <About />
        <ExperienceEditorial />
        <ProjectsDeck />
        <Skills />
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

