interface SparklineProps {
  values: number[];
  color: string;
}

/** 12-point sparkline: 2px line in the series hue + 10% area wash. */
export function Sparkline({values, color}: SparklineProps) {
  const W = 120;
  const H = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => (values.length === 1 ? W / 2 : (W * i) / (values.length - 1));
  const y = (v: number) => 2 + (H - 4) * (1 - (v - min) / span);
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={`${line} L${W},${H} L0,${H} Z`} fill={color} opacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
