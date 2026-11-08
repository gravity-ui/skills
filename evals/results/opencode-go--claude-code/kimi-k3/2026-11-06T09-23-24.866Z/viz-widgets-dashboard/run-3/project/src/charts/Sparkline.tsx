/** Мини-график на 12 точек: прошлое — приглушённым шагом рампы, текущий отрезок — акцентом. */
export function Sparkline({ points, width = 96, height = 24 }: { points: number[]; width?: number; height?: number }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const span = max - min || 1;
  const x = (i: number) => (i / (points.length - 1)) * (width - 2) + 1;
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4);

  const path = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const all = points.map((v, i) => ({ x: x(i), y: y(v) }));
  const recent = all.slice(-4); // текущий период — акцентный отрезок

  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      <path d={path(all)} fill="none" stroke="var(--viz-spark)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(recent)} fill="none" stroke="var(--viz-series-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={all[all.length - 1].x} cy={all[all.length - 1].y} r={3} fill="var(--viz-series-1)" />
    </svg>
  );
}
