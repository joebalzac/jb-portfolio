import { sideProjects } from '../data/site';
import { Section } from './Section';

export function Projects() {
  return (
    <Section id="projects" title="projects">
      {sideProjects.length === 0 ? (
        <p className="text-sm italic text-muted">
          More soon — projects added here as they ship.
        </p>
      ) : (
        <div className="space-y-8">
          {sideProjects.map((item) => (
            <article key={item.name}>
              <h3 className="text-base font-medium text-ink">{item.name}.</h3>
              <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
                {item.description}{' '}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline decoration-line underline-offset-2 hover:decoration-ink transition-colors"
                  >
                    {item.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
