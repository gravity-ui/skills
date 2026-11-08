import { useElementSize } from '../useElementSize';

/** 12 точек тренда: история приглушённая, текущая точка — акцентом. */
export function Sparkline({ values, height = 32 }: { values: number[]; height?: number }) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 5;
  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
  const y = (v: number) => pad + (height - pad * 2) * (1 - (max === min ? 0.5 : (v - min) / (max - min)));
  const last = values.length - 1;

  return (
    <div ref={ref} className="viz-spark" style={{ height }} aria-hidden>
      {width > 0 && (
        <svg width={width} height={height}>
          <polyline
            points={values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            stroke="var(--viz-muted)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polyline
            points={`${x(last - 1)},${y(values[last - 1])} ${x(last)},${y(values[last])}`}
            fill="none"
            stroke="var(--viz-series-1)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={x(last)} cy={y(values[last])} r={4} fill="var(--viz-series-1)" stroke="var(--viz-surface)" strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}
