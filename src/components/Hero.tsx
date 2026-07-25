import { profile } from '../data/site';

export function Hero() {
  return (
    <section className="px-8 py-32 pb-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-6xl md:text-7xl">
          {profile.name.toLowerCase()}
          <span className="text-accent">.</span>
        </h1>
        <div className="mt-6 max-w-lg space-y-1 text-base text-muted sm:text-lg">
          {profile.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
