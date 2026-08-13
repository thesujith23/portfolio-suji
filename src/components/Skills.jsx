import useReveal from '../hooks/useReveal';

const skillGroups = [
  { label: 'Languages', skills: ['Java', 'Python', 'JavaScript (ES6+)'] },
  { label: 'Frontend', skills: ['React.js', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap'] },
  { label: 'Backend', skills: ['Node.js', 'Express.js', 'Flask', 'RESTful APIs'] },
  { label: 'Databases', skills: ['MongoDB', 'MySQL', 'Supabase', 'Xano'] },
  { label: 'AI & Integrations', skills: ['Retell AI', 'nexHealth APIs', 'Claude AI', 'Plivo', 'OpenRouter', 'MediaPipe'] },
  { label: 'Data & Visualization', skills: ['Power BI', 'Recharts', 'MongoDB Aggregation', 'Stitch'] },
  { label: 'Tools', skills: ['Git', 'GitHub', 'Vercel', 'Socket.io'] },
];

export default function Skills() {
  const ref = useReveal();

  return (
    <section id="skills" className="skills-section" style={{ padding: '120px 0' }}>
      <div className="container" ref={ref}>
        <div className="section-label">Technical Skills</div>
        <h2 className="section-title reveal">What I work with</h2>
        <div className="skills-grid">
          {skillGroups.map((group, i) => (
            <div key={i} className="skill-category reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className="skill-cat-label">{group.label}</div>
              <div className="skill-tags">
                {group.skills.map((s, j) => (
                  <span key={j} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
