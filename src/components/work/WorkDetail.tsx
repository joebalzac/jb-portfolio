import { useEffect, useState, type MouseEvent } from 'react';
import type { WorkImage, WorkItem, WorkSection } from '../../data/site';
import { WorkCover } from './WorkCover';

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

function MediaCarousel({ images }: { images: WorkImage[] }) {
  const [index, setIndex] = useState(0);
  const image = images[index];

  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative">
        <FramedShot image={image} />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setIndex((index - 1 + images.length) % images.length)
              }
              aria-label="Previous image"
              className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/90 text-ink backdrop-blur-sm transition-colors hover:bg-card"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIndex((index + 1) % images.length)}
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

      {images.length > 1 && (
        <div className="mt-4 flex items-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.caption + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${img.caption}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-accent' : 'w-1.5 bg-line hover:bg-faint'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaSection({
  section,
  itemName,
}: {
  section: WorkSection;
  itemName: string;
}) {
  return (
    <div className="space-y-4">
      {section.cover && (
        <WorkCover
          item={{
            name: itemName,
            cover: section.cover,
            coverLogo: section.coverLogo,
            coverLogoColor: section.coverLogoColor,
            brandTone: 'soft',
          }}
          className="aspect-16/10"
        />
      )}

      {section.hero && (
        <div>
          <FramedShot image={section.hero} aspectClassName="aspect-16/10" />
          <div className="mt-3">
            <p className="text-sm font-medium text-ink">{section.hero.caption}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {section.hero.description}
            </p>
          </div>
        </div>
      )}

      <MediaCarousel images={section.images} />
    </div>
  );
}

export function WorkDetail({ item, onClose }: WorkDetailProps) {
  const sections: WorkSection[] =
    item.sections && item.sections.length > 0
      ? item.sections
      : [
          {
            hero: item.images[0],
            images: item.images.slice(1),
          },
        ];

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

      <div className="space-y-16">
        {sections.map((section, i) => (
          <MediaSection
            key={`${section.hero?.caption ?? section.cover ?? i}`}
            section={section}
            itemName={item.name}
          />
        ))}
      </div>
    </div>
  );
}
