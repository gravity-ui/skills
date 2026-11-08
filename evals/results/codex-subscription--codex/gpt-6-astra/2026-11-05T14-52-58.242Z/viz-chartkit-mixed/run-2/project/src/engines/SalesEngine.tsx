import { useEffect, useId, useRef, useState } from "react";
import type { ChartProps, Point } from "../components/Visualization";
const H = 230,
  L = 58,
  R = 22,
  T = 18,
  B = 34;
function smooth(points: Point[]) {
  return points
    .map((p, i, a) => {
      if (!i) return `M${p.x},${p.y}`;
      const prev = a[i - 1];
      const before = a[i - 2] || prev;
      const after = a[i + 1] || p;
      return `C${prev.x + (p.x - before.x) / 6},${prev.y + (p.y - before.y) / 6} ${p.x - (after.x - prev.x) / 6},${p.y - (after.y - prev.y) / 6} ${p.x},${p.y}`;
    })
    .join(" ");
}
export default function SalesEngine({
  series,
  formatX,
  formatY,
  unit,
}: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [W, setWidth] = useState(1000);
  const fillId = useId();
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const observer = new ResizeObserver(() =>
      setWidth(Math.max(240, svg.getBoundingClientRect().width)),
    );
    observer.observe(svg);
    return () => observer.disconnect();
  }, [series.length]);
  const [hover, setHover] = useState<number | null>(null);
  const all = series.flatMap((s) => s.data);
  if (!all.length)
    return <div className="chart-loading">Нет данных за этот период</div>;
  const max = Math.max(
    50000,
    Math.ceil(Math.max(...all.map((p) => p.y)) / 50000) * 50000,
  );
  const minX = Math.min(...all.map((p) => p.x)),
    maxX = Math.max(...all.map((p) => p.x));
  const sx = (x: number) => L + ((x - minX) / (maxX - minX || 1)) * (W - L - R),
    sy = (y: number) => H - B - (y / max) * (H - T - B);
  const index =
    hover === null
      ? null
      : Math.max(
          0,
          Math.min(
            series[0].data.length - 1,
            Math.round(
              ((hover - L) / (W - L - R)) * (series[0].data.length - 1),
            ),
          ),
        );
  const point = index === null ? null : series[0].data[index];
  return (
    <div className="sales-plot" onMouseLeave={() => setHover(null)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Линейный график: ${series.map((s) => s.label).join(", ")}`}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(((e.clientX - r.left) / r.width) * W);
        }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9984e9" stopOpacity=".14" />
            <stop offset="100%" stopColor="#9984e9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line
              x1={L}
              x2={W - R}
              y1={sy((max * i) / 4)}
              y2={sy((max * i) / 4)}
              stroke="#ececf1"
              strokeDasharray={i ? "3 5" : undefined}
            />
            <text
              x={L - 13}
              y={sy((max * i) / 4) + 4}
              textAnchor="end"
              fill="#91929e"
              fontSize="11"
            >
              {i ? `${Math.round((max * i) / 4 / 1000)} тыс.` : "0"}
            </text>
          </g>
        ))}
        {series.map((s, i) => {
          const pts = s.data.map((p) => ({ x: sx(p.x), y: sy(p.y) }));
          const d = smooth(pts);
          return (
            <g key={s.id}>
              {i === 0 && (
                <path
                  d={`${d} L${pts.at(-1)!.x},${H - B} L${L},${H - B} Z`}
                  fill={`url(#${fillId})`}
                />
              )}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={i === 0 ? 2.8 : 2.2}
                strokeDasharray={s.dashed ? "5 6" : undefined}
              />
            </g>
          );
        })}
        {series[0].data
          .filter(
            (_, i, a) =>
              i % Math.max(1, Math.ceil((a.length - 1) / (W < 500 ? 3 : 6))) ===
                0 || i === a.length - 1,
          )
          .map((p) => (
            <text
              key={p.x}
              x={sx(p.x)}
              y={H - 9}
              textAnchor="middle"
              fill="#91929e"
              fontSize="11"
            >
              {formatX(p.x)}
            </text>
          ))}
        {point && (
          <g>
            <line
              x1={sx(point.x)}
              x2={sx(point.x)}
              y1={T}
              y2={H - B}
              stroke="#aca5be"
              strokeDasharray="3 4"
            />
            {series.map(
              (s) =>
                s.data[index!] && (
                  <circle
                    key={s.id}
                    cx={sx(point.x)}
                    cy={sy(s.data[index!].y)}
                    r="5"
                    fill={s.color}
                    stroke="white"
                    strokeWidth="3"
                  />
                ),
            )}
          </g>
        )}
      </svg>
      {point && (
        <div
          className="plot-tooltip"
          style={{
            left: `${Math.min(76, Math.max(6, (sx(point.x) / W) * 100))}%`,
            top: 10,
          }}
        >
          <b>{formatX(point.x)}</b>
          {series.map((s) => (
            <div key={s.id}>
              <span>
                <i style={{ background: s.color }} />
                {s.label}
              </span>
              <strong>
                {formatY(s.data[index!]?.y || 0)} {unit}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
