import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const titleRef = useRef(null);
  const tagRef = useRef(null);
  const bottomRef = useRef(null);
  const badgeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    if (badgeRef.current) {
      tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
    if (tagRef.current) {
      tl.fromTo(tagRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3');
    }

    // Animate each character of the name
    const chars = titleRef.current?.querySelectorAll('.char');
    if (chars?.length) {
      tl.fromTo(chars,
        { y: '120%', opacity: 0, rotateX: -40 },
        {
          y: '0%', opacity: 1, rotateX: 0,
          duration: 0.9, stagger: 0.04,
          ease: 'power4.out'
        }, '-=0.2'
      );
    }

    if (bottomRef.current) {
      tl.fromTo(bottomRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
    }

    setLoaded(true);
  }, []);

  const splitChars = (word, cls) =>
    word.split('').map((c, i) => (
      <span key={i} className={`char ${cls}`} style={{ display: 'inline-block', transformOrigin: '50% 100%' }}>
        {c === ' ' ? '\u00A0' : c}
      </span>
    ));

  return (
    <section className="hero" id="home">
      <div className="hero-grid" />

      <div ref={badgeRef} style={{ opacity: 0 }}>
        <div className="status-badge">
          <span className="status-dot" />
          Available for opportunities
        </div>
      </div>

      <div ref={tagRef} className="hero-tag" style={{ opacity: 0 }}>
        Software Engineer — Full Stack
      </div>

      <div className="hero-name" ref={titleRef} style={{ perspective: '800px' }}>
        <div className="word">{splitChars('SUJITH', 'name-char')}</div>
      </div>

      <div ref={bottomRef} className="hero-bottom" style={{ opacity: 0 }}>
        <p className="hero-desc">
          <strong>Full-Stack Developer</strong> crafting responsive UIs,
          secure REST APIs, and AI-integrated platforms using{' '}
          <strong>React, Next.js, Node.js & MongoDB.</strong>
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">
            View Work ↓
          </a>
          <a href="/SujithResume(2).pdf" target="_blank" rel="noopener noreferrer" className="btn-ghost">
            Résumé 📄
          </a>
          <a href="#contact" className="btn-ghost">
            Let's Talk →
          </a>
        </div>
      </div>

      <div className="hero-scroll">
        <div className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
