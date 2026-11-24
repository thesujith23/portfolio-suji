import { useEffect, useRef, useState } from 'react';
import { TextReveal } from './ExperienceTimeline';

const devicon = (src) =>
  `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${src}" alt="" style="width: 100%; height: 100%; object-fit: contain;" />`;

const SKILLS = [
  { name: 'React.js', group: 'Frontend', featured: true, logo: devicon('react/react-original.svg') },
  { name: 'Next.js', group: 'Frontend', featured: true, logo: devicon('nextjs/nextjs-original.svg') },
  { name: 'JavaScript (ES6+)', group: 'Frontend', logo: devicon('javascript/javascript-original.svg') },
  { name: 'HTML5 / CSS3', group: 'Frontend', logo: devicon('html5/html5-original.svg') },
  { name: 'Tailwind CSS', group: 'Frontend', logo: devicon('tailwindcss/tailwindcss-original.svg') },
  { name: 'Bootstrap', group: 'Frontend', logo: devicon('bootstrap/bootstrap-original.svg') },
  { name: 'Recharts', group: 'Frontend', mark: 'R', tone: 'gold' },

  { name: 'Node.js', group: 'Backend', featured: true, logo: devicon('nodejs/nodejs-original.svg') },
  { name: 'Express.js', group: 'Backend', logo: devicon('express/express-original.svg') },
  { name: 'Flask', group: 'Backend', logo: devicon('flask/flask-original.svg') },
  { name: 'RESTful APIs', group: 'Backend', featured: true, logo: devicon('json/json-original.svg') },
  { name: 'Socket.io', group: 'Backend', logo: devicon('socketio/socketio-original.svg') },
  { name: 'MongoDB', group: 'Backend', logo: devicon('mongodb/mongodb-original.svg') },
  { name: 'MySQL', group: 'Backend', logo: devicon('mysql/mysql-original.svg') },
  { name: 'Supabase', group: 'Backend', logo: devicon('supabase/supabase-original.svg') },
  { name: 'Xano', group: 'Backend', mark: 'X', tone: 'red' },

  { name: 'Retell AI', group: 'AI & Voice', mark: 'Re', tone: 'ink' },
  { name: 'Claude AI', group: 'AI & Voice', mark: 'C', tone: 'cream' },
  { name: 'Plivo', group: 'AI & Voice', mark: 'P', tone: 'gold' },
  { name: 'nexHealth APIs', group: 'AI & Voice', mark: 'n', tone: 'red' },
  { name: 'OpenRouter', group: 'AI & Voice', mark: 'O', tone: 'ink' },
  { name: 'MediaPipe', group: 'AI & Voice', mark: 'M', tone: 'cream' },

  { name: 'Python', group: 'Data & Tools', logo: devicon('python/python-original.svg') },
  { name: 'Java', group: 'Data & Tools', logo: devicon('java/java-original.svg') },
  { name: 'Power BI', group: 'Data & Tools', mark: 'BI', tone: 'gold' },
  { name: 'Git / GitHub', group: 'Data & Tools', logo: devicon('github/github-original.svg') },
  { name: 'Vercel', group: 'Data & Tools', logo: devicon('vercel/vercel-original.svg') },
];

/* Four bands, one per group. Speed and direction live in CSS so the
   mobile pass can slow them down without touching the markup. */
const RAILS = [
  { key: 'Frontend', num: '01' },
  { key: 'Backend', num: '02' },
  { key: 'AI & Voice', num: '03' },
  { key: 'Data & Tools', num: '04' },
];

function RailChip({ skill }) {
  return (
    <li
      className={`rail-chip${skill.featured ? ' is-core' : ''}`}
      data-hover
      data-symbol={skill.logo || undefined}
    >
      {skill.logo ? (
        <span className="rail-chip-mark">
          <span className="rail-logo" dangerouslySetInnerHTML={{ __html: skill.logo }} />
        </span>
      ) : (
        <span className={`rail-mono tone-${skill.tone}`} aria-hidden="true">
          {skill.mark}
        </span>
      )}
      <span className="rail-chip-name">{skill.name}</span>
      {skill.featured ? <span className="rail-chip-star" aria-hidden="true">★</span> : null}
    </li>
  );
}

export default function SkillsSection() {
  const [live, setLive] = useState(false);
  const railsRef = useRef(null);

  // The bands only need to move once someone can see them.
  useEffect(() => {
    const el = railsRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="skills" id="skills">
      <div className="skills-header">
        <h2 className="skills-title">
          <TextReveal delay={0.05}>Tools &amp;</TextReveal>
          <br />
          <span className="accent">
            <TextReveal delay={0.1}>Technologies</TextReveal>
          </span>
        </h2>
        <p className="skills-subtitle">Four lines of work, one kit — hover a band to stop it and read</p>
        <span className="cartoon-sticker skills-sticker" aria-hidden="true">the kit ★</span>
      </div>

      <div className={`skills-rails${live ? ' is-live' : ''}`} ref={railsRef}>
        {RAILS.map((rail) => {
          const items = SKILLS.filter((s) => s.group === rail.key);
          return (
            <div className="skill-rail" key={rail.key}>
              <div className="skill-rail-head">
                <span className="skill-rail-num">{rail.num}</span>
                <span className="skill-rail-name">{rail.key}</span>
                <span className="skill-rail-count">{items.length} tools</span>
              </div>

              <div className="skill-rail-window">
                <div className="skill-rail-track">
                  {/* Two identical lists: the track slides exactly one list
                      width, so the loop has no visible seam. */}
                  {[0, 1].map((copy) => (
                    <ul
                      className="skill-rail-list"
                      key={copy}
                      aria-hidden={copy === 1 ? 'true' : undefined}
                    >
                      {items.map((skill, i) => (
                        <RailChip skill={skill} key={`${copy}-${skill.name}-${i}`} />
                      ))}
                    </ul>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
