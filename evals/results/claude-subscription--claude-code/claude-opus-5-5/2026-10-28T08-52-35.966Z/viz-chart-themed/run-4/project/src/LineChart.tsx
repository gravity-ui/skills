import * as React from 'react';
import { Text, useThemeType } from '@gravity-ui/uikit';

import './LineChart.css';

export interface LineSeries {
  id: string;
  name: string;
  values: number[];
}

export interface LineChartProps {
  categories: string[];
  series: LineSeries[];
  height?: number;
  formatValue?: (value: number) => string;
}

// Категориальная палитра: для каждой темы — свои шаги одних и тех же оттенков,
// проверенные на контраст и различимость при дальтонизме относительно фона
// Gravity UI (#ffffff в светлой теме, #221d22 в тёмной).
const PALETTE = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500'],
} as const;

const MARGIN = { top: 16, right: 16, bottom: 32, left: 48 };
const END_LABEL_WIDTH = 160;
const MIN_WIDTH_FOR_END_LABELS = 480;

const defaultFormat = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });

function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? rough;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function LineChart({ categories, series, height = 320, formatValue = defaultFormat.format }: LineChartProps) {
  const themeType = useThemeType();
  const colors = PALETTE[themeType];
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const showEndLabels = width >= MIN_WIDTH_FOR_END_LABELS;
  const plotLeft = MARGIN.left;
  const plotRight = Math.max(plotLeft + 1, width - MARGIN.right - (showEndLabels ? END_LABEL_WIDTH : 0));
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;

  const maxValue = Math.max(0, ...series.flatMap((s) => s.values));
  const yTicks = niceTicks(maxValue);
  const yMax = yTicks[yTicks.length - 1] || 1;

  const lastIndex = Math.max(categories.length - 1, 1);
  const x = (i: number) => plotLeft + ((plotRight - plotLeft) * i) / lastIndex;
  const y = (v: number) => plotBottom - ((plotBottom - plotTop) * v) / yMax;

  // Подписи оси X прореживаем, чтобы они не наезжали друг на друга.
  const xLabelEvery = Math.max(1, Math.ceil((categories.length * 56) / Math.max(plotRight - plotLeft, 1)));

  const indexFromClientX = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left;
    const i = Math.round(((px - plotLeft) / (plotRight - plotLeft)) * lastIndex);
    return Math.min(categories.length - 1, Math.max(0, i));
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    setActiveIndex(indexFromClientX(e.clientX, e.currentTarget.getBoundingClientRect()));
  };

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      setActiveIndex((i) => Math.min(categories.length - 1, Math.max(0, (i ?? (delta > 0 ? -1 : categories.length)) + delta)));
    } else if (e.key === 'Escape') {
      setActiveIndex(null);
    }
  };

  const tooltipOnLeft = activeIndex !== null && x(activeIndex) > (plotLeft + plotRight) / 2;

  return (
    <div className="line-chart">
      {series.length > 1 && (
        <ul className="line-chart__legend">
          {series.map((s, si) => (
            <li key={s.id} className="line-chart__legend-item">
              <span className="line-chart__key" style={{ background: colors[si] }} />
              <Text variant="body-1" color="secondary">
                {s.name}
              </Text>
            </li>
          ))}
        </ul>
      )}

      <div ref={containerRef} className="line-chart__canvas" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`Линейный график: ${series.map((s) => s.name).join(', ')}. Стрелки влево/вправо — значения по точкам.`}
            tabIndex={0}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActiveIndex(null)}
            onKeyDown={handleKeyDown}
            onBlur={() => setActiveIndex(null)}
          >
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  className={t === 0 ? 'line-chart__baseline' : 'line-chart__grid'}
                  x1={plotLeft}
                  x2={plotRight}
                  y1={y(t)}
                  y2={y(t)}
                />
                <text className="line-chart__tick" x={plotLeft - 8} y={y(t)} dy="0.32em" textAnchor="end">
                  {formatValue(t)}
                </text>
              </g>
            ))}

            {categories.map((c, i) =>
              i % xLabelEvery === 0 || i === categories.length - 1 ? (
                <text key={c} className="line-chart__tick" x={x(i)} y={plotBottom + 20} textAnchor="middle">
                  {c}
                </text>
              ) : null,
            )}

            {activeIndex !== null && (
              <line className="line-chart__crosshair" x1={x(activeIndex)} x2={x(activeIndex)} y1={plotTop} y2={plotBottom} />
            )}

            {series.map((s, si) => (
              <path
                key={s.id}
                className="line-chart__line"
                stroke={colors[si]}
                d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join('')}
              />
            ))}

            {series.map((s, si) => {
              const i = activeIndex ?? s.values.length - 1;
              return <circle key={s.id} className="line-chart__dot" cx={x(i)} cy={y(s.values[i])} r={4} fill={colors[si]} />;
            })}

            {showEndLabels &&
              series.map((s) => {
                const last = s.values.length - 1;
                return (
                  <text key={s.id} x={plotRight + 10} y={y(s.values[last])} dy="0.32em">
                    <tspan className="line-chart__end-value">{formatValue(s.values[last])}</tspan>
                    <tspan className="line-chart__end-name" dx={6}>
                      {s.name}
                    </tspan>
                  </text>
                );
              })}
          </svg>
        )}

        {activeIndex !== null && (
          <div
            className="line-chart__tooltip"
            role="status"
            style={{
              top: plotTop,
              left: tooltipOnLeft ? undefined : x(activeIndex) + 12,
              right: tooltipOnLeft ? width - x(activeIndex) + 12 : undefined,
            }}
          >
            <Text variant="caption-2" color="secondary" as="div">
              {categories[activeIndex]}
            </Text>
            {series.map((s, si) => (
              <div key={s.id} className="line-chart__tooltip-row">
                <span className="line-chart__key" style={{ background: colors[si] }} />
                <Text variant="subheader-1">{formatValue(s.values[activeIndex])}</Text>
                <Text variant="body-1" color="secondary">
                  {s.name}
                </Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
