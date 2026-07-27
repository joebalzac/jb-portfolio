import { useState } from 'react';
import { writing, type WritingPost } from '../data/site';
import { Section } from './Section';
import { WritingDetail } from './writing/WritingDetail';

export function Writing() {
  const [selected, setSelected] = useState<WritingPost | null>(null);

  const select = (post: WritingPost | null) => {
    setSelected(post);
    document
      .getElementById('writing')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Section id="writing" title="writing">
      {selected ? (
        <WritingDetail post={selected} onClose={() => select(null)} />
      ) : writing.length === 0 ? (
        <p className="text-sm italic text-muted">Nothing published yet.</p>
      ) : (
        <div className="space-y-20">
          {writing.map((post) => (
            <button
              key={post.title}
              type="button"
              onClick={() => select(post)}
              className="group grid w-full grid-cols-1 items-center gap-8 text-left md:grid-cols-2"
            >
              <div>
                <p className="font-mono text-xs text-faint">{post.date}</p>
                <h3 className="mt-2 text-xl font-medium text-ink">
                  {post.title}
                  <span className="text-accent">.</span>
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
                <span className="mt-6 inline-flex items-center gap-1 rounded-full border border-line bg-bg/50 px-4 py-1.5 text-sm text-ink shadow-sm backdrop-blur-sm transition-colors group-hover:bg-bg/80">
                  read <span aria-hidden>+</span>
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl transition-opacity group-hover:opacity-95">
                <img
                  src={post.cover}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
