import { TextReveal } from './ExperienceTimeline';
import ProjectBox from './ProjectBox';

export default function ProjectsSection() {
  return (
    <div id="work">
      <section className="projects-head">
        <span className="typewriter-terminal-tag">&gt;_ work.dir</span>
        <h2 className="projects-title">
          <TextReveal delay={0.05}>Projects</TextReveal>
        </h2>
        <p className="projects-sub">
          Real products, live in people&apos;s pockets. Pick a card from the box.
        </p>
      </section>

      <ProjectBox />
    </div>
  );
}
