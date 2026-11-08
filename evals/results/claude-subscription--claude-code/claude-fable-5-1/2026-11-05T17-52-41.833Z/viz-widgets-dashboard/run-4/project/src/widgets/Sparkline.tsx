import { useRef } from 'react';

import { useElementSize } from '../dashboard/useElementSize';

/** 12-точечный спарклайн: линия в приглушённом тоне, текущий период — акцентной точкой. */
export function Sparkline({ values, accent }: { values: number[]; accent: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(ref);
  const n = values.length;
  if (width <= 0 || height <= 0 || n < 2) return <div ref={ref} className="stat-tile__spark" />;

  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const xAt = (i: number) => pad + (i * (width - pad * 2)) / (n - 1);
  const yAt = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');

  return (
    <div ref={ref} className="stat-tile__spark">
      <svg width={width} height={height} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <path d={d} fill="none" stroke="var(--viz-spark)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={xAt(n - 1)} cy={yAt(values[n - 1])} r={5} fill={accent} stroke="var(--viz-surface)" strokeWidth={2} />
      </svg>
    </div>
  );
}
