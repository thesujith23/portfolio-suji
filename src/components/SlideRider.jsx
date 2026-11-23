import { useEffect, useRef } from 'react';
import {
  SLIDE_W,
  SLIDE_H,
  BED_LIFT,
  pointAt,
  platformPoint,
  fallAt,
  projectToScreen,
} from '../lib/slidePath';
import { play } from '../lib/sound';

/* Places the seat anchor on the slide bed as the section scrolls, publishes the
   ride phase and the local tilt, and plays the rolling sounds. */
export default function SlideRider({ containerRef }) {
  const seatRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const seat = seatRef.current;
    const container = containerRef.current;
    if (!seat || !container) return;

    let raf = 0;
    let lastT = -1;
    let lastTick = 0;
    let lastWhoosh = 0;
    let lastStamp = 0;
    let speed = 0;

    const loop = (now) => {
      const rect = container.getBoundingClientRect();
      const viewport = window.innerHeight || 1;

      // 0 at the station, 1 at the lip, >1 while Pikachu falls off the end.
      const progress = (viewport * 0.5 - rect.top) / Math.max(1, rect.height);

      let phase = 'gone';
      let design = null;
      let tilt = 0;

      if (rect.bottom > viewport * 0.02 && rect.top < viewport * 1.02) {
        if (progress <= 0.004) {
          phase = 'approach';
          design = platformPoint();
        } else if (progress < 1) {
          const point = pointAt(progress);
          phase = 'ride';
          design = { x: point.x, y: point.y, z: point.z + BED_LIFT };
          tilt = Math.max(-18, Math.min(18, point.angle + 90));
        } else {
          const u = Math.min(1, (progress - 1) / 0.16);
          design = fallAt(u);
          phase = u < 1 ? 'fall' : 'rest';
        }
      }

      if (design) {
        const onBed = projectToScreen(design.x, design.y, design.z);
        const x = (onBed.x / SLIDE_W) * rect.width;
        const y = (-onBed.y / SLIDE_H) * rect.height;
        seat.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        seat.dataset.tilt = `${tilt.toFixed(2)}deg`;
        // Publish the seat in screen space so the pet does not need its own
        // per-frame getBoundingClientRect() in the middle of the page.
        window.__pikaSeat = { x: rect.left + x, y: rect.top + y, phase, tilt };

        const dt = lastStamp ? now - lastStamp : 16;
        const moving = lastT >= 0 ? Math.abs(progress - lastT) / Math.max(1, dt) : 0;
        speed += (Math.min(1, moving * 9000) - speed) * 0.2;
        seat.style.setProperty('--slide-speed', speed.toFixed(3));

        if (phase === 'ride' && moving > 0.00002) {
          if (now - lastTick > 620) {
            lastTick = now;
            play('tick', { volume: 0.25 + speed * 0.25, rate: 0.9 + speed * 0.5 });
          }
          if (speed > 0.55 && now - lastWhoosh > 1800) {
            lastWhoosh = now;
            play('whoosh', { volume: 0.28 + speed * 0.2 });
          }
        }
      }

      seat.dataset.phase = phase;

      lastStamp = now;
      lastT = progress;
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      seat.dataset.phase = 'gone';
      window.__pikaSeat = null;
    };

    // Outside the experience section this loop has nothing to do, so it stops
    // instead of forcing a layout read on every frame of the whole page.
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start(); else stop(); },
      { rootMargin: '30% 0px' },
    );
    io.observe(container);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [containerRef]);

  return (
    <div className="slide-rig" aria-hidden="true">
      <div id="slide-seat" className="slide-seat" ref={seatRef} data-phase="gone" />
    </div>
  );
}
