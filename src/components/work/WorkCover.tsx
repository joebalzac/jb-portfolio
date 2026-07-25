import type { WorkItem } from '../../data/site';
import { EliseAiLogo } from './EliseAiLogo';

type WorkCoverProps = {
  item: WorkItem;
  className?: string;
};

export function WorkCover({ item, className = '' }: WorkCoverProps) {
  const brandTone = item.brandTone ?? 'soft';

  return (
    <div
      className={[
        'relative flex items-center justify-center overflow-hidden rounded-2xl',
        brandTone === 'dark' ? 'bg-ink' : 'bg-[#ebe8f2]',
        className,
      ].join(' ')}
    >
      {item.cover ? (
        <>
          <img
            src={item.cover}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/35 via-ink/10 to-transparent" />
          <div className="relative z-10 flex items-center justify-center">
            {item.coverLogo === 'eliseai' ? (
              <EliseAiLogo className="h-4 w-auto text-white drop-shadow-sm sm:h-5" />
            ) : (
              <span className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {item.name}
              </span>
            )}
          </div>
        </>
      ) : (
        <span
          className={
            brandTone === 'dark'
              ? 'text-2xl font-medium tracking-tight text-bg sm:text-3xl'
              : 'font-mono text-xs text-faint'
          }
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
