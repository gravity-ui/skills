import { useThemeType } from '@gravity-ui/uikit';

interface DataPoint {
  label: string;
  value: number;
}

const DATA: DataPoint[] = [
  { label: 'Jan', value: 400 },
  { label: 'Feb', value: 650 },
  { label: 'Mar', value: 520 },
  { label: 'Apr', value: 780 },
  { label: 'May', value: 600 },
  { label: 'Jun', value: 900 },
  { label: 'Jul', value: 830 },
  { label: 'Aug', value: 950 },
  { label: 'Sep', value: 700 },
  { label: 'Oct', value: 880 },
  { label: 'Nov', value: 1020 },
  { label: 'Dec', value: 1100 },
];

const PADDING = { top: 30, right: 30, bottom: 50, left: 60 };
const WIDTH = 700;
const HEIGHT = 400;

function useChartColors(isDark: boolean) {
  return {
    bg: isDark ? '#1e1e2e' : '#ffffff',
    grid: isDark ? '#3a3a4a' : '#e0e0e0',
    text: isDark ? '#a0a0b0' : '#666666',
    line: isDark ? '#7aa2f7' : '#4f46e5',
    dot: isDark ? '#7aa2f7' : '#4f46e5',
    dotStroke: isDark ? '#1e1e2e' : '#ffffff',
    area: isDark ? 'rgba(122, 162, 247, 0.15)' : 'rgba(79, 70, 229, 0.1)',
  };
}

function pathFromPoints(
  points: { x: number; y: number }[],
): string {
  if (points.length === 0) return '';
  return points.reduce((d, p, i) => {
    return d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');
}

function areaFromPoints(
  points: { x: number; y: number }[],
  chartHeight: number,
): string {
  if (points.length < 2) return '';
  const line = points.reduce((d, p, i) => {
    return d + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');
  return `${line} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;
}

function yAxisTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(min + step * i));
}

export function App() {
  const themeType = useThemeType();
  const isDark = themeType === 'dark';
  const colors = useChartColors(isDark);

  const chartWidth = WIDTH - PADDING.left - PADDING.right;
  const chartHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const values = DATA.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const yTicks = yAxisTicks(minVal, maxVal, 6);

  const points = DATA.map((d, i) => ({
    x: PADDING.left + (i / (DATA.length - 1)) * chartWidth,
    y:
      PADDING.top +
      chartHeight -
      ((d.value - minVal) / (maxVal - minVal)) * chartHeight,
  }));

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100vh',
        background: isDark ? '#13131f' : '#f5f5f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'system-ui, sans-serif',
        transition: 'background 0.3s',
      }}
    >
      <h2
        style={{
          margin: '0 0 16px',
          color: isDark ? '#cdd6f4' : '#1e1e2e',
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Monthly Revenue
      </h2>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{
          width: '100%',
          maxWidth: 700,
          height: 'auto',
          background: colors.bg,
          borderRadius: 12,
          boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.4)'
            : '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Y axis grid lines */}
        {yTicks.map((tick) => {
          const y =
            PADDING.top +
            chartHeight -
            ((tick - minVal) / (maxVal - minVal)) * chartHeight;
          return (
            <g key={`grid-${tick}`}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={WIDTH - PADDING.right}
                y2={y}
                stroke={colors.grid}
                strokeDasharray="4 4"
              />
              <text
                x={PADDING.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={colors.text}
                fontSize={12}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path
          d={areaFromPoints(points, HEIGHT - PADDING.bottom)}
          fill={colors.area}
          stroke="none"
        />

        {/* Data line */}
        <path
          d={pathFromPoints(points)}
          fill="none"
          stroke={colors.line}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data dots */}
        {points.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={colors.dot}
            stroke={colors.dotStroke}
            strokeWidth={2}
          />
        ))}

        {/* X axis labels */}
        {DATA.map((d, i) => {
          const x =
            PADDING.left + (i / (DATA.length - 1)) * chartWidth;
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={HEIGHT - PADDING.bottom + 18}
              textAnchor="middle"
              fill={colors.text}
              fontSize={11}
            >
              {d.label}
            </text>
          );
        })}

        {/* X axis baseline */}
        <line
          x1={PADDING.left}
          y1={HEIGHT - PADDING.bottom}
          x2={WIDTH - PADDING.right}
          y2={HEIGHT - PADDING.bottom}
          stroke={colors.grid}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}
