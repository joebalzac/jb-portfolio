import type { ReactNode } from 'react';

type CraftTileProps = {
  label: string;
  children: ReactNode;
};

export function CraftTile({ label, children }: CraftTileProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm text-ink">{label}</h3>
      <div className="relative flex min-h-64 items-center justify-center rounded-2xl border border-line bg-card p-8">
        <span className="absolute top-4 left-4 h-2 w-2 rounded-full bg-ink" />
        {children}
      </div>
    </div>
  );
}
