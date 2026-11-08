import * as React from 'react';
import { Button, Table, Text, type TableColumnConfig } from '@gravity-ui/uikit';

import type { ChartData, Series } from './data';
import './LineChart.css';

export interface LineChartProps {
  data: ChartData;
  /** Height of the plot area without the x-axis band, px. */
  plotHeight?: number;
}

const MARGIN = { top: 16, right: 12, bottom: 8, left: 8 };
const X_AXIS_BAND = 28;
const Y_TICK_WIDTH = 40;
const END_LABEL_GAP = 10;
const END_LABEL_MIN_SPACING = 14;
const MAX_SERIES = 3;
/** End labels may take at most this share of the chart width; past it the legend carries identity. */
const END_LABEL_MAX_SHARE = 0.3;
const END_LABEL_FONT_SIZE = 12;

const numberFormat = new Intl.NumberFormat('ru-RU');

/** Nice-number ticks: 0 .. ceil(max) in `count` clean steps. */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const niceStep =
    residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10;
  const step = niceStep * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return ticks;
}

function useElementWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Width of `text` in the chart's own font, so reserved space matches what is drawn. */
function measureText(text: string, fontFamily: string, fontSize: number): number {
  if (measureCtx === undefined) {
    measureCtx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  }
  if (!measureCtx) return text.length * fontSize * 0.6;
  measureCtx.font = `${fontSize}px ${fontFamily}`;
  return measureCtx.measureText(text).width;
}

function seriesColor(index: number): string {
  return `var(--chart-series-${index + 1})`;
}

/** Direct end-labels only when every line end is far enough from its neighbour. */
function endLabelsFit(endYs: number[]): boolean {
  const sorted = [...endYs].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i += 1) {
    if (sorted[i] - sorted[i - 1] < END_LABEL_MIN_SPACING) return false;
  }
  return true;
}

