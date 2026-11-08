import React, { useLayoutEffect, useRef, useState } from 'react';
import { useThemeType } from '@gravity-ui/uikit';

import { fmt } from './data';

// ---------- palette ----------

/**
 * Categorical slots in fixed order (validated with the dataviz palette
 * validator against Gravity's light #fff and dark #221d22 surfaces).
 * Light-mode aqua/yellow/magenta sit below 3:1, so every chart that uses them
 * also ships a legend and a table view.
 */
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'],
};
/** Ink to use for a label placed inside a categorical fill (yellow takes near-black). */
const INK_ON_FILL = {
  light: ['#fff', '#fff', '#fff', '#0b0b0b', '#fff'],
  dark: ['#fff', '#fff', '#fff', '#fff', '#fff'],
};

export function useSeriesColors() {
  const theme = useThemeType() === 'dark' ? 'dark' : 'light';
  return { colors: SERIES[theme], inkOnFill: INK_ON_FILL[theme] };
}

// ---------- utils ----------

export function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) =>
        Math.round(prev.width) === Math.round(width) && Math.round(prev.height) === Math.round(height)
          ? prev
          : { width, height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}

function niceStep(raw: number) {
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

export function niceTicks(max: number, count: number) {
  if (max <= 0) return [0, 1];
  const step = niceStep(max / Math.max(1, count));
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** Rough text width for the 11–13px UI sans; good enough to decide fit/no-fit. */
const textWidth = (text: string, px = 12) => text.length * px * 0.58;

// ---------- tooltip ----------

export interface TooltipRow {
  key: string;
  color?: string;
  value: string;
  label: string;
}

export function ChartTooltip({
  x,
  y,
  bounds,
  title,
  rows,
}: {
  x: number;
  y: number;
  bounds: { width: number; height: number };
  title?: string;
  rows: TooltipRow[];
}) {
  const width = 190;
  const left = x + 14 + width > bounds.width ? Math.max(0, x - 14 - width) : x + 14;
  const top = Math.max(0, Math.min(y - 12, bounds.height - 24 - rows.length * 22));
  return (
    <div className="viz-tooltip" style={{ left, top, width }} role="presentation">
      {title && <div className="viz-tooltip__title">{title}</div>}
      {rows.map((row) => (
        <div className="viz-tooltip__row" key={row.key}>
          {row.color && <span className="viz-tooltip__key" style={{ background: row.color }} />}
          <span className="viz-tooltip__value">{row.value}</span>
          <span className="viz-tooltip__label">{row.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- line chart ----------

export interface LineSeries {
  id: string;
  name: string;
  color: string;
  values: number[];
}

export function LineChart({
  dates,
  series,
  format,
  label,
}: {
  dates: Date[];
  series: LineSeries[];
  format: { value: (n: number) => string; axis: (n: number) => string; date: (d: Date) => string; longDate: (d: Date) => string };
  label: string;
}) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const n = dates.length;

  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(max, Math.max(2, Math.min(5, Math.floor(height / 45))));
  const yMax = ticks[ticks.length - 1];
  const tickLabels = ticks.map(format.axis);

  const margin = { top: 10, bottom: 24, left: Math.max(...tickLabels.map((t) => textWidth(t, 11))) + 10, right: 10 };
  const last = series.map((s) => s.values[n - 1]);
  const endLabels = series.map((s, i) => format.value(last[i]));
  const endWidth = Math.max(...endLabels.map((t) => textWidth(t, 12))) + 16;

  const plotWithEnd = width - margin.left - margin.right - endWidth;
  const yAt = (v: number, plotH: number) => margin.top + plotH - (v / yMax) * plotH;
  const plotH = Math.max(0, height - margin.top - margin.bottom);
  // End labels are the direct labels; when they would collide (or the chart is
  // narrow) we drop them and let the legend + tooltip carry identity.
  const endYs = last.map((v) => yAt(v, plotH));
  const showEnd = plotWithEnd > 220 && endYs.every((y, i) => endYs.every((o, j) => i === j || Math.abs(y - o) >= 16));
  if (showEnd) margin.right += endWidth;

  const plotW = Math.max(0, width - margin.left - margin.right);
  const step = n > 1 ? plotW / (n - 1) : 0;
  const xAt = (i: number) => margin.left + i * step;

  const xTickCount = Math.max(2, Math.floor(plotW / 80));
  const xEvery = Math.max(1, Math.ceil((n - 1) / xTickCount));
  const xTicks: number[] = [];
  for (let i = n - 1; i >= 0; i -= xEvery) xTicks.unshift(i);

  const pointerToIndex = (clientX: number, rect: DOMRect) =>
    Math.max(0, Math.min(n - 1, Math.round((clientX - rect.left - margin.left) / (step || 1))));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      setHover((h) => Math.max(0, Math.min(n - 1, (h ?? n - 1) + (e.key === 'ArrowLeft' ? -1 : 1))));
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      setHover(e.key === 'Home' ? 0 : n - 1);
    }
  };

  return (
    <div className="viz-line">
      {series.length > 1 && (
        <div className="viz-legend" aria-hidden>
          {series.map((s) => (
            <span className="viz-legend__item" key={s.id}>
              <span className="viz-legend__line" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div
        className="viz-plot"
        ref={ref}
        tabIndex={0}
        role="img"
        aria-label={`${label}. Стрелки влево и вправо — значения по дням.`}
        onKeyDown={onKeyDown}
        onFocus={() => setHover((h) => h ?? n - 1)}
        onBlur={() => setHover(null)}
      >
        {width > 0 && height > 0 && (
          <svg width={width} height={height} className="viz-svg">
            {ticks.map((t, i) => (
              <g key={t}>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={yAt(t, plotH)}
                  y2={yAt(t, plotH)}
                  className={i === 0 ? 'viz-baseline' : 'viz-grid'}
                />
                <text x={margin.left - 8} y={yAt(t, plotH)} dy="0.32em" textAnchor="end" className="viz-tick">
                  {tickLabels[i]}
                </text>
              </g>
            ))}
            {xTicks.map((i) => {
              const x = xAt(i);
              const anchor = x - margin.left < 24 ? 'start' : width - x < 30 ? 'end' : 'middle';
              return (
                <text key={i} x={x} y={height - 6} textAnchor={anchor} className="viz-tick">
                  {format.date(dates[i])}
                </text>
              );
            })}
            {series.map((s) => (
              <path
                key={s.id}
                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v, plotH).toFixed(1)}`).join('')}
                stroke={s.color}
                className="viz-line__path"
              />
            ))}
            {showEnd &&
              series.map((s, i) => (
                <g key={s.id}>
                  <circle cx={xAt(n - 1)} cy={endYs[i]} r={4} fill={s.color} className="viz-dot" />
                  <text x={xAt(n - 1) + 10} y={endYs[i]} dy="0.32em" className="viz-end-label">
                    {endLabels[i]}
                  </text>
                </g>
              ))}
            {hover !== null && (
              <g>
                <line x1={xAt(hover)} x2={xAt(hover)} y1={margin.top} y2={margin.top + plotH} className="viz-crosshair" />
                {series.map((s) => (
                  <circle key={s.id} cx={xAt(hover)} cy={yAt(s.values[hover], plotH)} r={4} fill={s.color} className="viz-dot" />
                ))}
              </g>
            )}
            <rect
              x={margin.left - step / 2}
              y={0}
              width={plotW + step}
              height={height}
              fill="transparent"
              onPointerMove={(e) => setHover(pointerToIndex(e.clientX, e.currentTarget.ownerSVGElement!.getBoundingClientRect()))}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}
        {hover !== null && width > 0 && (
          <ChartTooltip
            x={xAt(hover)}
            y={Math.min(...series.map((s) => yAt(s.values[hover], plotH)))}
            bounds={{ width, height }}
            title={format.longDate(dates[hover])}
            rows={series.map((s) => ({ key: s.id, color: s.color, value: format.value(s.values[hover]), label: s.name }))}
          />
        )}
      </div>
    </div>
  );
}

// ---------- sparkline ----------

export function Sparkline({
  values,
  dates,
  accent,
  format,
}: {
  values: number[];
  dates: Date[];
  accent: string;
  format: (n: number) => string;
}) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const n = values.length;
  const xAt = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, n - 1);
  const yAt = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / (max - min || 1));
  const active = hover ?? n - 1;

  return (
    <div className="viz-spark" ref={ref} aria-hidden>
      {width > 0 && height > 8 && (
        <svg
          width={width}
          height={height}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const i = Math.round(((e.clientX - rect.left - pad) / (width - pad * 2)) * (n - 1));
            setHover(Math.max(0, Math.min(n - 1, i)));
          }}
          onPointerLeave={() => setHover(null)}
        >
          <path
            d={values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join('')}
            className="viz-spark__path"
          />
          <circle cx={xAt(active)} cy={yAt(values[active])} r={4} fill={accent} className="viz-dot" />
        </svg>
      )}
      {hover !== null && (
        <ChartTooltip
          x={xAt(hover)}
          y={0}
          bounds={{ width, height: height + 40 }}
          title={fmt.longDay(dates[hover])}
          rows={[{ key: 'v', value: format(values[hover]), label: '' }]}
        />
      )}
    </div>
  );
}


// ---------- horizontal bars ----------

export function BarList({
  items,
  color,
  format,
}: {
  items: { name: string; value: number }[];
  color: string;
  format: (n: number) => string;
}) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<{ index: number; x: number; y: number } | null>(null);
  const max = Math.max(...items.map((i) => i.value));
  const total = items.reduce((a, b) => a + b.value, 0);
  const valueReserve = Math.max(...items.map((i) => textWidth(format(i.value)))) + 12;

  return (
    <div className="viz-bars" ref={ref} onPointerLeave={() => setHover(null)}>
      {items.map((item, index) => (
        <div
          key={item.name}
          className={`viz-bars__row${hover?.index === index ? ' viz-bars__row_active' : ''}`}
          tabIndex={0}
          aria-label={`${item.name}: ${format(item.value)}, ${(item.value / total * 100).toFixed(1)}%`}
          onPointerMove={(e) => {
            const box = ref.current!.getBoundingClientRect();
            setHover({ index, x: e.clientX - box.left, y: e.clientY - box.top });
          }}
          onFocus={(e) => {
            const box = ref.current!.getBoundingClientRect();
            const row = e.currentTarget.getBoundingClientRect();
            setHover({ index, x: row.left - box.left + row.width / 2, y: row.top - box.top });
          }}
          onBlur={() => setHover(null)}
        >
          <span className="viz-bars__name" title={item.name}>
            {item.name}
          </span>
          <span className="viz-bars__track">
            <span
              className="viz-bars__bar"
              style={{ background: color, width: `calc((100% - ${valueReserve}px) * ${item.value / max})` }}
            />
            <span className="viz-bars__value">{format(item.value)}</span>
          </span>
        </div>
      ))}
      {hover && (
        <ChartTooltip
          x={hover.x}
          y={hover.y}
          bounds={{ width, height }}
          rows={[
            { key: 'v', color, value: format(items[hover.index].value), label: items[hover.index].name },
            {
              key: 's',
              value: `${((items[hover.index].value / total) * 100).toFixed(1).replace('.', ',')}%`,
              label: 'доля от всех',
            },
          ]}
        />
      )}
    </div>
  );
}

// ---------- segmented bar (tall) ----------

export function SegmentedBar({
  items,
  format,
}: {
  items: { name: string; value: number }[];
  format: (n: number) => string;
}) {
  const { colors, inkOnFill } = useSeriesColors();
  const [ref, { width }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const total = items.reduce((a, b) => a + b.value, 0);
  const gaps = 2 * (items.length - 1);
  const share = (v: number) => `${((v / total) * 100).toFixed(0)}%`;

  return (
    <div className="viz-seg">
      <div className="viz-seg__bar" ref={ref} onPointerLeave={() => setHover(null)}>
        {items.map((item, i) => {
          if (item.value <= 0) return null;
          const blockWidth = ((width - gaps) * item.value) / total;
          const label = share(item.value);
          const fits = textWidth(label, 12) + 16 <= blockWidth;
          return (
            <div
              key={item.name}
              className={`viz-seg__block${hover === i ? ' viz-seg__block_active' : ''}`}
              style={{ flexGrow: item.value, background: colors[i], color: inkOnFill[i] }}
              tabIndex={0}
              aria-label={`${item.name}: ${format(item.value)}, ${share(item.value)}`}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            >
              {fits && label}
            </div>
          );
        })}
        {hover !== null && (
          <ChartTooltip
            x={
              ((width - gaps) * items.slice(0, hover).reduce((a, b) => a + b.value, 0)) / total +
              2 * hover +
              ((width - gaps) * items[hover].value) / total / 2
            }
            y={34}
            bounds={{ width, height: 200 }}
            rows={[
              { key: 'v', color: colors[hover], value: format(items[hover].value), label: items[hover].name },
              { key: 's', value: share(items[hover].value), label: 'доля визитов' },
            ]}
          />
        )}
      </div>
      <div className="viz-legend viz-legend_wrap" aria-hidden>
        {items.map((item, i) => (
          <span className="viz-legend__item" key={item.name}>
            <span className="viz-legend__swatch" style={{ background: colors[i] }} />
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- meter ----------

export function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  const ratio = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className="viz-meter"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <div className={`viz-meter__fill${ratio >= 1 ? ' viz-meter__fill_done' : ''}`} style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}
