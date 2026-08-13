import useReveal from '../hooks/useReveal';

const contacts = [
  { label: 'Email', value: 'sujith7344@gmail.com', href: 'mailto:sujith7344@gmail.com', tag: 'EMAIL' },
  { label: 'GitHub', value: 'github.com/thesujith23', href: 'https://github.com/thesujith23', tag: 'GITHUB' },
  { label: 'Phone', value: '+91 82176 15895', href: 'tel:+918217615895', tag: 'CALL' },
  { label: 'Location', value: 'Mangalore, India', href: '#', tag: 'LOCATION' },
];

export default function Contact() {
  const ref = useReveal();

  return (
    <section id="contact" className="contact-section" style={{ padding: '120px 0' }}>
      <div className="container" ref={ref}>
        <div className="section-label">Contact</div>
        <div className="contact-inner">
          <div>
            <h2 className="contact-heading reveal">
              Let's build
              <span className="highlight">something</span>
              great.
            </h2>
          </div>
          <div className="contact-links">
            {contacts.map((c, i) => (
              <a
                key={i}
                href={c.href}
                className="contact-link reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <div>
                  <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.1em' }}>{c.label}</div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text)' }}>{c.value}</div>
                </div>
                <span>{c.tag} →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
