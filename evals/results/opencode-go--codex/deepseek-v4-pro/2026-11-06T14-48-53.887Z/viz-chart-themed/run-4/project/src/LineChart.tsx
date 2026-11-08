import { useThemeValue } from '@gravity-ui/uikit';

export interface LineChartProps {
  data: { x: number | string; y: number }[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };

export function LineChart({
  data,
  width = 600,
  height = 400,
  margin = DEFAULT_MARGIN,
}: LineChartProps) {
  const theme = useThemeValue();
  const isDark = theme.startsWith('dark');

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));
  const yRange = maxY - minY || 1;

  const xScale = (i: number) => (i / (data.length - 1)) * innerWidth;
  const yScale = (val: number) =>
    innerHeight - ((val - minY) / yRange) * innerHeight;

  const points = data
    .map((d, i) => `${xScale(i)},${yScale(d.y)}`)
    .join(' ');

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    const val = minY + (yRange / (yTicks - 1)) * i;
    return Math.round(val);
  });

  return (
    <svg width={width} height={height} style={{ fontFamily: 'inherit' }}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Y-axis grid lines */}
        {yTickValues.map((val) => (
          <line
            key={`grid-${val}`}
            x1={0}
            y1={yScale(val)}
            x2={innerWidth}
            y2={yScale(val)}
            stroke="var(--g-color-line-generic)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* X-axis */}
        <line
          x1={0}
          y1={innerHeight}
          x2={innerWidth}
          y2={innerHeight}
          stroke="var(--g-color-line-generic)"
          strokeWidth="1"
        />

        {/* Y-axis */}
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={innerHeight}
          stroke="var(--g-color-line-generic)"
          strokeWidth="1"
        />

        {/* Y-axis labels */}
        {yTickValues.map((val) => (
          <text
            key={`ylabel-${val}`}
            x={-8}
            y={yScale(val) + 4}
            textAnchor="end"
            fill="var(--g-color-text-secondary)"
            fontSize="12"
          >
            {val}
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`xlabel-${i}`}
            x={xScale(i)}
            y={innerHeight + 20}
            textAnchor="middle"
            fill="var(--g-color-text-secondary)"
            fontSize="12"
          >
            {d.x}
          </text>
        ))}

        {/* Area under the line */}
        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--g-color-base-brand)"
            stopOpacity={isDark ? 0.25 : 0.2}
          />
          <stop
            offset="100%"
            stopColor="var(--g-color-base-brand)"
            stopOpacity={0.02}
          />
        </linearGradient>
        <polygon
          points={`0,${innerHeight} ${points} ${innerWidth},${innerHeight}`}
          fill="url(#area-gradient)"
        />

        {/* The line */}
        <polyline
          points={points}
          fill="none"
          stroke="var(--g-color-line-brand)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={`dot-${i}`}>
            <circle
              cx={xScale(i)}
              cy={yScale(d.y)}
              r={0}
              fill={isDark ? 'var(--g-color-base-float)' : 'var(--g-color-base-background)'}
              stroke="var(--g-color-line-brand)"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                from="0"
                to="4"
                dur="0.3s"
                begin={`${i * 0.08}s`}
                fill="freeze"
              />
            </circle>
          </g>
        ))}
      </g>
    </svg>
  );
}
