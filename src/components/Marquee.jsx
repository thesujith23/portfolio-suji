import { useEffect, useRef } from 'react';

const marqueeItems = [
  'React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript',
  'Express', 'Tailwind', 'Python', 'REST APIs', 'Full Stack',
  'React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript',
  'Express', 'Tailwind', 'Python', 'REST APIs', 'Full Stack',
];

export default function Marquee() {
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {marqueeItems.map((item, i) => (
          <div key={i} className="marquee-item">
            <span className="marquee-dot" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
