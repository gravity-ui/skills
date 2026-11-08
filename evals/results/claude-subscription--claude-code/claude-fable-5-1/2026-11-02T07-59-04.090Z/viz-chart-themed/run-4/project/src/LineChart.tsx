import React from 'react';
import { Button, Table, Text, useThemeType } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';

import type { Series } from './data';

/**
 * Категориальные цвета серий: один набор оттенков, отдельно подобранные шаги
 * для светлой и тёмной поверхности (проверены валидатором на фонах Gravity UI:
 * #ffffff и rgb(34,29,34) — полоса яркости, насыщенность, CVD-разделение, контраст).
 */
const SERIES_COLORS: Record<'light' | 'dark', string[]> = {
  light: ['#2a78d6', '#eb6834', '#1baf7a'],
  dark: ['#3987e5', '#d95926', '#199e70'],
};

/** Хром графика — токены Gravity UI, поэтому он следует теме сам (включая hc-варианты). */
const INK = {
  surface: 'var(--g-color-base-background)',
  primary: 'var(--g-color-text-primary)',
  secondary: 'var(--g-color-text-secondary)',
  hint: 'var(--g-color-text-hint)',
  grid: 'var(--g-color-line-generic)',
  axis: 'var(--g-color-line-generic-solid)',
  float: 'var(--g-color-base-float)',
  shadow: 'var(--g-color-sfx-shadow)',
};

const PLOT_HEIGHT = 240;
const PAD = { top: 16, right: 56, bottom: 28, left: 40 };
const HEIGHT = PAD.top + PLOT_HEIGHT + PAD.bottom;

export interface LineChartProps {
  title: string;
  subtitle?: string;
  categories: string[];
  series: Series[];
  unit?: string;
}

const fmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

function niceTicks(max: number, count = 5): number[] {
  const rawStep = max / count;
  const mag = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rawStep) ?? mag * 10;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Number(v.toFixed(6)));
  return ticks;
}

function useWidth(ref: React.RefObject<HTMLElement | null>, fallback: number) {
  const [width, setWidth] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width || fallback);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, fallback]);
  return width;
}

