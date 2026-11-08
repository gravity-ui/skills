import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

import { useElementSize } from '../dashboard/useElementSize';
import { ChartTooltip, tooltipPosition, type Series } from './chartParts';
import { formatTick, niceTicks } from './format';

interface Props {
  labels: string[];
  series: Series[];
  format: (v: number) => string;
}

const M = { top: 10, right: 60, bottom: 24, left: 46 };
const LABEL_GAP = 14;

/** Раздвигает подписи конца линий, чтобы они не наезжали друг на друга. */
function spreadLabels(ys: number[], min: number, max: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const placed: number[] = [];
  for (const { y } of order) {
    const prev = placed[placed.length - 1];
    placed.push(prev === undefined ? y : Math.max(y, prev + LABEL_GAP));
  }
  const overflow = placed[placed.length - 1] - max;
  if (overflow > 0) for (let i = 0; i < placed.length; i++) placed[i] -= overflow;
  for (let i = 0; i < placed.length; i++) placed[i] = Math.max(min, placed[i]);
  const out = new Array<number>(ys.length);
  order.forEach(({ i }, k) => (out[i] = placed[k]));
  return out;
}

export function LineChart({ labels, series, format }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const [hover, setHover] = useState<number | null>(null);

  const n = labels.length;
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;

  const { ticks, yMax } = useMemo(() => {
    const max = Math.max(0, ...series.flatMap((s) => s.values));
    const ticks = niceTicks(max, 4);
    return { ticks, yMax: ticks[ticks.length - 1] || 1 };
  }, [series]);

  if (innerW <= 20 || innerH <= 20 || n === 0) return <div ref={ref} className="viz-chart" />;

  const xAt = (i: number) => M.left + (n > 1 ? (i * innerW) / (n - 1) : innerW / 2);
  const yAt = (v: number) => M.top + innerH - (v / yMax) * innerH;
  const stepX = n > 1 ? innerW / (n - 1) : innerW;

  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));
  const endYs = spreadLabels(
    series.map((s) => yAt(s.values[n - 1])),
    M.top + 6,
    M.top + innerH - 6,
  );

  const pick = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left - M.left;
    setHover(Math.max(0, Math.min(n - 1, Math.round(x / stepX))));
  };
  const onPointerMove = (e: PointerEvent<SVGRectElement>) => pick(e.clientX);
  const onKeyDown = (e: KeyboardEvent<SVGRectElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setHover((h) => {
        const base = h ?? n - 1;
        return Math.max(0, Math.min(n - 1, base + (e.key === 'ArrowLeft' ? -1 : 1)));
      });
    } else if (e.key === 'Escape') {
      setHover(null);
    }
  };

  return (
    <div ref={ref} className="viz-chart">
      <svg width={width} height={height} aria-hidden="true">
        {/* сетка и ось Y */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={M.left + innerW} y1={yAt(t)} y2={yAt(t)} stroke="var(--viz-grid)" strokeWidth={1} />
            <text className="viz-tick" x={M.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle">
              {formatTick(t, yMax)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={M.left + innerW} y1={yAt(0)} y2={yAt(0)} stroke="var(--viz-axis)" strokeWidth={1} />

        {/* ось X */}
        {labels.map((l, i) =>
          (i % labelEvery === 0 && (n - 1 - i) * stepX >= 60) || i === n - 1 ? (
            <text key={i} className="viz-tick" x={xAt(i)} y={M.top + innerH + 16} textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}>
              {l}
            </text>
          ) : null,
        )}

        {/* линии */}
        {series.map((s) => (
          <path
            key={s.name}
            d={s.values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {/* подписи концов: значение, с выноской при сдвиге */}
        {series.map((s, k) => {
          const x = xAt(n - 1);
          const y = yAt(s.values[n - 1]);
          const ly = endYs[k];
          return (
            <g key={s.name}>
              {Math.abs(ly - y) > 1 && <line x1={x + 6} y1={y} x2={x + 10} y2={ly} stroke="var(--viz-axis)" strokeWidth={1} />}
              <circle cx={x} cy={y} r={5} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
              <text className="viz-value" x={x + 12} y={ly} dominantBaseline="middle">
                {format(s.values[n - 1])}
              </text>
            </g>
          );
        })}

        {/* перекрестие */}
        {hover !== null && (
          <g>
            <line x1={xAt(hover)} x2={xAt(hover)} y1={M.top} y2={M.top + innerH} stroke="var(--viz-axis)" strokeWidth={1} />
            {series.map((s) => (
              <circle key={s.name} cx={xAt(hover)} cy={yAt(s.values[hover])} r={5} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
            ))}
          </g>
        )}

        <rect
          className="viz-chart__overlay"
          x={M.left - stepX / 2}
          y={M.top}
          width={innerW + stepX}
          height={innerH}
          fill="transparent"
          tabIndex={0}
          role="img"
          aria-label={`График: ${series.map((s) => s.name).join(', ')}. Стрелки влево и вправо переключают дату.`}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKeyDown}
          onBlur={() => setHover(null)}
        />
        <rect className="viz-chart__focus-ring" x={M.left} y={M.top} width={innerW} height={innerH} fill="none" stroke="none" strokeWidth={2} rx={2} pointerEvents="none" />
      </svg>

      {hover !== null && (
        <ChartTooltip
          title={labels[hover]}
          rows={series.map((s) => ({ name: s.name, value: format(s.values[hover]), color: s.color }))}
          style={tooltipPosition(xAt(hover), M.top, width)}
        />
      )}
    </div>
  );
}
