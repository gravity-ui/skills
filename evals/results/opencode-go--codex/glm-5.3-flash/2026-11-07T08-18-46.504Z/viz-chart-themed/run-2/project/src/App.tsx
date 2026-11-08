import { useMemo, useState } from 'react';

import { SegmentedRadioGroup, SegmentedRadioGroupOption, ThemeProvider } from '@gravity-ui/uikit';

import './App.css';

type ChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: ChartPoint[];
};

type ScaledPoint = ChartPoint & {
  x: number;
  y: number;
};

const chartPadding = {
  top: 24,
  right: 20,
  bottom: 36,
  left: 44,
};

function LineChart({ data }: LineChartProps) {
  const width = 640;
  const height = 320;
  const plotWidth = width - chartPadding.left - chartPadding.right;
  const plotHeight = height - chartPadding.top - chartPadding.bottom;

  const chartGeometry = useMemo(() => {
    const values = data.map((point) => point.value);
    const rawMinimum = Math.min(...values);
    const rawMaximum = Math.max(...values);
    const valuePadding = Math.max((rawMaximum - rawMinimum) * 0.1, 8);
    const minimum = Math.max(0, rawMinimum - valuePadding);
    const maximum = rawMaximum + valuePadding;

    const xScale = (index: number) =>
      chartPadding.left +
      (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const yScale = (value: number) =>
      chartPadding.top + plotHeight - ((value - minimum) / (maximum - minimum)) * plotHeight;

    const points: ScaledPoint[] = data.map((point, index) => ({
      ...point,
      x: xScale(index),
      y: yScale(point.value),
    }));
    const gridLines = Array.from({ length: 5 }, (_, index) => {
      const value = minimum + ((maximum - minimum) / 4) * index;

      return { value, y: yScale(value) };
    });
    const ticks = data.map((point, index) => ({
      label: point.label,
      x: xScale(index),
    }));

    return { gridLines, points, ticks };
  }, [data, plotHeight, plotWidth]);

  const linePath = chartGeometry.points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');
  const baseline = chartPadding.top + plotHeight;
  const lastPoint = chartGeometry.points.at(-1)!;
  const firstPoint = chartGeometry.points[0];
  const areaPath = `${linePath} L${lastPoint.x},${baseline} L${firstPoint.x},${baseline} Z`;

  return (
    <svg
      aria-label="Динамика активности за неделю"
      className="line-chart"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="line-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop className="line-chart-area-start" offset="0%" />
          <stop className="line-chart-area-end" offset="100%" />
        </linearGradient>
      </defs>

      {chartGeometry.gridLines.map((gridLine) => (
        <g key={gridLine.value}>
          <line
            className="line-chart-grid"
            x1={chartPadding.left}
            x2={width - chartPadding.right}
            y1={gridLine.y}
            y2={gridLine.y}
          />
          <text
            className="line-chart-axis-label"
            dominantBaseline="middle"
            textAnchor="end"
            x={chartPadding.left - 10}
            y={gridLine.y}
          >
            {Math.round(gridLine.value)}
          </text>
        </g>
      ))}

      {chartGeometry.ticks.map((tick) => (
        <text
          className="line-chart-axis-label"
          key={tick.label}
          textAnchor="middle"
          x={tick.x}
          y={height - 12}
        >
          {tick.label}
        </text>
      ))}

      <path className="line-chart-area" d={areaPath} fill="url(#line-chart-fill)" />
      <path className="line-chart-line" d={linePath} />
      {chartGeometry.points.map((point) => (
        <circle className="line-chart-point" cx={point.x} cy={point.y} key={point.label} r={4}>
          <title>{`${point.label}: ${point.value}`}</title>
        </circle>
      ))}
    </svg>
  );
}

type ThemeSwitcherProps = {
  onUpdate: (theme: 'light' | 'dark') => void;
  value: 'light' | 'dark';
};

function ThemeSwitcher({ onUpdate, value }: ThemeSwitcherProps) {
  return (
    <SegmentedRadioGroup name="app-theme" onUpdate={onUpdate} size="s" value={value}>
      <SegmentedRadioGroupOption value="light">Светлая</SegmentedRadioGroupOption>
      <SegmentedRadioGroupOption value="dark">Тёмная</SegmentedRadioGroupOption>
    </SegmentedRadioGroup>
  );
}

export function App() {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');

  const lineData: ChartPoint[] = [
    { label: 'Пн', value: 18 },
    { label: 'Вт', value: 32 },
    { label: 'Ср', value: 24 },
    { label: 'Чт', value: 41 },
    { label: 'Пт', value: 36 },
    { label: 'Сб', value: 53 },
    { label: 'Вс', value: 47 },
  ];

  return (
    <ThemeProvider scoped theme={selectedTheme}>
      <main className="app-screen">
        <div className="app-card">
          <header className="app-header">
            <div>
              <p className="app-overline">Аналитика</p>
              <h1 className="app-title">Активность за неделю</h1>
            </div>
            <ThemeSwitcher onUpdate={setSelectedTheme} value={selectedTheme} />
          </header>
          <p className="app-description">
            График адаптируется к текущей цветовой теме интерфейса.
          </p>
          <LineChart data={lineData} />
        </div>
      </main>
    </ThemeProvider>
  );
}
