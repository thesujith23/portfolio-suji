import { useState } from 'react';
import { TextReveal } from './ExperienceTimeline';
import { play } from '../lib/sound';

const devicon = (src, invert = false) =>
  `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${src}" style="width: 100%; height: 100%; object-fit: contain; ${
    invert ? 'filter: invert(1);' : ''
  }" />`;

const SKILLS = [
  { name: 'React.js', group: 'Frontend', featured: true, symbol: devicon('react/react-original.svg') },
  { name: 'Next.js', group: 'Frontend', featured: true, symbol: devicon('nextjs/nextjs-original.svg', true) },
  { name: 'JavaScript (ES6+)', group: 'Frontend', symbol: devicon('javascript/javascript-original.svg') },
  { name: 'HTML5 / CSS3', group: 'Frontend', symbol: devicon('html5/html5-original.svg') },
  { name: 'Tailwind CSS', group: 'Frontend', symbol: devicon('tailwindcss/tailwindcss-original.svg') },
  { name: 'Bootstrap', group: 'Frontend', symbol: devicon('bootstrap/bootstrap-original.svg') },
  { name: 'Recharts', group: 'Frontend', symbol: '📈' },

  { name: 'Node.js', group: 'Backend', featured: true, symbol: devicon('nodejs/nodejs-original.svg') },
  { name: 'Express.js', group: 'Backend', symbol: devicon('express/express-original.svg', true) },
  { name: 'Flask', group: 'Backend', symbol: devicon('flask/flask-original.svg', true) },
  { name: 'RESTful APIs', group: 'Backend', featured: true, symbol: devicon('json/json-original.svg') },
  { name: 'Socket.io', group: 'Backend', symbol: devicon('socketio/socketio-original.svg', true) },
  { name: 'MongoDB', group: 'Backend', symbol: devicon('mongodb/mongodb-original.svg') },
  { name: 'MySQL', group: 'Backend', symbol: devicon('mysql/mysql-original.svg') },
  { name: 'Supabase', group: 'Backend', symbol: devicon('supabase/supabase-original.svg') },
  { name: 'Xano', group: 'Backend', symbol: '✖️' },

  { name: 'Retell AI', group: 'AI & Voice', symbol: '🤖' },
  { name: 'Claude AI', group: 'AI & Voice', symbol: '🧠' },
  { name: 'Plivo', group: 'AI & Voice', symbol: '📞' },
  { name: 'nexHealth APIs', group: 'AI & Voice', symbol: '🦷' },
  { name: 'OpenRouter', group: 'AI & Voice', symbol: '🌐' },
  { name: 'MediaPipe', group: 'AI & Voice', symbol: '👁️' },

  { name: 'Python', group: 'Data & Tools', symbol: devicon('python/python-original.svg') },
  { name: 'Java', group: 'Data & Tools', symbol: devicon('java/java-original.svg') },
  { name: 'Power BI', group: 'Data & Tools', symbol: '📊' },
  { name: 'Git / GitHub', group: 'Data & Tools', symbol: devicon('github/github-original.svg', true) },
  { name: 'Vercel', group: 'Data & Tools', symbol: devicon('vercel/vercel-original.svg', true) },
];

const GROUPS = ['All', 'Frontend', 'Backend', 'AI & Voice', 'Data & Tools'];

export default function SkillsSection() {
  const [group, setGroup] = useState('All');
  const visible = group === 'All' ? SKILLS : SKILLS.filter((s) => s.group === group);

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
        <p className="skills-subtitle">A curated set of languages, frameworks, and platforms I work with daily</p>
        <span className="cartoon-sticker skills-sticker" aria-hidden="true">daily drivers ★</span>
      </div>

      <div className="skills-filters" role="group" aria-label="Filter skills by category">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            className={`skill-group-btn ${group === g ? 'active' : ''}`}
            onClick={() => {
              if (g === group) return;
              setGroup(g);
              play('tick');
            }}
            aria-pressed={group === g}
            data-sound="none"
          >
            {g}
          </button>
        ))}
      </div>

      <div className="skills-orbit" key={group}>
        {visible.map((s, i) => (
          <span
            key={s.name}
            className={`skill-pill${s.featured ? ' featured' : ''}`}
            data-hover
            data-symbol={s.symbol}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {s.name}
          </span>
        ))}
      </div>

      <p className="skills-count">
        {visible.length} {visible.length === 1 ? 'tool' : 'tools'}
        {group !== 'All' ? ` in ${group}` : ' across the stack'}
      </p>
    </section>
  );
}
