import { AppIcon, StarsIcon } from './AppIcon';

/**
 * Apollo's suggestion card.
 *
 * Geometry taken from the shipped `.atlas-suggestion-card`: 12px radius, 14px
 * gap, 14px/16px padding, and a container query at 480px that switches the
 * card from a centred row to a 126px-tall top-aligned block. Container query
 * rather than a viewport breakpoint, because the card has to reflow to the
 * column it sits in, not to the window.
 */
export function SuggestionCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    /* The container must be an ancestor of the element that queries it, so the
       card measures its own grid cell rather than the page column. */
    <div className="@container w-full min-w-0">
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full min-w-0 cursor-pointer items-center gap-3.5 rounded-xl border border-app-line bg-white px-4 py-3.5 text-left text-app-ink transition-[border-color,box-shadow,background-color,transform] duration-[128ms] hover:-translate-y-px hover:border-app-purple-5/40 hover:shadow-[0_4px_16px_rgba(17,24,39,0.06)] focus-visible:ring-2 focus-visible:ring-app-purple-5 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 @min-[480px]:min-h-[126px] @min-[480px]:items-start @min-[480px]:py-[18px]"
      >
        <span className="flex size-[38px] shrink-0 items-center justify-center self-start rounded-[10px] bg-app-purple-0 text-app-purple-5">
          <StarsIcon className="size-[18px]" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-snug font-semibold tracking-[-0.01em] text-app-ink">
            {title}
          </span>
          <span className="mt-1.5 block line-clamp-3 text-[14px] leading-[1.45] text-app-muted">
            {description}
          </span>
        </span>

        <AppIcon
          name="chevron-right"
          className="size-4 self-center text-app-faint transition-transform duration-[128ms] group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </button>
    </div>
  );
}
