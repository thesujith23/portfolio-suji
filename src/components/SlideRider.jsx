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
   ride phase and the local tilt, and plays the rolling sounds.

   The container's box is measured only when layout can change (mount, resize,
   reflow) and the scroll offset comes from the scroll event. Reading
   getBoundingClientRect() inside the loop forced a synchronous layout on every
   scroll tick, which is what made the ride stutter. Frames are also parked
   shortly after scrolling stops instead of running all the time. */
export default function SlideRider({ containerRef }) {
  const seatRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const seat = seatRef.current;
    const container = containerRef.current;
    if (!seat || !container) return undefined;

    const geo = { top: 0, height: 1, left: 0, width: 1 };
    let raf = 0;
    let inView = false;
    let lastX = NaN;
    let lastY = NaN;
    let lastTilt = NaN;
    let lastPhase = null;
    let lastSpeed = -1;
    let lastT = -1;
    let lastTick = 0;
    let lastWhoosh = 0;
    let lastStamp = 0;
    let speed = 0;

    // Only called when layout really changed, never inside the frame loop.
    const measure = () => {
      const rect = container.getBoundingClientRect();
      geo.top = rect.top + (window.scrollY || 0);
      geo.height = Math.max(1, rect.height);
      geo.left = rect.left;
      geo.width = Math.max(1, rect.width);
      lastT = -1;
      wake();
    };

    const frame = () => {
      raf = 0;
      const viewport = window.innerHeight || 1;
      // Reading the scroll offset is cheap and never flushes layout, unlike
      // the container rect this loop used to measure every frame.
      const scrollPos = window.scrollY || 0;
      const top = geo.top - scrollPos;
      const bottom = top + geo.height;

      // 0 at the station, 1 at the lip, >1 while Pikachu falls off the end.
      const progress = (viewport * 0.5 - top) / geo.height;
      const now = performance.now();

      let phase = 'gone';
      let design = null;
      let tilt = 0;

      if (bottom > viewport * 0.02 && top < viewport * 1.02) {
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
        const x = (onBed.x / SLIDE_W) * geo.width;
        const y = (-onBed.y / SLIDE_H) * geo.height;

        if (Number.isNaN(lastX) || Math.abs(x - lastX) > 0.05 || Math.abs(y - lastY) > 0.05) {
          lastX = x;
          lastY = y;
          seat.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        }

        // Publish the seat in screen space so the pet does not need its own
        // per-frame getBoundingClientRect() in the middle of the page.
        if (lastPhase !== phase || window.__pikaSeat?.phase !== phase) {
          window.__pikaSeat = { x: geo.left + x, y: top + y, phase, tilt };
        } else if (window.__pikaSeat) {
          window.__pikaSeat.x = geo.left + x;
          window.__pikaSeat.y = top + y;
          window.__pikaSeat.tilt = tilt;
        }

        const dt = lastStamp ? now - lastStamp : 16;
        const moving = lastT >= 0 ? Math.abs(progress - lastT) / Math.max(1, dt) : 0;
        speed += (Math.min(1, moving * 9000) - speed) * 0.2;
        if (Math.abs(speed - lastSpeed) > 0.01) {
          lastSpeed = speed;
          seat.style.setProperty('--slide-speed', speed.toFixed(3));
        }

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

      const phaseChanged = lastPhase !== phase;

      if (lastTilt !== tilt) {
        lastTilt = tilt;
        seat.dataset.tilt = `${tilt.toFixed(2)}deg`;
      }
      if (phaseChanged) {
        lastPhase = phase;
        seat.dataset.phase = phase;
      }

      lastStamp = now;
      lastT = progress;

      // The loop only runs while the section is on screen. Every frame is a
      // handful of float ops now that the container box is cached, so keeping
      // it alive costs less than missing a scroll event would.
      if (inView) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!inView) return;
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      wake();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(container);
    }

    // Outside the experience section this loop has nothing to do, so it stops
    // instead of forcing a layout read on every frame of the whole page.
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          measure();
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
          lastPhase = 'gone';
          seat.dataset.phase = 'gone';
          window.__pikaSeat = null;
        }
      },
      { rootMargin: '30% 0px' },
    );
    io.observe(container);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io.disconnect();
    };
  }, [containerRef]);

  return (
    <div className="slide-rig" aria-hidden="true">
      <div id="slide-seat" className="slide-seat" ref={seatRef} data-phase="gone" />
    </div>
  );
}
