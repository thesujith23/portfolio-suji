import useReveal from '../hooks/useReveal';

const projects = [
  {
    num: '01',
    title: 'Expense Tracker & Financial Analytics Dashboard',
    desc: 'A secure multi-user financial tracking system with JWT-based authentication, role-protected routes, and an interactive dashboard with dynamic charts. MongoDB aggregation pipelines power real-time income, expense, and category-wise analytics.',
    stack: ['MERN', 'Recharts', 'JWT', 'MongoDB Aggregation'],
    link: '#',
  },
  {
    num: '02',
    title: 'Book Store Management System',
    desc: 'Full CRUD inventory management with secure REST APIs built on Node.js/Express and JWT authentication. Features a responsive React UI with reusable components for adding, updating, and viewing book records.',
    stack: ['MongoDB', 'Express.js', 'React', 'Node.js'],
    link: '#',
  },
  {
    num: '03',
    title: 'TechHire — Job Portal',
    desc: 'A job portal featuring 20+ company listings with real-time filtering by location and job title. Implemented dynamic routing, file-upload application flow, and reusable UI components. Deployed on Vercel with CI/CD pipeline achieving sub-2s load times.',
    stack: ['Next.js', 'Tailwind CSS', 'Vercel', 'App Router'],
    link: '#',
    live: true,
  },
  {
    num: '04',
    title: 'DigitiZedHealth — Dental Clinic Platform',
    desc: 'A full-stack dental clinic platform enabling patients to book, reschedule, and cancel appointments via an AI-powered voice call agent using Retell AI. Integrated with Eaglesoft for real-time patient and appointment data sync.',
    stack: ['Retell AI', 'nexHealth APIs', 'Supabase', 'Plivo', 'Stitch'],
    link: '#',
  },
];

export default function Projects() {
  const ref = useReveal();

  return (
    <section id="projects" style={{ padding: '120px 0' }}>
      <div className="container" ref={ref}>
        <div className="section-label">Projects</div>
        <h2 className="section-title reveal">Selected Work</h2>
        <div className="projects-list">
          {projects.map((p, i) => (
            <a
              key={i}
              href={p.link}
              className="project-item reveal"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="project-num">{p.num}</div>
              <div>
                <div className="project-title">
                  {p.title}
                  {p.live && (
                    <span style={{
                      fontSize: '0.5rem', fontFamily: 'var(--font-mono)',
                      color: 'var(--accent)', border: '1px solid rgba(168,255,87,0.3)',
                      padding: '2px 8px', borderRadius: '100px', marginLeft: '12px',
                      verticalAlign: 'middle', letterSpacing: '0.1em',
                    }}>LIVE</span>
                  )}
                </div>
                <div className="project-desc">{p.desc}</div>
                <div className="project-stack">
                  {p.stack.map((s, j) => (
                    <span key={j} className="stack-tag">{s}</span>
                  ))}
                </div>
              </div>
              <div className="project-arrow">↗</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
