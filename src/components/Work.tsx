import { useState, type ReactNode } from 'react';
import { isPlainClick } from '../lib/useRoute';
import { work, type WorkItem } from '../data/site';
import { Section } from './Section';
import { WorkCover } from './work/WorkCover';
import { WorkDetail } from './work/WorkDetail';

function WorkCard({ item }: { item: WorkItem }) {
  return (
    <>
      <div>
        <h3 className="text-xl font-medium text-ink">{item.name}.</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {item.description}
        </p>
        <span className="mt-6 inline-flex items-center gap-1 rounded-full border border-line bg-bg/50 px-4 py-1.5 text-sm text-ink shadow-sm backdrop-blur-sm transition-colors group-hover:bg-bg/80">
          view case study <span aria-hidden>+</span>
        </span>
      </div>
      <WorkCover
        item={item}
        className="aspect-video transition-opacity group-hover:opacity-95"
      />
    </>
  );
}

const cardClass =
  'group grid w-full grid-cols-1 items-center gap-8 text-left md:grid-cols-2';

export function Work({ onNavigate }: { onNavigate?: (to: string) => void }) {
  const [selected, setSelected] = useState<WorkItem | null>(null);

  const select = (item: WorkItem | null) => {
    setSelected(item);
    document
      .getElementById('work')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Section id="work" title="work" wide={selected?.demo === 'apollo'}>
      {selected ? (
        <WorkDetail item={selected} onClose={() => select(null)} />
      ) : work.length === 0 ? (
        <p className="text-sm italic text-muted">Case studies coming soon.</p>
      ) : (
        <div className="flex flex-col gap-20">
          {work.map((item): ReactNode =>
            /* Items with their own route stay real links, so cmd-click and
               middle-click behave, and the URL is shareable. */
            item.href ? (
              <a
                key={item.name}
                href={item.href}
                onClick={(event) => {
                  if (!onNavigate || !isPlainClick(event)) return;
                  event.preventDefault();
                  onNavigate(item.href!);
                }}
                className={cardClass}
              >
                <WorkCard item={item} />
              </a>
            ) : (
              <button
                key={item.name}
                type="button"
                onClick={() => select(item)}
                className={cardClass}
              >
                <WorkCard item={item} />
              </button>
            ),
          )}
        </div>
      )}
    </Section>
  );
}
