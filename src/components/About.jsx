import useReveal from '../hooks/useReveal';

const experiences = [
  {
    role: 'Software Engineer',
    company: 'Trikon Software Labs',
    period: 'Apr 2026 – May 2026',
    location: 'India',
  },
  {
    role: 'Web Application Developer Intern',
    company: 'MBL Technologies Pvt Ltd',
    period: 'Jan 2025 – Mar 2025',
    location: 'India',
  },
  {
    role: 'Software Developer Intern',
    company: 'Accolade Tech Solutions Pvt Ltd',
    period: 'Mar 2023 – Aug 2023',
    location: 'Mangalore, India',
  },
];

export default function About() {
  const ref = useReveal();

  return (
    <section id="about" style={{ padding: '120px 0' }}>
      <div className="container" ref={ref}>
        <div className="section-label">About</div>
        <div className="about-grid">
          <div className="about-left reveal">
            <p>
              I'm <strong>Sujith</strong>, a Software Developer based in{' '}
              <strong>Mangalore, India</strong> with hands-on experience
              building full-stack web applications.
            </p>
            <p>
              I specialize in creating <strong>responsive UIs</strong>,{' '}
              <strong>secure REST APIs</strong>, and{' '}
              <strong>AI-integrated platforms</strong> that are production-ready
              and data-driven.
            </p>
            <p>
              Seeking to contribute to a <strong>product-focused
              engineering team</strong> where I can deliver measurable impact.
            </p>

            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-num">3+</div>
                <div className="stat-label">Years Experience</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">10+</div>
                <div className="stat-label">Projects Shipped</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">MCA</div>
                <div className="stat-label">NMAM Institute of Tech</div>
              </div>
              <div className="stat-item">
                <div className="stat-num">30%</div>
                <div className="stat-label">Query Optimization</div>
              </div>
            </div>
          </div>

          <div className="about-right">
            {experiences.map((exp, i) => (
              <div key={i} className="exp-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="exp-role">{exp.role}</div>
                <div className="exp-company">{exp.company}</div>
                <div className="exp-period">{exp.period} · {exp.location}</div>
              </div>
            ))}

            <div className="edu-grid" style={{ marginTop: 0 }}>
              <div className="edu-card reveal">
                <div className="edu-degree">Master of Computer Applications</div>
                <div className="edu-school">NMAM Institute of Technology, Nitte</div>
                <div className="edu-period">Graduated Aug 2025</div>
              </div>
              <div className="edu-card reveal">
                <div className="edu-degree">Bachelor of Computer Applications</div>
                <div className="edu-school">SDM College of Business Management</div>
                <div className="edu-period">Graduated July 2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
