import React, { useState } from 'react';
import { useThemeType } from '@gravity-ui/uikit';

type LineChartProps = {
  data: { x: string; y: number }[];
};

export function LineChart({ data }: LineChartProps) {
  const theme = useThemeType();
  const gradientId = `line-chart-fill-${theme}`;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const width = 560;
  const height = 300;
  const padding = { top: 24, right: 24, bottom: 40, left: 48 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const maxX = data.length - 1;
  const minY = Math.min(...data.map((point) => point.y));
  const maxY = Math.max(...data.map((point) => point.y));
  const yMin = Math.floor(minY / 10) * 10;
  const yMax = Math.ceil(maxY / 10) * 10;

  const scaleX = (index: number) => padding.left + (index / maxX) * plotWidth;
  const scaleY = (value: number) => padding.top + (1 - (value - yMin) / (yMax - yMin)) * plotHeight;

  const points = data.map((point) => ({ x: scaleX(data.indexOf(point)), y: scaleY(point.y) }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');
  const areaPath = `${path} L${scaleX(maxX)},${scaleY(yMin)} L${scaleX(0)},${scaleY(yMin)} Z`;
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`line-chart-fill-${theme}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--g-color-text-brand-heavy)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--g-color-text-brand-heavy)" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g stroke="var(--g-color-line-generic)" strokeWidth="1">
        {yTicks.map((tick) => (
          <line key={tick} x1={padding.left} x2={width - padding.right} y1={scaleY(tick)} y2={scaleY(tick)} />
        ))}
      </g>

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke="var(--g-color-text-brand-heavy)" strokeWidth="2.5" strokeLinecap="round" />

      {yTicks.map((tick) => (
        <text
          key={tick}
          x={padding.left - 10}
          y={scaleY(tick)}
          dominantBaseline="middle"
          textAnchor="end"
          fontSize="11"
          fill="var(--g-color-text-secondary)"
        >
          {tick}
        </text>
      ))}

      {data.map((point, index) => {
        const isActive = index === hoveredIndex;
        return (
          <g key={point.x}>
            {index % 2 === 0 && (
              <text
                x={scaleX(index)}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="var(--g-color-text-secondary)"
              >
                {point.x}
              </text>
            )}

            {isActive && <line x1={scaleX(index)} x2={scaleX(index)} y1={padding.top} y2={scaleY(yMin)} stroke="var(--g-color-line-generic)" />}

            <circle
              cx={scaleX(index)}
              cy={scaleY(point.y)}
              r={isActive ? 5 : 0}
              fill="var(--g-color-base-background)"
              stroke="var(--g-color-text-brand-heavy)"
              strokeWidth="2.5"
            />

            <rect
              x={scaleX(index) - plotWidth / (2 * maxX)}
              y={padding.top}
              width={plotWidth / maxX}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />

            {isActive && (
              <g>
                <rect x={scaleX(index) - 36} y={scaleY(point.y) - 44} width="72" height="32" rx="6" fill="var(--g-color-base-background)" />
                <text x={scaleX(index)} y={scaleY(point.y) - 24} textAnchor="middle" fontSize="11" fill="var(--g-color-text-primary)">
                  {point.x}: {point.y}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
