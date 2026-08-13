import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

/* ════════ CURSOR ════════ */
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
      if (dot) { dot.style.left = x + 'px'; dot.style.top = y + 'px'; }
      if (sym) { sym.style.left = x + 'px'; sym.style.top = y + 'px'; }
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

/* ════════ LOADER ════════ */
function Loader({ onDone }) {
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(wrapRef.current, {
          yPercent: -100, duration: 0.8, ease: 'power4.inOut',
          onComplete: onDone,
        });
      },
    });

    tl.to(barRef.current, {
      width: '100%', duration: 2.2, ease: 'power2.inOut',
    });

    // Counter
    const obj = { val: 0 };
    tl.to(obj, {
      val: 100, duration: 2.2, ease: 'power2.inOut',
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

/* ════════ MAGNETIC ════════ */
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

function Magnetic({ children }) {
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
      xTo(x * 0.4);
      yTo(y * 0.4);
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

/* ════════ HERO CANVAS ════════ */
function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let particles = [];
    const particleCount = Math.floor((width * height) / 45000);
    const mouse = { x: -1000, y: -1000, radius: 150 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = forceDirectionX * force * 1.5;
          const directionY = forceDirectionY * force * 1.5;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 229, 191, 0.4)';
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 229, 191, ${(1 - dist / 120) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    init();
    gsap.ticker.add(animate);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      gsap.ticker.remove(animate);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
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

/* ════════ HERO ════════ */
function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ delay: 2.6 });
    tl.fromTo(el.querySelectorAll('.line-inner'), { yPercent: 120 }, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out' });
    tl.fromTo(el.querySelector('.hero-pre span'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.5');
    tl.fromTo(el.querySelector('.hero-bottom'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
  }, []);

  return (
    <section className="hero" id="home" ref={ref} style={{ position: 'relative' }}>
      <HeroCanvas />
      <div className="hero-pre" style={{ position: 'relative', zIndex: 1 }}><span style={{ opacity: 0 }}>Software Engineer — Full Stack Developer</span></div>
      <h1 className="hero-title" style={{ position: 'relative', zIndex: 1 }}>
        <span className="line"><span className="line-inner">Building</span></span>
        <span className="line"><span className="line-inner"><span className="italic">digital</span> experiences</span></span>
        <span className="line"><span className="line-inner">that <span className="outline">matter</span></span></span>
      </h1>
      <div className="hero-bottom" style={{ opacity: 0, position: 'relative', zIndex: 1 }}>
        <p className="hero-bio">
          <strong>Full-Stack Developer</strong> with expertise in React, Next.js, Node.js & AI integrations.
          Crafting <strong>responsive UIs</strong>, secure APIs, and data-driven dashboards from <strong>Mangalore, India</strong>.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Magnetic>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-btn-creative" data-hover>
              <span className="btn-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </span>
              <span>Download Résumé</span>
            </a>
          </Magnetic>
        </div>
      </div>
      <div className="hero-location" style={{ position: 'relative', zIndex: 1 }}>27.4505° N — Mangalore</div>
    </section>
  );
}



/* ════════ ABOUT ════════ */
function About() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const charsRef = useRef([]);
  const cursorRef = useRef(null);

  const paragraph = "I'm Sujith, a software engineer who transforms complex problems into elegant, production-ready web applications. I build with React, Next.js, and Node.js — creating AI-integrated platforms, secure REST APIs, and data-driven dashboards that deliver real business value. Currently seeking to contribute to a product-focused engineering team.";

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
        
        // Update every character synchronously
        chars.forEach((char, i) => {
          if (progress === 1 || i < targetIdx - 2) {
            // Fully typed and cooled down
            char.style.opacity = '1';
            char.style.color = '#1a1a1a';
            char.style.textShadow = 'none';
          } else if (i <= targetIdx) {
            // Actively typing - heat trail
            char.style.opacity = '1';
            char.style.color = '#F62440';
            char.style.textShadow = '0 0 12px #F62440';
          } else {
            // Untyped future text
            char.style.opacity = '0.15';
            char.style.color = '#999999';
            char.style.textShadow = 'none';
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

  // Split paragraph into characters, preserving spaces
  let charIdx = 0;
  const rendered = paragraph.split(' ').map((word, wi) => (
    <span key={wi} className="typewriter-word">
      {word.split('').map((ch) => {
        const idx = charIdx++;
        return (
          <span
            key={idx}
            className="typewriter-char"
            ref={(el) => { charsRef.current[idx] = el; }}
          >
            {ch}
          </span>
        );
      })}
      <span
        className="typewriter-char"
        ref={(el) => { charsRef.current[charIdx] = el; }}
      >
        {' '}
      </span>
      {(() => { charIdx++; return null; })()}
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

/* ════════ EXPERIENCE (HORIZONTAL SCROLL) ════════ */

/* ════════ PROJECTS (3D DECK) ════════ */
function ProjectsDeck() {
  const containerRef = useRef(null);

  const projects = [
    {
      idx: '01', name: 'BodySync-AI',
      meta: 'Intelligent Pose Detection & Fitness Tracker. An AI fitness assistant that uses pose estimation for real-time exercise tracking, form feedback, and performance analytics.',
      tags: ['MediaPipe', 'OpenCV', 'Python', 'Flask'],
      color: '#3d2fa9',
      isMobile: false,
      github: 'https://github.com/thesujith23/BodySync-AI---Intelligent-Pose-Detection-and-Fitness-Tracker.git'
    },
    {
      idx: '02', name: 'Expense Tracker & Analytics',
      meta: 'Secure multi-user financial tracking with JWT auth, role-protected routes, and MongoDB aggregation-powered real-time analytics dashboard.',
      tags: ['MERN', 'Recharts', 'JWT', 'Aggregation'],
      color: '#ff3c34',
      isMobile: true,
    },
    {
      idx: '03', name: 'Book Store Management',
      meta: 'Full CRUD inventory system with secure REST APIs, input validation, JWT authentication, and a responsive React UI with reusable components.',
      tags: ['MongoDB', 'Express', 'React', 'Node.js'],
      color: '#1a1a1a',
      isMobile: false,
    },
    {
      idx: '04', name: 'TechHire — Job Portal',
      meta: 'Job portal with 20+ listings, real-time filtering, dynamic routing, file-upload flow. Deployed on Vercel with CI/CD, sub-2s loads via Next.js App Router.',
      tags: ['Next.js', 'Tailwind', 'Vercel', 'CI/CD'],
      color: '#0055ff',
      isMobile: false,
      live: true,
    },
  ];

  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;
    
    let ctx = gsap.context(() => {
      let mm = gsap.matchMedia();
      mm.add("(min-width: 800px)", () => {
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
            trigger: section,
            start: "top top",
            end: `+=${cards.length * 100}%`,
            pin: true,
            scrub: 1,
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
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section id="work" style={{ position: 'relative', backgroundColor: 'var(--bg-base)', paddingTop: '120px' }}>
        <div style={{ marginBottom: '4rem', padding: '0 48px' }}>
          <div className="reveal-up">
            <span className="typewriter-terminal-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>&gt;_ work.dir</span>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(3rem,6vw,5rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 0.95, color: 'var(--text)' }}>
              Selected<br/><em>Projects</em>
            </h2>
          </div>
        </div>
      </section>

      <div ref={containerRef} style={{ backgroundColor: 'var(--bg-base)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', width: '100%', perspective: '2500px' }}>
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
                  padding: 'clamp(2rem, 4vw, 3rem)', 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem' }}>
                  <div style={{ maxWidth: '750px' }}>
                    <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 3.5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: '#fff' }}>
                      {p.name}
                    </h3>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginTop: '1.5rem', maxWidth: '90%' }}>
                      {p.meta}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                      {p.tags.map((t, j) => (
                        <span key={j} style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--mono)', border: '1px solid rgba(255,255,255,0.2)' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {p.github && (
                      <div style={{ marginTop: '2rem' }}>
                        <a href={p.github} target="_blank" rel="noopener noreferrer" data-hover style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#111', color: '#fff', borderRadius: '100px', fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.3s, transform 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#111'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                          View Repository
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.6)' }}>
                    ({p.idx})
                  </div>
                </div>

                <div className="deck-bottom-section" style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-end', flex: 1, minHeight: 0 }}>
                  {p.isMobile ? (
                    <div className="mobile-mockup-wrapper" style={{ flex: 1, display: 'flex', gap: '1.5rem', height: '100%', justifyContent: 'flex-start' }}>
                      <div className="main-phone" style={{ height: '100%', aspectRatio: '9/18', backgroundColor: '#000', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: '0 0 0 2px #4a4a4a, 0 0 0 7px #111, 0 20px 50px rgba(0,0,0,0.6)', transform: 'scale(1.05)', zIndex: 2 }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 30%)', zIndex: 5, pointerEvents: 'none' }}></div>
                        <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase' }}>[ Main UI ]</span>
                      </div>
                      <div className="side-phones" style={{ display: 'flex', gap: '1.5rem', height: '90%', alignItems: 'center' }}>
                        <div style={{ height: '100%', aspectRatio: '9/18', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative', boxShadow: '0 0 0 1px #4a4a4a, 0 0 0 5px #111, 0 10px 25px rgba(0,0,0,0.5)', opacity: 0.9 }}>
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 35%)', zIndex: 5, pointerEvents: 'none' }}></div>
                          <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', textTransform: 'uppercase', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>[ Side UI ]</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="landscape-mockup-wrapper" style={{ flex: 1, display: 'flex', gap: '1rem', height: '100%', width: '100%' }}>
                      <div style={{ flex: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.3)' }}>
                        <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Main UI View or Video ]</span>
                      </div>
                      <div className="landscape-side-images" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Image 1 ]</span>
                        </div>
                        <div style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="mono" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase' }}>[ Image 2 ]</span>
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
    </>
  );
}

/* ════════ SKILLS ════════ */
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
    { name: 'nexHealth APIs', symbol: '🏥' }, 
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
      period: '2026',
      desc: 'Engineered an AI-powered voice call agent integrated with healthcare APIs for real-time appointment management.',
      tags: ['Retell AI', 'Supabase', 'Next.js', 'Plivo'],
    },
    {
      num: '02',
      roleHtml: <>Full Stack <span className="italic">Intern</span></>,
      company: 'MBL Technologies',
      period: '2025',
      desc: 'Developed responsive web applications using the MERN stack. Optimized MongoDB queries by ~30% and implemented JWT-secured routes.',
      tags: ['React', 'Node.js', 'MongoDB', 'Express'],
    },
    {
      num: '03',
      roleHtml: <>Software Dev <span className="italic">Intern</span></>,
      company: 'Accolade Tech Solutions',
      period: '2023',
      desc: 'Built and maintained REST APIs, implemented data validation layers, and contributed to front-end performance modules.',
      tags: ['Python', 'Flask', 'MySQL', 'REST APIs'],
    },
  ];

  const edu = [
    {
      num: '01',
      roleHtml: <>Master of <span className="italic">Computer Applications</span></>,
      company: 'NMAM Institute of Technology',
      period: 'Graduated 2026',
      desc: 'Focused on advanced software engineering, data structures, and full-stack web technologies.',
      tags: ['Computer Science', 'Web Tech', 'Data Structures'],
    },
    {
      num: '02',
      roleHtml: <>Bachelor of <span className="italic">Computer Applications</span></>,
      company: 'St. Aloysius College',
      period: 'Graduated 2024',
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
      { y: 40, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power3.out' }
    );
  }, [activeTab]);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    const rows = listWrapRef.current.querySelectorAll('.exp-row');
    
    // Animate out with stagger
    gsap.to(rows, {
      y: -30,
      opacity: 0,
      stagger: 0.05,
      duration: 0.3,
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
      <div className="exp-header-top">
        <span className="typewriter-terminal-tag" style={{ background: 'transparent', borderColor: 'rgba(255,229,191,0.2)', color: 'var(--bg)' }}>{'>'}_ timeline.log</span>
        
        <div style={{ display: 'flex', gap: '40px', marginTop: '32px', position: 'relative' }}>
          {['experience', 'education'].map(tab => (
            <button 
              key={tab}
              onClick={() => handleTabSwitch(tab)}
              data-hover
              style={{ 
                background: 'transparent', border: 'none', 
                fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
                fontWeight: 900, color: '#FFE5BF', 
                padding: '8px 0',
                opacity: activeTab === tab ? 1 : 0.3,
                transform: activeTab === tab ? 'scale(1)' : 'scale(0.85)',
                transformOrigin: 'left bottom',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {activeTab === tab && (
                <span style={{ 
                  width: '10px', height: '10px', 
                  backgroundColor: 'var(--accent)', 
                  borderRadius: '50%', 
                  display: 'inline-block',
                  boxShadow: '0 0 12px var(--accent)'
                }} />
              )}
              {tab === 'experience' ? 'WORK EXPERIENCE' : 'EDUCATION'}
            </button>
          ))}
        </div>
      </div>

      <div className="exp-list" onMouseLeave={handleMouseLeaveList} ref={listWrapRef} style={{ minHeight: '400px' }}>
        {currentList.map((item, i) => (
          <div 
            key={`${activeTab}-${i}`} 
            className={`exp-row ${activeIdx === i ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(i)}
            onClick={() => handleMouseEnter(i)}
          >
            <div className="exp-row-visible">
              <div className="exp-row-left">
                <span className="exp-num">({item.num})</span>
              </div>
              
              <div className="exp-title-wrap">
                <h3 className="exp-title">
                  <span className="exp-title-inner">{item.roleHtml}</span>
                </h3>
              </div>
              
              <div className="exp-row-right" style={{ flexDirection: 'row', alignItems: 'center', gap: '24px', justifyContent: 'flex-end', width: '20%' }}>
                <span className="exp-period">{item.period}</span>
                <div className="exp-hover-indicator" style={{
                  width: '48px', height: '48px', borderRadius: '50%', 
                  border: '1px solid rgba(255,229,191,0.2)', display: 'flex', flexShrink: 0,
                  alignItems: 'center', justifyContent: 'center', color: '#FFE5BF',
                  transform: activeIdx === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.4s var(--ease), background 0.4s var(--ease)'
                }}>
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
              <div className="exp-accordion-inner">
                <div className="exp-acc-left">
                  <div className="exp-acc-company">{item.company}</div>
                </div>
                <div className="exp-acc-right">
                  <p className="exp-acc-desc">{item.desc}</p>
                  <div className="exp-acc-tags">
                    {item.tags.map((t, j) => <span key={j}>{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════ STATS ════════ */
function Stats() {
  return (
    <div className="stats-strip">
      {[
        { val: '3+', desc: 'Years Experience' },
        { val: '10+', desc: 'Projects Shipped' },
        { val: '~30%', desc: 'Query Optimization' },
        { val: 'MCA', desc: 'NMAM Institute of Tech' },
      ].map((s, i) => (
        <div key={i} className="stat-box reveal-up">
          <div className="stat-value">{s.val}</div>
          <div className="stat-desc">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ════════ CONTACT ════════ */
function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-eyebrow reveal-up">Get In Touch</div>
      <h2 className="contact-heading reveal-up">Let's create<br />something <em>great</em></h2>
      <div className="contact-links reveal-up">
        <a href="mailto:sujith7344@gmail.com" className="contact-btn primary" data-hover>✉ sujith7344@gmail.com</a>
        <a href="https://github.com/thesujith23" target="_blank" rel="noreferrer" className="contact-btn" data-hover>GitHub ↗</a>
        <a href="tel:+918217615895" className="contact-btn" data-hover>+91 82176 15895</a>
      </div>
    </section>
  );
}

/* ════════ APP ════════ */
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
        <Stats />
        <Skills />
        <Contact />
      </main>
      <footer className="footer">
        <span>© 2026 Sujith</span>
        <span>Designed & Built with React + GSAP</span>
        <a href="https://github.com/thesujith23" target="_blank" rel="noreferrer">github.com/thesujith23</a>
      </footer>
    </>
  );
}
