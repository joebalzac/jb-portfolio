import { useEffect, useState, type MouseEvent } from 'react';
import type { WorkImage, WorkItem } from '../../data/site';

type WorkDetailProps = {
  item: WorkItem;
  onClose: () => void;
};

function FramedShot({
  image,
  aspectClassName = 'aspect-4/3',
}: {
  image?: WorkImage;
  aspectClassName?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-card">
      {image?.src && (
        <img
          src={image.src}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
        />
      )}

      <div
        className={`relative flex items-center justify-center p-5 sm:p-7 ${aspectClassName}`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 sm:p-3">
          {image?.src ? (
            <img
              src={image.src}
              alt={image.caption}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <span className="font-mono text-xs text-faint">
              image placeholder
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkDetail({ item, onClose }: WorkDetailProps) {
  const [hero, ...carousel] = item.images;
  const [index, setIndex] = useState(0);
  const image = carousel[index];

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

  useEffect(() => {
    setIndex(0);
  }, [item.name]);

  const handleSurfaceClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={`${item.name} case study`}
      onClick={handleSurfaceClick}
      className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
    >
      <div>
        <h3 className="text-3xl font-semibold tracking-tight text-ink">
          {item.name}.
        </h3>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-muted">
          {item.description}
        </p>

        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent/15"
          >
            view <span aria-hidden>+</span>
          </a>
        )}

        <h4 className="mt-12 text-sm text-faint">what i did</h4>
        <ul className="mt-4 space-y-4">
          {item.whatIDid.map((line) => (
            <li key={line} className="flex items-start gap-3">
              <span className="mt-0.5 text-faint" aria-hidden>
                →
              </span>
              <span className="text-sm leading-relaxed text-ink">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        {hero && (
          <div>
            <FramedShot image={hero} aspectClassName="aspect-16/10" />
            <div className="mt-3">
              <p className="text-sm font-medium text-ink">{hero.caption}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {hero.description}
              </p>
            </div>
          </div>
        )}

        {carousel.length > 0 && (
          <div>
            <div className="relative">
              <FramedShot image={image} />

              {carousel.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setIndex((index - 1 + carousel.length) % carousel.length)
                    }
                    aria-label="Previous image"
                    className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur-sm transition-colors hover:bg-card"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex((index + 1) % carousel.length)}
                    aria-label="Next image"
                    className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur-sm transition-colors hover:bg-card"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="mt-3">
              <p className="text-sm font-medium text-ink">{image.caption}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {image.description}
              </p>
            </div>

            {carousel.length > 1 && (
              <div className="mt-4 flex items-center gap-2">
                {carousel.map((img, i) => (
                  <button
                    key={img.caption + i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to ${img.caption}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index
                        ? 'w-5 bg-accent'
                        : 'w-1.5 bg-line hover:bg-faint'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