export function LineChart({ data, plotHeight = 240 }: LineChartProps) {
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [view, setView] = React.useState<'chart' | 'table'>('chart');
  const chartId = React.useId();

  if (data.series.length > MAX_SERIES) {
    throw new Error(`LineChart supports up to ${MAX_SERIES} series; fold the rest into "Other".`);
  }

  const { categories, series } = data;
  const height = MARGIN.top + plotHeight + X_AXIS_BAND + MARGIN.bottom;
  const left = MARGIN.left + Y_TICK_WIDTH;
  const baseline = MARGIN.top + plotHeight;

  const maxValue = Math.max(0, ...series.flatMap((s) => s.values));
  const ticks = React.useMemo(() => niceTicks(maxValue), [maxValue]);
  const yMax = ticks[ticks.length - 1] || 1;
  const yAt = (v: number) => baseline - (plotHeight * v) / yMax;

  // Direct end-labels: only when the line ends are far enough apart vertically
  // and the longest name fits in a reasonable share of the width. Otherwise the
  // legend alone carries identity and the plot keeps the space.
  const endYs = series.map((s) => yAt(s.values[s.values.length - 1]));
  const fontFamily = plotRef.current ? getComputedStyle(plotRef.current).fontFamily : 'sans-serif';
  const widestLabel = Math.max(0, ...series.map((s) => measureText(s.name, fontFamily, END_LABEL_FONT_SIZE)));
  const endLabelReserve = END_LABEL_GAP + widestLabel + 4;
  const showEndLabels =
    series.length > 1 && endLabelsFit(endYs) && endLabelReserve <= width * END_LABEL_MAX_SHARE;

  const right = showEndLabels ? endLabelReserve : MARGIN.right;
  const plotWidth = Math.max(0, width - left - right);

  const xAt = (i: number) =>
    categories.length > 1 ? left + (plotWidth * i) / (categories.length - 1) : left + plotWidth / 2;

  const paths = series.map((s) =>
    s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' '),
  );

  // Thin out x labels when they would collide, counting back from the last
  // category so the most recent period is always labelled.
  const labelEvery = React.useMemo(() => {
    if (plotWidth === 0 || categories.length < 2) return 1;
    const slot = plotWidth / (categories.length - 1);
    const widest = Math.max(...categories.map((c) => measureText(c, fontFamily, 11)));
    return Math.max(1, Math.ceil((widest + 12) / slot));
  }, [plotWidth, categories, fontFamily]);
  const showXLabel = (i: number) => (categories.length - 1 - i) % labelEvery === 0;

  const indexFromClientX = (clientX: number) => {
    const svg = plotRef.current;
    if (!svg || categories.length === 0) return null;
    const rect = svg.getBoundingClientRect();
    const x = clientX - rect.left - left;
    const slot = categories.length > 1 ? plotWidth / (categories.length - 1) : plotWidth;
    const idx = Math.round(x / slot);
    return Math.min(categories.length - 1, Math.max(0, idx));
  };

  const handlePointer = (event: React.PointerEvent) => {
    setActiveIndex(indexFromClientX(event.clientX));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (categories.length === 0) return;
    const last = categories.length - 1;
    const current = activeIndex ?? last;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setActiveIndex(Math.max(0, current - 1));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setActiveIndex(activeIndex === null ? last : Math.min(last, current + 1));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(last);
        break;
      case 'Escape':
        setActiveIndex(null);
        break;
      default:
    }
  };

  const tooltipOnRight = activeIndex !== null && xAt(activeIndex) < left + plotWidth / 2;

  const ariaLabel = `${data.title}, ${data.unit}. ${series
    .map((s) => `${s.name}: от ${numberFormat.format(s.values[0])} до ${numberFormat.format(s.values[s.values.length - 1])}`)
    .join('; ')}.`;

  const tableColumns: TableColumnConfig<Record<string, string | number>>[] = [
    { id: 'period', name: 'Период', primary: true },
    ...series.map((s) => ({
      id: s.id,
      name: `${s.name}, ${data.unit}`,
      align: 'end' as const,
      className: 'line-chart__table-value',
      template: (row: Record<string, string | number>) => numberFormat.format(Number(row[s.id])),
    })),
  ];
  const tableData = categories.map((period, i) => {
    const row: Record<string, string | number> = { period };
    series.forEach((s) => {
      row[s.id] = s.values[i];
    });
    return row;
  });

  return (
    <figure className="line-chart" aria-labelledby={`${chartId}-title`} style={{ margin: 0 }}>
      <div className="line-chart__header">
        <div>
          <Text as="figcaption" variant="subheader-2" id={`${chartId}-title`}>
            {data.title}
          </Text>
          <Text as="div" variant="body-1" color="secondary">
            {data.unit}, по месяцам
          </Text>
        </div>
        <Button
          view="flat"
          size="m"
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          aria-pressed={view === 'table'}
        >
          {view === 'chart' ? 'Таблица' : 'График'}
        </Button>
      </div>

      {series.length > 1 && (
        <ul className="line-chart__legend" aria-label="Легенда">
          {series.map((s, i) => (
            <li key={s.id} className="line-chart__legend-item">
              <span
                className="line-chart__legend-key"
                style={{ '--series-color': seriesColor(i) } as React.CSSProperties}
                aria-hidden="true"
              />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {view === 'table' ? (
        <div className="line-chart__table">
          <Table data={tableData} columns={tableColumns} aria-label={data.title} />
        </div>
      ) : (
        <div className="line-chart__plot" ref={plotRef}>
          {width > 0 && (
            <>
              <svg
                className="line-chart__svg"
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                role="img"
                aria-label={ariaLabel}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onBlur={() => setActiveIndex(null)}
              >
                {/* gridlines + y ticks */}
                {ticks.map((t) => (
                  <g key={t}>
                    {t !== 0 && (
                      <line className="line-chart__grid" x1={left} x2={left + plotWidth} y1={yAt(t)} y2={yAt(t)} />
                    )}
                    <text className="line-chart__tick" x={left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle">
                      {numberFormat.format(t)}
                    </text>
                  </g>
                ))}
                <line className="line-chart__axis" x1={left} x2={left + plotWidth} y1={baseline} y2={baseline} />

                {/* x ticks */}
                {categories.map((c, i) =>
                  showXLabel(i) ? (
                    <text
                      key={c}
                      className="line-chart__tick"
                      x={xAt(i)}
                      y={baseline + 18}
                      textAnchor={i === 0 ? 'start' : i === categories.length - 1 ? 'end' : 'middle'}
                    >
                      {c}
                    </text>
                  ) : null,
                )}

                {/* crosshair under the lines */}
                {activeIndex !== null && (
                  <line
                    className="line-chart__crosshair"
                    x1={xAt(activeIndex)}
                    x2={xAt(activeIndex)}
                    y1={MARGIN.top}
                    y2={baseline}
                  />
                )}

                {/* series */}
                {series.map((s: Series, i) => {
                  const lastIdx = s.values.length - 1;
                  const style = { '--series-color': seriesColor(i) } as React.CSSProperties;
                  return (
                    <g key={s.id} style={style}>
                      <path className="line-chart__line" d={paths[i]} />
                      <circle className="line-chart__end-marker" cx={xAt(lastIdx)} cy={endYs[i]} r={4} />
                      {showEndLabels && (
                        <text
                          className="line-chart__end-label"
                          x={xAt(lastIdx) + END_LABEL_GAP}
                          y={endYs[i]}
                          dominantBaseline="middle"
                        >
                          {s.name}
                        </text>
                      )}
                      {activeIndex !== null && activeIndex !== lastIdx && (
                        <circle
                          className="line-chart__hover-marker"
                          cx={xAt(activeIndex)}
                          cy={yAt(s.values[activeIndex])}
                          r={4}
                        />
                      )}
                    </g>
                  );
                })}

                {/* hit area: the whole plot, so the pointer only has to be near an X */}
                <rect
                  className="line-chart__hit-area"
                  x={left - 12}
                  y={MARGIN.top - 12}
                  width={plotWidth + 24}
                  height={plotHeight + X_AXIS_BAND + 12}
                  onPointerMove={handlePointer}
                  onPointerDown={handlePointer}
                  onPointerLeave={() => setActiveIndex(null)}
                />
              </svg>

              {activeIndex !== null && (
                <div
                  className="line-chart__tooltip"
                  role="status"
                  style={
                    tooltipOnRight
                      ? { left: xAt(activeIndex) + 12 }
                      : { right: width - xAt(activeIndex) + 12 }
                  }
                >
                  <div className="line-chart__tooltip-title">{categories[activeIndex]}</div>
                  {series.map((s, i) => (
                    <div
                      key={s.id}
                      className="line-chart__tooltip-row"
                      style={{ '--series-color': seriesColor(i) } as React.CSSProperties}
                    >
                      <span className="line-chart__tooltip-key" aria-hidden="true" />
                      <span className="line-chart__tooltip-value">{numberFormat.format(s.values[activeIndex])}</span>
                      <span className="line-chart__tooltip-name">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </figure>
  );
}
