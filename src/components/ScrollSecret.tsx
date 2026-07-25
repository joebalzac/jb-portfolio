import { useEffect, useRef } from 'react';

const MESSAGES = ['nothing to see here.', 'still nothing to see.', 'go touch grass.'];
const MAX_PULL = 132;
const ASSEMBLE_AT = 72;
const CELL = 4;
const GLYPHS = ['#', '#', '#', '@', ':'];
const DRIFT_DISTANCE = 40;
const FADE_DURATION = 3000;

type Cell = {
  x: number;
  y: number;
  char: string;
  intensity: number;
  seed: number;
  accent: boolean;
};

function seededRandom(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function computeCells(
  text: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
): Cell[] {
  const off = document.createElement('canvas');
  off.width = canvasWidth;
  off.height = canvasHeight;
  const octx = off.getContext('2d');
  if (!octx) return [];

  const cssWidth = canvasWidth / dpr;
  const fontSizeCss = Math.min(96, Math.max(44, cssWidth / 13));
  const fontSize = fontSizeCss * dpr;

  octx.font = `700 ${fontSize}px "Geist Sans", sans-serif`;
  octx.fillStyle = '#000';
  octx.textBaseline = 'alphabetic';
  octx.textAlign = 'center';
  octx.fillText(text, canvasWidth / 2, fontSize * 0.95);

  const { data } = octx.getImageData(0, 0, canvasWidth, canvasHeight);
  const cell = CELL * dpr;
  const cells: Cell[] = [];

  for (let gy = 0; gy < canvasHeight; gy += cell) {
    for (let gx = 0; gx < canvasWidth; gx += cell) {
      const alpha = data[(gy * canvasWidth + gx) * 4 + 3];
      if (alpha < 28) continue;

      const intensity = alpha / 255;
      const seed = gx * 7.13 + gy * 13.7;
      const glyphPick = Math.floor(seededRandom(seed) * GLYPHS.length);

      cells.push({
        x: gx,
        y: gy,
        char: GLYPHS[glyphPick],
        intensity,
        seed,
        accent: seededRandom(seed + 1) > 0.94,
      });
    }
  }

  return cells;
}

export function ScrollSecret() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!container || !canvas || !ctx) return;

    const pageContent = document.getElementById('page-content');
    if (pageContent) pageContent.style.willChange = 'transform';

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pull = 0;
    let armed = true;
    let messageIndex = -1;
    let cells: Cell[] = [];
    let revealStart: number | null = null;
    let rafId: number | null = null;
    let fadedOut = false;

    const navHeight = () =>
      document.querySelector('header')?.getBoundingClientRect().height ?? 64;

    const rebuildCells = () => {
      if (messageIndex < 0) return;
      cells = computeCells(
        MESSAGES[messageIndex],
        canvas.width,
        canvas.height,
        dpr,
      );
    };

    const resize = () => {
      container.style.top = `${navHeight()}px`;
      container.style.height = `${MAX_PULL}px`;
      canvas.width = window.innerWidth * dpr;
      canvas.height = MAX_PULL * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${MAX_PULL}px`;
      rebuildCells();
      draw();
    };

    const draw = () => {
      const cellSize = CELL * dpr;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (pull <= 0 || cells.length === 0 || fadedOut) return;

      let displayProgress = Math.min(1, pull / ASSEMBLE_AT);
      let drift = 0;

      if (revealStart !== null) {
        const t = Math.min(1, (performance.now() - revealStart) / FADE_DURATION);
        displayProgress = 1 - t;
        drift = -t * DRIFT_DISTANCE * dpr;
      }

      if (displayProgress <= 0) return;

      // Scatter early, lock into the word as pull progresses
      const maxDrip = 26 * dpr * (1 - displayProgress);

      for (const c of cells) {
        const drip = seededRandom(c.seed) * maxDrip;
        const alpha =
          c.intensity * displayProgress * (0.78 + seededRandom(c.seed + 2) * 0.22);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.accent ? '#ff2f77' : '#1a1a1a';
        ctx.font = `${cellSize * 1.25}px "Geist Mono", monospace`;
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.fillText(c.char, c.x, c.y + drip + drift);
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      draw();
      if (revealStart !== null && performance.now() - revealStart < FADE_DURATION) {
        rafId = requestAnimationFrame(tick);
      } else {
        revealStart = null;
        rafId = null;
        release();
      }
    };

    const startReveal = () => {
      fadedOut = false;
      revealStart = performance.now();
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    const setPull = (next: number, bounce: boolean) => {
      pull = Math.max(0, Math.min(MAX_PULL, next));
      if (pageContent) {
        pageContent.style.transition = bounce
          ? 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'transform 60ms linear';
        pageContent.style.transform = `translateY(${pull}px)`;
      }
      draw();
    };

    const release = () => {
      if (pull === 0) return;
      fadedOut = false;
      setPull(0, true);
      armed = true;
    };

    const handleWheel = (event: WheelEvent) => {
      if (window.scrollY > 2) {
        release();
        return;
      }

      if (event.deltaY < 0) {
        setPull(pull + Math.abs(event.deltaY) * 0.6, false);
        if (pull >= MAX_PULL && armed) {
          armed = false;
          messageIndex = (messageIndex + 1) % MESSAGES.length;
          rebuildCells();
          startReveal();
        }
      } else if (event.deltaY > 0) {
        release();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', handleWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (pageContent) {
        pageContent.style.transition = '';
        pageContent.style.transform = '';
        pageContent.style.willChange = '';
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 z-10 overflow-hidden bg-bg"
    >
      <div className="absolute inset-x-0 top-0">
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
}
