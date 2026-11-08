import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { SegmentedBar } from './charts/SegmentedBar';
import { Sparkline } from './charts/Sparkline';
import {
  categories,
  formatNumber,
  formatValue,
  revenueNow,
  revenuePrev,
  sources,
  stats,
  topPages,
  type DayPoint,
} from './data';

export type WidgetType = 'kpi' | 'revenue' | 'categories' | 'sources' | 'pages';

export interface WidgetMeta {
  title: string;
  minW: number;
  minH: number;
  defaultW: number;
  defaultH: number;
  /** есть ли переключатель «график/таблица» */
  hasTableView?: boolean;
}

export const WIDGETS: Record<WidgetType, WidgetMeta> = {
  kpi: { title: 'Ключевые метрики', minW: 4, minH: 2, defaultW: 12, defaultH: 2 },
  revenue: {
    title: 'Выручка, тыс. ₽',
    minW: 4,
    minH: 3,
    defaultW: 7,
    defaultH: 4,
    hasTableView: true,
  },
  categories: {
    title: 'Продажи по категориям',
    minW: 4,
    minH: 3,
    defaultW: 5,
    defaultH: 4,
    hasTableView: true,
  },
  sources: {
    title: 'Источники трафика',
    minW: 4,
    minH: 2,
    defaultW: 12,
    defaultH: 2,
    hasTableView: true,
  },
  pages: { title: 'Популярные страницы', minW: 4, minH: 3, defaultW: 5, defaultH: 4 },
};

/* ---------- тела виджетов ---------- */

function KpiBody() {
  return (
    <div className="viz-stats">
      {stats.map((s) => {
        const good = s.delta >= 0 === s.upIsGood;
        return (
          <div className="viz-stat" key={s.id}>
            <span className="viz-stat__label">{s.label}</span>
            <span className="viz-stat__value">{formatValue(s.value, s.format)}</span>
            <span
              className="viz-stat__delta"
              style={{ color: good ? 'var(--viz-delta-up-good)' : 'var(--viz-delta-down-bad)' }}
            >
              {s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta).toFixed(1).replace('.', ',')}% к прошлому
              периоду
            </span>
            <span className="viz-stat__spark">
              <Sparkline points={s.spark} height={20} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SeriesTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; num?: boolean }[];
  rows: (string | number)[][];
}) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.num ? 'viz-table__num' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={columns[j].num ? 'viz-table__num' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RevenueBody({ table }: { table: boolean }) {
  if (table) {
    return (
      <SeriesTable
        columns={[
          { key: 'd', label: 'Дата' },
          { key: 'now', label: 'Этот год', num: true },
          { key: 'prev', label: 'Прошлый год', num: true },
        ]}
        rows={revenueNow.map((p: DayPoint, i: number) => [
          p.label,
          formatNumber(p.value),
          formatNumber(revenuePrev[i].value),
        ])}
      />
    );
  }
  return (
    <LineChart
      series={[
        { name: 'Этот год', color: 'var(--viz-series-1)', points: revenueNow },
        { name: 'Прошлый год', color: 'var(--viz-series-2)', points: revenuePrev },
      ]}
    />
  );
}

function CategoriesBody({ table }: { table: boolean }) {
  if (table) {
    return (
      <SeriesTable
        columns={[
          { key: 'n', label: 'Категория' },
          { key: 'v', label: 'Продажи', num: true },
        ]}
        rows={[...categories]
          .sort((a, b) => b.value - a.value)
          .map((c) => [c.name, formatNumber(c.value)])}
      />
    );
  }
  return <BarChart items={categories} />;
}

function SourcesBody({ table }: { table: boolean }) {
  if (table) {
    return (
      <SeriesTable
        columns={[
          { key: 'n', label: 'Источник' },
          { key: 'v', label: 'Доля, %', num: true },
        ]}
        rows={sources.map((s) => [s.name, s.value.toFixed(1).replace('.', ',')])}
      />
    );
  }
  return <SegmentedBar items={sources} />;
}

function PagesBody() {
  return (
    <SeriesTable
      columns={[
        { key: 'p', label: 'Страница' },
        { key: 'v', label: 'Просмотры', num: true },
        { key: 'c', label: 'Изм., %', num: true },
      ]}
      rows={topPages.map((p) => [
        p.page,
        formatNumber(p.views),
        `${p.change >= 0 ? '+' : ''}${p.change.toFixed(1).replace('.', ',')}`,
      ])}
    />
  );
}

export function WidgetBody({ type, table }: { type: WidgetType; table: boolean }) {
  switch (type) {
    case 'kpi':
      return <KpiBody />;
    case 'revenue':
      return <RevenueBody table={table} />;
    case 'categories':
      return <CategoriesBody table={table} />;
    case 'sources':
      return <SourcesBody table={table} />;
    case 'pages':
      return <PagesBody />;
  }
}
