/** 12-точечный спарклайн: вся линия приглушённая, последний отрезок и точка — в акценте. */
export function Sparkline({ values, width = 96, height = 28 }: { values: number[]; width?: number; height?: number }) {
  const n = values.length;
  if (n < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 4;
  const x = (i: number) => pad + (i / (n - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const basePath = `M${points.slice(0, -1).join(' L')}`;
  const lastPath = `M${points[n - 2]} L${points[n - 1]}`;
  return (
    <svg width={width} height={height} className="viz-spark" aria-hidden="true">
      <path d={basePath} fill="none" stroke="var(--viz-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={lastPath} fill="none" stroke="var(--viz-series-1)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(values[n - 1])} r={4} fill="var(--viz-series-1)" className="viz-dot" />
    </svg>
  );
}
