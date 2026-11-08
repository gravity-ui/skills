interface Props {
  values: number[];
}

const W = 240;
const H = 32;

/** Trend in the de-emphasis gray, with the current period marked in the accent hue. */
export function Sparkline({ values }: Props) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (W - 6) + 3;
    const y = H - 4 - ((v - min) / span) * (H - 8);
    return { x, y };
  });
  const last = pts[pts.length - 1];

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMid meet" aria-hidden="true">
      <polyline
        points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="none"
        className="spark-line"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r={4} className="spark-dot" />
    </svg>
  );
}