export function LineChart({ title, subtitle, categories, series, unit }: LineChartProps) {
  const themeType = useThemeType();
  const colors = SERIES_COLORS[themeType];

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const width = useWidth(wrapRef, 720);

  const [hidden, setHidden] = React.useState<Set<string>>(() => new Set());
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [showTable, setShowTable] = React.useState(false);

  // Цвет закреплён за серией по её позиции в исходном списке — скрытие соседей его не меняет.
  const colored = series.map((s, i) => ({ ...s, color: colors[i % colors.length] }));
  const visible = colored.filter((s) => !hidden.has(s.id));

  const plotW = Math.max(120, width - PAD.left - PAD.right);
  const maxVal = Math.max(1, ...visible.flatMap((s) => s.values));
  const ticks = niceTicks(maxVal);
  const yMax = ticks[ticks.length - 1];
  const n = categories.length;

  const x = (i: number) => PAD.left + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
  const y = (v: number) => PAD.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT;

  const pathFor = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  // Прямые подписи значения у конца линии — только если не сталкиваются (иначе их несут легенда и тултип).
  const endLabels = (() => {
    const items = visible
      .map((s) => ({ id: s.id, yPos: y(s.values[n - 1]), value: s.values[n - 1] }))
      .sort((a, b) => a.yPos - b.yPos);
    const shown = new Set<string>();
    let lastY = -Infinity;
    for (const it of items) {
      if (it.yPos - lastY >= 14) {
        shown.add(it.id);
        lastY = it.yPos;
      }
    }
    return shown;
  })();

  const pickIndex = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const rel = n > 1 ? (px - PAD.left) / plotW : 0;
    setHoverIdx(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHoverIdx((i) => Math.min(n - 1, (i ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setHoverIdx((i) => Math.max(0, (i ?? n) - 1));
    else if (e.key === 'Home') setHoverIdx(0);
    else if (e.key === 'End') setHoverIdx(n - 1);
    else if (e.key === 'Escape') setHoverIdx(null);
    else return;
    e.preventDefault();
  };

  const toggleSeries = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < series.length - 1) next.add(id);
      return next;
    });

  const TIP_W = 180;
  // Тултип уходит влево от перекрестия, если справа он накрыл бы концы линий и их подписи.
  const tooltipLeft = hoverIdx === null ? 0 : x(hoverIdx) + 12 + TIP_W > x(n - 1) - 8 ? x(hoverIdx) - 12 - TIP_W : x(hoverIdx) + 12;

  const tableRows = categories.map((c, i) => {
    const row: Record<string, string | number> = { period: c };
    for (const s of series) row[s.id] = s.values[i];
    return row;
  });
  const tableColumns: TableColumnConfig<Record<string, string | number>>[] = [
    { id: 'period', name: 'Месяц' },
    ...series.map((s) => ({
      id: s.id,
      name: unit ? `${s.name}, ${unit}` : s.name,
      align: 'end' as const,
      template: (row: Record<string, string | number>) => fmt.format(Number(row[s.id])),
    })),
  ];

  const ariaLabel = `${title}. ${series.map((s) => `${s.name}: от ${fmt.format(s.values[0])} до ${fmt.format(s.values[n - 1])}`).join('; ')}.`;

  return (
    <figure style={{ margin: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <Text as="div" variant="subheader-2" color="primary">
            {title}
          </Text>
          {subtitle && (
            <Text as="div" variant="body-1" color="secondary">
              {subtitle}
            </Text>
          )}
        </div>
        <Button view="flat-secondary" size="s" onClick={() => setShowTable((v) => !v)} aria-pressed={showTable}>
          {showTable ? 'График' : 'Таблица'}
        </Button>
      </div>

      {/* Легенда — ключ-штрих в цвете серии, текст в текстовых токенах; клик скрывает/показывает серию */}
      <div role="list" aria-label="Легенда" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', marginTop: 12 }}>
        {colored.map((s) => {
          const off = hidden.has(s.id);
          return (
            <button
              key={s.id}
              role="listitem"
              type="button"
              aria-pressed={!off}
              onClick={() => toggleSeries(s.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                margin: '0 -6px',
                border: 0,
                borderRadius: 4,
                background: 'transparent',
                cursor: 'pointer',
                opacity: off ? 0.45 : 1,
                font: 'inherit',
              }}
            >
              <svg width="16" height="8" aria-hidden="true">
                <line x1="0" y1="4" x2="16" y2="4" stroke={s.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <Text variant="body-1" color="secondary" style={{ textDecoration: off ? 'line-through' : 'none' }}>
                {s.name}
              </Text>
            </button>
          );
        })}
      </div>

      {showTable ? (
        <div style={{ marginTop: 12 }}>
          <Table data={tableRows} columns={tableColumns} aria-label={title} />
        </div>
      ) : (
        <div ref={wrapRef} style={{ position: 'relative', marginTop: 8, color: INK.primary }}>
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="img"
            aria-label={ariaLabel}
            style={{ display: 'block', overflow: 'visible', fontFamily: 'inherit' }}
          >
            {/* Сетка и ось — волосяные сплошные линии, на шаг светлее поверхности */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotW}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === 0 ? INK.axis : INK.grid}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
                <text x={PAD.left - 8} y={y(t)} dy="0.35em" textAnchor="end" fontSize={11} fill={INK.hint} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fmt.format(t)}
                </text>
              </g>
            ))}
            {categories.map((c, i) => (
              <text key={c} x={x(i)} y={PAD.top + PLOT_HEIGHT + 18} textAnchor="middle" fontSize={11} fill={INK.hint}>
                {c}
              </text>
            ))}

            {/* Перекрестие */}
            {hoverIdx !== null && (
              <line x1={x(hoverIdx)} x2={x(hoverIdx)} y1={PAD.top} y2={PAD.top + PLOT_HEIGHT} stroke={INK.axis} strokeWidth={1} shapeRendering="crispEdges" />
            )}

            {/* Линии 2px, маркер на конце и в точке наведения — с кольцом цвета поверхности */}
            {visible.map((s) => (
              <g key={s.id}>
                <path d={pathFor(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={6} fill={INK.surface} />
                <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={4} fill={s.color} />
                {endLabels.has(s.id) && (
                  <text x={x(n - 1) + 10} y={y(s.values[n - 1])} dy="0.35em" fontSize={12} fontWeight={600} fill={INK.primary} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmt.format(s.values[n - 1])}
                  </text>
                )}
                {hoverIdx !== null && hoverIdx !== n - 1 && (
                  <>
                    <circle cx={x(hoverIdx)} cy={y(s.values[hoverIdx])} r={6} fill={INK.surface} />
                    <circle cx={x(hoverIdx)} cy={y(s.values[hoverIdx])} r={4} fill={s.color} />
                  </>
                )}
              </g>
            ))}

            {/* Зона захвата: вся область графика; клавиатура — стрелки */}
            <rect
              x={PAD.left - 12}
              y={PAD.top}
              width={plotW + 24}
              height={PLOT_HEIGHT + PAD.bottom}
              fill="transparent"
              tabIndex={0}
              aria-label="Навигация по точкам: стрелки влево/вправо"
              style={{ outline: 'none', cursor: 'crosshair' }}
              onPointerMove={(e) => pickIndex(e.clientX)}
              onPointerLeave={() => setHoverIdx(null)}
              onKeyDown={onKeyDown}
              onBlur={() => setHoverIdx(null)}
              onFocus={() => setHoverIdx((i) => i ?? n - 1)}
            />
          </svg>

          {hoverIdx !== null && (
            <div
              role="status"
              style={{
                position: 'absolute',
                left: tooltipLeft,
                top: PAD.top,
                width: TIP_W,
                padding: '8px 10px',
                borderRadius: 8,
                background: INK.float,
                boxShadow: `0 2px 8px ${INK.shadow}`,
                pointerEvents: 'none',
                boxSizing: 'border-box',
              }}
            >
              <Text as="div" variant="caption-2" color="secondary" style={{ marginBottom: 4 }}>
                {categories[hoverIdx]}
              </Text>
              {visible.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, lineHeight: '20px' }}>
                  <svg width="12" height="8" aria-hidden="true">
                    <line x1="0" y1="4" x2="12" y2="4" stroke={s.color} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <Text variant="body-1" color="secondary" style={{ flex: 1 }}>
                    {s.name}
                  </Text>
                  <Text variant="body-1" color="primary" style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt.format(s.values[hoverIdx])}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
