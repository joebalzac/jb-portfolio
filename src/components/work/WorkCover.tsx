import type { WorkItem } from '../../data/site';
import { EliseAiLogo } from './EliseAiLogo';

type WorkCoverProps = {
  item: Pick<
    WorkItem,
    'name' | 'cover' | 'coverLogo' | 'coverLogoColor' | 'brandTone'
  >;
  className?: string;
};

export function WorkCover({ item, className = '' }: WorkCoverProps) {
  const brandTone = item.brandTone ?? 'soft';
  const logoColor = item.coverLogoColor ?? '#ffffff';
  const isDarkLogo = logoColor.toLowerCase() !== '#ffffff';

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
          <div
            className={
              isDarkLogo
                ? 'absolute inset-0 bg-linear-to-t from-[#181819]/5 via-transparent to-transparent'
                : 'absolute inset-0 bg-linear-to-t from-ink/8 via-transparent to-transparent'
            }
          />
          <div className="relative z-10 flex items-center justify-center">
            {item.coverLogo === 'eliseai' ? (
              <EliseAiLogo
                className="h-4 w-auto drop-shadow-sm sm:h-5"
                style={{ color: logoColor }}
              />
            ) : (
              <span
                className="text-2xl font-medium tracking-tight sm:text-3xl"
                style={{ color: logoColor }}
              >
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
