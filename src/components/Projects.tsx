import { useState } from 'react';
import { sideProjects, type WorkItem } from '../data/site';
import { Section } from './Section';
import { WorkCover } from './work/WorkCover';
import { WorkDetail } from './work/WorkDetail';

export function Projects() {
  const [selected, setSelected] = useState<WorkItem | null>(null);

  const select = (item: WorkItem | null) => {
    setSelected(item);
    document
      .getElementById('projects')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Section id="projects" title="projects">
      {selected ? (
        <WorkDetail item={selected} onClose={() => select(null)} />
      ) : sideProjects.length === 0 ? (
        <p className="text-sm italic text-muted">
          More soon — projects added here as they ship.
        </p>
      ) : (
        <div className="space-y-20">
          {sideProjects.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => select(item)}
              className="group grid w-full grid-cols-1 items-center gap-8 text-left md:grid-cols-2"
            >
              <div>
                <h3 className="text-xl font-medium text-ink">{item.name}.</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 rounded-full border border-line bg-bg/50 px-4 py-1.5 text-sm text-ink shadow-sm backdrop-blur-sm transition-colors group-hover:bg-bg/80">
                  view project <span aria-hidden>+</span>
                </span>
              </div>
              <WorkCover
                item={item}
                className="aspect-video border border-line transition-colors group-hover:border-ink/20"
              />
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
