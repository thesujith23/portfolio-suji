import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [hoverText, setHoverText] = useState('');

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
      if (textRef.current) {
        textRef.current.style.left = e.clientX + 'px';
        textRef.current.style.top = e.clientY + 'px';
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top = ringPos.current.y + 'px';
      }
      raf.current = requestAnimationFrame(animate);
    };

    const handleOver = (e) => {
      const expCard = e.target.closest('.timeline-content');
      if (expCard) {
        setHoverText('Click to View');
        if (cursorRef.current) cursorRef.current.classList.add('hovering-exp');
      } else {
        const el = e.target.closest('a, button, [data-cursor]');
        if (el && cursorRef.current) cursorRef.current.classList.add('hovering');
      }
    };
    const handleOut = (e) => {
      if (cursorRef.current) {
        cursorRef.current.classList.remove('hovering');
        cursorRef.current.classList.remove('hovering-exp');
      }
      setHoverText('');
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="cursor" ref={cursorRef}>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-text" ref={textRef}>{hoverText}</div>
    </div>
  );
}
