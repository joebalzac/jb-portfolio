const dots = [
  { color: 'bg-accent', delay: '0ms' },
  { color: 'bg-amber-400', delay: '150ms' },
  { color: 'bg-blue-400', delay: '300ms' },
];

export function LoadingDots() {
  return (
    <div className="flex gap-2">
      {dots.map((dot) => (
        <span
          key={dot.color}
          className={`h-3 w-3 animate-bounce rounded-full ${dot.color}`}
          style={{ animationDelay: dot.delay, animationDuration: '900ms' }}
        />
      ))}
    </div>
  );
}
