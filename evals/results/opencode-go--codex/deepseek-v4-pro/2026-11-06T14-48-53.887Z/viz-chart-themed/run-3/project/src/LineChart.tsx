import { useThemeType } from '@gravity-ui/uikit';

export interface DataPoint {
  x: number | string;
  y: number;
}

export interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

const PADDING = { top: 24, right: 24, bottom: 48, left: 56 };

export function LineChart({
  data,
  width = 640,
  height = 360,
  title,
  xLabel,
  yLabel,
}: LineChartProps) {
  const themeType = useThemeType();
  const isDark = themeType === 'dark';

  const colors = {
    bg: 'var(--g-color-base-background)',
    text: 'var(--g-color-text-primary)',
    axis: 'var(--g-color-infographics-axis)',
    line: isDark ? '#6BAEFF' : '#2F80ED',
    area: isDark ? 'rgba(107, 174, 255, 0.12)' : 'rgba(47, 128, 237, 0.10)',
    dot: isDark ? '#6BAEFF' : '#2F80ED',
    dotStroke: isDark ? '#1E1E24' : '#ffffff',
    grid: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
  };

  if (data.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.text,
        }}
      >
        Нет данных
      </div>
    );
  }

  const xs = data.map((d) => Number(d.x));
  const ys = data.map((d) => d.y);

  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  const toX = (v: number) => PADDING.left + ((v - xMin) / xRange) * plotW;
  const toY = (v: number) => PADDING.top + plotH - ((v - yMin) / yRange) * plotH;

  const points = data.map((d) => `${toX(Number(d.x))},${toY(d.y)}`).join(' ');

  const areaPoints = [
    `${toX(Number(data[0].x))},${PADDING.top + plotH}`,
    ...data.map((d) => `${toX(Number(d.x))},${toY(d.y)}`),
    `${toX(Number(data[data.length - 1].x))},${PADDING.top + plotH}`,
  ].join(' ');

  const yTicks = 5;
  const yTickValues = Array.from(
    { length: yTicks },
    (_, i) => yMin + (yRange / (yTicks - 1)) * i,
  );

  const xTicks =
    data.length <= 10
      ? data
      : [
          data[0],
          data[Math.floor(data.length / 4)],
          data[Math.floor(data.length / 2)],
          data[Math.floor((data.length * 3) / 4)],
          data[data.length - 1],
        ];

  return (
    <div style={{ width, height, fontFamily: 'var(--g-font-family-sans)' }}>
      {title && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 600,
            color: colors.text,
            marginBottom: 8,
          }}
        >
          {title}
        </div>
      )}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect width={width} height={height} fill={colors.bg} rx={4} />

        {yTickValues.map((v, i) => (
          <line
            key={i}
            x1={PADDING.left}
            y1={toY(v)}
            x2={width - PADDING.right}
            y2={toY(v)}
            stroke={colors.grid}
            strokeWidth={1}
          />
        ))}

        <polygon points={areaPoints} fill={colors.area} />

        <polyline
          points={points}
          fill="none"
          stroke={colors.line}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(Number(d.x))}
            cy={toY(d.y)}
            r={4}
            fill={colors.dot}
            stroke={colors.dotStroke}
            strokeWidth={2}
          />
        ))}

        {yTickValues.map((v, i) => (
          <text
            key={i}
            x={PADDING.left - 8}
            y={toY(v) + 4}
            textAnchor="end"
            fill={colors.text}
            fontSize={12}
            fontFamily="inherit"
          >
            {Number.isInteger(v) ? v : Number(v).toFixed(1)}
          </text>
        ))}

        {xTicks.map((d, i) => (
          <text
            key={i}
            x={toX(Number(d.x))}
            y={PADDING.top + plotH + 20}
            textAnchor="middle"
            fill={colors.text}
            fontSize={12}
            fontFamily="inherit"
          >
            {String(d.x)}
          </text>
        ))}

        {xLabel && (
          <text
            x={width / 2}
            y={height - 6}
            textAnchor="middle"
            fill={colors.text}
            fontSize={12}
            fontFamily="inherit"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={12}
            y={height / 2}
            textAnchor="middle"
            fill={colors.text}
            fontSize={12}
            fontFamily="inherit"
            transform={`rotate(-90, 12, ${height / 2})`}
          >
            {yLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
