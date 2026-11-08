import { useState } from "react";
import type { ChartProps } from "../components/Visualization";
export default function SalesEngine({
  data,
  comparison,
  color = "#8b68df",
  onHover,
}: ChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 1000,
    h = 288,
    left = 0,
    top = 12,
    bottom = 260;
  const max = Math.max(
    60000,
    Math.ceil(
      data.reduce(
        (m, p) => Math.max(m, p.value, comparison ? (p.previous ?? 0) : 0),
        0,
      ) / 20000,
    ) * 20000,
  );
  const coords = (previous = false) =>
    data.map((p, i) => [
      left + (i / Math.max(1, data.length - 1)) * w,
      bottom -
        ((previous ? (p.previous ?? 0) : p.value) / max) * (bottom - top),
    ]);
  const smooth = (points: number[][]) =>
    points.reduce((s, p, i) => {
      if (!i) return `M${p[0]},${p[1]}`;
      const a = points[i - 1];
      const mid = (a[0] + p[0]) / 2;
      return `${s} C${mid},${a[1]} ${mid},${p[1]} ${p[0]},${p[1]}`;
    }, "");
  const line = smooth(coords());
  const prev = smooth(coords(true));
  const point = hover === null ? null : data[hover];
  return (
    <div className="plot-wrap sales-plot">
      <div className="y-axis">
        {[1, 0.75, 0.5, 0.25, 0]
          .map((r) => `${(max * r).toLocaleString("ru-RU")} ₽`)
          .map((s) => (
            <span key={s}>{s}</span>
          ))}
      </div>
      <div className="plot-body">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="sales-svg"
          role="img"
          aria-label="Линейный график выручки за выбранный период"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.max(
              0,
              Math.min(
                data.length - 1,
                Math.round(
                  ((e.clientX - r.left) / r.width) * (data.length - 1),
                ),
              ),
            );
            setHover(i);
            onHover?.(data[i]);
          }}
          onMouseLeave={() => {
            setHover(null);
            onHover?.(null);
          }}
        >
          <defs>
            <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity=".19" />
              <stop offset="100%" stopColor={color} stopOpacity=".015" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              x2={w}
              y1={top + (i * (bottom - top)) / 4}
              y2={top + (i * (bottom - top)) / 4}
              stroke="#eeedf1"
              strokeDasharray="4 5"
            />
          ))}
          <path
            d={`${line} L${w},${bottom} L0,${bottom} Z`}
            fill="url(#sales-fill)"
          />
          {comparison && (
            <path
              d={prev}
              fill="none"
              stroke="#c7b6eb"
              strokeWidth="2"
              strokeDasharray="6 6"
              vectorEffect="non-scaling-stroke"
            />
          )}
          <path
            d={line}
            fill="none"
            stroke={color}
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          {hover !== null && (
            <>
              <line
                x1={coords()[hover][0]}
                x2={coords()[hover][0]}
                y1={top}
                y2={bottom}
                stroke={color}
                strokeDasharray="4 4"
              />
              <circle
                cx={coords()[hover][0]}
                cy={coords()[hover][1]}
                r="5"
                fill={color}
                stroke="white"
                strokeWidth="3"
              />
            </>
          )}
        </svg>
        <div className="x-axis">
          {[0, 0.17, 0.34, 0.51, 0.68, 0.85, 1].map((p, i) => (
            <span key={i}>
              {new Date(
                data[Math.round(p * (data.length - 1))].time,
              ).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
            </span>
          ))}
        </div>
        {point && (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(76, Math.max(3, (hover! / (data.length - 1)) * 100))}%`,
            }}
          >
            <span>
              {new Date(point.time).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
              })}
            </span>
            <strong>{point.value.toLocaleString("ru-RU")} ₽</strong>
            {comparison && (
              <small>Ранее: {point.previous?.toLocaleString("ru-RU")} ₽</small>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
