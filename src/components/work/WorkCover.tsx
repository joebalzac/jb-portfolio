import type { WorkItem } from '../../data/site';
import { EliseAiLogo } from './EliseAiLogo';

type WorkCoverProps = {
  item: Pick<
    WorkItem,
    'name' | 'cover' | 'coverLogo' | 'coverLogoColor' | 'brandTone'
  >;
  className?: string;
};

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M8 1.2 9.1 6.1 14 7.2 9.1 8.3 8 13.2 6.9 8.3 2 7.2 6.9 6.1 8 1.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WorkCover({ item, className = '' }: WorkCoverProps) {
  const brandTone = item.brandTone ?? 'soft';
  const logoColor = item.coverLogoColor ?? '#ffffff';
  const isDarkLogo = logoColor.toLowerCase() !== '#ffffff';
  const gradientOnly = !item.cover && brandTone === 'dark';

  return (
    <div
      className={[
        'relative flex items-center justify-center overflow-hidden rounded-2xl',
        item.cover
          ? 'bg-transparent'
          : brandTone === 'dark'
            ? 'bg-ink'
            : 'bg-[#ebe8f2]',
        className,
      ].join(' ')}
    >
      {item.cover ? (
        <>
          <img
            src={item.cover}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
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
      ) : gradientOnly ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_20%,#2a3348_0%,#141820_42%,#0a0b0e_100%)]"
          />
          <div
            aria-hidden
            className="absolute -top-1/4 left-1/4 h-3/4 w-1/2 rounded-full bg-[#4b6fff]/18 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -right-10 -bottom-16 h-2/3 w-1/2 rounded-full bg-[#6b8cff]/12 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-white/5"
          />
          <div className="relative z-10 flex items-center gap-2.5 text-white">
            <SparkIcon className="h-4 w-4 text-[#6b8cff] sm:h-5 sm:w-5" />
            <span className="text-lg font-medium tracking-tight sm:text-xl">
              {item.name}
            </span>
          </div>
        </>
      ) : (
        <span className="font-mono text-xs text-faint">{item.name}</span>
      )}
    </div>
  );
}
