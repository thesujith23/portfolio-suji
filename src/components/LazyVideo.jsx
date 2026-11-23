import { useEffect, useRef } from 'react';

/**
 * Video that never downloads until it is close to the viewport,
 * and pauses itself as soon as it leaves.
 */
export default function LazyVideo({ src, poster, className, style, controls = false, onClick, active = true, ...rest }) {
  const ref = useRef(null);
  const inView = useRef(false);
  const isActive = useRef(active);

  /* Stacked deck cards are all "in view" at once, so being visible is not
     enough: only the active card is allowed to decode and play its video. */
  const sync = () => {
    const el = ref.current;
    if (!el) return;
    if (isActive.current && inView.current) {
      if (el.preload !== 'auto') el.preload = 'auto';
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    } else if (!el.paused) {
      el.pause();
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.preload = 'metadata';
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView.current = entry.isIntersecting;
          sync();
        });
      },
      { rootMargin: '200px', threshold: 0.15 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (ref.current && !ref.current.paused) ref.current.pause();
    };
  }, []);

  useEffect(() => {
    isActive.current = active;
    sync();
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      preload="none"
      loop
      muted
      playsInline
      controls={controls}
      className={className}
      style={style}
      onClick={onClick}
      {...rest}
    />
  );
}
