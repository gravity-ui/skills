import React from 'react';
import { LineChart } from '../charts/LineChart';
import { deviceSplit, topPages, trafficByChannel, type KpiId } from '../data';
import { fmtDateShort, fmtInt, fmtPercent } from '../format';
import type { GridItem } from '../grid/layout';
import { Devices } from './Devices';
import { Incidents } from './Incidents';
import { Kpi } from './Kpi';
import type { TableData } from './parts';
import { Services } from './Services';
import { TopPages } from './TopPages';

export interface RenderCtx {
  days: number;
  width: number;
  height: number;
}

export interface WidgetDef {
  id: string;
  title: string;
  /** Подпись в шапке виджета. */
  subtitle?: (days: number) => string;
  minW: number;
  minH: number;
  initial: Omit<GridItem, 'id'>;
  render: (ctx: RenderCtx) => React.ReactNode;
  /** Если есть — в шапке появляется переключатель «график / таблица». */
  table?: (days: number) => TableData;
}

const period = (d: number) => `за ${d} дн.`;

const kpiDef = (id: KpiId, title: string, x: number): WidgetDef => ({
  id: `kpi-${id}`,
  title,
  subtitle: period,
  minW: 2,
  minH: 3,
  initial: { x, y: 0, w: 3, h: 3 },
  render: ({ days, width }) => <Kpi id={id} days={days} width={width} title={title} />,
});

export const WIDGETS: WidgetDef[] = [
  kpiDef('visitors', 'Посетители', 0),
  kpiDef('revenue', 'Выручка', 3),
  kpiDef('conversion', 'Конверсия в заказ', 6),
  kpiDef('errors', 'Доля ошибок', 9),
  {
    id: 'traffic',
    title: 'Трафик по каналам',
    subtitle: (d) => `визиты в день, ${period(d)}`,
    minW: 4,
    minH: 5,
    initial: { x: 0, y: 3, w: 8, h: 9 },
    render: ({ days, width, height }) => {
      const { dates, series } = trafficByChannel(days);
      const colors = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];
      return (
        <LineChart
          dates={dates}
          series={series.map((s, i) => ({ ...s, color: colors[i] }))}
          width={width}
          height={height}
          label={`Трафик по каналам ${period(days)}`}
        />
      );
    },
    table: (days) => {
      const { dates, series } = trafficByChannel(days);
      return {
        columns: [
          { key: 'date', title: 'Дата' },
          ...series.map((s) => ({ key: s.id, title: s.name, align: 'end' as const })),
        ],
        rows: dates
          .map((d, i) => ({
            date: fmtDateShort(d),
            ...Object.fromEntries(series.map((s) => [s.id, fmtInt(s.values[i])])),
          }))
          .reverse(),
      };
    },
  },
  {
    id: 'devices',
    title: 'Устройства',
    subtitle: period,
    minW: 3,
    minH: 4,
    initial: { x: 8, y: 3, w: 4, h: 4 },
    render: ({ days, width }) => <Devices days={days} width={width} />,
    table: (days) => ({
      columns: [
        { key: 'name', title: 'Устройство' },
        { key: 'value', title: 'Визиты', align: 'end' },
        { key: 'share', title: 'Доля', align: 'end' },
      ],
      rows: deviceSplit(days).parts.map((p) => ({
        name: p.name,
        value: fmtInt(p.value),
        share: fmtPercent(p.share, 1),
      })),
    }),
  },
  {
    id: 'services',
    title: 'Нагрузка на сервисы',
    subtitle: () => 'сейчас',
    minW: 3,
    minH: 4,
    initial: { x: 8, y: 7, w: 4, h: 5 },
    render: ({ height }) => <Services height={height} />,
  },
  {
    id: 'pages',
    title: 'Топ страниц',
    subtitle: (d) => `просмотры, ${period(d)}`,
    minW: 3,
    minH: 4,
    initial: { x: 0, y: 12, w: 5, h: 7 },
    render: ({ days, height }) => <TopPages days={days} height={height} />,
    table: (days) => ({
      columns: [
        { key: 'path', title: 'Страница' },
        { key: 'views', title: 'Просмотры', align: 'end' },
      ],
      rows: topPages(days).map((p) => ({ path: p.path, views: fmtInt(p.views) })),
    }),
  },
  {
    id: 'incidents',
    title: 'Последние события',
    subtitle: period,
    minW: 4,
    minH: 4,
    initial: { x: 5, y: 12, w: 7, h: 7 },
    render: ({ days, width }) => <Incidents days={days} width={width} />,
  },
];

export const WIDGET_BY_ID: Record<string, WidgetDef> = Object.fromEntries(WIDGETS.map((w) => [w.id, w]));

export const LIMITS = Object.fromEntries(WIDGETS.map((w) => [w.id, { minW: w.minW, minH: w.minH }]));

export const DEFAULT_LAYOUT: GridItem[] = WIDGETS.map((w) => ({ id: w.id, ...w.initial }));

