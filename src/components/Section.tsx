import type { ReactNode } from 'react';

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 px-8 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-sm text-muted">{title}</h2>
        <div className="mb-10 border-t border-line" />
        {children}
      </div>
    </section>
  );
}
