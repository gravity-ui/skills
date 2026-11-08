import React, {Suspense, lazy, useMemo} from 'react';
import {Loader, Text} from '@gravity-ui/uikit';

import {MAX_SERIES, PALETTES} from './colors';
import {
  defaultTooltipXFormat,
  defaultXTickFormat,
  defaultYFormat,
} from './format';
import type {
  ChartSeries,
  ChartWidgetProps,
  EngineProps,
  ResolvedSeries,
  WidgetMode,
} from './types';
import {useResolvedTheme} from './useResolvedTheme';
import './widget.css';

/**
 * Движки подключаются динамическим импортом: чанк режима уходит в сеть только
 * когда этот режим реально рендерится. Реестр — единственное место, где режим
 * связывается со своим движком; снаружи виден лишь единый API ChartWidget.
 */
const SalesEngine = lazy(() => import('../engines/sales/SalesEngine'));
const MonitoringEngine = lazy(() => import('../engines/monitoring/MonitoringEngine'));

const ENGINES: Record<WidgetMode, React.LazyExoticComponent<React.ComponentType<EngineProps>>> = {
  sales: SalesEngine,
  monitoring: MonitoringEngine,
};

const DEFAULT_HEIGHT = 320;
const TABLE_MAX_ROWS = 120;

export function ChartWidget(props: ChartWidgetProps) {
  const {
    mode,
    title,
    subtitle,
    series,
    height = DEFAULT_HEIGHT,
    yTickFormat = defaultYFormat,
    xTickFormat = defaultXTickFormat,
    tooltipValueFormat = defaultYFormat,
    tooltipXFormat = defaultTooltipXFormat,
  } = props;

  const theme = useResolvedTheme();
  const palette = PALETTES[theme];

  // Цвет следует за серией (её индексом в переданном массиве), слоты — в фиксированном
  // порядке, сверх MAX_SERIES серии не принимаем (fold/facet — забота потребителя).
  const resolved = useMemo<ResolvedSeries[]>(
    () => series.slice(0, MAX_SERIES).map((s, i) => ({...s, color: palette.series[i]})),
    [series, palette],
  );

  const Engine = ENGINES[mode];

  const cssVars = {
    '--viz-surface': palette.surface,
    '--viz-text-primary': palette.textPrimary,
    '--viz-text-secondary': palette.textSecondary,
    '--viz-text-muted': palette.textMuted,
    '--viz-baseline': palette.baseline,
    '--viz-border': palette.border,
  } as React.CSSProperties;

  return (
    <section className="viz-widget" style={cssVars} aria-label={title}>
      <header className="viz-widget__header">
        <Text variant="subheader-2" as="h2" className="viz-widget__title">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body-1" color="secondary" className="viz-widget__subtitle">
            {subtitle}
          </Text>
        ) : null}
      </header>

      {/* Легенда обязательна при ≥2 сериях; при одной серии её несёт заголовок. */}
      {resolved.length > 1 && (
        <ul className="viz-legend">
          {resolved.map((s) => (
            <li className="viz-legend__item" key={s.id}>
              <span className="viz-legend__line" style={{background: s.color}} aria-hidden />
              <span className="viz-legend__name">{s.name}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Фолбэк держит высоту графика — нет скачка раскладки при догрузке чанка. */}
      <div className="viz-widget__plot" style={{height}}>
        <Suspense
          fallback={
            <div className="viz-widget__loading">
              <Loader size="m" />
            </div>
          }
        >
          <Engine
            series={resolved}
            height={height}
            palette={palette}
            yTickFormat={yTickFormat}
            xTickFormat={xTickFormat}
            tooltipValueFormat={tooltipValueFormat}
            tooltipXFormat={tooltipXFormat}
          />
        </Suspense>
      </div>

      <DataTable series={resolved} xFormat={tooltipXFormat} valueFormat={tooltipValueFormat} />
    </section>
  );
}

/** Табличный вид: те же значения без наведения (relief-правило и доступность). */
function DataTable({
  series,
  xFormat,
  valueFormat,
}: {
  series: ResolvedSeries[];
  xFormat: (t: number) => string;
  valueFormat: (v: number) => string;
}) {
  const rows = useMemo(() => buildTableRows(series, xFormat, valueFormat), [series, xFormat, valueFormat]);
  if (series.length === 0) return null;

  return (
    <details className="viz-table-toggle">
      <summary>Данные таблицей</summary>
      <div className="viz-table-scroll">
        <table className="viz-table">
          <thead>
            <tr>
              <th scope="col">Время</th>
              {series.map((s) => (
                <th scope="col" key={s.id}>
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>{row.time}</td>
                {row.values.map((v, i) => (
                  <td key={series[i].id}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

interface TableRow {
  key: number;
  time: string;
  values: string[];
}

function buildTableRows(
  series: ChartSeries[],
  xFormat: (t: number) => string,
  valueFormat: (v: number) => string,
): TableRow[] {
  const base = series[0]?.points ?? [];
  const step = Math.max(1, Math.ceil(base.length / TABLE_MAX_ROWS));
  const byTime = series.map((s) => new Map(s.points.map((p) => [p.t, p.v])));

  const rows: TableRow[] = [];
  for (let i = 0; i < base.length; i += step) {
    const t = base[i].t;
    rows.push({
      key: t,
      time: xFormat(t),
      values: byTime.map((m) => {
        const v = m.get(t);
        return v === undefined ? '—' : valueFormat(v);
      }),
    });
  }
  return rows;
}
