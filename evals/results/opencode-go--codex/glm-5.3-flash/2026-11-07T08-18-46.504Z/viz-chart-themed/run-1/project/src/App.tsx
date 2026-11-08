import { useState } from 'react';
import type { ThemeType } from '@gravity-ui/uikit';
import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import './App.css';

type AppProps = {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
};

const data = [
  { label: 'Янв', value: 18 },
  { label: 'Фев', value: 26 },
  { label: 'Мар', value: 22 },
  { label: 'Апр', value: 35 },
  { label: 'Май', value: 31 },
  { label: 'Июн', value: 44 },
  { label: 'Июл', value: 39 },
  { label: 'Авг', value: 52 },
];

const chartWidth = 680;
const chartHeight = 320;
const paddingLeft = 48;
const paddingRight = 24;
const paddingTop = 24;
const paddingBottom = 44;

function App({ theme, onThemeChange }: AppProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = 60;
  const stepX = (chartWidth - paddingLeft - paddingRight) / (data.length - 1);
  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const points = data.map((item, index) => ({
    ...item,
    x: paddingLeft + index * stepX,
    y: paddingTop + usableHeight * (1 - item.value / maxValue),
  }));
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Динамика показателя</h1>
        <SegmentedRadioGroup value={theme} onUpdate={(value) => onThemeChange(value as ThemeType)}>
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </header>

      <section className="app__card">
        <svg
          className="chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="Линейный график динамики показателя по месяцам"
        >
          <defs>
            <linearGradient id="chart-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop className="chart__gradient-start" offset="0%" />
              <stop className="chart__gradient-end" offset="100%" />
            </linearGradient>
          </defs>

          {[0, 20, 40, 60].map((value) => {
            const y = paddingTop + usableHeight * (1 - value / maxValue);
            return (
              <g key={value}>
                <line
                  className={value === 0 ? 'chart__axis-line' : 'chart__grid-line'}
                  x1={paddingLeft}
                  x2={chartWidth - paddingRight}
                  y1={y}
                  y2={y}
                />
                <text className="chart__label" x={paddingLeft - 12} y={y + 4} textAnchor="end">
                  {value}
                </text>
              </g>
            );
          })}

          <path className="chart__area" d={areaPath} />
          <path className="chart__line" d={linePath} strokeWidth={3} />

          {points.map((point, index) => (
            <g key={point.label}>
              <text
                className="chart__label"
                x={point.x}
                y={chartHeight - paddingBottom + 24}
                textAnchor="middle"
              >
                {point.label}
              </text>
              <circle
                className="chart__point"
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 6 : 4}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            </g>
          ))}
        </svg>
      </section>
    </div>
  );
}

export { App };
