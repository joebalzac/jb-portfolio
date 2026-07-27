import { useEffect, type MouseEvent } from 'react';
import type { WritingPost } from '../../data/site';

type WritingDetailProps = {
  post: WritingPost;
  onClose: () => void;
};

export function WritingDetail({ post, onClose }: WritingDetailProps) {
  useEffect(() => {
    document.documentElement.dataset.cursorMode = 'close';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      delete document.documentElement.dataset.cursorMode;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleSurfaceClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    onClose();
  };

  return (
    <article
      role="dialog"
      aria-label={post.title}
      onClick={handleSurfaceClick}
      className="mx-auto max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl">
        <img
          src={post.cover}
          alt=""
          className="aspect-video w-full object-cover"
        />
      </div>

      <header className="mt-10">
        <p className="font-mono text-xs text-faint">{post.date}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          {post.title}
          <span className="text-accent">.</span>
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </header>

      <div className="mt-10 space-y-5 border-t border-line pt-10">
        {post.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="text-[15px] leading-7 text-ink/90"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
